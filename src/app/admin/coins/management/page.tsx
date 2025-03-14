import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/utils/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCoinPackages } from "@/components/admin/admin-coin-packages";
import { AdminUserCoinAdjustment } from "@/components/admin/admin-user-coin-adjustment";
import { CoinTransactionTable } from "@/components/admin/coin-transaction-table";
import { Coins, Package, Users, History } from "lucide-react";

export default async function AdminCoinManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=admin/coins/management");
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(user.id);
  if (!isAdmin) {
    redirect("/");
  }

  // Get all transactions for admin view
  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*, user:user_id(email, name, full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  // Get all users for the user adjustment tab
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, full_name, coins")
    .order("coins", { ascending: false });

  // Get coin packages
  const { data: coinPackages } = await supabase
    .from("coin_packages")
    .select("*")
    .order("coins", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Coins className="mr-3 h-8 w-8 text-primary" />
                Coin Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage coin packages, user balances, and view transaction
                history
              </p>
            </div>
          </div>

          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Coin Packages</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>User Balances</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages">
              <AdminCoinPackages initialPackages={coinPackages || []} />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserCoinAdjustment users={users || []} />
            </TabsContent>

            <TabsContent value="transactions">
              <CoinTransactionTable transactions={transactions || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
