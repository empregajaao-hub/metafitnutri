import { supabase } from "@/integrations/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  // Validate the string is a proper base64url format
  if (!base64String || base64String.length < 20) {
    throw new Error("Chave VAPID inválida — contacte o administrador.");
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  } catch {
    throw new Error("Chave VAPID mal formatada — contacte o administrador.");
  }
}

/**
 * Register push. Returns true if subscription was saved.
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

  // Ensure service worker is registered
  let reg: any;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    // Try registering it
    reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    reg = await navigator.serviceWorker.ready;
  }

  // Get VAPID public key from edge function
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

  // Save subscription server-side
  const { error: saveError } = await supabase.functions.invoke("push-subscribe", {
    body: subscription.toJSON(),
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
    const reg: any = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
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
    const reg: any = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/**
 * Auto-register push on login. Enabled by default (opt-out).
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
