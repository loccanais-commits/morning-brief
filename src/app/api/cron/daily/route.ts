/**
 * API Route: Daily Cron Job
 *
 * GET /api/cron/daily
 *
 * Configuração Vercel (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily",
 *     "schedule": "0 11 * * *"  // 11:00 UTC = 6:00 EST
 *   }]
 * }
 */
import { NextResponse } from "next/server";
import { hasTodayBriefing } from "@/lib/storage";
import { getAllPushSubscriptions, isSupabaseConfigured } from "@/lib/supabase";
import { sendPushToAll, createDailyBriefingPayload, isPushConfigured } from "@/lib/push-notifications";

const CRON_SECRET = process.env.CRON_SECRET;

// Gera o texto do tweet baseado no briefing
function generateTweetText(briefing: {
  title?: string;
  categories?: Array<{ id: string; title?: string; headline?: string }>;
}): string {
  const categoryEmojis: Record<string, string> = {
    china: "🇨🇳",
    russia: "🇷🇺",
    middleeast: "🇮🇱",
    middle_east: "🇮🇱",
    economy: "💰",
    defense: "🛡️",
    technology: "🤖",
    tech: "🤖",
  };

  // Pega até 4 headlines das categorias
  const headlines = (briefing.categories || [])
    .slice(0, 4)
    .map((cat) => {
      const emoji = categoryEmojis[cat.id] || "📰";
      const headline = cat.title || cat.headline || "";
      // Trunca headline se muito longa
      const truncated = headline.length > 45 
        ? headline.substring(0, 42) + "..." 
        : headline;
      return `${emoji} ${truncated}`;
    })
    .join("\n");

  if (headlines) {
    return `🌅 Your Morning Brief is ready!

Today's top stories:
${headlines}

🎧 Listen now: morningbrief.news

#Geopolitics #WorldNews`;
  }

  // Fallback se não tiver categorias
  return `🌅 Your Morning Brief is ready!

${briefing.title || "Today's global news briefing is live."}

🎧 Listen now: morningbrief.news

#Geopolitics #WorldNews #MorningBrief`;
}

export async function GET(request: Request) {
  // Verificar autorização
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    const vercelCron = request.headers.get("x-vercel-cron");
    if (!vercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  console.log("[Cron] Starting daily job...");
  const startTime = Date.now();

  try {
    // Verificar se já gerou hoje
    const exists = await hasTodayBriefing();
    if (exists) {
      console.log("[Cron] Briefing already exists for today, skipping...");
      return NextResponse.json({
        success: true,
        message: "Briefing already generated today",
        skipped: true,
      });
    }

    // Chamar a API de geração
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    "http://localhost:3000");

    const generateResponse = await fetch(`${baseUrl}/api/briefings/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stories: 10 }),
    });

    const result = await generateResponse.json();

    if (!result.success) {
      throw new Error(result.error || "Generation failed");
    }

    console.log(`[Cron] Briefing generated: ${result.briefing?.title}`);

    // === ENVIAR PUSH NOTIFICATIONS ===
    let pushResults = null;
    if (isPushConfigured() && isSupabaseConfigured()) {
      console.log("[Cron] Sending push notifications...");
      const subscriptions = await getAllPushSubscriptions();
      if (subscriptions.length > 0) {
        const payload = createDailyBriefingPayload(result.briefing?.title);
        pushResults = await sendPushToAll(subscriptions, payload);
        console.log(`[Cron] Push sent: ${pushResults.sent} success, ${pushResults.failed} failed`);
      } else {
        console.log("[Cron] No push subscriptions found");
      }
    }

    // === POSTAR NO TWITTER/X ===
    let twitterResult = null;
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) {
      console.log("[Cron] Posting to Twitter...");
      try {
        const tweetText = generateTweetText(result.briefing);
        
        const twitterResponse = await fetch(`${baseUrl}/api/twitter/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tweetText }),
        });

        const twitterData = await twitterResponse.json();
        
        if (twitterData.success) {
          console.log(`[Cron] Tweet posted: ${twitterData.url}`);
          twitterResult = {
            success: true,
            tweetId: twitterData.tweetId,
            url: twitterData.url,
          };
        } else {
          console.error("[Cron] Twitter error:", twitterData.error);
          twitterResult = {
            success: false,
            error: twitterData.error,
          };
        }
      } catch (twitterError) {
        console.error("[Cron] Twitter error:", twitterError);
        twitterResult = {
          success: false,
          error: twitterError instanceof Error ? twitterError.message : "Unknown error",
        };
      }
    } else {
      console.log("[Cron] Twitter not configured, skipping...");
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Cron] Complete in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      message: "Daily briefing generated",
      date: result.date,
      headline: result.briefing?.title,
      processingTime: `${elapsed}s`,
      push: pushResults ? {
        sent: pushResults.sent,
        failed: pushResults.failed,
      } : null,
      twitter: twitterResult,
    });

  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Cron failed",
    }, { status: 500 });
  }
}
