"use client";

import { useState, useEffect } from "react";

type SubscriptionStatus = "idle" | "subscribing" | "subscribed" | "denied" | "unsupported";

export default function PushNotificationButton() {
  const [status, setStatus] = useState<SubscriptionStatus>("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Verificar suporte e status atual
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    // Verificar suporte
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    // Verificar permissão
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    // Verificar se já está inscrito
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setStatus("subscribed");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribe = async () => {
    if (status === "subscribed" || status === "subscribing") return;
    
    setStatus("subscribing");

    try {
      // 1. Pedir permissão
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      // 2. Obter VAPID public key do servidor
      const keyResponse = await fetch("/api/push/subscribe");
      const { publicKey } = await keyResponse.json();
      
      if (!publicKey) {
        console.error("No VAPID public key");
        setStatus("idle");
        return;
      }

      // 3. Registrar no Push Manager
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey, // Passar string diretamente
      });

      // 4. Enviar subscription para o servidor
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        setStatus("subscribed");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        throw new Error("Failed to save subscription");
      }

    } catch (error) {
      console.error("Push subscription error:", error);
      setStatus("idle");
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remover no servidor
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        
        // Cancelar localmente
        await subscription.unsubscribe();
      }
      
      setStatus("idle");
    } catch (error) {
      console.error("Unsubscribe error:", error);
    }
  };

  // Não mostrar se não suportado
  if (status === "unsupported") {
    return null;
  }

  return (
    <>
      <button
        onClick={status === "subscribed" ? unsubscribe : subscribe}
        disabled={status === "subscribing" || status === "denied"}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
          ${status === "subscribed" 
            ? "bg-[var(--accent-green)]/20 text-[var(--accent-green)] border border-[var(--accent-green)]/30" 
            : status === "denied"
            ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
            : "bg-[var(--bg-elevated)] text-white hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]"
          }
        `}
      >
        {status === "subscribing" ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Enabling...
          </>
        ) : status === "subscribed" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Notifications On
          </>
        ) : status === "denied" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            Blocked
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            Enable Notifications
          </>
        )}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--accent-green)] text-black font-medium rounded-lg shadow-lg animate-in z-50">
          🔔 You'll be notified when new briefings are ready!
        </div>
      )}
    </>
  );
}
