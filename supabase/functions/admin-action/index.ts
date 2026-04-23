import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user auth
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role with service_role
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
      return new Response(JSON.stringify({ error: "Sin permisos de admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse action
    const { action, ...params } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Acción requerida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // ROUTER — cada acción es una operación admin de escritura
    // ============================================================
    let result;

    switch (action) {

      // ── PERFILES ──────────────────────────────────────────────
      case "update-profile": {
        const { profileId, data } = params;
        if (!profileId || !data) throw new Error("profileId y data requeridos");
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            nombre: data.nombre?.trim() || null,
            apellido: data.apellido?.trim() || null,
            empresa: data.empresa?.trim() || null,
            cargo: data.cargo?.trim() || null,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            display_name: `${(data.nombre || "").trim()} ${(data.apellido || "").trim()}`.trim() || null,
          })
          .eq("id", profileId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ── CONTENIDO: POSTS ──────────────────────────────────────
      case "create-post": {
        const { post } = params;
        if (!post) throw new Error("post requerido");
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
        const { postId, estado } = params;
        if (!postId || !estado) throw new Error("postId y estado requeridos");
        const { error } = await supabaseAdmin
          .from("content_posts")
          .update({ estado })
          .eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete-post": {
        const { postId } = params;
        if (!postId) throw new Error("postId requerido");
        const { error } = await supabaseAdmin
          .from("content_posts")
          .delete()
          .eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ── CONTENIDO: CATEGORÍAS ─────────────────────────────────
      case "create-category": {
        const { category } = params;
        if (!category) throw new Error("category requerido");
        const { error } = await supabaseAdmin
          .from("content_categories")
          .insert(category);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ── NOVEDADES ─────────────────────────────────────────────
      case "upsert-novedad": {
        const { novedadId, data } = params;
        if (!data) throw new Error("data requerido");
        if (novedadId) {
          const { error } = await supabaseAdmin
            .from("novedades")
            .update(data)
            .eq("id", novedadId);
          if (error) throw error;
        } else {
          const { error } = await supabaseAdmin
            .from("novedades")
            .insert(data);
          if (error) throw error;
        }
        result = { success: true };
        break;
      }

      case "delete-novedad": {
        const { novedadId } = params;
        if (!novedadId) throw new Error("novedadId requerido");
        const { error } = await supabaseAdmin
          .from("novedades")
          .delete()
          .eq("id", novedadId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ── MURO: MODERACIÓN ──────────────────────────────────────
      case "moderate-post": {
        const { postId, status } = params;
        if (!postId || !status) throw new Error("postId y status requeridos");
        const { error } = await supabaseAdmin
          .from("wall_posts")
          .update({ status })
          .eq("id", postId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "moderate-comment": {
        const { commentId, status } = params;
        if (!commentId || !status) throw new Error("commentId y status requeridos");
        const { error } = await supabaseAdmin
          .from("wall_comments")
          .update({ status })
          .eq("id", commentId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ── ROLES ─────────────────────────────────────────────────
      case "add-role": {
        const { targetUserId, role } = params;
        if (!targetUserId || !role) throw new Error("targetUserId y role requeridos");
        const { error } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: targetUserId, role });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "remove-role": {
        const { targetUserId, role } = params;
        if (!targetUserId || !role) throw new Error("targetUserId y role requeridos");
        // Prevent self-demotion
        if (targetUserId === user.id && role === "admin") {
          return new Response(JSON.stringify({ error: "No podés eliminarte a vos mismo" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
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
        return new Response(JSON.stringify({ error: `Acción desconocida: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("admin-action error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
