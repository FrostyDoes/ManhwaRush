"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function purchaseChapter(
  manhwaId: string,
  chapterId: string,
  chapterNumber: number,
  coinPrice: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to purchase chapters",
    };
  }

  // Start a transaction
  try {
    // 1. Check if user already purchased this chapter using the utility function
    const { hasUserPurchasedChapter } = await import(
      "@/utils/chapter-purchases"
    );
    const alreadyPurchased = await hasUserPurchasedChapter(user.id, chapterId);

    if (alreadyPurchased) {
      // User already purchased this chapter
      return { success: true, alreadyPurchased: true };
    }

    // 2. Get user's current coin balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: "Failed to retrieve user data" };
    }

    const currentCoins = userData.coins || 0;

    // 3. Check if user has enough coins
    if (currentCoins < coinPrice) {
      return {
        success: false,
        error: "Insufficient coins",
        currentCoins,
        requiredCoins: coinPrice,
      };
    }

    // 4. Deduct coins from user's balance
    const newCoinBalance = currentCoins - coinPrice;
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoinBalance })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    // 5. Record the transaction
    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: coinPrice,
        transaction_type: "spend",
        description: `Purchased Chapter ${chapterNumber}`,
        reference_id: chapterId,
        metadata: {
          manhwa_id: manhwaId,
          chapter_number: chapterNumber,
          purchase_type: "chapter",
        },
      });

    if (transactionError) {
      throw transactionError;
    }

    // 6. Record the chapter purchase
    const { error: purchaseError } = await supabase
      .from("user_chapter_purchases")
      .insert({
        user_id: user.id,
        chapter_id: chapterId,
        coins_spent: coinPrice,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      throw purchaseError;
    }

    // Revalidate the chapter page to reflect the purchase
    revalidatePath(`/manhwa/${manhwaId}/chapter/${chapterNumber}`);

    return {
      success: true,
      newCoinBalance,
      message: `Successfully purchased Chapter ${chapterNumber} for ${coinPrice} coins`,
    };
  } catch (error: any) {
    console.error("Error purchasing chapter:", error);
    return {
      success: false,
      error: error.message || "Failed to complete purchase",
    };
  }
}
