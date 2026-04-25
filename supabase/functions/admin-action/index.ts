import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, jsonHeaders } from "../_shared/cors.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

// ── Rate limiting (in-memory, per-function) ─────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── Validation helpers ──────────────────────────────────────────
function requireString(val: unknown, name: string): string {
  if (!val || typeof val !== "string" || val.trim().length === 0) {
    throw new Error(`${name} requerido`);
  }
  return val.trim();
}

function requireObject(val: unknown, name: string): Record<string, unknown> {
  if (!val || typeof val !== "object" || Array.isArray(val)) {
    throw new Error(`${name} requerido`);
  }
  return val as Record<string, unknown>;
}

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const origin = req.headers.get("Origin");
  const headers = jsonHeaders(origin);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers });
    }

    if (!checkRateLimit(user.id)) {
      logWarn("admin-action", "Rate limit hit", { user_id: user.id });
      return new Response(JSON.stringify({ error: "Demasiadas acciones. Esperá un minuto." }), { status: 429, headers });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      logWarn("admin-action", "Non-admin attempt", { user_id: user.id });
      return new Response(JSON.stringify({ error: "Sin permisos de admin" }), { status: 403, headers });
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;
    if (!action || typeof action !== "string") {
      return new Response(JSON.stringify({ error: "Acción requerida" }), { status: 400, headers });
    }

    // ── Audit log (fire-and-forget) ────────────────────────────
    const { action: _a, ...params } = body;
    supabaseAdmin.from("admin_audit_log").insert({
      user_id: user.id,
      action,
      params: JSON.stringify(params).slice(0, 1000),
      ip: req.headers.get("x-forwarded-for") || "unknown",
    }).then(() => {}).catch(() => {});

    // ============================================================
    // ROUTER
    // ============================================================
    let result;

    switch (action) {

      case "update-profile": {
        const data = requireObject(params.data, "data");
        const profileId = requireString(params.profileId, "profileId");
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            nombre: (data.nombre as string)?.trim() || null,
            apellido: (data.apellido as string)?.trim() || null,
            empresa: (data.empresa as string)?.trim() || null,
            cargo: (data.cargo as string)?.trim() || null,
            email: (data.email as string)?.trim() || null,
            phone: (data.phone as string)?.trim() || null,
            display_name: `${((data.nombre as string) || "").trim()} ${((data.apellido as string) || "").trim()}`.trim() || null,
          })
          .eq("id", profileId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "create-post": {
        const post = requireObject(params.post, "post");
        const { data: created, error } = await supabaseAdmin
          .from("content_posts")
          .insert(post)
          .select("id")
          .single();
        if (error) throw error;
        result = { success: true, id: created.id };
        break;
      }

      case "update-post-status": {
        const postId = requireString(params.postId, "postId");
        const estado = requireString(params.estado, "estado");
        const { error } = await supabaseAdmin
          .from("content_posts")
          .update({ estado })
          .eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete-post": {
        const postId = requireString(params.postId, "postId");
        const { error } = await supabaseAdmin
          .from("content_posts")
          .delete()
          .eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "create-category": {
        const category = requireObject(params.category, "category");
        const { error } = await supabaseAdmin
          .from("content_categories")
          .insert(category);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "upsert-novedad": {
        const data = requireObject(params.data, "data");
        if (params.novedadId) {
          const novedadId = requireString(params.novedadId, "novedadId");
          const { error } = await supabaseAdmin.from("novedades").update(data).eq("id", novedadId);
          if (error) throw error;
        } else {
          const { error } = await supabaseAdmin.from("novedades").insert(data);
          if (error) throw error;
        }
        result = { success: true };
        break;
      }

      case "delete-novedad": {
        const novedadId = requireString(params.novedadId, "novedadId");
        const { error } = await supabaseAdmin.from("novedades").delete().eq("id", novedadId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "moderate-post": {
        const postId = requireString(params.postId, "postId");
        const status = requireString(params.status, "status");
        const { error } = await supabaseAdmin.from("wall_posts").update({ status }).eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "moderate-comment": {
        const commentId = requireString(params.commentId, "commentId");
        const status = requireString(params.status, "status");
        const { error } = await supabaseAdmin.from("wall_comments").update({ status }).eq("id", commentId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "add-role": {
        const targetUserId = requireString(params.targetUserId, "targetUserId");
        const role = requireString(params.role, "role");
        const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: targetUserId, role });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "remove-role": {
        const targetUserId = requireString(params.targetUserId, "targetUserId");
        const role = requireString(params.role, "role");
        if (targetUserId === user.id && role === "admin") {
          return new Response(JSON.stringify({ error: "No podés eliminarte a vos mismo" }), { status: 400, headers });
        }
        const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId).eq("role", role);
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Acción desconocida: ${action}` }), { status: 400, headers });
    }

    logInfo("admin-action", action, { user_id: user.id });
    return new Response(JSON.stringify(result), { headers });

  } catch (e) {
    logError("admin-action", "Unhandled error", { error: String(e) });
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error interno" }),
      { status: 500, headers: jsonHeaders(origin) }
    );
  }
});
