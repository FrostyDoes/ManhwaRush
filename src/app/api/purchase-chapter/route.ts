import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map(({ name, value }) => ({
              name,
              value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { manhwaId, chapterId, chapterNumber, coinPrice } =
      await request.json();

    if (!manhwaId || !chapterId || !chapterNumber || coinPrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Start a transaction
    try {
      // 1. Check if user already purchased this chapter
      const { data: existingPurchase } = await supabase
        .from("user_chapter_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("chapter_id", chapterId)
        .maybeSingle();

      if (existingPurchase) {
        // User already purchased this chapter
        return NextResponse.json({
          success: true,
          alreadyPurchased: true,
          message: "Chapter already purchased",
        });
      }

      // 2. Get user's current coin balance
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: "Failed to retrieve user data" },
          { status: 500 },
        );
      }

      const currentCoins = userData.coins || 0;

      // 3. Check if user has enough coins
      if (currentCoins < coinPrice) {
        return NextResponse.json(
          {
            error: "Insufficient coins",
            currentCoins,
            requiredCoins: coinPrice,
          },
          { status: 400 },
        );
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

      return NextResponse.json({
        success: true,
        newCoinBalance,
        message: `Successfully purchased Chapter ${chapterNumber} for ${coinPrice} coins`,
      });
    } catch (error: any) {
      console.error("Error purchasing chapter:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to complete purchase",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 },
    );
  }
}
