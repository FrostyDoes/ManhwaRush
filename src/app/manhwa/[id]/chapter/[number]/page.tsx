"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Lock,
  Coins,
  Loader2,
} from "lucide-react";
import { PurchaseChapterDialog } from "@/components/purchase-chapter-dialog";
import { ChapterPageContent } from "@/components/chapter-page-content";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface ChapterPageProps {
  params: { id: string; number: string };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const [chapterData, setChapterData] = useState<any>(null);
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userCoins, setUserCoins] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const chapterNumber = parseInt(params.number);
  const manhwaId = params.id;

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        id: `${manhwaId}-ch-${chapterNumber}-page-${i + 1}`,
        number: i + 1,
        imageUrl,
      };
    });
  };

  // Fetch chapter details and access status
  useEffect(() => {
    const fetchChapterDetails = async () => {
      setIsLoading(true);
      try {
        // Create Supabase client
        const { createClient } = await import("../../../../../../supabase/client");
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          router.push(`/sign-in?redirect=/manhwa/${manhwaId}/chapter/${chapterNumber}`);
          return;
        }

        // Get user's coin balance
        const { data: userData } = await supabase
          .from("users")
          .select("coins")
          .eq("id", user.id)
          .single();

        setUserCoins(userData?.coins || 0);

        // Fetch chapter details
        const chapterResponse = await fetch(`/api/chapters/coin-access?manhwaId=${manhwaId}&chapterNumber=${chapterNumber}`);
        if (!chapterResponse.ok) throw new Error("Failed to fetch chapter details");
        const chapterDetails = await chapterResponse.json();
        setChapterData(chapterDetails);

        // Fetch access status
        const accessResponse = await fetch(`/api/chapters/purchase-status?chapterId=${chapterDetails.id}`);
        if (!accessResponse.ok) throw new Error("Failed to check access status");
        const accessData = await accessResponse.json();
        setAccessStatus(accessData);

        // Get user's reading progress
        const progressResponse = await fetch(`/api/reading-progress?chapterId=${chapterDetails.id}`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setUserProgress(progressData.progress || 0);
        }

        // Generate pages
        setPages(generatePages(15)); // Average 15 pages per chapter

        // Show toast for free chapters
        if (chapterDetails.isFree) {
          toast({
            title: "Free Chapter",
            description: "Enjoy this free chapter!",
            duration: 3000,
          });
        }
      } catch (error: any) {
        console.error("Error fetching chapter details:", error);
        toast({
          title: "Error",
          description: "Failed to load chapter details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterDetails();

    // Set up real-time subscription for purchase status
    const setupRealtimeSubscription = async () => {
      try {
        const { createClient } = await import("../../../../../../supabase/client");
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return () => {};

        const channel = supabase
          .channel("purchase-status-changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "user_chapter_purchases",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              // Refresh access status when purchase is made
              if (chapterData?.id) {
                fetch(`/api/chapters/purchase-status?chapterId=${chapterData.id}`)
                  .then(res => res.json())
                  .then(data => setAccessStatus(data))
                  .catch(err => console.error("Error refreshing access status:", err));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        return () => {};
      }
    };

    const unsubscribe = setupRealtimeSubscription();
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, [manhwaId, chapterNumber, router, toast]);

  // Calculate prev/next chapter numbers
  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter = chapterNumber < 200 ? chapterNumber + 1 : null; // Assuming max 200 chapters

  // Determine if user can access the full chapter
  const canAccessFullChapter = accessStatus?.hasAccess || accessStatus?.isFree;

  if (isLoading || !chapterData) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Loading chapter...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  {chapterData.title ? chapterData.title.split(":")[0] : "Manhwa"}
                </Link>
                <span className="mx-2">›</span>
                <span>Chapter {chapterNumber}</span>
                
                {/* Access badges */}
                <div className="inline-flex ml-2">
                  {accessStatus?.isFree && (
                    <Badge 
                      className="bg-green-500 hover:bg-green-500/90 text-white rounded-full px-2 py-0.5 text-xs"
                    >
                      FREE
                    </Badge>
                  )}
                  {!accessStatus?.isFree && !accessStatus?.hasAccess && (
                    <Badge 
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Coins className="h-3 w-3 text-yellow-400" />
                      <span>{chapterData.coinPrice}</span>
                    </Badge>
                  )}
                </div>
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
            <h1 className="text-2xl font-bold mb-2">
              Chapter {chapterNumber}{chapterData.title ? `: ${chapterData.title}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(chapterData.createdAt)}
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
              <ChapterPageContent
                pages={pages}
                manhwaId={manhwaId}
                chapterId={chapterData.id}
                chapterNumber={chapterNumber}
                isPreview={true}
                previewPageCount={3}
              />

              {/* Purchase prompt */}
              <div className="relative mt-8 mb-12">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className="bg-card p-6 rounded-lg shadow-lg border max-w-md w-full text-center">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">Premium Chapter</h3>
                    <p className="text-muted-foreground mb-6
