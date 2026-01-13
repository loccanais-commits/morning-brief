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
    });

  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Cron failed",
    }, { status: 500 });
  }
}
