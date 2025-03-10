"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import { supabase } from "../../supabase/supabase";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  popular?: boolean;
  discount?: number;
}

interface CoinPackagesProps {
  packages: CoinPackage[];
  user: User | null;
}

export function CoinPackages({ packages, user }: CoinPackagesProps) {
  const handlePurchase = async (
    packageId: string,
    coins: number,
    price: number,
  ) => {
    if (!user) {
      window.location.href = "/sign-in?redirect=coins";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: packageId,
            user_id: user.id,
            return_url: `${window.location.origin}/coins/success?coins=${coins}`,
            metadata: {
              coins: coins,
              type: "coin_purchase",
            },
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card
          key={pkg.id}
          className={`overflow-hidden ${pkg.popular ? "border-primary shadow-lg" : ""}`}
        >
          {pkg.popular && (
            <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
              Most Popular
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-400" />
              {pkg.name}
            </CardTitle>
            <CardDescription>
              {pkg.discount ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-muted-foreground">
                    ${(pkg.price * (1 + pkg.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                    Save {pkg.discount}%
                  </span>
                </div>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold">
                ${pkg.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-1">USD</span>
            </div>
            <div className="flex items-center justify-center bg-muted/50 rounded-lg py-3 mb-4">
              <Coins className="h-6 w-6 text-yellow-400 mr-2" />
              <span className="text-xl font-bold">{pkg.coins} Coins</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => handlePurchase(pkg.id, pkg.coins, pkg.price)}
            >
              Purchase
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
