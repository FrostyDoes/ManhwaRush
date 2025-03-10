import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "@/components/ui/button";
import { MainNav, MobileNav } from "@/components/main-nav";
import { Search } from "@/components/search";
import { CoinDisplay } from "@/components/coin-display";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
// Admin check function
async function isUserAdmin(userData: any): Promise<boolean> {
  return userData?.role === "admin";
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's coin balance and admin status if logged in
  let coinBalance = 0;
  let isAdmin = false;
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("coins, role")
      .eq("id", user.id)
      .single();

    coinBalance = userData?.coins || 0;
    isAdmin = userData?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              ManhwaRush
            </span>
          </Link>
          <MainNav className="hidden lg:flex" />
        </div>

        <div className="hidden md:flex md:flex-1 md:justify-center px-4">
          <Search />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <CoinDisplay
                coinBalance={coinBalance}
                className="hidden sm:flex"
              />
              <UserNav user={user} isAdmin={isAdmin} />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
