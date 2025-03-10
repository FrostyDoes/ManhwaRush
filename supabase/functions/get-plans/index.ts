import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

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
    // First try to get coin packages (prices with metadata.type = 'coin_package')
    const coinPackages = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 100,
    });

    // Filter for coin packages
    const coinPrices = coinPackages.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        return product.metadata?.type === "coin_package";
      })
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          name: product.name,
          coins: parseInt(product.metadata?.coins || "0"),
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval || "one-time",
          popular: product.metadata?.popular === "true",
          discount: product.metadata?.discount
            ? parseInt(product.metadata.discount)
            : 0,
        };
      });

    // If we found coin packages, return those
    if (coinPrices.length > 0) {
      return new Response(JSON.stringify(coinPrices), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Otherwise, fall back to regular plans
    const plans = await stripe.plans.list({
      active: true,
    });

    return new Response(JSON.stringify(plans.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
