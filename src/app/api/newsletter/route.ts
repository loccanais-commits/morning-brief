/**
 * API Route: Newsletter Subscription
 * 
 * POST /api/newsletter - Subscribe email
 * 
 * Flow:
 * 1. Valida email
 * 2. Adiciona no Beehiiv (envia emails profissionais)
 * 3. Salva no Supabase (backup + analytics)
 */

import { NextResponse } from "next/server";
import { addSubscriber as addSupabaseSubscriber, isSupabaseConfigured } from "@/lib/supabase";
import { addSubscriber as addBeehiivSubscriber, isBeehiivConfigured } from "@/lib/beehiiv";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validar email
    if (!email || !email.includes("@")) {
      return NextResponse.json({
        success: false,
        error: "Valid email required",
      }, { status: 400 });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: "Invalid email format",
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let beehiivSuccess = false;
    let supabaseSuccess = false;
    let beehiivError = "";

    // 1. Adicionar no Beehiiv (principal - envia welcome email)
    if (isBeehiivConfigured()) {
      console.log(`[Newsletter] Adding to Beehiiv: ${normalizedEmail}`);
      
      const beehiivResult = await addBeehiivSubscriber(normalizedEmail, {
        utmSource: "morning_brief_app",
        utmMedium: "website",
        utmCampaign: "newsletter_signup",
        sendWelcomeEmail: true,
        reactivateExisting: true,
      });
      
      beehiivSuccess = beehiivResult.success;
      if (!beehiivSuccess) {
        beehiivError = beehiivResult.error || "Beehiiv error";
        console.error(`[Newsletter] Beehiiv error: ${beehiivError}`);
      }
    } else {
      console.log("[Newsletter] Beehiiv not configured, skipping...");
    }

    // 2. Salvar no Supabase (backup + analytics)
    if (isSupabaseConfigured()) {
      console.log(`[Newsletter] Saving to Supabase: ${normalizedEmail}`);
      supabaseSuccess = await addSupabaseSubscriber(normalizedEmail);
      
      if (!supabaseSuccess) {
        console.error("[Newsletter] Supabase save failed");
      }
    } else {
      console.log("[Newsletter] Supabase not configured, skipping...");
    }

    // Se nenhum serviço está configurado
    if (!isBeehiivConfigured() && !isSupabaseConfigured()) {
      console.log(`[Newsletter] No service configured, logging only: ${normalizedEmail}`);
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing!",
        note: "Email logged (services not configured)",
      });
    }

    // Se Beehiiv falhou mas era o principal
    if (isBeehiivConfigured() && !beehiivSuccess) {
      // Se já existe no Beehiiv, não é erro
      if (beehiivError.toLowerCase().includes("already") || 
          beehiivError.toLowerCase().includes("exists")) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
      
      return NextResponse.json({
        success: false,
        error: "Failed to subscribe. Please try again.",
      }, { status: 500 });
    }

    // Sucesso!
    console.log(`[Newsletter] ✅ Subscribed: ${normalizedEmail} (Beehiiv: ${beehiivSuccess}, Supabase: ${supabaseSuccess})`);
    
    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! Check your email for confirmation.",
    });

  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Something went wrong. Please try again.",
    }, { status: 500 });
  }
}

