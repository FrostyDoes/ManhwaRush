"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Loader2 } from "lucide-react";
import Link from "next/link";

interface CoinDisplayProps {
  coinBalance?: number;
  className?: string;
  userId?: string;
}

export function CoinDisplay({
  coinBalance = 0,
  className,
  userId,
}: CoinDisplayProps) {
  const [balance, setBalance] = useState(coinBalance);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update the local state when the prop changes
    setBalance(coinBalance);
  }, [coinBalance]);

  useEffect(() => {
    // Only fetch balance if user is logged in
    if (!userId) return;

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/coins/balance");
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Error fetching coin balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription for coin balance updates
    const setupRealtimeSubscription = async () => {
      try {
        const { createClient } = await import("../../supabase/client");
        const supabase = createClient();

        const channel = supabase
          .channel("coin-balance-changes")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "users",
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              if (payload.new && typeof payload.new.coins === "number") {
                setBalance(payload.new.coins);
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        return () => {};
      }
    };

    const unsubscribe = setupRealtimeSubscription();
    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, [userId]);

  return (
    <Button asChild variant="outline" className={className}>
      <Link href="/coins" className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-yellow-400" />
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span className="font-medium">{balance}</span>
        )}
      </Link>
    </Button>
  );
}
