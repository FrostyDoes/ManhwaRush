import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../../../supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  Bookmark,
  Share,
  Home,
  Lock,
  Coins,
} from "lucide-react";
import { PurchaseChapterDialog } from "@/components/purchase-chapter-dialog";
import { ChapterPageContent } from "@/components/chapter-page-content";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function ChapterPage({
  params,
}: {
  params: { id: string; number: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chapterNumber = parseInt(params.number);
  const manhwaId = params.id;

  // Check if this is a premium chapter
  const isPremiumChapter =
    chapterNumber > 50 &&
    (manhwaId === "tower-of-god" || manhwaId === "omniscient-reader");

  // Calculate coin price for premium chapters
  const coinPrice = isPremiumChapter ? Math.floor(Math.random() * 3) + 3 : 0; // 3-5 coins for premium

  // Get chapter ID
  const chapterId = `${manhwaId}-ch-${chapterNumber}`;

  // Check if user has purchased this chapter
  let hasUserPurchased = false;
  let userCoins = 0;
  let hasSubscription = false;

  if (user && isPremiumChapter) {
    // Import and use the utility function
    const { hasUserPurchasedChapter } = await import(
      "@/utils/chapter-purchases"
    );
    hasUserPurchased = await hasUserPurchasedChapter(user.id, chapterId);

    // Get user's coin balance
    const { data: userData } = await supabase
      .from("users")
      .select("coins")
      .eq("id", user.id)
      .single();

    userCoins = userData?.coins || 0;

    // Check if user has an active subscription that grants access to premium content
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    hasSubscription = !!subscriptionData;
  }

  // Get user's reading progress if logged in
  let userProgress = 0;
  if (user) {
    const { getReadingProgress } = await import("@/utils/reading-progress");
    const progressData = await getReadingProgress(user.id, chapterId);
    if (progressData) {
      userProgress = progressData.progress;
    }
  }

  // Determine if user can access the full chapter
  const canAccessFullChapter =
    !isPremiumChapter || hasUserPurchased || hasSubscription;

  // Generate sample chapter data
  const chapterData = {
    id: chapterId,
    number: chapterNumber,
    title: `Chapter ${chapterNumber}`,
    manhwaTitle:
      manhwaId === "solo-leveling"
        ? "Solo Leveling"
        : manhwaId === "tower-of-god"
          ? "Tower of God"
          : manhwaId === "omniscient-reader"
            ? "Omniscient Reader"
            : "Unknown Manhwa",
    releaseDate: new Date(
      Date.now() - chapterNumber * 86400000 * 3,
    ).toISOString(),
    isPremium: isPremiumChapter,
    coinPrice: coinPrice,
    hasUserPurchased: hasUserPurchased,
  };

  // Generate sample pages for the chapter
  const generatePages = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      // Use different placeholder images for variety
      const imageIndex = (i % 5) + 1;
      let imageUrl;

      switch (imageIndex) {
        case 1:
          imageUrl =
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=80";
          break;
        case 2:
          imageUrl =
            "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=1000&q=80";
          break;
        case 3:
          imageUrl =
            "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=1000&q=80";
          break;
        case 4:
          imageUrl =
            "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1000&q=80";
          break;
        case 5:
          imageUrl =
            "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=1000&q=80";
          break;
        default:
          imageUrl =
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=80";
      }

      return {
        id: `${chapterData.id}-page-${i + 1}`,
        number: i + 1,
        imageUrl,
      };
    });
  };

  const pages = generatePages(15); // Average 15 pages per chapter

  // Format release date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate prev/next chapter numbers
  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter = chapterNumber < 200 ? chapterNumber + 1 : null; // Assuming max 200 chapters

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Chapter Navigation Bar */}
      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/manhwa/${manhwaId}`}>
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm font-medium">
                <Link href={`/manhwa/${manhwaId}`} className="hover:underline">
                  {chapterData.manhwaTitle}
                </Link>
                <span className="mx-2">›</span>
                <span>{chapterData.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={!prevChapter}
                asChild={!!prevChapter}
              >
                {prevChapter ? (
                  <Link href={`/manhwa/${manhwaId}/chapter/${prevChapter}`}>
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={!nextChapter}
                asChild={!!nextChapter}
              >
                {nextChapter ? (
                  <Link href={`/manhwa/${manhwaId}/chapter/${nextChapter}`}>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Chapter Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{chapterData.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(chapterData.releaseDate)}
            </p>
          </div>

          {/* Reading Progress Bar */}
          {user && canAccessFullChapter && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Reading Progress</span>
                <span>{Math.round(userProgress * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${userProgress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Chapter Pages */}
          {!canAccessFullChapter ? (
            <div className="space-y-6 py-8">
              {/* Preview first 3 pages */}
              <div className="space-y-4">
                {pages.slice(0, 3).map((page) => (
                  <div key={page.id} className="w-full">
                    <Image
                      src={page.imageUrl}
                      alt={`Page ${page.number}`}
                      width={1000}
                      height={1500}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                ))}
              </div>

              {/* Blur overlay with purchase prompt */}
              <div className="relative mt-8 mb-12">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
                <div className="relative">
                  <Image
                    src={pages[3]?.imageUrl}
                    alt="Preview"
                    width={1000}
                    height={1500}
                    className="w-full h-auto rounded-md blur-sm opacity-50"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className="bg-card p-6 rounded-lg shadow-lg border max-w-md w-full text-center">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">Premium Chapter</h3>
                    <p className="text-muted-foreground mb-6">
                      This is a premium chapter. Purchase it to continue
                      reading.
                    </p>

                    {user ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2 text-lg font-bold">
                          <Coins className="h-5 w-5 text-yellow-400" />
                          <span>{coinPrice} coins</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <PurchaseChapterDialog
                            manhwaId={manhwaId}
                            chapterId={chapterId}
                            chapterNumber={chapterNumber}
                            chapterTitle={chapterData.title}
                            coinPrice={coinPrice}
                            userCoins={userCoins}
                          >
                            <Button className="w-full">
                              <Coins className="mr-2 h-4 w-4" />
                              Purchase Chapter
                            </Button>
                          </PurchaseChapterDialog>

                          <Button variant="outline" asChild>
                            <Link href="/pricing">
                              Subscribe for Unlimited Access
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                          <Link
                            href={`/sign-in?redirect=/manhwa/${manhwaId}/chapter/${chapterNumber}`}
                          >
                            Sign in to Purchase
                          </Link>
                        </Button>

                        <Button variant="outline" asChild>
                          <Link href="/pricing">View Subscription Plans</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChapterPageContent
              pages={pages}
              userId={user?.id}
              manhwaId={manhwaId}
              chapterId={chapterId}
              chapterNumber={chapterNumber}
            />
          )}

          {/* Chapter Navigation */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <Button
              variant="outline"
              disabled={!prevChapter}
              asChild={!!prevChapter}
            >
              {prevChapter ? (
                <Link href={`/manhwa/${manhwaId}/chapter/${prevChapter}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Chapter
                </Link>
              ) : (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Chapter
                </>
              )}
            </Button>

            <Button
              variant="outline"
              disabled={!nextChapter}
              asChild={!!nextChapter}
            >
              {nextChapter ? (
                <Link href={`/manhwa/${manhwaId}/chapter/${nextChapter}`}>
                  Next Chapter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <>
                  Next Chapter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
