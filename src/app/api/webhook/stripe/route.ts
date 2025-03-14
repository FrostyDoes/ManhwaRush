import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Webhook secret for verifying the event
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !endpointSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    // Verify the event with the signature and secret
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Log the event type for debugging
  console.log(`Processing webhook event: ${event.type}`);

  // Handle the event based on its type
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({
      received: true,
      type: event.type,
      id: event.id,
    });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Error processing webhook", details: error.message },
      { status: 500 },
    );
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  // Check if this payment is related to a coin purchase
  if (
    !paymentIntent.metadata?.type ||
    paymentIntent.metadata.type !== "coin_purchase"
  ) {
    console.log("Payment intent is not for a coin purchase, skipping");
    return;
  }

  console.log(
    `Processing payment intent for coin purchase: ${paymentIntent.id}`,
  );

  // Try to find the associated checkout session to get more metadata
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      expand: ["data.line_items"],
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      await handleCheckoutSessionCompleted(session);
    } else {
      // If no session found, try to process with payment intent metadata
      if (paymentIntent.metadata.user_id && paymentIntent.metadata.coins) {
        await processCoinsTransaction(
          paymentIntent.metadata.user_id,
          parseInt(paymentIntent.metadata.coins),
          paymentIntent.id,
          {
            payment_intent: paymentIntent.id,
            amount_total: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        );
      }
    }
  } catch (error) {
    console.error("Error processing payment intent:", error);
    throw error;
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  // Check if this is related to a coin purchase via payment intent
  if (!charge.payment_intent) {
    console.log("Charge has no payment intent, skipping");
    return;
  }

  try {
    // Get the payment intent to check metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent.id,
    );

    if (paymentIntent.metadata?.type === "coin_purchase") {
      console.log(`Processing charge for coin purchase: ${charge.id}`);
      await handlePaymentIntentSucceeded(paymentIntent);
    }
  } catch (error) {
    console.error("Error processing charge:", error);
    throw error;
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  console.log(`Processing checkout session: ${session.id}`);
  console.log(`Session metadata:`, session.metadata);

  // Check if this is a coin purchase
  if (session.metadata?.type !== "coin_purchase" || !session.metadata?.coins) {
    console.log("Not a coin purchase or missing coins metadata, skipping");
    return; // Not a coin purchase, ignore
  }

  const userId = session.metadata.user_id;
  const coins = parseInt(session.metadata.coins);

  if (!userId || !coins) {
    console.error("Missing user ID or coins amount in session metadata");
    return;
  }

  // Get payment intent ID for reference
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // Process the transaction
  await processCoinsTransaction(userId, coins, session.id, {
    payment_intent: paymentIntentId,
    checkout_session: session.id,
    stripe_data: {
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });
}

// Shared function to process coin transactions
async function processCoinsTransaction(
  userId: string,
  coins: number,
  referenceId: string,
  metadata: any,
) {
  console.log(`Processing coin transaction: ${coins} coins for user ${userId}`);

  // Check for duplicate transactions to prevent double-crediting
  const supabase = await createClient();

  // Check if this transaction has already been processed
  const { data: existingTransaction } = await supabase
    .from("coin_transactions")
    .select("id")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (existingTransaction) {
    console.log(`Transaction ${referenceId} already processed, skipping`);
    return;
  }

  try {
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

    console.log(
      `Updating user ${userId} balance from ${currentCoins} to ${newCoinBalance}`,
    );

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
        reference_id: referenceId,
        metadata,
      });

    if (transactionError) {
      throw new Error(
        `Error recording transaction: ${transactionError.message}`,
      );
    }

    console.log(`Successfully added ${coins} coins to user ${userId}`);
  } catch (error) {
    console.error("Error processing coin purchase:", error);
    throw error;
  }
}
