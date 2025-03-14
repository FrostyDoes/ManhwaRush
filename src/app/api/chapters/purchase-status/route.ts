import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const chapterId = url.searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "Missing chapter ID" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get chapter details to check if it's free
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("is_free, coin_price")
      .eq("id", chapterId)
      .single();

    if (chapterError) {
      return NextResponse.json(
        { error: `Error fetching chapter: ${chapterError.message}` },
        { status: 500 },
      );
    }

    // If chapter is free, no need to check purchase status
    if (chapterData.is_free) {
      return NextResponse.json({
        hasAccess: true,
        isFree: true,
        isPurchased: false,
        coinPrice: chapterData.coin_price,
      });
    }

    // Check if user has purchased this chapter
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("user_chapter_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId)
      .maybeSingle();

    if (purchaseError) {
      return NextResponse.json(
        { error: `Error checking purchase status: ${purchaseError.message}` },
        { status: 500 },
      );
    }

    // Check if user has an active subscription
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const hasSubscription = !!subscriptionData;

    return NextResponse.json({
      hasAccess: !!purchaseData || hasSubscription,
      isFree: false,
      isPurchased: !!purchaseData,
      hasSubscription,
      coinPrice: chapterData.coin_price,
    });
  } catch (error: any) {
    console.error("Error checking purchase status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check purchase status" },
      { status: 500 },
    );
  }
}
