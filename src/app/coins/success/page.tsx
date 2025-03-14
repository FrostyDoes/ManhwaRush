"use client";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Coins, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../../supabase/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SuccessPageProps {
  searchParams: { coins?: string; session_id?: string; canceled?: string };
  user: any;
  initialCoinBalance: number;
}

function SuccessPageClient({
  searchParams,
  user,
  initialCoinBalance,
}: SuccessPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [coinBalance, setCoinBalance] = useState(initialCoinBalance);
  const [processingComplete, setProcessingComplete] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const coinsAdded = searchParams.coins ? parseInt(searchParams.coins) : 0;
  const sessionId = searchParams.session_id;
  const canceled = searchParams.canceled === "true";

  useEffect(() => {
    // Process the checkout session if session_id is provided
    const processCheckout = async () => {
      if (!sessionId || processingComplete) return;

      setIsProcessing(true);

      try {
        // Call the handle-checkout-success edge function to process the payment
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-handle-checkout-success",
          {
            body: { session_id: sessionId },
          },
        );

        if (error) {
          throw error;
        }

        if (data?.success) {
          // Update the displayed coin balance with the new balance from the server
          if (data.newBalance) {
            setCoinBalance(data.newBalance);
          }

          toast({
            title: "Purchase Successful",
            description: `${coinsAdded} coins have been added to your account!`,
            variant: "default",
          });
        }
      } catch (error: any) {
        console.error("Error processing checkout success:", error);
        toast({
          title: "Processing Notice",
          description:
            "Your purchase is being processed. Coins will be added to your account shortly.",
          variant: "default",
        });
      } finally {
        setIsProcessing(false);
        setProcessingComplete(true);
      }
    };

    processCheckout();
  }, [sessionId, processingComplete, supabase, coinsAdded, toast]);

  // If the user canceled the checkout
  useEffect(() => {
    if (canceled) {
      toast({
        title: "Purchase Canceled",
        description:
          "Your coin purchase was canceled. No payment was processed.",
        variant: "destructive",
      });
    }
  }, [canceled, toast]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {canceled ? (
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
                  <Coins className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">Purchase Canceled</CardTitle>
                <CardDescription>
                  Your coin purchase was not completed
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    No payment was processed. You can try again or explore other
                    options.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button asChild>
                    <Link
                      href="/coins"
                      className="flex items-center justify-center"
                    >
                      Try Again
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center pb-2">
                {isProcessing ? (
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                  </div>
                )}
                <CardTitle className="text-2xl">
                  {isProcessing
                    ? "Processing Purchase..."
                    : "Purchase Successful!"}
                </CardTitle>
                <CardDescription>
                  {isProcessing
                    ? "Please wait while we process your payment"
                    : "Your coins have been added to your account"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Coins Added:
                    </span>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{coinsAdded}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Current Balance:
                    </span>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {initialCoinBalance}
                          </span>
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <span className="font-medium">{coinBalance}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button asChild disabled={isProcessing}>
                    <Link href="/" className="flex items-center justify-center">
                      Browse Manhwa
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" disabled={isProcessing}>
                    <Link href="/profile/transactions">
                      View Transaction History
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" disabled={isProcessing}>
                    <Link href="/coins">Buy More Coins</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default async function CoinSuccessPage({
  searchParams,
}: {
  searchParams: { coins?: string; session_id?: string; canceled?: string };
}) {
  // Server-side code
  const { createClient } = await import("../../../../supabase/server");
  const serverSupabase = await createClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's current coin balance
  const { data: userData } = await serverSupabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  const initialCoinBalance = userData?.coins || 0;

  // Pass the data to the client component
  return (
    <SuccessPageClient
      searchParams={searchParams}
      user={user}
      initialCoinBalance={initialCoinBalance}
    />
  );
}
