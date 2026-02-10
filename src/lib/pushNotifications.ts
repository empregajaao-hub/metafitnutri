import { supabase } from "@/integrations/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/**
 * Silently try to register push. Returns true if subscription was saved.
 * Won't show any permission prompt if the user already denied.
 */
export async function enableWebPush(): Promise<{ enabled: boolean; reason?: string }> {
  if (typeof window === "undefined") return { enabled: false, reason: "browser_only" };
  if (!("Notification" in window)) return { enabled: false, reason: "no_notification_api" };
  if (!("serviceWorker" in navigator)) return { enabled: false, reason: "no_service_worker" };
  if (!("PushManager" in window)) return { enabled: false, reason: "no_push_manager" };

  // If permission was already denied, don't prompt again
  if (Notification.permission === "denied") return { enabled: false, reason: "permission_denied" };

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { enabled: false, reason: "permission_denied" };

  const reg = await navigator.serviceWorker.ready;

  // Get VAPID public key from edge function (safe to expose)
  const { data: keyData, error: keyError } = await supabase.functions.invoke("push-public-key");
  if (keyError || !keyData?.publicKey) {
    throw new Error(keyError?.message || "Falha ao obter chave pública (VAPID)");
  }

  const applicationServerKey = urlBase64ToUint8Array(String(keyData.publicKey));

  const existing = await reg.pushManager.getSubscription();
  const subscription =
    existing ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));

  // Save subscription server-side (JWT verified)
  const { error: saveError } = await supabase.functions.invoke("push-subscribe", {
    body: subscription,
  });
  if (saveError) throw new Error(saveError.message);

  return { enabled: true };
}

/**
 * Unsubscribe from push notifications and remove from server.
 */
export async function disableWebPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      // Remove from server
      await supabase.functions.invoke("push-unsubscribe", {
        body: { endpoint: subscription.endpoint },
      });
      await subscription.unsubscribe();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user currently has an active push subscription.
 */
export async function isPushEnabled(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/**
 * Auto-register push silently on login. Call from App or auth listener.
 * Only prompts if permission hasn't been decided yet or is already granted.
 */
export async function autoRegisterPush(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Only auto-prompt if not denied
    if (Notification.permission === "denied") return;

    // Register service worker if not already
    if (!navigator.serviceWorker.controller) {
      await navigator.serviceWorker.register("/sw.js");
    }

    await enableWebPush();
  } catch (e) {
    console.log("Auto push registration skipped:", e);
  }
}
