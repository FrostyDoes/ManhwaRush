import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      coins,
      transactionType,
      description,
      referenceId,
      metadata,
    } = await req.json();

    if (!userId || !coins || !transactionType) {
      throw new Error("Missing required parameters");
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get current user coins
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }

    const currentCoins = userData.coins || 0;
    let newCoinBalance = currentCoins;

    // Update user's coin balance based on transaction type
    if (transactionType === "purchase" || transactionType === "credit") {
      newCoinBalance = currentCoins + coins;
    } else if (transactionType === "spend") {
      if (currentCoins < coins) {
        throw new Error("Insufficient coins");
      }
      newCoinBalance = currentCoins - coins;
    } else {
      throw new Error("Invalid transaction type");
    }

    // Update user's coin balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoinBalance })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Error updating user coins: ${updateError.message}`);
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: userId,
        amount: coins,
        transaction_type: transactionType,
        description: description || "",
        reference_id: referenceId || "",
        metadata: metadata || {},
      });

    if (transactionError) {
      throw new Error(
        `Error recording transaction: ${transactionError.message}`,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: newCoinBalance,
        message: `Successfully ${transactionType === "spend" ? "spent" : "added"} ${coins} coins`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error updating user coins:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
