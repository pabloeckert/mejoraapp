/**
 * Edge Function: send-push-notification
 *
 * Sends Web Push notifications to subscribed users.
 * Requires: web-push library (Deno compatible)
 *
 * Actions:
 *  - new_post: Notify all subscribers (except author) about a new muro post
 *  - reply: Notify post author about a new comment
 *  - new_novedad: Notify all subscribers about a new novedad
 *
 * Called from: database webhooks or admin-action
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ApplicationServerKey,
  PushSubscription,
  sendNotification,
} from "https://deno.land/x/web_push/mod.ts";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@mejoraok.com";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface NotificationPayload {
  action: "new_post" | "reply" | "new_novedad";
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  exclude_user_id?: string;
  target_user_id?: string;
}

serve(async (req) => {
  // Only POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response("VAPID keys not configured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: NotificationPayload = await req.json();
    const { action, title, body, url, tag, exclude_user_id, target_user_id } = payload;

    // Build notification based on action
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

    // Get subscriptions
    let query = supabase.from("push_subscriptions").select("*");

    if (target_user_id) {
      query = query.eq("user_id", target_user_id);
    } else if (exclude_user_id) {
      query = query.neq("user_id", exclude_user_id);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return new Response("Error fetching subscriptions", { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send push to all subscriptions
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
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth,
        },
      };

      try {
        await sendNotification(pushSub, JSON.stringify({
          title: notifTitle,
          body: notifBody,
          url: notifUrl,
          tag: notifTag,
        }), { vapidKeys });
        sent++;
      } catch (err) {
        console.error(`Push failed for ${sub.user_id}:`, err);
        failed++;
        // Clean up invalid subscriptions (410 Gone)
        if (err.message?.includes("410") || err.message?.includes("expired")) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
