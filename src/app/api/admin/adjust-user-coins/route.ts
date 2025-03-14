import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { isUserAdmin } from "@/utils/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, transactionType, description } = await req.json();

    if (!userId || !amount || !transactionType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get the authenticated user (admin)
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

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Get current user coins
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: `Error fetching user: ${userError.message}` },
        { status: 500 },
      );
    }

    const currentCoins = userData?.coins || 0;
    let newCoinBalance = currentCoins;

    // Update user's coin balance based on transaction type
    if (transactionType === "admin_credit") {
      newCoinBalance = currentCoins + amount;
    } else if (transactionType === "admin_adjustment") {
      newCoinBalance = Math.max(0, currentCoins - amount);
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
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: `Error updating user coins: ${updateError.message}` },
        { status: 500 },
      );
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: userId,
        amount,
        transaction_type: transactionType,
        description:
          description ||
          `Admin ${transactionType === "admin_credit" ? "added" : "subtracted"} ${amount} coins`,
        metadata: {
          admin_id: user.id,
          admin_email: user.email,
        },
      });

    if (transactionError) {
      return NextResponse.json(
        { error: `Error recording transaction: ${transactionError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: newCoinBalance,
      message: `Successfully ${transactionType === "admin_credit" ? "added" : "subtracted"} ${amount} coins`,
    });
  } catch (error: any) {
    console.error("Error adjusting user coins:", error);
    return NextResponse.json(
      { error: error.message || "Failed to adjust user coins" },
      { status: 500 },
    );
  }
}
