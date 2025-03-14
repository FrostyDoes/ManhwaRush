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

    // Check if user has purchased this chapter
    const hasPurchased = await hasUserPurchasedChapter(user.id, chapterId);

    // Get chapter details
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("is_premium, coin_price, manhwa_id, number, title")
      .eq("id", chapterId)
      .single();

    if (chapterError) {
      return NextResponse.json(
        { error: `Error fetching chapter: ${chapterError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      hasPurchased,
      chapterDetails: chapterData,
    });
  } catch (error: any) {
    console.error("Error checking chapter purchase:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check chapter purchase" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { chapterId, manhwaId, chapterNumber, chapterTitle, coinPrice } =
      await req.json();

    if (!chapterId || !coinPrice) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Check if user already purchased this chapter
    const hasPurchased = await hasUserPurchasedChapter(user.id, chapterId);
    if (hasPurchased) {
      return NextResponse.json({
        success: true,
        message: "Chapter already purchased",
        alreadyPurchased: true,
      });
    }

    // Get user's coin balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: `Error fetching user: ${userError.message}` },
        { status: 500 },
      );
    }

    const currentCoins = userData.coins || 0;

    // Check if user has enough coins
    if (currentCoins < coinPrice) {
      return NextResponse.json(
        { error: "Insufficient coins", insufficientCoins: true },
        { status: 400 },
      );
    }

    // Begin transaction
    // 1. Deduct coins from user's balance
    const newCoinBalance = currentCoins - coinPrice;
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoinBalance })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Error updating user coins: ${updateError.message}` },
        { status: 500 },
      );
    }

    // 2. Record the transaction
    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: coinPrice,
        transaction_type: "spend",
        description: `Purchased chapter ${chapterNumber}: ${chapterTitle || ""}`,
        reference_id: chapterId,
        metadata: {
          manhwa_id: manhwaId,
          chapter_number: chapterNumber,
          chapter_title: chapterTitle,
        },
      });

    if (transactionError) {
      // Attempt to rollback coin deduction if transaction recording fails
      await supabase
        .from("users")
        .update({ coins: currentCoins })
        .eq("id", user.id);

      return NextResponse.json(
        { error: `Error recording transaction: ${transactionError.message}` },
        { status: 500 },
      );
    }

    // 3. Record the chapter purchase
    const { error: purchaseError } = await supabase
      .from("user_chapter_purchases")
      .insert({
        user_id: user.id,
        chapter_id: chapterId,
        coins_spent: coinPrice,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      // This is a critical error as the user has been charged but purchase not recorded
      // Log this for admin attention but still return success to user
      console.error("CRITICAL ERROR: User charged but purchase not recorded:", {
        userId: user.id,
        chapterId,
        coinPrice,
        error: purchaseError.message,
      });
    }

    return NextResponse.json({
      success: true,
      newBalance: newCoinBalance,
      message: `Successfully purchased chapter for ${coinPrice} coins`,
    });
  } catch (error: any) {
    console.error("Error purchasing chapter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purchase chapter" },
      { status: 500 },
    );
  }
}
