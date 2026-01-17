// Storage usando Supabase (funciona no Vercel serverless)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos
export interface NewsStory {
  id: string;
  uuid: string;
  title: string;
  summary: string;
  category: string;
  categoryDisplay: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface CategoryBriefData {
  category: string;
  displayName: string;
  emoji: string;
  headline: string;
  script: string;
  audioUrl?: string;
  storyCount: number;
  estimatedDuration: string;
  stories: NewsStory[];
}

export interface DailyBriefing {
  date: string;
  generatedAt: string;
  fullBriefing: {
    headline: string;
    script: string;
    audioUrl?: string;
    duration: string;
    storyCount: number;
  };
  categoryBriefs: CategoryBriefData[];
  stories: NewsStory[];
  meta: {
    totalStories: number;
    categoryCounts: Record<string, number>;
    topSources: string[];
  };
  // Backwards compatibility
  dailySummary?: {
    title: string;
    audioUrl?: string;
    duration: string;
  };
}

// Função para obter a data de hoje no formato YYYY-MM-DD
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

// Salvar briefing no Supabase
export async function saveDailyBriefing(briefing: DailyBriefing): Promise<void> {
  const { error } = await supabase
    .from("briefings")
    .upsert({
      date: briefing.date,
      data: briefing,
      generated_at: briefing.generatedAt,
    }, {
      onConflict: "date"
    });

  if (error) {
    console.error("Error saving briefing to Supabase:", error);
    throw new Error(`Failed to save briefing: ${error.message}`);
  }
  
  console.log(`✅ Briefing saved to Supabase for ${briefing.date}`);
}

// Carregar briefing do Supabase
export async function loadDailyBriefing(date?: string): Promise<DailyBriefing | null> {
  const targetDate = date || getTodayDate();
  
  const { data, error } = await supabase
    .from("briefings")
    .select("data")
    .eq("date", targetDate)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error loading briefing:", error);
    return null;
  }

  return data?.data as DailyBriefing;
}

// Listar todos os briefings disponíveis
export async function listAvailableBriefings(): Promise<Array<{
  date: string;
  headline: string;
  storyCount: number;
  duration?: string;
  categoryCount: number;
}>> {
  const { data, error } = await supabase
    .from("briefings")
    .select("date, data")
    .order("date", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error listing briefings:", error);
    return [];
  }

  return (data || []).map((row) => {
    const briefing = row.data as DailyBriefing;
    return {
      date: row.date,
      headline: briefing?.fullBriefing?.headline || briefing?.dailySummary?.title || "Daily Briefing",
      storyCount: briefing?.meta?.totalStories || briefing?.stories?.length || 0,
      duration: briefing?.fullBriefing?.duration || briefing?.dailySummary?.duration,
      categoryCount: briefing?.categoryBriefs?.length || 0,
    };
  });
}

// ============================================
// ALIASES PARA COMPATIBILIDADE COM ROUTES
// ============================================

// Alias: getTodayBriefing -> loadDailyBriefing (sem parâmetro)
export async function getTodayBriefing(): Promise<DailyBriefing | null> {
  return loadDailyBriefing();
}

// Alias: getBriefing -> loadDailyBriefing (com data)
export async function getBriefing(date: string): Promise<DailyBriefing | null> {
  return loadDailyBriefing(date);
}

// Alias: getHistorySummary -> listAvailableBriefings
export async function getHistorySummary(): Promise<Array<{
  date: string;
  headline: string;
  storyCount: number;
  duration?: string;
  categoryCount: number;
}>> {
  return listAvailableBriefings();
}

// Verificar se já existe briefing hoje
export async function hasTodayBriefing(): Promise<boolean> {
  const briefing = await loadDailyBriefing();
  return briefing !== null;
}

// Verificar se existe briefing para uma data específica
export async function hasBriefingForDate(date: string): Promise<boolean> {
  const briefing = await loadDailyBriefing(date);
  return briefing !== null;
}

// ============================================
// AUDIO STORAGE
// ============================================

// Upload de áudio para Supabase Storage
export async function uploadAudio(
  fileName: string,
  audioBuffer: Buffer
): Promise<string> {
  const bucketName = "audio";
  
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading audio:", error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log(`✅ Audio uploaded: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

// Alias para manter compatibilidade com código existente
export async function saveAudioFile(
  fileName: string,
  audioBuffer: Buffer
): Promise<string> {
  return uploadAudio(fileName, audioBuffer);
}
