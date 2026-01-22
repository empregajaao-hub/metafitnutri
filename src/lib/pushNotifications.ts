import { supabase } from "@/integrations/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function enableWebPush(): Promise<{ enabled: boolean; reason?: string }>
{
  if (typeof window === "undefined") return { enabled: false, reason: "browser_only" };
  if (!("Notification" in window)) return { enabled: false, reason: "no_notification_api" };
  if (!("serviceWorker" in navigator)) return { enabled: false, reason: "no_service_worker" };
  if (!("PushManager" in window)) return { enabled: false, reason: "no_push_manager" };

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
