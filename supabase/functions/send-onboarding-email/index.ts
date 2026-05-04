import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "MejoraApp <admin@mejoraok.com>";

// ── Email Templates ────────────────────────────────────────────
const EMAIL_TEMPLATES: Record<string, { subject: string; html: (nombre: string) => string }> = {
  day1: {
    subject: "👋 Tu primer paso en MejoraApp",
    html: (nombre: string) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0505a6; font-size: 24px; margin: 0;">¡${nombre ? `Hola ${nombre}` : 'Hola'}!</h1>
          <p style="color: #666; margin-top: 8px;">Ya forma parte de la comunidad MejoraApp</p>
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #0505a6; font-size: 18px; margin-top: 0;">¿Qué podés hacer hoy?</h2>
          <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
            <li><strong>Hacer tu diagnóstico estratégico</strong> — en 5 minutos sabés cómo está tu negocio</li>
            <li><strong>Explorar el contenido</strong> — artículos y tips para hacer crecer tu empresa</li>
            <li><strong>Conectarte en el muro</strong> — compartí experiencias con otros líderes</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://app.mejoraok.com"
             style="background: #0505a6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Entrar a MejoraApp
          </a>
        </div>

        <p style="color: #999; font-size: 13px; text-align: center;">
          Si no querés recibir estos emails, <a href="https://app.mejoraok.com" style="color: #999;">gestioná tu suscripción</a>.
        </p>
      </div>
    `,
  },
  day3: {
    subject: "📊 ¿Ya hiciste tu diagnóstico?",
    html: (nombre: string) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0505a6; font-size: 24px; margin: 0;">${nombre ? `${nombre}, ` : ''}¿cómo va tu negocio?</h1>
          <p style="color: #666; margin-top: 8px;">Hace 3 días que te uniste a MejoraApp</p>
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #0505a6; font-size: 18px; margin-top: 0;">Tu diagnóstico te espera</h2>
          <p style="color: #333; line-height: 1.7;">
            El diagnóstico estratégico te toma <strong>5 minutos</strong> y te da un panorama claro de cómo está tu negocio.
            Ya cientos de líderes empresariales lo hicieron.
          </p>
          <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
            <li>Recibís un puntaje personalizado</li>
            <li>Vés recomendaciones según tu perfil</li>
            <li>Podés comparar tu evolución con el tiempo</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://app.mejoraok.com"
             style="background: #0505a6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Hacer mi diagnóstico
          </a>
        </div>

        <div style="background: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            💡 <strong>Tip:</strong> Completá tu perfil para recibir contenido personalizado según tu industria y rol.
          </p>
        </div>

        <p style="color: #999; font-size: 13px; text-align: center;">
          Si no querés recibir estos emails, <a href="https://app.mejoraok.com" style="color: #999;">gestioná tu suscripción</a>.
        </p>
      </div>
    `,
  },
  day7: {
    subject: "🏆 Una semana en MejoraApp — mirá lo que podés lograr",
    html: (nombre: string) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0505a6; font-size: 24px; margin: 0;">${nombre ? `${nombre}, ` : ''}¡una semana!</h1>
          <p style="color: #666; margin-top: 8px;">Ya pasaron 7 días desde que te uniste</p>
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #0505a6; font-size: 18px; margin-top: 0;">Lo que podés hacer en MejoraApp</h2>
          <div style="color: #333; line-height: 1.8;">
            <p>🔍 <strong>Diagnóstico estratégico</strong> — evaluá tu negocio y recibí recomendaciones</p>
            <p>📚 <strong>Contenido de valor</strong> — artículos, tips y estrategias para tu industria</p>
            <p>💬 <strong>Muro anónimo</strong> — compartí experiencias con otros líderes</p>
            <p>🏅 <strong>Badges y ranking</strong> — completá desafíos y subí en el ranking</p>
            <p>🤝 <strong>Comunidad</strong> — conectá con empresarios que piensan como vos</p>
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://app.mejoraok.com"
             style="background: #0505a6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Explorar MejoraApp
          </a>
        </div>

        <div style="background: #d4edda; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #155724; margin: 0; font-size: 14px;">
            🚀 <strong>¿Querés más?</strong> Los miembros premium acceden a historial de diagnósticos, recomendaciones IA y contenido exclusivo.
          </p>
        </div>

        <p style="color: #999; font-size: 13px; text-align: center;">
          Si no querés recibir estos emails, <a href="https://app.mejoraok.com" style="color: #999;">gestioná tu suscripción</a>.
        </p>
      </div>
    `,
  },
};

// ── Send email via Resend ──────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    logWarn("send-onboarding-email", "No RESEND_API_KEY configured");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logError("send-onboarding-email", "Resend API error", { status: res.status, error: err });
      return false;
    }

    return true;
  } catch (e) {
    logError("send-onboarding-email", "Failed to send email", { error: String(e) });
    return false;
  }
}

// ── Main handler ───────────────────────────────────────────────
Deno.serve(
  withMiddleware({ auth: false, rateLimit: 30 }, async (req, _ctx) => {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    if (!RESEND_API_KEY) {
      logWarn("send-onboarding-email", "No RESEND_API_KEY configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 503 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get users needing onboarding emails
    const { data: users, error } = await supabase.rpc("get_users_needing_onboarding_email");

    if (error) {
      logError("send-onboarding-email", "Failed to get users", { error: error.message });
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!users || users.length === 0) {
      logInfo("send-onboarding-email", "No users needing emails");
      return new Response(JSON.stringify({ sent: 0, message: "No hay usuarios pendientes" }));
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      const template = EMAIL_TEMPLATES[user.email_type];
      if (!template) continue;

      const html = template.html(user.nombre || "");
      const success = await sendEmail(user.email, template.subject, html);

      if (success) {
        // Record that we sent this email
        await supabase.from("onboarding_emails").insert({
          user_id: user.user_id,
          email_type: user.email_type,
        });
        sentCount++;
        logInfo("send-onboarding-email", "Email sent", {
          user_id: user.user_id,
          email_type: user.email_type,
          email: user.email,
        });
      } else {
        failedCount++;
      }

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    logInfo("send-onboarding-email", "Batch complete", { sent: sentCount, failed: failedCount, total: users.length });

    return new Response(
      JSON.stringify({ sent: sentCount, failed: failedCount, total: users.length })
    );
  })
);
