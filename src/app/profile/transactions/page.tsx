import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { CoinTransactionHistory } from "@/components/coin-transaction-history";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=profile/transactions");
  }

  // Get user's coin transactions
  const { data: transactions, error } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Coin Transactions</h1>
              <p className="text-muted-foreground mt-1">
                View your coin transaction history
              </p>
            </div>
          </div>

          <CoinTransactionHistory transactions={transactions || []} />
        </div>
      </main>
    </div>
  );
}
