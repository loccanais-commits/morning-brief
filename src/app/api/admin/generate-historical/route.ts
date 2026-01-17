/**
 * API Route: Generate Historical Briefings
 *
 * POST /api/admin/generate-historical
 *
 * Body:
 * {
 *   dates: ["2026-01-01", "2026-01-02", ...]
 *   // or
 *   startDate: "2026-01-01",
 *   endDate: "2026-01-13"
 * }
 *
 * Note: This endpoint is expensive and should be protected.
 * Each day costs ~$0.15-0.30 in API usage (ElevenLabs + Polly + AI)
 */

import { NextResponse } from "next/server";
import { hasBriefingForDate } from "@/lib/storage";

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.CRON_SECRET;

export const maxDuration = 300; // 5 min timeout for batch processing

export async function POST(request: Request) {
  // Check authorization
  const authHeader = request.headers.get("authorization");
  if (ADMIN_SECRET && authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    let datesToGenerate: string[] = [];

    // Option 1: Explicit dates array
    if (body.dates && Array.isArray(body.dates)) {
      datesToGenerate = body.dates;
    }
    // Option 2: Date range
    else if (body.startDate && body.endDate) {
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToGenerate.push(d.toISOString().split("T")[0]);
      }
    } else {
      return NextResponse.json(
        {
          error: "Please provide either 'dates' array or 'startDate'/'endDate'",
          example: {
            option1: { dates: ["2026-01-01", "2026-01-02"] },
            option2: { startDate: "2026-01-01", endDate: "2026-01-13" },
          },
        },
        { status: 400 }
      );
    }

    console.log(`[HistoricalGen] Starting generation for ${datesToGenerate.length} dates...`);

    const results: Array<{
      date: string;
      status: "success" | "skipped" | "error";
      message?: string;
    }> = [];

    // Process each date sequentially to avoid overwhelming the APIs
    for (const date of datesToGenerate) {
      try {
        // Check if briefing already exists
        const exists = await hasBriefingForDate(date);
        if (exists) {
          console.log(`[HistoricalGen] ${date}: Already exists, skipping...`);
          results.push({ date, status: "skipped", message: "Briefing already exists" });
          continue;
        }

        console.log(`[HistoricalGen] ${date}: Generating...`);

        // Call the generate API with the specific date
        const response = await fetch(`${baseUrl}/api/briefings/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date }),
        });

        const result = await response.json();

        if (result.success) {
          console.log(`[HistoricalGen] ${date}: ✅ Success - "${result.briefing?.headline}"`);
          results.push({ date, status: "success", message: result.briefing?.headline });
        } else {
          console.error(`[HistoricalGen] ${date}: ❌ Failed - ${result.error}`);
          results.push({ date, status: "error", message: result.error });
        }

        // Wait between generations to avoid rate limits
        await new Promise((r) => setTimeout(r, 2000));
      } catch (error) {
        console.error(`[HistoricalGen] ${date}: ❌ Exception -`, error);
        results.push({
          date,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successful = results.filter((r) => r.status === "success").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const failed = results.filter((r) => r.status === "error").length;

    console.log(`[HistoricalGen] Complete: ${successful} success, ${skipped} skipped, ${failed} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        total: datesToGenerate.length,
        successful,
        skipped,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error("[HistoricalGen] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Historical generation failed",
      },
      { status: 500 }
    );
  }
}
