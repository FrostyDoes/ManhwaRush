"use client";

import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import Link from "next/link";

interface CoinDisplayProps {
  coinBalance?: number;
  className?: string;
}

export function CoinDisplay({ coinBalance = 0, className }: CoinDisplayProps) {
  return (
    <Button asChild variant="outline" className={className}>
      <Link href="/coins" className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-yellow-400" />
        <span className="font-medium">{coinBalance}</span>
      </Link>
    </Button>
  );
}
