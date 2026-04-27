/**
 * verify-admin — Edge Function para verificar si un usuario es admin
 *
 * Usa middleware compartido para CORS + Auth + Admin check.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logWarn } from "../_shared/log.ts";

Deno.serve(
  withMiddleware({ auth: true, admin: true }, async (_req, ctx) => {
    const user = ctx.user!;

    // If middleware passed admin check, user is admin
    return new Response(
      JSON.stringify({
        authorized: true,
        user_id: user.id,
        email: user.email,
        role: "admin",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  })
);
