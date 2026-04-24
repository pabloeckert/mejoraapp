import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ALLOWED_ORIGINS = ["https://app.mejoraok.com", "http://localhost:8080", "http://localhost:5173"];
function getCorsHeaders(origin: string | null) {
  const allowed = ALLOWED_ORIGINS.includes(origin ?? "") ? origin! : "https://app.mejoraok.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MODERATION_PROMPT = `Sos el moderador de MejoraOK, comunidad de negocios argentina. Decidí si un comentario es apropiado.
APROBÁS: experiencias, preguntas, consejos, reflexiones de negocio.
RECHAZÁS: spam, publicidad, insultos, datos personales, contenido irrelevante.
SÉ PERMISIVO con el tono argentino. Respondé ÚNICAMENTE en JSON: {"action":"approved" o "rejected","reason":"breve razón"}`;

async function callAI(prompt: string): Promise<{ action: string; reason: string } | null> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${MODERATION_PROMPT}\n\n${prompt}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) return JSON.parse(match[0]);
      }
    } catch (e) { console.warn("Gemini failed:", e); }
  }

  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: MODERATION_PROMPT }, { role: "user", content: prompt }],
          temperature: 0.3, max_tokens: 256,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) return JSON.parse(match[0]);
      }
    } catch (e) { console.warn("Groq failed:", e); }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { post_id, content } = await req.json();

    if (!post_id || !content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Datos incompletos." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (content.length > 500) {
      return new Response(JSON.stringify({ error: "Máximo 500 caracteres." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: 10 comments per minute
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabaseAdmin
      .from("wall_comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo);

    if ((count || 0) >= 10) {
      return new Response(JSON.stringify({ error: "Máximo 10 comentarios por minuto." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI moderation
    let modAction = "approved";
    let modReason = "Auto-aprobado";

    const aiResult = await callAI(`Moderá este comentario:\n\n"${content}"`);
    if (aiResult) {
      modAction = aiResult.action || "approved";
      modReason = aiResult.reason || "Moderado por IA";
    }

    // Insert comment with service_role
    const { data: comment, error: insertError } = await supabaseAdmin
      .from("wall_comments")
      .insert({ post_id, user_id: user.id, content: content.trim(), status: modAction })
      .select("id, post_id, content, created_at, user_id, status")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Error al publicar comentario");
    }

    // Log moderation
    if (comment) {
      await supabaseAdmin.from("moderation_comments_log").insert({
        comment_id: comment.id, action: modAction, reason: modReason,
      });
    }

    if (modAction === "rejected") {
      return new Response(
        JSON.stringify({ success: false, rejected: true, reason: "Tu comentario no cumple con las normas." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, comment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("moderate-comment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
