/**
 * Storage Service - Multi-Category System
 * 
 * Estrutura:
 * - data/briefings/2026-01-11.json (briefing completo com categories)
 * - public/audio/2026-01-11-full.mp3 (resumo completo 5 min)
 * - public/audio/2026-01-11-china.mp3 (category brief 1-2 min)
 * - public/audio/2026-01-11-russia.mp3
 * - etc.
 */

import { promises as fs } from "fs";
import path from "path";
import { CategoryName } from "./news-api";

// === TIPOS ===

export interface NewsStory {
  id: string;
  uuid: string;
  title: string;
  summary: string;
  category: CategoryName;
  categoryDisplay: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface CategoryBriefData {
  category: CategoryName;
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
  
  // Resumo COMPLETO (5 min - ElevenLabs)
  fullBriefing: {
    headline: string;
    script: string;
    audioUrl?: string;
    duration: string;
    storyCount: number;
  };
  
  // Resumos por CATEGORIA (1-2 min cada - Polly)
  categoryBriefs: CategoryBriefData[];
  
  // Todas as notícias
  stories: NewsStory[];
  
  // Metadados
  meta: {
    totalStories: number;
    categoryCounts: Record<CategoryName, number>;
    topSources: string[];
  };
}

// === PATHS ===

const DATA_DIR = path.join(process.cwd(), "data", "briefings");
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

// === FUNÇÕES ===

/**
 * Garante que diretórios existem
 */
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

/**
 * Gera nome do arquivo para uma data
 */
function getFilePath(date: string): string {
  return path.join(DATA_DIR, `${date}.json`);
}

/**
 * Salva briefing do dia
 */
export async function saveDailyBriefing(briefing: DailyBriefing): Promise<void> {
  await ensureDirectories();
  
  const filePath = getFilePath(briefing.date);
  await fs.writeFile(filePath, JSON.stringify(briefing, null, 2));
  
  console.log(`[Storage] Saved briefing for ${briefing.date}`);
  
  // Limpar arquivos antigos (mais de 30 dias)
  await cleanupOldFiles();
}

/**
 * Carrega briefing de uma data
 */
export async function getBriefing(date: string): Promise<DailyBriefing | null> {
  await ensureDirectories();
  
  try {
    const filePath = getFilePath(date);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Carrega briefing de hoje
 */
export async function getTodayBriefing(): Promise<DailyBriefing | null> {
  const today = new Date().toISOString().split("T")[0];
  return getBriefing(today);
}

/**
 * Lista todas as datas disponíveis
 */
export async function listAvailableDates(): Promise<string[]> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(".json", ""))
      .sort((a, b) => b.localeCompare(a)); // Mais recente primeiro
  } catch {
    return [];
  }
}

/**
 * Retorna resumo do histórico
 */
export async function getHistorySummary(): Promise<Array<{
  date: string;
  storyCount: number;
  duration: string;
  headline: string;
  categoryCount: number;
}>> {
  const dates = await listAvailableDates();
  const summaries = [];
  
  for (const date of dates.slice(0, 14)) { // Últimos 14 dias
    const briefing = await getBriefing(date);
    if (briefing) {
      summaries.push({
        date: briefing.date,
        storyCount: briefing.meta.totalStories,
        duration: briefing.fullBriefing?.duration || "0:00",
        headline: briefing.fullBriefing?.headline || "Daily Briefing",
        categoryCount: briefing.categoryBriefs?.length || 0,
      });
    }
  }
  
  return summaries;
}

/**
 * Salva arquivo de áudio
 */
export async function saveAudioFile(filename: string, buffer: Buffer): Promise<string> {
  await ensureDirectories();
  
  const filePath = path.join(AUDIO_DIR, filename);
  await fs.writeFile(filePath, buffer);
  
  const publicUrl = `/audio/${filename}`;
  console.log(`[Storage] Saved audio: ${publicUrl}`);
  
  return publicUrl;
}

/**
 * Limpa arquivos com mais de 30 dias
 */
async function cleanupOldFiles(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];
  
  // Limpar JSONs
  try {
    const jsonFiles = await fs.readdir(DATA_DIR);
    for (const file of jsonFiles) {
      const date = file.replace(".json", "");
      if (date < cutoffDate) {
        await fs.unlink(path.join(DATA_DIR, file));
        console.log(`[Storage] Deleted old briefing: ${file}`);
      }
    }
  } catch (e) {
    console.error("[Storage] Error cleaning JSON files:", e);
  }
  
  // Limpar áudios
  try {
    const audioFiles = await fs.readdir(AUDIO_DIR);
    for (const file of audioFiles) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match && match[1] < cutoffDate) {
        await fs.unlink(path.join(AUDIO_DIR, file));
        console.log(`[Storage] Deleted old audio: ${file}`);
      }
    }
  } catch (e) {
    console.error("[Storage] Error cleaning audio files:", e);
  }
}

/**
 * Verifica se já existe briefing para hoje
 */
export async function hasTodayBriefing(): Promise<boolean> {
  const briefing = await getTodayBriefing();
  return briefing !== null;
}
