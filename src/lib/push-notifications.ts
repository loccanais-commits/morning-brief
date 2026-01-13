/**
 * Web Push Notifications Service
 * 
 * Usa a Web Push API para enviar notificações push.
 * Requer VAPID keys (gerados uma vez e armazenados nas env vars).
 * 
 * Para gerar VAPID keys:
 * npx web-push generate-vapid-keys
 */

import webpush from "web-push";

// Configurar VAPID keys
function setupVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:hello@morningbrief.news";

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not configured. Push notifications disabled.");
    return false;
  }

  try {
    webpush.setVapidDetails(email, publicKey, privateKey);
    return true;
  } catch (error) {
    console.error("[Push] Failed to setup VAPID:", error);
    return false;
  }
}

// Tipos
export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Envia push notification para uma subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  if (!setupVapid()) {
    return false;
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1 hora
        urgency: "normal",
      }
    );
    
    console.log(`[Push] Notification sent to ${subscription.endpoint.slice(0, 50)}...`);
    return true;

  } catch (error: any) {
    // Se subscription expirou, retorna false para remover do banco
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`[Push] Subscription expired: ${subscription.endpoint.slice(0, 50)}...`);
      return false;
    }
    
    console.error("[Push] Failed to send notification:", error.message);
    return false;
  }
}

/**
 * Envia notificação para múltiplas subscriptions
 */
export async function sendPushToAll(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; expired: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    expired: [] as string[],
  };

  if (!setupVapid()) {
    return results;
  }

  console.log(`[Push] Sending notifications to ${subscriptions.length} subscribers...`);

  const promises = subscriptions.map(async (sub) => {
    const success = await sendPushNotification(sub, payload);
    
    if (success) {
      results.sent++;
    } else {
      results.failed++;
      // Marcar como expirada para remoção
      results.expired.push(sub.endpoint);
    }
  });

  await Promise.allSettled(promises);

  console.log(`[Push] Results: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

/**
 * Payload padrão para notificação do briefing diário
 */
export function createDailyBriefingPayload(headline?: string): PushPayload {
  return {
    title: "🎧 Your Morning Brief is Ready",
    body: headline || "Today's geopolitics briefing is waiting for you.",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    url: "/",
    tag: "daily-briefing", // Agrupa notificações
  };
}

/**
 * Verifica se push notifications estão configuradas
 */
export function isPushConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && 
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Retorna a public key para o frontend
 */
export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}
