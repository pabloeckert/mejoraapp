/**
 * tiendup-checkout — Edge Function para generar link de pago Tiendup
 *
 * Recibe product_id del plan elegido, consulta la API de Tiendup
 * para obtener el link de checkout, y lo retorna al frontend.
 *
 * Requiere autenticación (usuario logueado).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logError } from "../_shared/log.ts";

const TIENDUP_API_URL = Deno.env.get("TIENDUP_API_URL") ?? "https://pablo-usos.public-api.tiendup.com";
const TIENDUP_API_KEY = Deno.env.get("TIENDUP_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface CheckoutRequest {
  product_id: string;
}

Deno.serve(
  withMiddleware({ auth: true, rateLimit: 10 }, async (req, ctx) => {
    const headers = { "Content-Type": "application/json" };
    const user = ctx.user!;

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers,
      });
    }

    if (!TIENDUP_API_KEY) {
      logError("tiendup-checkout", "TIENDUP_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment system not configured" }),
        { status: 500, headers }
      );
    }

    // Parse request
    let body: CheckoutRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers,
      });
    }

    if (!body.product_id) {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400,
        headers,
      });
    }

    // Get user email for Tiendup
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, nombre, apellido")
      .eq("user_id", user.id)
      .maybeSingle();

    const email = profile?.email || user.email;
    if (!email) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers }
      );
    }

    // Create sale in Tiendup to get checkout link
    try {
      const tiendupRes = await fetch(`${TIENDUP_API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TIENDUP_API_KEY}`,
        },
        body: JSON.stringify({
          product_id: body.product_id,
          email,
          name: [profile?.nombre, profile?.apellido].filter(Boolean).join(" ") || undefined,
        }),
      });

      if (!tiendupRes.ok) {
        const errText = await tiendupRes.text();
        logError("tiendup-checkout", `Tiendup API error ${tiendupRes.status}: ${errText}`);
        return new Response(
          JSON.stringify({ error: "Failed to create checkout session" }),
          { status: 502, headers }
        );
      }

      const tiendupData = await tiendupRes.json();

      logInfo("tiendup-checkout", `Checkout created for ${email}, product: ${body.product_id}`);

      // Return checkout URL
      return new Response(
        JSON.stringify({
          checkout_url: tiendupData.checkout_url || tiendupData.url || tiendupData.payment_url,
          sale_id: tiendupData.id || tiendupData.sale_id,
        }),
        { status: 200, headers }
      );
    } catch (err) {
      logError("tiendup-checkout", `Fetch error: ${err}`);
      return new Response(
        JSON.stringify({ error: "Failed to connect to payment provider" }),
        { status: 502, headers }
      );
    }
  })
);
