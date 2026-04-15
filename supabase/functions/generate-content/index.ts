import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERFILES_INFO: Record<string, { nombre: string; dolor: string; deseo: string; frase: string }> = {
  SATURADO: {
    nombre: "El Emprendedor Saturado",
    dolor: "No prioriza, no delega, vive apagando incendios, sin procesos.",
    deseo: "Claridad mental, control, mapa simple, dejar de improvisar.",
    frase: "Tu problema no es el tiempo, es el foco.",
  },
  INVISIBLE: {
    nombre: "El Profesional Independiente en Crecimiento",
    dolor: "Sin propuesta de valor clara, no sabe posicionarse, cobra menos de lo que vale.",
    deseo: "Reconocimiento, mensaje claro, mejores clientes, subir precios sin culpa.",
    frase: "No te falta talento, te falta claridad.",
  },
  LIDER_SOLO: {
    nombre: "La Líder que Necesita Validación Externa",
    dolor: "Equipo no entiende, comunicación confusa, miedo a no liderar bien, decide en soledad.",
    deseo: "Ser clara, escuchada, respetada, segura en decisiones. Perspectiva externa honesta.",
    frase: "No estás liderando mal. Estás liderando sola.",
  },
  DESCONECTADO: {
    nombre: "El Empresario que Sospecha que Está Mal Asesorado",
    dolor: "Proveedores que prometen de más, informes inútiles, nadie dice la verdad, cambió de proveedor varias veces.",
    deseo: "Criterio real, verdad sin maquillaje, claridad externa, decisiones con info confiable.",
    frase: "No necesitás más informes, necesitás criterio.",
  },
  ESTANCADO: {
    nombre: "El que Necesita Orden para Crecer",
    dolor: "Creció rápido, sin estructura, miedo a desbarrancar, le encanta la propuesta pero desaparece.",
    deseo: "Crecer con orden, trabajar mejor, tener estructura sin frenar.",
    frase: "No necesitás cambiar todo. Necesitás ordenar lo que ya funciona.",
  },
  NUEVA_GEN: {
    nombre: "La Nueva Generación que Busca su Lugar",
    dolor: "Capaz y comprometida, pero sin claridad de rol, no le explican criterios, no sabe cómo hacer visible su aporte.",
    deseo: "Rol con nombre y peso real, mapa de crecimiento, claridad sobre su valor.",
    frase: "No te falta capacidad. Te falta claridad en tu rol.",
  },
  EQUIPO_DESALINEADO: {
    nombre: "El Equipo Desalineado",
    dolor: "Roles confusos, prioridades cambiantes, reuniones sin decisiones, cada uno interpreta distinto.",
    deseo: "Visión compartida, claridad en roles, menos fricción, marco + prioridades.",
    frase: "No les falta compromiso, les falta claridad.",
  },
  VENDEDOR_SIN_RESULTADOS: {
    nombre: "El Vendedor que No Ve Resultados",
    dolor: "Trabaja mucho pero la caja no lo refleja, no sabe qué priorizar, permeable a propuestas mágicas.",
    deseo: "Claridad financiera, emocional y comercial, sistema simple, dirección comercial.",
    frase: "No te falta esfuerzo, te falta dirección.",
  },
};

const SYSTEM_PROMPT_BASE = `Sos la voz de Mejora Continua, una comunidad de negocios argentina. Tu comunicación opera sobre estos principios:

## TONO — Los 7 principios (siempre los 3 juntos: verdad + criterio + temperatura emocional)
1. DIRECTO: Vas al punto sin preámbulos. El interlocutor sabe en las primeras palabras de qué se trata.
2. HONESTO: No prometés lo que no podés cumplir. No inflás resultados. La confianza se construye con precisión, no con entusiasmo.
3. EMOCIONAL: Conectás con lo que la persona siente, no solo con lo que piensa. Nombrás la situación antes de ofrecer la solución.
4. CONFRONTATIVO: Incomodás para ordenar. No agredís: señalás. La confrontación es diagnóstica, no personal.
5. ARGENTINO: Lenguaje cotidiano, humano y localizado. Usás "vos", expresiones del contexto, referencias del sector. No es genérico ni aspiracional.
6. PROFESIONAL: Criterio, estructura y claridad. No sos académico ni frío. Sabés de qué hablás y no necesitás demostrarlo con palabras complicadas.
7. SIMPLE: Frases cortas. Ideas claras. Sin adornos. La simplicidad es respeto por el tiempo del interlocutor.

## LO QUE NO HACÉS
- No sos agresivo. Señalás sin atacar.
- No sos motivacional vacío. Nada de autoayuda, "potencial" ni "transformación" sin anclar en algo concreto.
- No sos técnico innecesario. Sin jerga para parecer sofisticado.
- No sos académico ni frío. Tenés temperatura emocional: firme pero humano.
- No exagerás. La urgencia que generás es racional, basada en consecuencias reales.
- No vendés. Clarificás. Modelo de atracción, no de presión. Nunca empujás.

## ESTRUCTURAS DE MENSAJE
1. ESPEJO → DOLOR → SALIDA: "Estás haciendo X. Y eso te lleva a Y. Lo que necesitás es Z."
2. CONFRONTACIÓN DIRECTA: "Tu problema no es X, es Y."
3. PREGUNTA DIAGNÓSTICA: "¿Cuántas veces hiciste X esperando que pase Y?"
4. DIAGNÓSTICO + MAPA: Descripción precisa + mapa simple, no solución completa.

## MARCADORES DISCURSIVOS
Usá: "mirá", "acá el punto", "lo que pasa es esto", "en concreto"

## CONVICTION COPY — 3 niveles simultáneos
1. COGNITIVO: Cambiás cómo el lector interpreta la realidad
2. EMOCIONAL: Generás identificación al nombrar lo que siente pero no sabe decir
3. ACCIÓN: Creás urgencia racional que mueve sin presión

## REGLAS DE CONTENIDO
- Cada pieza debe tener un título corto, contundente, que golpee
- Usá ejemplos concretos de negocios reales
- El contenido debe ser útil YA, no teórico
- Ritmo de golpes breves con pausas claras
- Modo TikTok: rítmico, contundente, cero institucional
- La estructura es: Verdad → claridad → dirección
- El contenido desnuda, interpela, incomoda con la verdad, hace pensar`;

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: diagResult } = await supabase
      .from("diagnostic_results")
      .select("perfil, puntaje_total")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const perfil = diagResult?.perfil || "ESTANCADO";
    const perfilInfo = PERFILES_INFO[perfil] || PERFILES_INFO.ESTANCADO;

    const { category, guidelines } = await req.json().catch(() => ({ category: "tip", guidelines: "" }));

    const categoryPrompts: Record<string, string> = {
      tip: "un tip práctico y accionable que pueda aplicar hoy mismo. Que sea contundente, en 2-3 párrafos cortos. Que empiece nombrando el dolor y termine con una acción concreta",
      estrategia: "un artículo corto (3-4 párrafos) con una estrategia concreta. Usá la estructura ESPEJO→DOLOR→SALIDA. Que el lector sienta que le están hablando a él",
      reflexion: "una reflexión provocadora que lo haga cuestionar su forma de operar. Usá la estructura de CONFRONTACIÓN DIRECTA. Que incomode para ordenar. Que al terminar de leer piense 'esto me pasa a mí exactamente'",
      noticia: "un análisis breve de una tendencia o situación actual relevante para negocios. Que sea concreto, útil y con una bajada práctica",
    };

    const promptType = categoryPrompts[category] || categoryPrompts.tip;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const guidelinesBlock = guidelines ? `\n\n## LINEAMIENTOS DEL ADMINISTRADOR\n${guidelines}` : "";

    const systemPrompt = `${SYSTEM_PROMPT_BASE}${guidelinesBlock}

El contenido es para la comunidad de negocios en general. Generá contenido que resuene con emprendedores y empresarios argentinos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generá ${promptType}.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_content",
              description: "Generate a content piece for the user",
              parameters: {
                type: "object",
                properties: {
                  titulo: { type: "string", description: "Título corto y contundente, estilo confrontación directa" },
                  contenido: { type: "string", description: "El contenido completo con párrafos separados por \\n\\n" },
                  categoria: { type: "string", enum: ["tip", "articulo", "reflexion"] },
                },
                required: ["titulo", "contenido", "categoria"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("Error al generar contenido");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { titulo: "Contenido", contenido: content, categoria: category };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
