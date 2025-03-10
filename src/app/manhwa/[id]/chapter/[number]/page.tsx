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
} from "lucide-react";
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

  // In a real app, check if this is a premium chapter and if the user has purchased it
  const isPremiumChapter =
    chapterNumber > 50 &&
    (manhwaId === "tower-of-god" || manhwaId === "omniscient-reader");
  const hasUserPurchased = false; // This would be a database check

  // If premium chapter and user hasn't purchased, redirect to purchase page
  if (isPremiumChapter && !hasUserPurchased && user) {
    // In a real app, redirect to purchase page
    // For now, we'll just show the chapter
  }

  // Generate sample chapter data
  const chapterData = {
    id: `${manhwaId}-ch-${chapterNumber}`,
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
    coinPrice: isPremiumChapter ? Math.floor(Math.random() * 3) + 3 : 0,
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

  // Update reading history if user is logged in
  if (user) {
    // In a real app, this would update the reading_history table
    // For now, we'll just log it
    console.log(
      `User ${user.id} is reading ${manhwaId} chapter ${chapterNumber}`,
    );
  }

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

          {/* Chapter Pages */}
          <div className="space-y-4">
            {pages.map((page) => (
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
