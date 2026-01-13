/**
 * Beehiiv Integration
 * 
 * API para gerenciar subscribers da newsletter
 * Docs: https://developers.beehiiv.com/docs/v2
 */

const BEEHIIV_API_URL = "https://api.beehiiv.com/v2";

interface BeehiivSubscriber {
  id: string;
  email: string;
  status: "active" | "inactive" | "pending";
  created_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface BeehiivResponse {
  data: BeehiivSubscriber;
}

interface BeehiivError {
  errors?: Array<{ message: string }>;
  message?: string;
}

/**
 * Verifica se Beehiiv está configurado
 */
export function isBeehiivConfigured(): boolean {
  return !!(
    process.env.BEEHIIV_API_KEY && 
    process.env.BEEHIIV_PUBLICATION_ID
  );
}

/**
 * Obtém headers de autenticação
 */
function getHeaders(): HeadersInit {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) throw new Error("BEEHIIV_API_KEY not configured");
  
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Adiciona um subscriber à newsletter
 */
export async function addSubscriber(
  email: string,
  options?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    sendWelcomeEmail?: boolean;
    reactivateExisting?: boolean;
  }
): Promise<{ success: boolean; subscriber?: BeehiivSubscriber; error?: string }> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  
  if (!publicationId) {
    return { success: false, error: "BEEHIIV_PUBLICATION_ID not configured" };
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_URL}/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          reactivate_existing: options?.reactivateExisting ?? true,
          send_welcome_email: options?.sendWelcomeEmail ?? true,
          utm_source: options?.utmSource || "morning_brief_app",
          utm_medium: options?.utmMedium || "website",
          utm_campaign: options?.utmCampaign || "newsletter_signup",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as BeehiivError;
      const errorMessage = errorData.errors?.[0]?.message || errorData.message || "Failed to subscribe";
      console.error("[Beehiiv] Error:", errorMessage);
      return { success: false, error: errorMessage };
    }

    const successData = data as BeehiivResponse;
    console.log(`[Beehiiv] Subscriber added: ${email}`);
    
    return { success: true, subscriber: successData.data };

  } catch (error) {
    console.error("[Beehiiv] Network error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}

/**
 * Verifica se email já está inscrito
 */
export async function getSubscriber(
  email: string
): Promise<{ exists: boolean; subscriber?: BeehiivSubscriber; error?: string }> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  
  if (!publicationId) {
    return { exists: false, error: "BEEHIIV_PUBLICATION_ID not configured" };
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_URL}/publications/${publicationId}/subscriptions?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { exists: false };
      }
      return { exists: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return { exists: true, subscriber: data.data[0] };
    }

    return { exists: false };

  } catch (error) {
    console.error("[Beehiiv] Error checking subscriber:", error);
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}

/**
 * Atualiza status do subscriber
 */
export async function updateSubscriberStatus(
  subscriberId: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  
  if (!publicationId) {
    return { success: false, error: "BEEHIIV_PUBLICATION_ID not configured" };
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_URL}/publications/${publicationId}/subscriptions/${subscriberId}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    console.log(`[Beehiiv] Subscriber ${subscriberId} status updated to ${status}`);
    return { success: true };

  } catch (error) {
    console.error("[Beehiiv] Error updating subscriber:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}

/**
 * Obtém estatísticas da publicação
 */
export async function getPublicationStats(): Promise<{
  success: boolean;
  stats?: {
    totalSubscribers: number;
    activeSubscribers: number;
  };
  error?: string;
}> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  
  if (!publicationId) {
    return { success: false, error: "BEEHIIV_PUBLICATION_ID not configured" };
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_URL}/publications/${publicationId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      stats: {
        totalSubscribers: data.data?.total_subscriptions || 0,
        activeSubscribers: data.data?.active_subscriptions || 0,
      },
    };

  } catch (error) {
    console.error("[Beehiiv] Error fetching stats:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}
