import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../../../supabase/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/utils/admin";
import { CoinTransactionTable } from "@/components/admin/coin-transaction-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Coins } from "lucide-react";
import Link from "next/link";

export default async function UserTransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=admin/users");
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(user.id);
  if (!isAdmin) {
    redirect("/");
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("id, email, name, full_name, coins")
    .eq("id", userId)
    .single();

  if (!userData) {
    redirect("/admin/coins");
  }

  // Get user's transactions
  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*, user:user_id(email, name, full_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/admin/coins">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <User className="mr-3 h-8 w-8 text-primary" />
                User Transactions
              </h1>
              <p className="text-muted-foreground mt-1">
                Transaction history for {userData.email}
              </p>
            </div>

            <div className="bg-card p-4 rounded-lg border flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Current Balance:
              </div>
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-xl font-bold">{userData.coins || 0}</span>
              </div>
            </div>
          </div>

          <CoinTransactionTable transactions={transactions || []} />
        </div>
      </main>
    </div>
  );
}
