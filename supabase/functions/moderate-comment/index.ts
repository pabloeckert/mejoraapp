/**
 * moderate-comment — Edge Function para moderación de comentarios
 *
 * Usa middleware compartido para CORS + Auth + Rate Limiting.
 * Cadena IA: Gemini → Groq → auto-aprobado.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

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
    } catch (e) {
      logWarn("moderate-comment", "Gemini failed", { error: String(e) });
    }
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
          temperature: 0.3,
          max_tokens: 256,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) return JSON.parse(match[0]);
      }
    } catch (e) {
      logWarn("moderate-comment", "Groq failed", { error: String(e) });
    }
  }

  return null;
}

Deno.serve(
  withMiddleware({ auth: true, rateLimit: 10 }, async (req, ctx) => {
    const headers = { "Content-Type": "application/json" };
    const user = ctx.user!;

    try {
      const body = await req.json().catch(() => null);
      if (!body?.post_id || !body?.content || typeof body.content !== "string" || body.content.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Datos incompletos." }), { status: 400, headers });
      }

      const post_id = typeof body.post_id === "string" ? body.post_id.trim() : "";
      if (!post_id || post_id.length > 100) {
        return new Response(JSON.stringify({ error: "post_id inválido." }), { status: 400, headers });
      }
      const content = (body.content as string).replace(/<[^>]*>/g, "").trim(); // Strip HTML tags
      if (content.length === 0) {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío." }), { status: 400, headers });
      }
      if (content.length > 500) {
        return new Response(JSON.stringify({ error: "Máximo 500 caracteres." }), { status: 400, headers });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // DB-level rate limit: 10 comments per minute
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await supabaseAdmin
        .from("wall_comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneMinuteAgo);

      if ((count || 0) >= 10) {
        logWarn("moderate-comment", "DB rate limit hit", { user_id: user.id });
        return new Response(
          JSON.stringify({ error: "Máximo 10 comentarios por minuto." }),
          { status: 429, headers }
        );
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
        logError("moderate-comment", "Insert failed", { error: insertError.message });
        throw new Error("Error al publicar comentario");
      }

      // Log moderation (fire-and-forget)
      if (comment) {
        supabaseAdmin.from("moderation_comments_log").insert({
          comment_id: comment.id, action: modAction, reason: modReason,
        }).then(() => {}).catch(() => {});
      }

      logInfo("moderate-comment", "Comment created", {
        comment_id: comment?.id, status: modAction, user_id: user.id,
      });

      if (modAction === "rejected") {
        return new Response(
          JSON.stringify({ success: false, rejected: true, reason: "Tu comentario no cumple con las normas." }),
          { headers }
        );
      }

      return new Response(JSON.stringify({ success: true, comment }), { headers });
    } catch (e) {
      logError("moderate-comment", "Unhandled error", { error: String(e) });
      return new Response(
        JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
        { status: 500, headers }
      );
    }
  })
);
