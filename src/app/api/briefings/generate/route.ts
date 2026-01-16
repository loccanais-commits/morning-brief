/**
 * API Route: Generate Daily Briefing - Multi-Category System
 * 
 * POST /api/briefings/generate
 * 
 * Pipeline:
 * 1. Busca notícias de TODAS as categorias (18 requests)
 * 2. Gera resumos por categoria + Full com AI
 * 3. Gera áudio Full (ElevenLabs) + Categories (Polly)
 * 4. Salva tudo
 * 
 * Áudios gerados:
 * - 1 Full Briefing (5 min) - ElevenLabs $5
 * - 6 Category Briefs (1-2 min cada) - Polly FREE
 */

import { NextResponse } from "next/server";
import { 
  fetchAllCategoriesNews, 
  deduplicateArticles, 
  rankArticles,
  CategoryName,
  CATEGORIES 
} from "@/lib/news-api";
import { generateAllBriefings, estimateAudioDuration } from "@/lib/ai-summarize";
import { saveDailyBriefing, saveAudioFile, DailyBriefing, CategoryBriefData } from "@/lib/storage";
import { generateElevenLabsAudio, formatTextForTTS, VOICES, MODELS } from "@/lib/tts-elevenlabs";
import { generatePollyAudio } from "@/lib/tts-polly";

export const maxDuration = 120; // 2 min timeout para processar tudo

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const voiceId = body.voice || VOICES.george;
    const modelId = body.model || MODELS.flash;
    
    const today = new Date().toISOString().split("T")[0];
    
    console.log(`[Generate] Starting multi-category generation for ${today}...`);

    // === STEP 1: Fetch ALL Categories ===
    console.log("[Generate] Step 1: Fetching all categories (18 requests)...");
    const { byCategory, all } = await fetchAllCategoriesNews();
    
    const totalArticles = all.length;
    if (totalArticles === 0) {
      return NextResponse.json({
        success: false,
        error: "No news articles found",
      }, { status: 404 });
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
      fullAudioUrl = await saveAudioFile(`${today}-full.mp3`, elevenLabsAudio);
      console.log(`[Generate] Full audio saved: ${fullAudioUrl}`);
    } else {
      // Fallback para Polly se ElevenLabs falhar
      console.log("[Generate] ElevenLabs failed, using Polly for full...");
      const pollyAudio = await generatePollyAudio(fullTtsText);
      if (pollyAudio) {
        fullAudioUrl = await saveAudioFile(`${today}-full.mp3`, pollyAudio);
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
          audioUrl = await saveAudioFile(`${today}-${brief.category}.mp3`, pollyAudio);
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

    // === STEP 6: Calculate Metadata ===
    const categoryCounts: Record<CategoryName, number> = {} as Record<CategoryName, number>;
    const sources: string[] = [];
    
    aiResult.stories.forEach(story => {
      categoryCounts[story.category] = (categoryCounts[story.category] || 0) + 1;
      if (!sources.includes(story.source)) {
        sources.push(story.source);
      }
    });

    // === STEP 7: Save Everything ===
    console.log("[Generate] Step 6: Saving...");
    
    const dailyBriefing: DailyBriefing = {
      date: today,
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

    return NextResponse.json({
      success: true,
      date: today,
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
    });

  } catch (error) {
    console.error("[Generate] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    }, { status: 500 });
  }
}
