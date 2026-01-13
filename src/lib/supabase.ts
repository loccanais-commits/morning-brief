/**
 * Supabase Client
 * 
 * Conecta ao Supabase para:
 * - Briefings históricos
 * - Newsletter subscribers
 * - Push notification subscriptions
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Tipos do banco
export interface DbBriefing {
  id?: string;
  date: string;
  headline: string;
  script: string;
  audio_url: string;
  duration: string;
  story_count: number;
  categories: Record<string, number>;
  sources: string[];
  created_at?: string;
}

export interface DbStory {
  id?: string;
  briefing_id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  source_url: string;
  image_url?: string;
  published_at?: string;
  position: number;
}

export interface DbSubscriber {
  id?: string;
  email: string;
  active: boolean;
  created_at?: string;
}

export interface DbPushSubscription {
  id?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at?: string;
}

// Singleton do cliente
let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}

// === BRIEFINGS ===

export async function saveBriefingToSupabase(
  briefing: DbBriefing,
  stories: DbStory[]
): Promise<string | null> {
  const supabase = getSupabase();

  try {
    // Inserir briefing
    const { data: briefingData, error: briefingError } = await supabase
      .from("briefings")
      .upsert({
        date: briefing.date,
        headline: briefing.headline,
        script: briefing.script,
        audio_url: briefing.audio_url,
        duration: briefing.duration,
        story_count: briefing.story_count,
        categories: briefing.categories,
        sources: briefing.sources,
      }, { 
        onConflict: "date" 
      })
      .select()
      .single();

    if (briefingError) {
      console.error("[Supabase] Briefing error:", briefingError);
      return null;
    }

    const briefingId = briefingData.id;

    // Deletar stories antigas deste briefing
    await supabase
      .from("stories")
      .delete()
      .eq("briefing_id", briefingId);

    // Inserir stories novas
    const storiesWithBriefingId = stories.map((s, i) => ({
      ...s,
      briefing_id: briefingId,
      position: i + 1,
    }));

    const { error: storiesError } = await supabase
      .from("stories")
      .insert(storiesWithBriefingId);

    if (storiesError) {
      console.error("[Supabase] Stories error:", storiesError);
    }

    console.log(`[Supabase] Saved briefing ${briefing.date} with ${stories.length} stories`);
    return briefingId;

  } catch (error) {
    console.error("[Supabase] Save error:", error);
    return null;
  }
}

export async function getBriefingFromSupabase(date: string): Promise<{
  briefing: DbBriefing;
  stories: DbStory[];
} | null> {
  const supabase = getSupabase();

  try {
    const { data: briefing, error: briefingError } = await supabase
      .from("briefings")
      .select("*")
      .eq("date", date)
      .single();

    if (briefingError || !briefing) {
      return null;
    }

    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select("*")
      .eq("briefing_id", briefing.id)
      .order("position", { ascending: true });

    if (storiesError) {
      console.error("[Supabase] Stories fetch error:", storiesError);
    }

    return {
      briefing,
      stories: stories || [],
    };

  } catch (error) {
    console.error("[Supabase] Fetch error:", error);
    return null;
  }
}

export async function getBriefingHistory(limit: number = 14): Promise<Partial<DbBriefing>[]> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("briefings")
      .select("date, headline, duration, story_count, categories")
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Supabase] History error:", error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error("[Supabase] History error:", error);
    return [];
  }
}

// === NEWSLETTER SUBSCRIBERS ===

export async function addSubscriber(email: string): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("subscribers")
      .upsert({ 
        email, 
        active: true 
      }, { 
        onConflict: "email" 
      });

    if (error) {
      console.error("[Supabase] Subscriber error:", error);
      return false;
    }

    console.log(`[Supabase] Added subscriber: ${email}`);
    return true;

  } catch (error) {
    console.error("[Supabase] Subscriber error:", error);
    return false;
  }
}

export async function getActiveSubscribers(): Promise<string[]> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email")
      .eq("active", true);

    if (error) {
      console.error("[Supabase] Subscribers error:", error);
      return [];
    }

    return data?.map(s => s.email) || [];

  } catch (error) {
    return [];
  }
}

// === PUSH SUBSCRIPTIONS ===

export async function savePushSubscription(subscription: PushSubscriptionJSON): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      }, {
        onConflict: "endpoint"
      });

    if (error) {
      console.error("[Supabase] Push subscription error:", error);
      return false;
    }

    console.log("[Supabase] Push subscription saved");
    return true;

  } catch (error) {
    console.error("[Supabase] Push subscription error:", error);
    return false;
  }
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    if (error) {
      console.error("[Supabase] Remove push error:", error);
      return false;
    }

    return true;

  } catch (error) {
    return false;
  }
}

export async function getAllPushSubscriptions(): Promise<DbPushSubscription[]> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      console.error("[Supabase] Get push subs error:", error);
      return [];
    }

    return data || [];

  } catch (error) {
    return [];
  }
}

// Verificar se Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
