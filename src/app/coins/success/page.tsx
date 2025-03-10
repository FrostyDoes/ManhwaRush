import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export default async function CoinSuccessPage({
  searchParams,
}: {
  searchParams: { coins?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const coinsAdded = searchParams.coins ? parseInt(searchParams.coins) : 0;

  // Get user's current coin balance
  const { data: userData } = await supabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  const coinBalance = userData?.coins || 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
              <CardDescription>
                Your coins have been added to your account
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
                    <span className="font-medium">{coinBalance}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button asChild>
                  <Link href="/" className="flex items-center justify-center">
                    Browse Manhwa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href="/coins">Buy More Coins</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
