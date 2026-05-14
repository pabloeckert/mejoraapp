/**
 * mentor-chat-stream — Streaming SSE version of Mentor IA
 *
 * Returns a Server-Sent Events stream so the UI can render
 * tokens progressively instead of waiting for the full response.
 *
 * SSE protocol:
 *   data: {"chunk":"texto..."}\n\n          ← token parcial
 *   data: {"done":true,"conversationId":"...","model":"..."}\n\n  ← fin
 *   data: {"error":"mensaje"}\n\n           ← error no-recuperable
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

// ── Types ────────────────────────────────────────────────────────

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

type ChunkCallback = (text: string) => Promise<void>;

interface StreamResult {
  content: string;
  model: string;
  tokensUsed: number;
}

// ── Auth helper ──────────────────────────────────────────────────

async function verifyJwt(token: string): Promise<{ id: string; email?: string } | null> {
  try {
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")!}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

// ── Rate limiter (in-memory, per instance) ───────────────────────

const rlMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = rlMap.get(key);
  if (!entry || now > entry.resetAt) {
    rlMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ── Streaming AI providers ───────────────────────────────────────

async function streamGroq(
  messages: AIMessage[],
  onChunk: ChunkCallback
): Promise<StreamResult | null> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 512,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) {
            fullText += chunk;
            await onChunk(chunk);
          }
        } catch {
          // skip malformed SSE chunk
        }
      }
    }

    return fullText
      ? { content: fullText, model: "llama-3.3-70b-versatile", tokensUsed: 0 }
      : null;
  } catch (e) {
    logWarn("mentor-chat-stream", "Groq stream failed", { error: String(e) });
    return null;
  }
}

async function streamGemini(
  messages: AIMessage[],
  onChunk: ChunkCallback
): Promise<StreamResult | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;

  try {
    const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
    const conversationMsgs = messages.filter((m) => m.role !== "system");
    const prompt =
      `${systemMsg}\n\n` +
      conversationMsgs
        .map((m) => `${m.role === "user" ? "Usuario" : "Mentor"}: ${m.content}`)
        .join("\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${key}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) {
            fullText += chunk;
            await onChunk(chunk);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }

    return fullText
      ? { content: fullText, model: "gemini-2.0-flash", tokensUsed: 0 }
      : null;
  } catch (e) {
    logWarn("mentor-chat-stream", "Gemini stream failed", { error: String(e) });
    return null;
  }
}

async function streamOpenRouter(
  messages: AIMessage[],
  onChunk: ChunkCallback
): Promise<StreamResult | null> {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return null;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages,
        temperature: 0.7,
        max_tokens: 512,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) {
            fullText += chunk;
            await onChunk(chunk);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }

    return fullText
      ? { content: fullText, model: "deepseek-v3", tokensUsed: 0 }
      : null;
  } catch (e) {
    logWarn("mentor-chat-stream", "OpenRouter stream failed", { error: String(e) });
    return null;
  }
}

// ── Context helpers (same logic as mentor-chat) ──────────────────

async function buildUserContext(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  try {
    const [{ data: profile }, { data: diagnostic }, { data: badges }] = await Promise.all([
      supabase
        .from("profiles")
        .select("empresa, cargo, industry")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("diagnostic_results")
        .select("score, perfil")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("user_badges").select("badge_id").eq("user_id", userId),
    ]);

    const parts: string[] = [];
    if (profile?.empresa) parts.push(`Empresa: ${profile.empresa}`);
    if (profile?.cargo) parts.push(`Cargo: ${profile.cargo}`);
    if (profile?.industry) parts.push(`Industria: ${profile.industry}`);
    if (diagnostic?.perfil)
      parts.push(`Perfil Mirror: ${diagnostic.perfil} (${diagnostic.score} puntos)`);
    if (badges?.length) parts.push(`Badges: ${badges.map((b) => b.badge_id).join(", ")}`);

    return parts.length > 0 ? parts.join("\n") : "Sin perfil completado aún.";
  } catch {
    return "Contexto no disponible.";
  }
}

async function getSystemPrompt(supabase: ReturnType<typeof createClient>): Promise<string> {
  try {
    const { data } = await supabase
      .from("mentor_config")
      .select("value")
      .eq("key", "system_prompt")
      .maybeSingle();
    return data?.value ?? getDefaultSystemPrompt();
  } catch {
    return getDefaultSystemPrompt();
  }
}

function getDefaultSystemPrompt(): string {
  return `Sos el Mentor IA de Mejora Continua, una comunidad de líderes empresariales argentinos. Tu rol es ser un mentor de negocios personalizado.

REGLAS:
- Respondé siempre en español argentino con voseo
- Sé directo, práctico y accionable
- Basá tus respuestas en el contexto del usuario (empresa, cargo, industria, resultado Mirror)
- Cuando sea posible, sugerí contenido de la plataforma o pasos concretos
- No inventes datos — si no tenés información, pedila
- Mantené un tono profesional pero cercano, como un mentor experimentado
- Limitá tus respuestas a 200 palabras máximo para mantener el chat ágil
- Si el usuario pregunta algo fuera del ámbito de negocios, redirigilo amablemente`;
}

async function getConversationHistory(
  supabase: ReturnType<typeof createClient>,
  conversationId: string
): Promise<AIMessage[]> {
  try {
    const { data } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    return (data ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  } catch {
    return [];
  }
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user = await verifyJwt(authHeader.replace("Bearer ", ""));
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate limit: 20 req/min
  if (!checkRateLimit(user.id, 20)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Intentá en un minuto." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
    });
  }

  // Parse body
  let message: string;
  let conversationId: string | null;

  try {
    const body = await req.json();
    message = body.message ?? "";
    conversationId = body.conversationId ?? null;
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!message.trim() || message.length > 1000) {
    return new Response(
      JSON.stringify({ error: "Mensaje requerido (máx 1000 caracteres)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const enc = new TextEncoder();

  const send = async (payload: Record<string, unknown>) => {
    await writer.write(enc.encode(`data: ${JSON.stringify(payload)}\n\n`));
  };

  // Process in background — response is returned immediately
  (async () => {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Check mentor enabled
      const { data: cfg } = await supabase
        .from("mentor_config")
        .select("value")
        .eq("key", "enabled")
        .maybeSingle();

      if (cfg?.value === "false") {
        await send({ error: "El Mentor IA no está disponible en este momento" });
        return;
      }

      // Get or create conversation
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("mentor_conversations")
          .insert({
            user_id: user.id,
            title: message.substring(0, 80) + (message.length > 80 ? "..." : ""),
          })
          .select("id")
          .single();

        if (convError) {
          logError("mentor-chat-stream", "Failed to create conversation", {
            error: convError.message,
          });
          await send({ error: "Error al crear conversación" });
          return;
        }

        activeConversationId = newConv.id;
        // Tell client the new conversation ID immediately so it can track it
        await send({ conversationId: activeConversationId });
      }

      // Build context + history in parallel
      const [userContext, systemPrompt, history] = await Promise.all([
        buildUserContext(supabase, user.id),
        getSystemPrompt(supabase),
        getConversationHistory(supabase, activeConversationId!),
      ]);

      // Save user message
      await supabase.from("mentor_messages").insert({
        conversation_id: activeConversationId,
        user_id: user.id,
        role: "user",
        content: message.trim(),
      });

      // Build messages array
      const systemWithContext = systemPrompt
        .replace("{user_context}", userContext)
        .replace(
          "{conversation_history}",
          history.length > 0
            ? history
                .map((m) => `${m.role === "user" ? "Usuario" : "Mentor"}: ${m.content}`)
                .join("\n")
            : "Primera interacción."
        );

      const aiMessages: AIMessage[] = [
        { role: "system", content: systemWithContext },
        ...history,
        { role: "user", content: message.trim() },
      ];

      // Stream from AI (Groq → Gemini → OpenRouter → fallback)
      const onChunk: ChunkCallback = (chunk) => send({ chunk });

      const result =
        (await streamGroq(aiMessages, onChunk)) ??
        (await streamGemini(aiMessages, onChunk)) ??
        (await streamOpenRouter(aiMessages, onChunk));

      let finalContent: string;
      let finalModel: string;

      if (result) {
        finalContent = result.content;
        finalModel = result.model;
      } else {
        // Fallback: stream the fixed message character by character for consistency
        finalContent =
          "Disculpá, tuve un problema técnico. ¿Podés reformular tu consulta? Si el problema persiste, contactá al soporte de Mejora Continua.";
        await send({ chunk: finalContent });
        finalModel = "fallback";
      }

      // Save assistant message
      await supabase.from("mentor_messages").insert({
        conversation_id: activeConversationId,
        user_id: user.id,
        role: "assistant",
        content: finalContent,
        model_used: finalModel,
        tokens_used: result?.tokensUsed ?? 0,
      });

      logInfo("mentor-chat-stream", "Stream complete", {
        userId: user.id,
        conversationId: activeConversationId,
        model: finalModel,
        chars: finalContent.length,
      });

      // Signal completion
      await send({ done: true, conversationId: activeConversationId, model: finalModel });
    } catch (e) {
      logError("mentor-chat-stream", "Unhandled error", { error: String(e) });
      await send({ error: "Error interno del servidor" });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});
