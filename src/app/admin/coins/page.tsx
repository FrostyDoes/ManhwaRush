import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/utils/admin";
import { CoinManagementDashboard } from "@/components/admin/coin-management-dashboard";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import Link from "next/link";

export default async function AdminCoinsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=admin/coins");
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(user.id);
  if (!isAdmin) {
    redirect("/");
  }

  // Get all users with their coin balances
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, full_name, coins")
    .order("coins", { ascending: false });

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*, user:user_id(email, name, full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  // Calculate total coins in circulation
  const totalCoins =
    users?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

  // Calculate transaction statistics
  const transactionStats = transactions?.reduce(
    (stats, transaction) => {
      if (
        transaction.transaction_type === "purchase" ||
        transaction.transaction_type === "credit" ||
        transaction.transaction_type === "admin_credit"
      ) {
        stats.totalPurchased += transaction.amount;
        stats.purchaseCount += 1;
      } else if (transaction.transaction_type === "spend") {
        stats.totalSpent += transaction.amount;
        stats.spendCount += 1;
      }
      return stats;
    },
    { totalPurchased: 0, totalSpent: 0, purchaseCount: 0, spendCount: 0 },
  ) || { totalPurchased: 0, totalSpent: 0, purchaseCount: 0, spendCount: 0 };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Coins className="mr-3 h-8 w-8 text-primary" />
              Coin Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of the coin economy and user statistics
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/coins/management">
              <Coins className="mr-2 h-4 w-4" />
              Manage Coins
            </Link>
          </Button>
        </div>

        <CoinManagementDashboard
          totalCoins={totalCoins}
          users={users || []}
          transactionStats={transactionStats}
        />
      </div>
    </main>
  );
}
