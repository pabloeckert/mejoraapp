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
    frase: "No estás saturado por trabajar mucho, sino por trabajar sin claridad.",
  },
  INVISIBLE: {
    nombre: "El Profesional Independiente en Crecimiento",
    dolor: "Sin propuesta de valor clara, no sabe posicionarse, cobra menos de lo que vale.",
    deseo: "Reconocimiento, mensaje claro, mejores clientes, subir precios sin culpa.",
    frase: "No te falta talento, te falta claridad.",
  },
  LIDER_SOLO: {
    nombre: "La Líder que Necesita Validación Externa",
    dolor: "Equipo no entiende, comunicación confusa, miedo a no liderar bien.",
    deseo: "Ser clara, escuchada, respetada, segura en decisiones.",
    frase: "No necesitás ser perfecta, necesitás ser clara.",
  },
  DESCONECTADO: {
    nombre: "El Empresario que Sospecha que Está Mal Asesorado",
    dolor: "Proveedores que prometen de más, informes inútiles, nadie dice la verdad.",
    deseo: "Criterio real, verdad sin maquillaje, claridad externa, decisiones con info confiable.",
    frase: "No estás mal asesorado, estás mal informado.",
  },
  ESTANCADO: {
    nombre: "El que Necesita Orden para Crecer",
    dolor: "Crece mal, sin procesos, miedo a desbarrancar.",
    deseo: "Crecer con orden, trabajar mejor, tener estructura sin frenar.",
    frase: "No necesitás cambiar todo, necesitás ordenar lo que ya funciona.",
  },
  NUEVA_GEN: {
    nombre: "La Nueva Generación que Busca su Lugar",
    dolor: "No le explican criterios, no sabe cómo hacer visible su aporte.",
    deseo: "Rol con nombre y peso real, mapa de crecimiento, claridad sobre su valor.",
    frase: "No te falta capacidad. Te falta claridad en tu rol.",
  },
  EQUIPO_DESALINEADO: {
    nombre: "El Equipo Desalineado",
    dolor: "Roles confusos, prioridades cambiantes, reuniones sin decisiones.",
    deseo: "Visión compartida, claridad en roles, menos fricción.",
    frase: "No están desmotivados, están desordenados.",
  },
  VENDEDOR_SIN_RESULTADOS: {
    nombre: "El Vendedor que No Ve Resultados",
    dolor: "No ve resultados, no sabe qué priorizar, permeable a propuestas mágicas.",
    deseo: "Claridad financiera, emocional y comercial, sistema simple.",
    frase: "No te falta esfuerzo, te falta estrategia.",
  },
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

    // Get user's diagnostic profile
    const { data: diagResult } = await supabase
      .from("diagnostic_results")
      .select("perfil, puntaje_total")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const perfil = diagResult?.perfil || "ESTANCADO";
    const perfilInfo = PERFILES_INFO[perfil] || PERFILES_INFO.ESTANCADO;

    const { category } = await req.json().catch(() => ({ category: "tip" }));

    const categoryPrompts: Record<string, string> = {
      tip: "un tip práctico y accionable que pueda aplicar hoy mismo en su negocio",
      articulo: "un artículo corto (3-4 párrafos) con una estrategia concreta para su situación",
      reflexion: "una reflexión provocadora que lo haga cuestionar su forma de operar",
    };

    const promptType = categoryPrompts[category] || categoryPrompts.tip;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Sos MejoraOK, una comunidad de negocios argentina. Tu tono es:
- Argentino, directo, emocional, contundente, profesional
- Sin tecnicismos, sin vueltas, sin humo
- Interpelás, incomodás con la verdad, devolvés claridad
- Autoridad serena, no agresiva
- Tuteás usando "vos" (argentino)

El usuario tiene el perfil "${perfilInfo.nombre}".
- Su dolor principal: ${perfilInfo.dolor}
- Lo que desea: ${perfilInfo.deseo}
- Frase que lo define: "${perfilInfo.frase}"

IMPORTANTE: 
- Generá contenido en español argentino
- Usá ejemplos concretos de negocios reales
- No uses jerga de coaching ni frases motivacionales vacías
- Cada contenido debe tener un título corto y contundente
- El contenido debe ser útil YA, no teórico`;

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
          { role: "user", content: `Generá ${promptType}. Respondé en JSON con este formato exacto: {"titulo": "...", "contenido": "...", "categoria": "${category}"}` },
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
                  titulo: { type: "string", description: "Título corto y contundente" },
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
      // Fallback: try parsing from content
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
