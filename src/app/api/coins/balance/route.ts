import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(req: NextRequest) {
  try {
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

    // Get user's coin balance
    const { data, error } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ balance: data?.coins || 0 });
  } catch (error: any) {
    console.error("Error fetching coin balance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coin balance" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount, transactionType, description } = await req.json();

    if (!amount || !transactionType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Get current user coins
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (userError) {
      throw userError;
    }

    const currentCoins = userData?.coins || 0;
    let newCoinBalance = currentCoins;

    // Update user's coin balance based on transaction type
    if (
      transactionType === "add" ||
      transactionType === "purchase" ||
      transactionType === "credit"
    ) {
      newCoinBalance = currentCoins + amount;
    } else if (transactionType === "spend") {
      if (currentCoins < amount) {
        return NextResponse.json(
          { error: "Insufficient coins" },
          { status: 400 },
        );
      }
      newCoinBalance = currentCoins - amount;
    } else {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }

    // Update user's coin balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoinBalance })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount,
        transaction_type: transactionType,
        description:
          description ||
          `${transactionType === "spend" ? "Spent" : "Added"} ${amount} coins`,
      });

    if (transactionError) {
      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      newBalance: newCoinBalance,
      message: `Successfully ${transactionType === "spend" ? "spent" : "added"} ${amount} coins`,
    });
  } catch (error: any) {
    console.error("Error updating coin balance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coin balance" },
      { status: 500 },
    );
  }
}
