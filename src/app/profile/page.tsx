import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { CoinTransactionHistory } from "@/components/coin-transaction-history";
import { AccountSettings } from "@/components/account-settings";
import { Coins, User, Settings, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=profile");
  }

  // Get user profile data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user is an admin
  const isAdmin = userData?.role === "admin";

  // Get user's coin transactions
  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate total coins spent and earned
  const coinStats = transactions?.reduce(
    (acc, transaction) => {
      if (transaction.transaction_type === "spend") {
        acc.spent += transaction.amount;
      } else if (
        transaction.transaction_type === "purchase" ||
        transaction.transaction_type === "credit" ||
        transaction.transaction_type === "admin_credit"
      ) {
        acc.earned += transaction.amount;
      }
      return acc;
    },
    { spent: 0, earned: 0 },
  ) || { spent: 0, earned: 0 };

  const userInitials = userData?.name
    ? userData.name.substring(0, 2).toUpperCase()
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* User Profile Card */}
            <Card className="w-full md:w-1/3">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage
                    src={userData?.avatar_url}
                    alt={userData?.name || user.email}
                  />
                  <AvatarFallback className="text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{userData?.name || user.email}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coin Balance Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-primary" />
                      Coin Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Coins className="h-8 w-8 text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-3xl font-bold">
                          {userData?.coins || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available coins
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild className="w-full">
                      <Link
                        href="/coins"
                        className="flex items-center justify-center"
                      >
                        <Coins className="mr-2 h-4 w-4" />
                        Buy More Coins
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Coin Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
                        <div className="text-lg font-bold">
                          {coinStats.earned}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Coins Earned
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <Coins className="h-5 w-5 text-primary mb-1" />
                        <div className="text-lg font-bold">
                          {coinStats.spent}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Coins Spent
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="coins"
                    className="flex items-center gap-2"
                  >
                    <Coins className="h-4 w-4" />
                    <span className="hidden sm:inline">Coin History</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your profile information here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProfileForm user={user} userData={userData} />

                      {isAdmin && (
                        <div className="mt-6 pt-6 border-t">
                          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Admin Actions
                          </h3>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            asChild
                          >
                            <a href="/admin">
                              <Shield className="h-4 w-4" />
                              Go to Admin Dashboard
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="coins">
                  <Card>
                    <CardHeader>
                      <CardTitle>Coin Transaction History</CardTitle>
                      <CardDescription>
                        View your recent coin transactions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CoinTransactionHistory
                        transactions={transactions || []}
                      />
                      <div className="mt-4 flex justify-end">
                        <Button asChild variant="outline">
                          <Link
                            href="/profile/transactions"
                            className="flex items-center"
                          >
                            View All Transactions
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccountSettings user={user} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
