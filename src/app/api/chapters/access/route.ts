import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { hasUserPurchasedChapter } from "@/utils/chapter-purchases";

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

    // Get the authenticated user
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

    // Check if the chapter is free (no need to purchase)
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("is_premium, coin_price")
      .eq("id", chapterId)
      .single();

    if (chapterError) {
      return NextResponse.json(
        { error: `Error fetching chapter: ${chapterError.message}` },
        { status: 500 },
      );
    }

    // If chapter is not premium, grant access
    if (!chapterData.is_premium) {
      return NextResponse.json({ hasAccess: true, isPremium: false });
    }

    // Check if user has an active subscription
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const hasSubscription = !!subscriptionData;

    // If user has subscription, grant access
    if (hasSubscription) {
      return NextResponse.json({
        hasAccess: true,
        isPremium: true,
        accessType: "subscription",
      });
    }

    // Check if user has purchased this chapter
    const hasPurchased = await hasUserPurchasedChapter(user.id, chapterId);

    return NextResponse.json({
      hasAccess: hasPurchased,
      isPremium: true,
      coinPrice: chapterData.coin_price,
      accessType: hasPurchased ? "purchase" : null,
    });
  } catch (error: any) {
    console.error("Error checking chapter access:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check chapter access" },
      { status: 500 },
    );
  }
}
