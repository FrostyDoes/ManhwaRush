import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { CoinDisplay } from "@/components/coin-display";
import { UserNav } from "@/components/user-nav";
import { createClient } from "../../supabase/server";
import { isUserAdmin } from "@/utils/admin";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's coin balance if logged in
  let coinBalance = 0;
  let isAdmin = false;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    coinBalance = userData?.coins || 0;

    // Check if user is admin
    isAdmin = await isUserAdmin(user.id);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          {user && <CoinDisplay coinBalance={coinBalance} userId={user.id} />}
          <ThemeToggle />
          {user ? (
            <UserNav user={user} isAdmin={isAdmin} />
          ) : (
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
