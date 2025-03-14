import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const { packageId, coins, returnUrl } = await req.json();

    if (!packageId || !coins) {
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

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: packageId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/coins/success?session_id={CHECKOUT_SESSION_ID}&coins=${coins}`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/coins/success?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        coins: coins.toString(),
        type: "coin_purchase",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating coin purchase:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process purchase" },
      { status: 500 },
    );
  }
}
