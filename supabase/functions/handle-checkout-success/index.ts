import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session ID");
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "line_items"],
    });

    // Verify payment status
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Extract user ID and coin amount from metadata
    const userId = session.metadata?.user_id;
    const coins = parseInt(session.metadata?.coins || "0");

    if (!userId || !coins) {
      throw new Error("Invalid metadata: missing user ID or coins amount");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const newCoinBalance = currentCoins + coins;

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
        transaction_type: "purchase",
        description: `Purchased ${coins} coins`,
        reference_id: session.id,
        metadata: {
          payment_intent: session.payment_intent?.id,
          checkout_session: session.id,
          stripe_data: {
            amount_total: session.amount_total,
            currency: session.currency,
          },
        },
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
        message: `Successfully added ${coins} coins to user account`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing checkout success:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
