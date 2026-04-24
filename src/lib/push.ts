/**
 * Web Push Notifications — MejoraApp
 *
 * Gestiona suscripción push del usuario y permisos.
 * Requiere VAPID public key en VITE_VAPID_PUBLIC_KEY.
 *
 * Flujo:
 *  1. requestPermission() → pide permiso al navegador
 *  2. subscribe() → crea suscripción y la guarda en Supabase
 *  3. unsubscribe() → elimina suscripción
 */

import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Get current notification permission state.
 */
export function getPermissionState(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 * Returns the new permission state.
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) throw new Error("Push not supported");
  return Notification.requestPermission();
}

/**
 * Subscribe the user to push notifications.
 * Saves the subscription to Supabase.
 */
export async function subscribe(userId: string): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[Push] No VAPID key configured");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await saveSubscription(userId, existing);
    return existing;
  }

  // Create new subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await saveSubscription(userId, subscription);
  return subscription;
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribe(userId: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
  }

  // Remove from Supabase
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);
}

/**
 * Check if user is currently subscribed.
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint ?? "",
      keys_p256dh: json.keys?.p256dh ?? "",
      keys_auth: json.keys?.auth ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[Push] Failed to save subscription:", error);
  }
}
