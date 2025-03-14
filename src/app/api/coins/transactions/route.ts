import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

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

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const type = url.searchParams.get("type"); // Optional filter by transaction type

    // Build query
    let query = supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply type filter if provided
    if (type) {
      query = query.eq("transaction_type", type);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Error fetching transactions: ${error.message}` },
        { status: 500 },
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("coin_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error getting total count:", countError);
    }

    return NextResponse.json({
      transactions: data || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount, transactionType, description, referenceId, metadata } =
      await req.json();

    if (!amount || !transactionType) {
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

    // Insert the transaction
    const { data, error } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount,
        transaction_type: transactionType,
        description:
          description ||
          `${transactionType === "spend" ? "Spent" : "Added"} ${amount} coins`,
        reference_id: referenceId || null,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error creating transaction: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      transaction: data,
      message: "Transaction recorded successfully",
    });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 },
    );
  }
}
