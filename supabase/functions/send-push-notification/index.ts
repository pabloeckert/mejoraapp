/**
 * send-push-notification — Edge Function para envío de push notifications
 *
 * Usa middleware compartido para CORS + Rate Limiting.
 * Usa service_role key (no JWT) para acceder a suscripciones.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withMiddleware } from "../_shared/middleware.ts";
import { logInfo, logWarn, logError } from "../_shared/log.ts";
import {
  ApplicationServerKey,
  PushSubscription,
  sendNotification,
} from "https://deno.land/x/web_push/mod.ts";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@mejoraok.com";

interface NotificationPayload {
  action: "new_post" | "reply" | "new_novedad";
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  exclude_user_id?: string;
  target_user_id?: string;
}

Deno.serve(
  withMiddleware({ auth: false, rateLimit: 30 }, async (req, _ctx) => {
    const headers = { "Content-Type": "application/json" };

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response("VAPID keys not configured", { status: 500 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    try {
      const payload: NotificationPayload = await req.json();
      const { action, title, body, url, tag, exclude_user_id, target_user_id } = payload;

      let notifTitle = title || "MejoraApp";
      let notifBody = body || "";
      let notifUrl = url || "/";
      let notifTag = tag || action;

      switch (action) {
        case "new_post":
          notifTitle = "💬 Nuevo post en el muro";
          notifBody = body || "Alguien compartió algo anónimo. ¡Leelo!";
          notifUrl = "/";
          notifTag = "new-post";
          break;
        case "reply":
          notifTitle = "💬 Respondieron tu post";
          notifBody = body || "Tu post tiene una nueva respuesta.";
          notifUrl = "/";
          notifTag = "reply";
          break;
        case "new_novedad":
          notifTitle = "📢 Nueva novedad";
          notifBody = body || "Hay una novedad nueva en Mejora Continua.";
          notifUrl = "/";
          notifTag = "new-novedad";
          break;
      }

      let query = supabase.from("push_subscriptions").select("*");
      if (target_user_id) {
        query = query.eq("user_id", target_user_id);
      } else if (exclude_user_id) {
        query = query.neq("user_id", exclude_user_id);
      }

      const { data: subscriptions, error } = await query;
      if (error) {
        logError("send-push", "DB error", { error: error.message });
        return new Response("Error fetching subscriptions", { status: 500 });
      }

      if (!subscriptions || subscriptions.length === 0) {
        return new Response(JSON.stringify({ sent: 0, message: "No subscriptions" }), { headers });
      }

      const vapidKeys = new ApplicationServerKey({
        publicKey: VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY,
        subject: VAPID_SUBJECT,
      });

      let sent = 0;
      let failed = 0;

      for (const sub of subscriptions) {
        const pushSub: PushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        };

        try {
          await sendNotification(pushSub, JSON.stringify({
            title: notifTitle, body: notifBody, url: notifUrl, tag: notifTag,
          }), { vapidKeys });
          sent++;
        } catch (err) {
          failed++;
          logWarn("send-push", "Push failed", { user_id: sub.user_id, error: String(err) });
          if (err instanceof Error && (err.message.includes("410") || err.message.includes("expired"))) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }

      logInfo("send-push", "Push batch complete", { action, sent, failed, total: subscriptions.length });

      return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), { headers });
    } catch (err) {
      logError("send-push", "Unhandled error", { error: String(err) });
      return new Response("Internal server error", { status: 500 });
    }
  })
);
