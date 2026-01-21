/**
 * Shared Briefing Generation Logic
 *
 * This module can be called directly from cron or API routes
 * to avoid HTTP call issues within serverless functions.
 */

import {
  fetchAllCategoriesNews,
  deduplicateArticles,
  rankArticles,
  CategoryName,
  CATEGORIES
} from "@/lib/news-api";
import { generateAllBriefings } from "@/lib/ai-summarize";
import { saveDailyBriefing, saveAudioFile, DailyBriefing, CategoryBriefData } from "@/lib/storage";
import { generateElevenLabsAudio, formatTextForTTS, VOICES, MODELS } from "@/lib/tts-elevenlabs";
import { generatePollyAudio } from "@/lib/tts-polly";

export interface GenerationOptions {
  date?: string;
  voiceId?: string;
  modelId?: string;
}

export interface GenerationResult {
  success: boolean;
  date?: string;
  processingTime?: string;
  briefing?: {
    headline: string;
    duration: string;
    audioUrl?: string;
    totalStories: number;
    categoryBriefs: Array<{
      category: string;
      displayName: string;
      emoji: string;
      headline: string;
      duration: string;
      storyCount: number;
      hasAudio: boolean;
    }>;
  };
  error?: string;
}

export async function generateDailyBriefing(options: GenerationOptions = {}): Promise<GenerationResult> {
  const startTime = Date.now();

  const voiceId = options.voiceId || VOICES.george;
  const modelId = options.modelId || MODELS.flash;
  const targetDate = options.date || new Date().toISOString().split("T")[0];

  console.log(`[Generate] Starting multi-category generation for ${targetDate}...`);

  try {
    // === STEP 1: Fetch ALL Categories ===
    console.log("[Generate] Step 1: Fetching all categories (18 requests)...");
    const { byCategory, all } = await fetchAllCategoriesNews(options.date ? targetDate : undefined);

    const totalArticles = all.length;
    if (totalArticles === 0) {
      return {
        success: false,
        error: "No news articles found",
      };
    }

    console.log(`[Generate] Found ${totalArticles} unique articles across all categories`);

    // Log por categoria
    for (const [cat, articles] of Object.entries(byCategory)) {
      console.log(`  - ${cat}: ${articles.length} articles`);
    }

    // === STEP 2: Process & Rank each category ===
    console.log("[Generate] Step 2: Processing articles...");
    const processedByCategory: Record<CategoryName, typeof all> = {} as Record<CategoryName, typeof all>;

    for (const [catKey, articles] of Object.entries(byCategory)) {
      const categoryName = catKey as CategoryName;
      let processed = deduplicateArticles(articles);
      processed = rankArticles(processed);
      processed = processed.slice(0, 6); // Max 6 por categoria
      processedByCategory[categoryName] = processed;
    }

    // === STEP 3: Generate AI Content ===
    console.log("[Generate] Step 3: Generating AI summaries...");
    const aiResult = await generateAllBriefings(processedByCategory);

    console.log(`[Generate] AI generated:`);
    console.log(`  - Full briefing: "${aiResult.headline}" (${aiResult.script.length} chars)`);
    console.log(`  - ${aiResult.categoryBriefs.length} category briefs`);
    console.log(`  - ${aiResult.stories.length} total stories`);

    // === STEP 4: Generate Audio - Full (ElevenLabs) ===
    console.log("[Generate] Step 4: Generating Full audio (ElevenLabs)...");
    let fullAudioUrl = "";

    const fullTtsText = formatTextForTTS(aiResult.script);
    const elevenLabsAudio = await generateElevenLabsAudio(fullTtsText, {
      voiceId,
      modelId,
    });

    if (elevenLabsAudio) {
      fullAudioUrl = await saveAudioFile(`${targetDate}-full.mp3`, elevenLabsAudio);
      console.log(`[Generate] Full audio saved: ${fullAudioUrl}`);
    } else {
      // Fallback para Polly se ElevenLabs falhar
      console.log("[Generate] ElevenLabs failed, using Polly for full...");
      const pollyAudio = await generatePollyAudio(fullTtsText);
      if (pollyAudio) {
        fullAudioUrl = await saveAudioFile(`${targetDate}-full.mp3`, pollyAudio);
      }
    }

    // === STEP 5: Generate Audio - Categories (Polly FREE) ===
    console.log("[Generate] Step 5: Generating category audios (Polly)...");
    const categoryBriefsWithAudio: CategoryBriefData[] = [];

    for (const brief of aiResult.categoryBriefs) {
      let audioUrl = "";

      try {
        const categoryTtsText = formatTextForTTS(brief.script);
        const pollyAudio = await generatePollyAudio(categoryTtsText);

        if (pollyAudio) {
          audioUrl = await saveAudioFile(`${targetDate}-${brief.category}.mp3`, pollyAudio);
          console.log(`[Generate] ${brief.displayName} audio saved: ${audioUrl}`);
        }
      } catch (error) {
        console.error(`[Generate] Failed to generate audio for ${brief.category}:`, error);
      }

      categoryBriefsWithAudio.push({
        category: brief.category,
        displayName: brief.displayName,
        emoji: brief.emoji,
        headline: brief.headline,
        script: brief.script,
        audioUrl,
        storyCount: brief.storyCount,
        estimatedDuration: brief.estimatedDuration,
        stories: brief.stories,
      });
    }

    // === STEP 6: Contagem de categorias e sources ===
    const categoryCounts: Record<string, number> = {};
    const sourceCount: Record<string, number> = {};

    for (const story of aiResult.stories) {
      categoryCounts[story.category] = (categoryCounts[story.category] || 0) + 1;
      sourceCount[story.source] = (sourceCount[story.source] || 0) + 1;
    }

    const sources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // === STEP 7: Save Everything ===
    console.log("[Generate] Step 6: Saving...");

    const dailyBriefing: DailyBriefing = {
      date: targetDate,
      generatedAt: new Date().toISOString(),

      fullBriefing: {
        headline: aiResult.headline,
        script: aiResult.script,
        audioUrl: fullAudioUrl,
        duration: aiResult.estimatedDuration,
        storyCount: aiResult.totalStories,
      },

      categoryBriefs: categoryBriefsWithAudio,
      stories: aiResult.stories,

      meta: {
        totalStories: aiResult.totalStories,
        categoryCounts,
        topSources: sources.slice(0, 10),
      },
    };

    await saveDailyBriefing(dailyBriefing);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Generate] ✅ Complete in ${elapsed}s`);

    return {
      success: true,
      date: targetDate,
      processingTime: `${elapsed}s`,
      briefing: {
        headline: dailyBriefing.fullBriefing.headline,
        duration: dailyBriefing.fullBriefing.duration,
        audioUrl: dailyBriefing.fullBriefing.audioUrl,
        totalStories: dailyBriefing.meta.totalStories,
        categoryBriefs: categoryBriefsWithAudio.map(cb => ({
          category: cb.category,
          displayName: cb.displayName,
          emoji: cb.emoji,
          headline: cb.headline,
          duration: cb.estimatedDuration,
          storyCount: cb.storyCount,
          hasAudio: !!cb.audioUrl,
        })),
      },
    };

  } catch (error) {
    console.error("[Generate] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}
