import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useCoins() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCoinBalance = async () => {
    try {
      const response = await fetch("/api/coins/balance");
      if (!response.ok) throw new Error("Failed to fetch coin balance");
      const data = await response.json();
      return data.balance;
    } catch (error: any) {
      console.error("Error fetching coin balance:", error);
      return null;
    }
  };

  const purchaseCoins = async (
    packageId: string,
    coins: number,
    returnUrl?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coins/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          coins,
          returnUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create purchase");

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      toast({
        title: "Purchase Error",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const spendCoins = async (amount: number, description?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coins/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          transactionType: "spend",
          description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Insufficient coins") {
          toast({
            title: "Insufficient Coins",
            description: `You need ${amount} coins for this purchase.`,
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to spend coins");
        }
        return { success: false, error: data.error };
      }

      return { success: true, newBalance: data.newBalance };
    } catch (error: any) {
      toast({
        title: "Transaction Error",
        description: error.message || "Failed to process transaction",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCoinBalance,
    purchaseCoins,
    spendCoins,
    isLoading,
  };
}
