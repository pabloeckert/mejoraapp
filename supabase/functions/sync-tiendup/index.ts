/**
 * sync-tiendup — Sincroniza suscripciones de Tiendup con profiles
 *
 * Puede llamarse:
 *   - Desde cron: header x-cron-secret → sincroniza todos
 *   - Desde usuario autenticado (JWT) → sincroniza solo ese usuario
 *
 * Secrets requeridos en Supabase:
 *   TIENDUP_API_KEY   — API key de Tiendup (NUNCA en código)
 *   CRON_SECRET       — openssl rand -hex 32
 *   APP_URL           — https://app.mejoraok.com
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, jsonHeaders } from "../_shared/cors.ts";

const TIENDUP_BASE  = "https://pablo-usos.public-api.tiendup.com";
const TIENDUP_KEY   = Deno.env.get("TIENDUP_API_KEY") ?? "";
const CRON_SECRET   = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Helpers ──────────────────────────────────────────────────────

async function tiendupGet(path: string): Promise<unknown> {
  const res = await fetch(`${TIENDUP_BASE}${path}`, {
    headers: { "X-Api-Key": TIENDUP_KEY },
  });
  if (!res.ok) throw new Error(`Tiendup ${path} → ${res.status}`);
  return res.json();
}

function determineLevelFromPlan(planName: string): "n1" | "n2" {
  const lower = planName.toLowerCase();
  if (lower.includes("dorado") || lower.includes("n2") || lower.includes("premium")) return "n2";
  return "n1";
}

function expiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 32);
  return d.toISOString();
}

// ── Sincronizar un usuario por email ─────────────────────────────

async function syncUser(email: string, sub: Record<string, unknown>) {
  const level = determineLevelFromPlan(String(sub.plan_name ?? sub.product_name ?? ""));
  const subId  = String(sub.id ?? "");

  // Buscar perfil por email (case insensitive)
  const { data: profile } = await db
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) return { updated: false, email };

  const expAt = expiresAt();

  await db.from("profiles").update({
    membership_level:         level,
    membership_expires_at:    expAt,
    tiendup_subscription_id:  subId,
    last_tiendup_sync:        new Date().toISOString(),
  }).eq("id", profile.id);

  await db.from("membership_activations").insert({
    user_id:        profile.id,
    level,
    activated_by:   "tiendup_sync",
    tiendup_sub_id: subId,
    valid_from:     new Date().toISOString(),
    valid_until:    expAt,
  });

  return { updated: true, email, level };
}

// ── Downgrade usuarios vencidos ───────────────────────────────────

async function downgradeExpired(): Promise<number> {
  const { data } = await db
    .from("profiles")
    .select("id")
    .in("membership_level", ["n1", "n2"])
    .lt("membership_expires_at", new Date().toISOString());

  if (!data?.length) return 0;

  await db.from("profiles")
    .update({ membership_level: "n0" })
    .in("id", data.map((p: { id: string }) => p.id));

  return data.length;
}

// ── Handler principal ─────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const origin  = req.headers.get("Origin");
  const headers = jsonHeaders(origin);

  if (!TIENDUP_KEY) {
    return new Response(JSON.stringify({ error: "TIENDUP_API_KEY not configured" }), { status: 500, headers });
  }

  const isCron = req.headers.get("x-cron-secret") === CRON_SECRET && CRON_SECRET;
  const authHeader = req.headers.get("Authorization") ?? "";
  const isUser = authHeader.startsWith("Bearer ");

  if (!isCron && !isUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  const errors: string[] = [];
  let updated   = 0;
  let downgraded = 0;

  try {
    // GET /subscriptions?status=active&limit=100
    const resp = await tiendupGet("/subscriptions?status=active&limit=100") as {
      status: string;
      data: Record<string, unknown>[];
    };

    const subscriptions = resp?.data ?? [];

    // Log la estructura del primer objeto para diagnóstico
    if (subscriptions.length > 0) {
      console.log("[sync-tiendup] Primer objeto:", JSON.stringify(subscriptions[0]));
    } else {
      console.log("[sync-tiendup] Sin suscripciones activas aún.");
    }

    if (isUser && !isCron) {
      // Modo usuario: sincronizar solo su email
      const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: authHeader, apikey: SERVICE_KEY },
      });
      const authUser = await authRes.json();
      const email: string = authUser?.email ?? "";

      const userSub = subscriptions.find(
        (s) => String(s.email ?? s.customer_email ?? "").toLowerCase() === email.toLowerCase()
      );

      if (userSub) {
        const r = await syncUser(email, userSub);
        if (r.updated) updated = 1;
      }
    } else {
      // Modo cron: sincronizar todos
      for (const sub of subscriptions) {
        const email = String(sub.email ?? sub.customer_email ?? "");
        if (!email) continue;
        try {
          const r = await syncUser(email, sub);
          if (r.updated) updated++;
        } catch (e) {
          errors.push(`${email}: ${String(e)}`);
        }
      }

      downgraded = await downgradeExpired();
    }

    // Log en tiendup_sync_log solo en modo cron
    if (isCron) {
      await db.from("tiendup_sync_log").insert({
        subscriptions_found: subscriptions.length,
        accounts_updated:    updated,
        accounts_downgraded: downgraded,
        errors:              errors,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, updated, downgraded, subscriptions: subscriptions.length }),
      { status: 200, headers }
    );
  } catch (e) {
    console.error("[sync-tiendup] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
