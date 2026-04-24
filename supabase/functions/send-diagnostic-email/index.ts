/**
 * Edge Function: send-diagnostic-email
 *
 * Sends follow-up email after completing the diagnostic.
 * Called from: DiagnosticTest.tsx after saving results.
 *
 * Requires: RESEND_API_KEY env var
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "MejoraApp <hola@mejoraok.com>";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Perfil descriptions for email content
const PERFILES: Record<string, { tagline: string; recommendation: string }> = {
  "el-estratega": {
    tagline: "El Estratega",
    recommendation: "Tu negocio tiene buena base. El siguiente paso es definir una estrategia de crecimiento clara. Te recomendamos nuestro contenido sobre planificación estratégica.",
  },
  "el-emprendedor": {
    tagline: "El Emprendedor",
    recommendation: "Tenés energía y visión, pero te falta estructura. Te recomendamos enfocarte en procesos y delegación. Mirá nuestro contenido sobre gestión de equipos.",
  },
  "el-operador": {
    tagline: "El Operador",
    recommendation: "Estás metido en el día a día. Necesitás tiempo para pensar en grande. Te recomendamos nuestro contenido sobre productividad y trabajo en el negocio vs. en el negocio.",
  },
  "el-dormido": {
    tagline: "El Dormido",
    recommendation: "Tu negocio está estancado y puede que no lo veas. Es hora de despertar. Te recomendamos empezar por el diagnóstico completo y nuestro contenido sobre innovación.",
  },
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response("Resend not configured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { user_id, perfil, puntaje } = await req.json();

    if (!user_id || !perfil) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) {
      return new Response("User not found", { status: 404 });
    }

    const email = userData.user.email;
    const nombre = userData.user.user_metadata?.nombre || "";
    const perfilInfo = PERFILES[perfil] || { tagline: perfil, recommendation: "Mirá nuestro contenido recomendado." };

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `Tu diagnóstico: ${perfilInfo.tagline} — MejoraApp`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #1a365d; font-size: 24px;">Hola${nombre ? ` ${nombre}` : ""} 👋</h1>

            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Completaste el diagnóstico estratégico de Mejora Continua. Estos son tus resultados:
            </p>

            <div style="background: #f7fafc; border-left: 4px solid #e53e3e; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <h2 style="color: #e53e3e; font-size: 20px; margin: 0 0 8px;">${perfilInfo.tagline}</h2>
              <p style="color: #4a5568; font-size: 14px; margin: 0;">Puntaje: ${puntaje}/40</p>
            </div>

            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              ${perfilInfo.recommendation}
            </p>

            <div style="margin: 32px 0;">
              <a href="https://app.mejoraok.com" style="display: inline-block; background: #1a365d; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Ver contenido recomendado →
              </a>
            </div>

            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
              Si querés hablar con un especialista sobre tu diagnóstico, respondé a este email o escribinos por
              <a href="https://wa.me/5491100000000" style="color: #25d366;">WhatsApp</a>.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

            <p style="color: #a0aec0; font-size: 12px;">
              MejoraApp — Comunidad de Líderes Empresariales<br/>
              <a href="https://app.mejoraok.com" style="color: #a0aec0;">app.mejoraok.com</a>
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response("Failed to send email", { status: 500 });
    }

    const result = await res.json();

    // Log email sent
    await supabase.from("moderation_log").insert({
      action: "diagnostic_email_sent",
      details: { user_id, perfil, puntaje, email_id: result.id },
    });

    return new Response(JSON.stringify({ success: true, email_id: result.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-diagnostic-email error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
