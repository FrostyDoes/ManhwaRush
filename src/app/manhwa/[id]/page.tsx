"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Clock, Coins, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ChapterData {
  id: string;
  number: number;
  title: string;
  created_at: string;
  is_free: boolean;
  coin_price: number;
  is_premium: boolean;
}

interface ManhwaDetailPageProps {
  params: { id: string };
}

export default function ManhwaDetailPage({ params }: ManhwaDetailPageProps) {
  const [manhwaData, setManhwaData] = useState<any>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [newChapters, setNewChapters] = useState<Set<string>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch manhwa details and chapters
  useEffect(() => {
    const fetchManhwaDetails = async () => {
      setIsLoading(true);
      try {
        // Create Supabase client
        const { createClient } = await import("../../../../supabase/client");
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Fetch manhwa details
        const { data: manhwaDetails, error: manhwaError } = await supabase
          .from("manhwa")
          .select("*")
          .eq("id", params.id)
          .single();

        if (manhwaError) throw manhwaError;
        setManhwaData(manhwaDetails);

        // Fetch chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from("chapters")
          .select("*")
          .eq("manhwa_id", params.id)
          .order("number", { ascending: false });

        if (chaptersError) throw chaptersError;
        setChapters(chaptersData || []);

        // Fetch new chapters (less than 3 days old)
        const response = await fetch(`/api/chapters/new?manhwaId=${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch new chapters");
        const { newChapters: newChaptersData } = await response.json();

        // Create a set of new chapter IDs
        const newChapterIds = new Set<string>();
        newChaptersData.forEach((chapter: any) =>
          newChapterIds.add(chapter.id),
        );
        setNewChapters(newChapterIds);

        // Check if user has bookmarked this manhwa
        if (user) {
          const { data: bookmark } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("user_id", user.id)
            .eq("manhwa_id", params.id)
            .maybeSingle();

          setIsBookmarked(!!bookmark);
        }
      } catch (error: any) {
        console.error("Error fetching manhwa details:", error);
        toast({
          title: "Error",
          description: "Failed to load manhwa details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchManhwaDetails();

    // Set up real-time subscription for chapters
    const setupRealtimeSubscription = async () => {
      try {
        const { createClient } = await import("../../../../supabase/client");
        const supabase = createClient();

        const channel = supabase
          .channel("chapters-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "chapters",
              filter: `manhwa_id=eq.${params.id}`,
            },
            () => {
              // Refresh chapters when changes occur
              fetchManhwaDetails();
            },
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
      unsubscribe.then((unsub) => unsub());
    };
  }, [params.id, toast]);

  if (isLoading || !manhwaData) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Loading manhwa details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Banner Image with Gradient Overlay */}
      <div className="relative h-[300px] md:h-[400px] w-full">
        <Image
          src={
            manhwaData.banner_image ||
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80"
          }
          alt={manhwaData.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <main className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Manhwa Info Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Cover Image */}
            <div className="w-[200px] h-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg border border-border">
              <Image
                src={
                  manhwaData.cover_image ||
                  "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=800&q=80"
                }
                alt={manhwaData.title}
                width={200}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {manhwaData.genres?.split(",").map((genre: string) => (
                  <Badge key={genre.trim()} variant="secondary">
                    {genre.trim()}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {manhwaData.title}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">
                    {(manhwaData.rating || 4.0).toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {manhwaData.status || "Ongoing"}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {manhwaData.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Author
                  </h3>
                  <p>{manhwaData.author || "Unknown"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Artist
                  </h3>
                  <p>{manhwaData.artist || "Unknown"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Release
                  </h3>
                  <p>{new Date(manhwaData.created_at).getFullYear()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Chapters
                  </h3>
                  <p>{chapters.length}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {chapters.length > 0 && (
                  <Button asChild>
                    <Link
                      href={`/manhwa/${params.id}/chapter/${chapters[chapters.length - 1].number}`}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Reading
                    </Link>
                  </Button>
                )}

                <BookmarkButton
                  manhwaId={params.id}
                  userId={user?.id || ""}
                  initialIsBookmarked={isBookmarked}
                  variant={isBookmarked ? "default" : "outline"}
                />
              </div>
            </div>
          </div>

          {/* Chapters Section */}
          <div className="mt-12">
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger
                  value="chapters"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Chapters</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>About</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">All Chapters</h2>
                      <div className="text-sm text-muted-foreground">
                        {chapters.length} chapters available
                      </div>
                    </div>

                    <div className="space-y-1">
                      {chapters.map((chapter) => (
                        <motion.div
                          key={chapter.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors"
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex-1">
                            <Link
                              href={`/manhwa/${params.id}/chapter/${chapter.number}`}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">
                                {chapter.title || `Chapter ${chapter.number}`}
                              </span>

                              {/* New chapter badge */}
                              {newChapters.has(chapter.id) && (
                                <Badge className="bg-[#E63946] hover:bg-[#E63946]/90 text-white rounded-full px-2 py-1 text-xs">
                                  NEW
                                </Badge>
                              )}

                              {/* Free badge */}
                              {chapter.is_free && (
                                <Badge className="bg-green-500 hover:bg-green-500/90 text-white rounded-full px-2 py-1 text-xs ml-1">
                                  FREE
                                </Badge>
                              )}

                              {/* Coin price badge */}
                              {!chapter.is_free && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 flex items-center gap-1"
                                >
                                  <Coins className="h-3 w-3 text-yellow-400" />
                                  <span>{chapter.coin_price}</span>
                                </Badge>
                              )}
                            </Link>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(chapter.created_at)}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="bg-[#457B9D] text-white hover:bg-[#457B9D]/90"
                          >
                            <Link
                              href={`/manhwa/${params.id}/chapter/${chapter.number}`}
                            >
                              Read
                            </Link>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                      About {manhwaData.title}
                    </h2>
                    <p className="mb-4">{manhwaData.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Details</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Author
                            </span>
                            <span>{manhwaData.author || "Unknown"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Artist
                            </span>
                            <span>{manhwaData.artist || "Unknown"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Release Year
                            </span>
                            <span>
                              {new Date(manhwaData.created_at).getFullYear()}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span>{manhwaData.status || "Ongoing"}</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {manhwaData.genres
                            ?.split(",")
                            .map((genre: string) => (
                              <Badge key={genre.trim()} variant="secondary">
                                {genre.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
