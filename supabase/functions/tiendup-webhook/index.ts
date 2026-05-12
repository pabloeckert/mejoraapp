/**
 * tiendup-webhook — Edge Function para recibir webhooks de Tiendup
 *
 * Recibe eventos: sale.completed, subscription.activated,
 * subscription.cancelled, subscription.expired.
 *
 * Valida firma HMAC-SHA256 con secreto compartido.
 * Actualiza access_level en profiles y registra en payments.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, jsonHeaders } from "../_shared/cors.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("TIENDUP_WEBHOOK_SECRET") ?? "";

// Product ID → Access Level mapping (configurable via env)
const PRODUCT_N1_ID = Deno.env.get("TIENDUP_PRODUCT_N1_ID") ?? "";
const PRODUCT_N2_ID = Deno.env.get("TIENDUP_PRODUCT_N2_ID") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Signature verification ──────────────────────────────────────

async function verifySignature(body: string, signature: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    logWarn("tiendup-webhook", "No TIENDUP_WEBHOOK_SECRET configured — skipping verification");
    return true;
  }
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expected === signature;
  } catch {
    return false;
  }
}

// ── Event handlers ──────────────────────────────────────────────

interface TiendupEvent {
  event: string;
  data: {
    email?: string;
    subscriber_email?: string;
    product_id?: string;
    product_name?: string;
    amount?: number;
    currency?: string;
    payment_method?: string;
    external_id?: string;
    subscription_id?: string;
    [key: string]: unknown;
  };
}

/** Determine access level from product_id. Falls back to product_name heuristic. */
function resolveAccessLevel(event: TiendupEvent): string {
  const pid = event.data.product_id ?? "";

  // Exact match by configured product IDs
  if (PRODUCT_N2_ID && pid === PRODUCT_N2_ID) return "N2";
  if (PRODUCT_N1_ID && pid === PRODUCT_N1_ID) return "N1";

  // Fallback: heuristic by product name
  const name = (event.data.product_name ?? "").toLowerCase();
  if (name.includes("premium") || name.includes("n2")) return "N2";

  return "N1"; // default
}

async function findUserByEmail(email: string): Promise<string | null> {
  // Search in auth.users via admin API
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const users = data.users ?? [];
  return users.length > 0 ? users[0].id : null;
}

async function getProfileByUserId(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("access_level")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function updateAccessLevel(userId: string, level: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      access_level: level,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    logError("tiendup-webhook", `Failed to update access_level for ${userId}: ${error.message}`);
    return false;
  }
  return true;
}

async function setMembershipExpiry(userId: string, expiresAt: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ membership_expires_at: expiresAt })
    .eq("user_id", userId);

  if (error) {
    logError("tiendup-webhook", `Failed to set membership_expires_at for ${userId}: ${error.message}`);
  }
}

async function registerPayment(
  userId: string,
  amount: number,
  currency: string,
  method: string | null,
  externalId: string | null,
  accessLevel: string,
  notes: string
) {
  const now = new Date();
  const periodStart = now.toISOString().split("T")[0];
  const periodEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split("T")[0];

  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    amount,
    currency: currency || "ARS",
    payment_method: method,
    external_id: externalId,
    status: "completed",
    access_level_granted: accessLevel,
    period_start: periodStart,
    period_end: periodEnd,
    notes,
  });

  if (error) {
    logError("tiendup-webhook", `Failed to register payment: ${error.message}`);
  }
}

async function handleSaleCompleted(event: TiendupEvent) {
  const email = event.data.email || event.data.subscriber_email;
  if (!email) {
    logWarn("tiendup-webhook", "sale.completed: no email in event data");
    return;
  }

  const userId = await findUserByEmail(email);
  if (!userId) {
    logWarn("tiendup-webhook", `sale.completed: user not found for ${email}`);
    return;
  }

  const targetLevel = resolveAccessLevel(event);

  // Set membership expiry (1 month from now for one-time purchases)
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await updateAccessLevel(userId, targetLevel);
  await setMembershipExpiry(userId, expiresAt.toISOString());
  await registerPayment(
    userId,
    event.data.amount ?? 0,
    event.data.currency ?? "ARS",
    event.data.payment_method ?? null,
    event.data.external_id ?? null,
    targetLevel,
    `Tiendup sale: ${event.data.product_name ?? "unknown"}`
  );

  logInfo("tiendup-webhook", `sale.completed: ${email} → ${targetLevel}, expires ${expiresAt.toISOString()}`);
}

async function handleSubscriptionActivated(event: TiendupEvent) {
  const email = event.data.email || event.data.subscriber_email;
  if (!email) return;

  const userId = await findUserByEmail(email);
  if (!userId) {
    logWarn("tiendup-webhook", `subscription.activated: user not found for ${email}`);
    return;
  }

  const targetLevel = resolveAccessLevel(event);
  await updateAccessLevel(userId, targetLevel);
  logInfo("tiendup-webhook", `subscription.activated: ${email} → ${targetLevel}`);
}

async function handleSubscriptionCancelled(event: TiendupEvent) {
  const email = event.data.email || event.data.subscriber_email;
  if (!email) return;

  const userId = await findUserByEmail(email);
  if (!userId) {
    logWarn("tiendup-webhook", `subscription.cancelled: user not found for ${email}`);
    return;
  }

  await updateAccessLevel(userId, "N0");
  logInfo("tiendup-webhook", `subscription.cancelled: ${email} → N0`);
}

async function handleSubscriptionExpired(event: TiendupEvent) {
  const email = event.data.email || event.data.subscriber_email;
  if (!email) return;

  const userId = await findUserByEmail(email);
  if (!userId) {
    logWarn("tiendup-webhook", `subscription.expired: user not found for ${email}`);
    return;
  }

  await updateAccessLevel(userId, "N0");
  logInfo("tiendup-webhook", `subscription.expired: ${email} → N0`);
}

// ── Main handler ────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const headers = jsonHeaders(req.headers.get("Origin"));

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  // Verify signature
  const body = await req.text();
  const signature = req.headers.get("X-Tiendup-Signature");
  const isValid = await verifySignature(body, signature);

  if (!isValid) {
    logWarn("tiendup-webhook", "Invalid webhook signature");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers,
    });
  }

  // Parse event
  let event: TiendupEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  logInfo("tiendup-webhook", `Received event: ${event.event}`);

  // Route to handler
  try {
    switch (event.event) {
      case "sale.completed":
        await handleSaleCompleted(event);
        break;
      case "subscription.activated":
        await handleSubscriptionActivated(event);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event);
        break;
      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;
      default:
        logInfo("tiendup-webhook", `Unhandled event type: ${event.event}`);
    }

    return new Response(JSON.stringify({ received: true, event: event.event }), {
      status: 200,
      headers,
    });
  } catch (err) {
    logError("tiendup-webhook", `Handler error: ${err}`);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers,
    });
  }
});
