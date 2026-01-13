/**
 * API Route: Get Briefings
 * 
 * GET /api/briefings - Briefing de hoje
 * GET /api/briefings?date=2026-01-11 - Briefing de uma data
 * GET /api/briefings?history=true - Lista de datas disponíveis
 */

import { NextResponse } from "next/server";
import { getTodayBriefing, getBriefing, getHistorySummary } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const history = searchParams.get("history");

    // Lista de datas disponíveis
    if (history === "true") {
      const dates = await getHistorySummary();
      return NextResponse.json({
        success: true,
        history: dates,
      });
    }

    // Buscar por data específica
    if (date) {
      const briefing = await getBriefing(date);
      
      if (!briefing) {
        return NextResponse.json({
          success: false,
          error: `No briefing found for ${date}`,
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        briefing,
      });
    }

    // Buscar briefing de hoje
    const todayBriefing = await getTodayBriefing();

    if (!todayBriefing) {
      return NextResponse.json({
        success: false,
        error: "No briefing generated yet for today",
        hint: "POST /api/briefings/generate to create today's briefing",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      briefing: todayBriefing,
    });

  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch briefings",
    }, { status: 500 });
  }
}
