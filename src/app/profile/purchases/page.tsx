import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { getUserPurchaseHistory } from "@/utils/chapter-purchases";

export default async function PurchasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=profile/purchases");
  }

  // Get user's purchase history
  const purchaseHistory = await getUserPurchaseHistory(user.id);

  // Sample data for development/preview
  const samplePurchases = [
    {
      id: "1",
      chapter_id: "tower-of-god-ch-100",
      coins_spent: 5,
      purchased_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      manhwa: {
        id: "tower-of-god",
        title: "Tower of God",
        cover_image:
          "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
        slug: "tower-of-god",
      },
      chapter: {
        id: "tog-ch-100",
        number: 100,
        title: "The 100th Floor",
      },
    },
    {
      id: "2",
      chapter_id: "omniscient-reader-ch-75",
      coins_spent: 3,
      purchased_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      manhwa: {
        id: "omniscient-reader",
        title: "Omniscient Reader",
        cover_image:
          "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=800&q=80",
        slug: "omniscient-reader",
      },
      chapter: {
        id: "or-ch-75",
        number: 75,
        title: "The Disaster of Floods",
      },
    },
  ];

  // Use real data if available, otherwise use sample data
  const purchases = purchaseHistory.length ? purchaseHistory : samplePurchases;

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Purchases</h1>
              <p className="text-muted-foreground mt-1">
                Your premium chapter purchases
              </p>
            </div>
          </div>

          {purchases.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't purchased any premium chapters yet
                </p>
                <Button asChild>
                  <Link href="/">
                    <Coins className="mr-2 h-4 w-4" />
                    Browse Premium Content
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/4 md:w-1/5 h-[180px] sm:h-auto relative">
                      <Image
                        src={
                          purchase.manhwa?.cover_image ||
                          "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=800&q=80"
                        }
                        alt={purchase.manhwa?.title || "Manhwa"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {purchase.manhwa?.title || "Unknown Manhwa"}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Chapter {purchase.chapter?.number || "Unknown"}:{" "}
                            {purchase.chapter?.title || ""}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">
                              {purchase.coins_spent} coins
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(purchase.purchased_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button asChild>
                          <Link
                            href={`/manhwa/${purchase.manhwa?.slug || purchase.manhwa?.id}/chapter/${purchase.chapter?.number}`}
                          >
                            Read Chapter
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link
                            href={`/manhwa/${purchase.manhwa?.slug || purchase.manhwa?.id}`}
                          >
                            View Series
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
