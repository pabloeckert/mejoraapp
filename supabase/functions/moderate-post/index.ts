import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "El contenido no puede estar vacío." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (content.length > 1000) {
      return new Response(JSON.stringify({ error: "El contenido no puede superar los 1000 caracteres." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // AI moderation
    const moderationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sos el moderador de MejoraOK, una comunidad de negocios argentina. Tu trabajo es decidir si un post anónimo del muro es apropiado o no.

APROBÁS si:
- Comparte una experiencia de negocio (buena o mala)
- Hace una pregunta genuina sobre emprendimiento
- Expresa frustración real sobre su situación empresarial
- Pide consejo o perspectiva sobre negocios
- Comparte un aprendizaje o reflexión de negocio

RECHAZÁS si:
- Contiene spam, publicidad o promoción de servicios
- Tiene insultos directos a personas o empresas con nombre
- Incluye información personal identificable (teléfonos, direcciones, emails)
- Contenido sexual, violento o discriminatorio
- Es completamente irrelevante al mundo de los negocios
- Intenta vender algo o captar clientes

SÉ PERMISIVO con el tono argentino: puteadas leves, frustración genuina, ironía y sarcasmo son parte de la cultura y están bien. No censures por tono, solo por contenido dañino.`,
          },
          {
            role: "user",
            content: `Moderá este post del muro anónimo:\n\n"${content}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderate_post",
              description: "Decide if a wall post should be approved or rejected",
              parameters: {
                type: "object",
                properties: {
                  action: { type: "string", enum: ["approved", "rejected"] },
                  reason: { type: "string", description: "Brief reason in Spanish" },
                },
                required: ["action", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "moderate_post" } },
      }),
    });

    if (!moderationResponse.ok) {
      if (moderationResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá de nuevo." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (moderationResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI moderation error:", moderationResponse.status);
      // On AI failure, approve by default to not block users
    }

    let modAction = "approved";
    let modReason = "Auto-aprobado";

    if (moderationResponse.ok) {
      const aiData = await moderationResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        modAction = parsed.action;
        modReason = parsed.reason;
      }
    }

    // Use service role to insert post + moderation log
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: post, error: insertError } = await supabaseAdmin
      .from("wall_posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        status: modAction,
      })
      .select("id, status")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Error al publicar");
    }

    // Log moderation
    await supabaseAdmin.from("moderation_log").insert({
      post_id: post.id,
      action: modAction,
      reason: modReason,
    });

    if (modAction === "rejected") {
      return new Response(
        JSON.stringify({
          success: false,
          rejected: true,
          reason: "Tu post no pudo ser publicado porque no cumple con las normas de la comunidad.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, post_id: post.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("moderate-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
