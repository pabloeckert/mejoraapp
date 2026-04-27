/**
 * admin-action — Edge Function para acciones administrativas
 *
 * 13 acciones CRUD para admin. Usa middleware compartido para
 * CORS + Auth + Admin + Rate Limiting.
 *
 * Acciones: update-profile, create-post, update-post-status, delete-post,
 * create-category, upsert-novedad, delete-novedad, moderate-post,
 * moderate-comment, add-role, remove-role.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logError } from "../_shared/log.ts";

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

Deno.serve(
  withMiddleware({ auth: true, admin: true, rateLimit: 30 }, async (req, ctx) => {
    const headers = { "Content-Type": "application/json" };
    const user = ctx.user!;

    try {
      const body = await req.json().catch(() => null);
      const action = body?.action;
      if (!action || typeof action !== "string") {
        return new Response(JSON.stringify({ error: "Acción requerida" }), { status: 400, headers });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

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
          const { error } = await supabaseAdmin.from("content_posts").delete().eq("id", postId);
          if (error) throw error;
          result = { success: true };
          break;
        }

        case "create-category": {
          const category = requireObject(params.category, "category");
          const { error } = await supabaseAdmin.from("content_categories").insert(category);
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
            return new Response(
              JSON.stringify({ error: "No podés eliminarte a vos mismo" }),
              { status: 400, headers }
            );
          }
          const { error } = await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", targetUserId)
            .eq("role", role);
          if (error) throw error;
          result = { success: true };
          break;
        }

        default:
          return new Response(
            JSON.stringify({ error: `Acción desconocida: ${action}` }),
            { status: 400, headers }
          );
      }

      logInfo("admin-action", action, { user_id: user.id });
      return new Response(JSON.stringify(result), { headers });
    } catch (e) {
      logError("admin-action", "Unhandled error", { error: String(e) });
      return new Response(
        JSON.stringify({ error: e instanceof Error ? e.message : "Error interno" }),
        { status: 500, headers }
      );
    }
  })
);
