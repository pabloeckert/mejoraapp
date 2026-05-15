/**
 * activate-membership-manual — Activación manual de membresía por admin
 *
 * Body: { user_id: string, level: 'n1'|'n2', days?: number, note?: string }
 * Auth: JWT requerido + rol admin
 * Rate limit: 20 activaciones por hora
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

interface ActivateBody {
  user_id: string;
  level: "n1" | "n2";
  days?: number;
  note?: string;
}

// Rate limit propio por hora (20 activaciones/hora por admin)
const hourlyActivations = new Map<string, { count: number; resetAt: number }>();

function checkHourlyLimit(adminId: string): boolean {
  const now = Date.now();
  const entry = hourlyActivations.get(adminId);
  if (!entry || now > entry.resetAt) {
    hourlyActivations.set(adminId, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

Deno.serve(
  withMiddleware({ auth: true, admin: true, rateLimit: 0 }, async (req, ctx) => {
    const headers = { "Content-Type": "application/json" };

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    const adminId = ctx.user!.id;

    if (!checkHourlyLimit(adminId)) {
      return new Response(
        JSON.stringify({ error: "Límite de 20 activaciones por hora alcanzado." }),
        { status: 429, headers: { ...headers, "Retry-After": "3600" } }
      );
    }

    let body: ActivateBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, headers });
    }

    const { user_id, level, days = 30, note } = body;

    if (!user_id || !["n1", "n2"].includes(level)) {
      return new Response(JSON.stringify({ error: "user_id y level (n1|n2) son requeridos" }), { status: 400, headers });
    }

    const validFrom  = new Date();
    const validUntil = new Date(validFrom.getTime() + days * 86_400_000);

    const { error: updateError } = await db.from("profiles").update({
      membership_level:       level,
      membership_expires_at:  validUntil.toISOString(),
      membership_started_at:  validFrom.toISOString(),
    }).eq("id", user_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers });
    }

    await db.from("membership_activations").insert({
      user_id,
      level,
      activated_by: "admin",
      valid_from:   validFrom.toISOString(),
      valid_until:  validUntil.toISOString(),
      notes:        note ?? null,
    });

    // Retornar perfil actualizado
    const { data: profile } = await db
      .from("profiles")
      .select("id, email, nombre, apellido, membership_level, membership_expires_at")
      .eq("id", user_id)
      .maybeSingle();

    return new Response(JSON.stringify({ ok: true, profile }), { status: 200, headers });
  })
);
