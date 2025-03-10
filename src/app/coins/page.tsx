import { SiteHeader } from "@/components/site-header";
import { CoinPackages } from "@/components/coin-packages";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";

// Sample coin packages data
const coinPackages = [
  {
    id: "price_coin_100",
    name: "Basic Pack",
    coins: 100,
    price: 9.99,
  },
  {
    id: "price_coin_250",
    name: "Popular Pack",
    coins: 250,
    price: 19.99,
    popular: true,
    discount: 20,
  },
  {
    id: "price_coin_500",
    name: "Premium Pack",
    coins: 500,
    price: 34.99,
    discount: 30,
  },
  {
    id: "price_coin_1000",
    name: "Mega Pack",
    coins: 1000,
    price: 59.99,
    discount: 40,
  },
  {
    id: "price_coin_2500",
    name: "Ultimate Pack",
    coins: 2500,
    price: 129.99,
    discount: 50,
  },
  {
    id: "price_coin_5000",
    name: "Collector's Pack",
    coins: 5000,
    price: 249.99,
    discount: 55,
  },
];

export default async function CoinsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=coins");
  }

  // Get user's coin balance
  const { data: userData } = await supabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  const coinBalance = userData?.coins || 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">ManhwaRush Coins</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Purchase coins to unlock premium manhwa chapters and support your
              favorite creators.
            </p>

            <div className="bg-card border rounded-xl p-6 flex flex-col items-center mb-8 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Your Coin Balance</h2>
              <div className="flex items-center justify-center bg-primary/10 rounded-full p-6 mb-4">
                <Coins className="h-8 w-8 text-yellow-400 mr-3" />
                <span className="text-3xl font-bold">{coinBalance}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Use your coins to unlock premium chapters across the platform.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Choose a Coin Package</h2>
          <CoinPackages packages={coinPackages} user={user} />

          <div className="mt-8 bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <h3 className="font-medium mb-2">About ManhwaRush Coins</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Coins are used to unlock premium manhwa chapters</li>
              <li>Purchased coins never expire</li>
              <li>Larger packages offer better value with discounts</li>
              <li>All transactions are secure and processed through Stripe</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
