import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, jsonHeaders } from "../_shared/cors.ts";
import { logWarn, logError } from "../_shared/log.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const origin = req.headers.get("Origin");
  const headers = jsonHeaders(origin);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ authorized: false, error: "No autenticado" }), { status: 401, headers });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ authorized: false, error: "No autenticado" }), { status: 401, headers });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      logWarn("verify-admin", "Non-admin access attempt", { user_id: user.id });
      return new Response(JSON.stringify({ authorized: false, error: "Sin permisos de admin" }), { status: 403, headers });
    }

    return new Response(
      JSON.stringify({ authorized: true, user_id: user.id, email: user.email, role: "admin" }),
      { headers }
    );
  } catch (e) {
    logError("verify-admin", "Unhandled error", { error: String(e) });
    return new Response(JSON.stringify({ authorized: false, error: "Error interno" }), { status: 500, headers });
  }
});
