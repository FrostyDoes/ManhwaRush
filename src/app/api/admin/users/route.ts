import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { isUserAdmin } from "@/utils/admin";

export async function GET(req: NextRequest) {
  try {
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

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (userId) {
      // Get a specific user with detailed information
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        return NextResponse.json(
          { error: `Error fetching user: ${userError.message}` },
          { status: 500 },
        );
      }

      // Get user's transaction history
      const { data: transactions, error: transactionsError } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
      }

      // Get user's reading history
      const { data: readingHistory, error: readingError } = await supabase
        .from("reading_history")
        .select(
          `
          id,
          progress,
          last_read_at,
          manhwa:manhwa_id(id, title),
          chapter:chapter_id(id, number, title)
        `,
        )
        .eq("user_id", userId)
        .order("last_read_at", { ascending: false });

      if (readingError) {
        console.error("Error fetching reading history:", readingError);
      }

      // Get user's chapter purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from("user_chapter_purchases")
        .select(
          `
          id,
          coins_spent,
          purchased_at,
          chapter:chapter_id(id, number, title, manhwa_id)
        `,
        )
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (purchasesError) {
        console.error("Error fetching purchases:", purchasesError);
      }

      return NextResponse.json({
        user: userData,
        transactions: transactions || [],
        readingHistory: readingHistory || [],
        purchases: purchases || [],
      });
    } else {
      // Get all users with basic information
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, name, full_name, role, coins, created_at")
        .order("created_at", { ascending: false });

      if (usersError) {
        return NextResponse.json(
          { error: `Error fetching users: ${usersError.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({ users: users || [] });
    }
  } catch (error: any) {
    console.error("Error in admin users route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, role, coins, clearHistory } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Verify the user is an admin
    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (coins !== undefined) updateData.coins = coins;

    // Update user data if there's anything to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (updateError) {
        return NextResponse.json(
          { error: `Error updating user: ${updateError.message}` },
          { status: 500 },
        );
      }

      // If coins were updated, record a transaction
      if (coins !== undefined) {
        // Get current user coins to calculate the difference
        const { data: userData } = await supabase
          .from("users")
          .select("coins")
          .eq("id", userId)
          .single();

        const previousCoins = userData?.coins || 0;
        const coinDifference = coins - previousCoins;

        if (coinDifference !== 0) {
          await supabase.from("coin_transactions").insert({
            user_id: userId,
            amount: Math.abs(coinDifference),
            transaction_type:
              coinDifference > 0 ? "admin_credit" : "admin_adjustment",
            description: `Admin ${coinDifference > 0 ? "added" : "subtracted"} ${Math.abs(coinDifference)} coins`,
            metadata: {
              admin_id: user.id,
              admin_email: user.email,
              previous_balance: previousCoins,
              new_balance: coins,
            },
          });
        }
      }
    }

    // Clear reading history if requested
    if (clearHistory) {
      const { error: historyError } = await supabase
        .from("reading_history")
        .delete()
        .eq("user_id", userId);

      if (historyError) {
        return NextResponse.json(
          { error: `Error clearing reading history: ${historyError.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 },
    );
  }
}
