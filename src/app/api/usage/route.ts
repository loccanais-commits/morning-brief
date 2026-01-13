/**
 * API Route: Check ElevenLabs Usage
 * 
 * GET /api/usage
 * 
 * Retorna informações sobre uso de créditos do ElevenLabs
 */

import { NextResponse } from "next/server";
import { getElevenLabsUsage } from "@/lib/tts-elevenlabs";

export async function GET() {
  try {
    const usage = await getElevenLabsUsage();
    
    if (!usage) {
      return NextResponse.json({
        success: false,
        error: "ElevenLabs not configured or unable to fetch usage",
      });
    }

    // Calcular porcentagem usada
    const percentUsed = Math.round((usage.characterCount / usage.characterLimit) * 100);
    
    // Estimar dias restantes (baseado em ~900 chars/dia com Flash = 450 credits)
    const dailyUsage = 450; // estimativa com modelo Flash
    const daysRemaining = Math.floor(usage.remainingCharacters / dailyUsage);

    return NextResponse.json({
      success: true,
      elevenlabs: {
        creditsUsed: usage.characterCount,
        creditsLimit: usage.characterLimit,
        creditsRemaining: usage.remainingCharacters,
        percentUsed,
        estimatedDaysRemaining: daysRemaining,
      },
      tip: percentUsed > 80 
        ? "Consider upgrading to Creator plan ($22/mo) for 100k credits"
        : "Credits looking good! Using Flash model saves 50%.",
    });

  } catch (error) {
    console.error("[Usage] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch usage",
    }, { status: 500 });
  }
}
