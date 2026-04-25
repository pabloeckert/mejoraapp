import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, jsonHeaders } from "../_shared/cors.ts";
import { logInfo, logError } from "../_shared/log.ts";

const SYSTEM_PROMPT = `Sos la voz de Mejora Continua, una comunidad de negocios argentina. Tu comunicación es:
- DIRECTA: Vas al punto sin preámbulos.
- HONESTA: No prometés lo que no podés cumplir.
- EMOCIONAL: Conectás con lo que la persona siente.
- ARGENTINA: Usás "vos", expresiones del contexto.
- SIMPLE: Frases cortas, ideas claras.

Generá contenido con un título corto y contundente, y contenido en párrafos separados por saltos de línea.

Respondé ÚNICAMENTE en formato JSON: {"titulo": "...", "contenido": "...", "resumen": "..."}`;

const CATEGORY_PROMPTS: Record<string, string> = {
  tip: "un tip práctico y accionable que pueda aplicar hoy mismo. Que sea contundente, en 2-3 párrafos cortos. Que empiece nombrando el dolor y termine con una acción concreta",
  estrategia: "un artículo corto (3-4 párrafos) con una estrategia concreta. Usá la estructura ESPEJO→DOLOR→SALIDA.",
  reflexion: "una reflexión provocadora que lo haga cuestionar su forma de operar. Usá la estructura de CONFRONTACIÓN DIRECTA.",
  noticia: "un análisis breve de una tendencia o situación actual relevante para negocios. Concreto, útil y con bajada práctica.",
};

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    const errText = await res.text();
    throw new Error(`Gemini error: ${res.status} ${errText}`);
  }

  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7, max_tokens: 2048,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    }
  }

  throw new Error("No hay proveedores de IA configurados.");
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers });
    }

    const body = await req.json().catch(() => ({}));
    const category = typeof body.category === "string" ? body.category : "tip";
    const guidelines = typeof body.guidelines === "string" ? body.guidelines : "";

    const promptType = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.tip;
    const guidelinesBlock = guidelines ? `\n\nLineamientos del administrador: ${guidelines}` : "";

    const aiResponse = await callAI(
      SYSTEM_PROMPT + guidelinesBlock,
      `Generá ${promptType}.`
    );

    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { titulo: "Contenido generado", contenido: aiResponse, resumen: aiResponse.slice(0, 120) };
    } catch {
      result = { titulo: "Contenido generado", contenido: aiResponse, resumen: aiResponse.slice(0, 120) };
    }

    logInfo("generate-content", "Content generated", { category, user_id: user.id });

    return new Response(JSON.stringify(result), { headers });
  } catch (e) {
    logError("generate-content", "Unhandled error", { error: String(e) });
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: jsonHeaders(origin) }
    );
  }
});
