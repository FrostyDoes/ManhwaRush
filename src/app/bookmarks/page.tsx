import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkX, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=bookmarks");
  }

  // Get user's bookmarks with manhwa details
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      id,
      created_at,
      manhwa:manhwa_id(id, title, cover_image, description, genres, rating, status, slug)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Sample data for development/preview
  const sampleBookmarks = [
    {
      id: "1",
      created_at: new Date().toISOString(),
      manhwa: {
        id: "solo-leveling",
        title: "Solo Leveling",
        cover_image:
          "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
        description:
          "When a portal connecting our world to a different dimension full of monsters opens up, some people gain the power to hunt them. These hunters possess magical abilities and are known as 'awakened'. The main character, Sung Jinwoo, is the weakest of all the hunters and barely stronger than a normal human.",
        genres: ["Action", "Fantasy", "Adventure"],
        rating: 4.8,
        status: "Ongoing",
        slug: "solo-leveling",
      },
    },
    {
      id: "2",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      manhwa: {
        id: "tower-of-god",
        title: "Tower of God",
        cover_image:
          "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
        description:
          "What do you desire? Money and wealth? Honor and pride? Authority and power? Revenge? Or something that transcends them all? Whatever you desire—it's here.",
        genres: ["Fantasy", "Adventure", "Drama"],
        rating: 4.7,
        status: "Ongoing",
        slug: "tower-of-god",
      },
    },
    {
      id: "3",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      manhwa: {
        id: "omniscient-reader",
        title: "Omniscient Reader",
        cover_image:
          "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=800&q=80",
        description:
          "Dokja was an average office worker whose sole interest was reading his favorite web novel 'Three Ways to Survive the Apocalypse.' But when the novel suddenly becomes reality, he is the only person who knows how the world will end.",
        genres: ["Action", "Drama", "Fantasy"],
        rating: 4.5,
        status: "Ongoing",
        slug: "omniscient-reader",
      },
    },
  ];

  // Use real data if available, otherwise use sample data
  const bookmarkItems = bookmarks?.length ? bookmarks : sampleBookmarks;

  // Function to remove a bookmark
  const removeBookmark = async (bookmarkId: string) => {
    // In a real app, this would delete the bookmark from the database
    // For now, we'll just show a UI that allows this action
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Bookmarks</h1>
              <p className="text-muted-foreground mt-1">
                Your saved manhwa collection
              </p>
            </div>
          </div>

          {bookmarkItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <BookmarkX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start bookmarking manhwa to build your collection
                </p>
                <Button asChild>
                  <Link href="/">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Manhwa
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarkItems.map((bookmark) => {
                // Ensure manhwa is an object and not an array
                const manhwa =
                  bookmark.manhwa && !Array.isArray(bookmark.manhwa)
                    ? bookmark.manhwa
                    : null;
                if (!manhwa) return null;

                return (
                  <Card key={bookmark.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-1/3 h-[200px] relative">
                        <Image
                          src={manhwa.cover_image}
                          alt={manhwa.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {manhwa.genres
                                ?.slice(0, 2)
                                .map((genre: string) => (
                                  <Badge
                                    key={genre}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {genre}
                                  </Badge>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold mb-1">
                              {manhwa.title}
                            </h3>

                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                              {manhwa.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <Button asChild size="sm">
                              <Link href={`/manhwa/${manhwa.slug}`}>
                                Read Now
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <BookmarkX className="h-4 w-4" />
                              <span className="sr-only">Remove Bookmark</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
