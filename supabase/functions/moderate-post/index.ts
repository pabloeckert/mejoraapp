/**
 * moderate-post — Edge Function para moderación de posts del muro
 *
 * Usa middleware compartido para CORS + Auth + Rate Limiting.
 * Cadena IA: Gemini → Groq → OpenRouter → auto-aprobado.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

const MODERATION_PROMPT = `Sos el moderador de MejoraOK, una comunidad de negocios argentina. Tu trabajo es decidir si un post anónimo del muro es apropiado o no.

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

SÉ PERMISIVO con el tono argentino: puteadas leves, frustración genuina, ironía y sarcasmo son parte de la cultura y están bien. No censures por tono, solo por contenido dañino.

Respondé ÚNICAMENTE en formato JSON: {"action": "approved" o "rejected", "reason": "razón breve en español"}`;

async function callAI(prompt: string): Promise<{ action: string; reason: string } | null> {
  // Try Gemini first
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
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
      logWarn("moderate-post", "Gemini failed, trying fallback", { error: String(e) });
    }
  }

  // Fallback: Groq
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: MODERATION_PROMPT },
            { role: "user", content: prompt },
          ],
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
      logWarn("moderate-post", "Groq failed, trying fallback", { error: String(e) });
    }
  }

  // Fallback: OpenRouter
  const orKey = Deno.env.get("OPENROUTER_API_KEY");
  if (orKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${orKey}` },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            { role: "system", content: MODERATION_PROMPT },
            { role: "user", content: prompt },
          ],
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
      logWarn("moderate-post", "OpenRouter failed", { error: String(e) });
    }
  }

  return null;
}

Deno.serve(
  withMiddleware({ auth: true, rateLimit: 3 }, async (req, ctx) => {
    const headers = { "Content-Type": "application/json" };
    const user = ctx.user!;

    try {
      const body = await req.json().catch(() => null);
      if (!body?.content || typeof body.content !== "string" || body.content.trim().length === 0) {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío." }), { status: 400, headers });
      }

      const content = (body.content as string).replace(/<[^>]*>/g, "").trim(); // Strip HTML tags
      if (content.length === 0) {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío." }), { status: 400, headers });
      }
      if (content.length > 1000) {
        return new Response(JSON.stringify({ error: "El contenido no puede superar los 1000 caracteres." }), { status: 400, headers });
      }

      // Supabase admin client for DB operations
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Additional DB-level rate limit: max 3 posts per minute per user
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await supabaseAdmin
        .from("wall_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneMinuteAgo);

      if ((count || 0) >= 3) {
        logWarn("moderate-post", "DB rate limit hit", { user_id: user.id });
        return new Response(
          JSON.stringify({ error: "Máximo 3 posts por minuto. Esperá un momento." }),
          { status: 429, headers }
        );
      }

      // AI moderation
      let modAction = "approved";
      let modReason = "Auto-aprobado (sin IA configurada)";

      const aiResult = await callAI(`Moderá este post del muro anónimo:\n\n"${content}"`);
      if (aiResult) {
        modAction = aiResult.action || "approved";
        modReason = aiResult.reason || "Moderado por IA";
      }

      // Insert post with service_role (bypasses RLS)
      const { data: post, error: insertError } = await supabaseAdmin
        .from("wall_posts")
        .insert({ user_id: user.id, content: content.trim(), status: modAction })
        .select("id, status")
        .single();

      if (insertError) {
        logError("moderate-post", "Insert failed", { error: insertError.message });
        throw new Error("Error al publicar");
      }

      // Log moderation (fire-and-forget)
      supabaseAdmin.from("moderation_log").insert({
        post_id: post.id, action: modAction, reason: modReason,
      }).then(() => {}).catch(() => {});

      logInfo("moderate-post", "Post created", { post_id: post.id, status: modAction, user_id: user.id });

      if (modAction === "rejected") {
        return new Response(
          JSON.stringify({
            success: false,
            rejected: true,
            reason: "Tu post no pudo ser publicado porque no cumple con las normas de la comunidad.",
          }),
          { headers }
        );
      }

      return new Response(JSON.stringify({ success: true, post_id: post.id }), { headers });
    } catch (e) {
      logError("moderate-post", "Unhandled error", { error: String(e) });
      return new Response(
        JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
        { status: 500, headers }
      );
    }
  })
);
