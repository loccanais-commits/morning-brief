/**
 * API Route: Push Notification Subscriptions
 * 
 * POST /api/push/subscribe - Salvar subscription
 * DELETE /api/push/subscribe - Remover subscription
 * GET /api/push/subscribe - Retorna VAPID public key
 */

import { NextResponse } from "next/server";
import { 
  savePushSubscription, 
  removePushSubscription,
  isSupabaseConfigured 
} from "@/lib/supabase";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push-notifications";

// GET - Retorna public key para o frontend
export async function GET() {
  const publicKey = getVapidPublicKey();
  
  if (!publicKey) {
    return NextResponse.json({
      success: false,
      error: "Push notifications not configured",
    }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    publicKey,
  });
}

// POST - Salvar subscription
export async function POST(request: Request) {
  try {
    if (!isPushConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Push notifications not configured on server",
      }, { status: 503 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Database not configured",
      }, { status: 503 });
    }

    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json({
        success: false,
        error: "Invalid subscription format",
      }, { status: 400 });
    }

    const saved = await savePushSubscription(subscription);

    if (!saved) {
      return NextResponse.json({
        success: false,
        error: "Failed to save subscription",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription saved",
    });

  } catch (error) {
    console.error("[API] Push subscribe error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// DELETE - Remover subscription
export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: "Endpoint required",
      }, { status: 400 });
    }

    const removed = await removePushSubscription(endpoint);

    return NextResponse.json({
      success: removed,
      message: removed ? "Subscription removed" : "Subscription not found",
    });

  } catch (error) {
    console.error("[API] Push unsubscribe error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}
