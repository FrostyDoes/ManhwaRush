"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UnlockAnimation } from "@/components/unlock-animation";

interface PurchaseChapterDialogProps {
  manhwaId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  coinPrice: number;
  userCoins: number;
  children?: React.ReactNode;
}

export function PurchaseChapterDialog({
  manhwaId,
  chapterId,
  chapterNumber,
  chapterTitle,
  coinPrice,
  userCoins,
  children,
}: PurchaseChapterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const handlePurchaseConfirm = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/chapters/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manhwaId,
          chapterId,
          chapterNumber,
          chapterTitle,
          coinPrice,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.insufficientCoins) {
          toast({
            title: "Insufficient Coins",
            description: `You need ${coinPrice} coins to purchase this chapter.`,
            variant: "destructive",
          });
        } else {
          throw new Error(result.error || "Failed to purchase chapter");
        }
        setShowConfirmation(false);
        return;
      }

      if (result.success) {
        if (result.alreadyPurchased) {
          toast({
            title: "Already Purchased",
            description: "You already own this chapter",
          });
          setIsOpen(false);
          // Redirect to the chapter page
          router.push(`/manhwa/${manhwaId}/chapter/${chapterNumber}`);
          router.refresh();
        } else {
          // Show unlock animation instead of toast
          setShowConfirmation(false);
          setShowUnlockAnimation(true);
        }
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to complete purchase",
          variant: "destructive",
        });
        setShowConfirmation(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowUnlockAnimation(false);
    setIsOpen(false);
    // Redirect to the chapter page after animation completes
    router.push(`/manhwa/${manhwaId}/chapter/${chapterNumber}`);
    router.refresh();
  };

  const handlePurchase = () => {
    setShowConfirmation(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock Chapter
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Chapter</DialogTitle>
            <DialogDescription>
              Unlock Chapter {chapterNumber}: {chapterTitle} to continue reading
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <Coins className="h-12 w-12 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-1">{coinPrice} Coins</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your balance: {userCoins} coins
            </p>

            {userCoins < coinPrice && (
              <div className="bg-amber-500/10 text-amber-500 p-3 rounded-md text-sm mb-4">
                You don't have enough coins. Visit the coins page to purchase
                more.
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {userCoins < coinPrice ? (
              <Button onClick={() => router.push("/coins")}>
                <Coins className="mr-2 h-4 w-4" />
                Buy Coins
              </Button>
            ) : (
              <Button onClick={handlePurchase} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Purchase for {coinPrice} Coins
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to spend {coinPrice} coins to unlock Chapter{" "}
              {chapterNumber}?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            <div className="bg-amber-500/10 p-4 rounded-lg mb-4 w-full">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Balance:</span>
                <div className="flex items-center">
                  <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{userCoins} coins</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium">Cost:</span>
                <div className="flex items-center">
                  <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>-{coinPrice} coins</span>
                </div>
              </div>
              <div className="border-t border-amber-500/20 my-2" />
              <div className="flex items-center justify-between">
                <span className="font-medium">New Balance:</span>
                <div className="flex items-center">
                  <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{userCoins - coinPrice} coins</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Once purchased, the chapter will be
              permanently unlocked.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchaseConfirm}
              disabled={isLoading}
              variant="default"
            >
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

      {/* Unlock Animation */}
      {showUnlockAnimation && (
        <UnlockAnimation
          isOpen={showUnlockAnimation}
          onAnimationComplete={handleAnimationComplete}
          chapterNumber={chapterNumber}
          coinPrice={coinPrice}
        />
      )}
    </>
  );
}
