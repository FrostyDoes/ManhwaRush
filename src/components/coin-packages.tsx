"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, CreditCard, Loader2, CheckCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPackage, setConfirmPackage] = useState<CoinPackage | null>(
    null,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePurchase = (pkg: CoinPackage) => {
    if (!user) {
      window.location.href = "/sign-in?redirect=coins";
      return;
    }

    setConfirmPackage(pkg);
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = async () => {
    if (!confirmPackage || !user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: confirmPackage.id,
            user_id: user.id,
            return_url: `${window.location.origin}/coins/success?coins=${confirmPackage.coins}`,
            metadata: {
              coins: confirmPackage.coins,
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
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
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
              onClick={() => handlePurchase(pkg)}
              disabled={isLoading}
              variant={pkg.popular ? "default" : "outline"}
            >
              {isLoading && confirmPackage?.id === pkg.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase the following coin package:
            </DialogDescription>
          </DialogHeader>

          {confirmPackage && (
            <div className="py-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Coins className="h-10 w-10 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold">{confirmPackage.name}</h3>
                <div className="flex items-center mt-2">
                  <Coins className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-lg font-medium">
                    {confirmPackage.coins} Coins
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span>Price:</span>
                  <span className="font-bold">
                    ${confirmPackage.price.toFixed(2)} USD
                  </span>
                </div>
                {confirmPackage.discount && (
                  <div className="flex justify-between items-center text-green-500">
                    <span>Discount:</span>
                    <span>{confirmPackage.discount}% off</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                <p className="flex items-start mb-2">
                  <CreditCard className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  You'll be redirected to our secure payment processor to
                  complete this transaction.
                </p>
                <p className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Coins will be added to your account immediately after payment.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
