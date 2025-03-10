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
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile-form";
import { CoinHistory } from "@/components/coin-history";
import { AccountSettings } from "@/components/account-settings";
import { Coins, User, Settings } from "lucide-react";

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

  // Get user's coin transactions
  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

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
              <CardContent>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Coin Balance</span>
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="font-bold">{userData?.coins || 0}</span>
                  </div>
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
                      <CoinHistory transactions={transactions || []} />
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
