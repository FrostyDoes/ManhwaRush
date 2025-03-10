import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../../supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  Coins,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ManhwaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch manhwa details
  // In a real app, this would come from the database
  // For now, we'll use sample data based on the ID

  // Sample data for development/preview
  const manhwaData = {
    id: params.id,
    title:
      params.id === "solo-leveling"
        ? "Solo Leveling"
        : params.id === "tower-of-god"
          ? "Tower of God"
          : params.id === "omniscient-reader"
            ? "Omniscient Reader"
            : "Unknown Manhwa",
    description:
      params.id === "solo-leveling"
        ? "When a portal connecting our world to a different dimension full of monsters opens up, some people gain the power to hunt them. These hunters possess magical abilities and are known as 'awakened'. The main character, Sung Jinwoo, is the weakest of all the hunters and barely stronger than a normal human."
        : params.id === "tower-of-god"
          ? "What do you desire? Money and wealth? Honor and pride? Authority and power? Revenge? Or something that transcends them all? Whatever you desire—it's here."
          : params.id === "omniscient-reader"
            ? "Dokja was an average office worker whose sole interest was reading his favorite web novel 'Three Ways to Survive the Apocalypse.' But when the novel suddenly becomes reality, he is the only person who knows how the world will end."
            : "A captivating manhwa series with stunning artwork and an engaging storyline.",
    coverImage:
      params.id === "solo-leveling"
        ? "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80"
        : params.id === "tower-of-god"
          ? "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80"
          : params.id === "omniscient-reader"
            ? "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=800&q=80"
            : "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=800&q=80",
    bannerImage:
      params.id === "solo-leveling"
        ? "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=1920&q=80"
        : params.id === "tower-of-god"
          ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80"
          : params.id === "omniscient-reader"
            ? "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=1920&q=80"
            : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
    genres:
      params.id === "solo-leveling"
        ? ["Action", "Fantasy", "Adventure"]
        : params.id === "tower-of-god"
          ? ["Fantasy", "Adventure", "Drama"]
          : params.id === "omniscient-reader"
            ? ["Action", "Drama", "Fantasy"]
            : ["Action", "Fantasy"],
    rating:
      params.id === "solo-leveling"
        ? 4.8
        : params.id === "tower-of-god"
          ? 4.7
          : params.id === "omniscient-reader"
            ? 4.5
            : 4.2,
    status: "Ongoing",
    author:
      params.id === "solo-leveling"
        ? "Chugong"
        : params.id === "tower-of-god"
          ? "SIU"
          : params.id === "omniscient-reader"
            ? "Sing Shong"
            : "Unknown",
    artist:
      params.id === "solo-leveling"
        ? "DUBU"
        : params.id === "tower-of-god"
          ? "SIU"
          : params.id === "omniscient-reader"
            ? "Sleepy-C"
            : "Unknown",
    releaseYear:
      params.id === "solo-leveling"
        ? 2018
        : params.id === "tower-of-god"
          ? 2010
          : params.id === "omniscient-reader"
            ? 2020
            : 2022,
    isBookmarked: false,
  };

  // Generate sample chapters
  const generateChapters = (count: number, hasPremium: boolean = false) => {
    return Array.from({ length: count }, (_, i) => {
      const chapterNum = i + 1;
      const isPremium = hasPremium && chapterNum > Math.floor(count * 0.3); // Make later chapters premium
      return {
        id: `${params.id}-ch-${chapterNum}`,
        number: chapterNum,
        title: `Chapter ${chapterNum}`,
        releaseDate: new Date(
          Date.now() - (count - i) * 86400000 * 3,
        ).toISOString(), // Every 3 days
        isPremium,
        coinPrice: isPremium ? Math.floor(Math.random() * 3) + 3 : 0, // 3-5 coins for premium
      };
    }).reverse(); // Most recent first
  };

  const chapters = generateChapters(
    params.id === "solo-leveling"
      ? 180
      : params.id === "tower-of-god"
        ? 550
        : params.id === "omniscient-reader"
          ? 120
          : 50,
    params.id === "tower-of-god" || params.id === "omniscient-reader", // These have premium chapters
  );

  // Check if user has bookmarked this manhwa
  let isBookmarked = false;
  if (user) {
    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("manhwa_id", params.id)
      .maybeSingle();

    isBookmarked = !!bookmark;
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Banner Image with Gradient Overlay */}
      <div className="relative h-[300px] md:h-[400px] w-full">
        <Image
          src={manhwaData.bannerImage}
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
                src={manhwaData.coverImage}
                alt={manhwaData.title}
                width={200}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {manhwaData.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
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
                    {manhwaData.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {manhwaData.status}
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
                  <p>{manhwaData.author}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Artist
                  </h3>
                  <p>{manhwaData.artist}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Release
                  </h3>
                  <p>{manhwaData.releaseYear}</p>
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

                {user ? (
                  <Button variant={isBookmarked ? "default" : "outline"}>
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="mr-2 h-4 w-4" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Add to Bookmarks
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/sign-in?redirect=manhwa/${params.id}">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Sign in to Bookmark
                    </Link>
                  </Button>
                )}
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
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors"
                        >
                          <div className="flex-1">
                            <Link
                              href={`/manhwa/${params.id}/chapter/${chapter.number}`}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">
                                {chapter.title}
                              </span>
                              {chapter.isPremium && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 flex items-center gap-1"
                                >
                                  <Coins className="h-3 w-3 text-yellow-400" />
                                  <span>{chapter.coinPrice}</span>
                                </Badge>
                              )}
                            </Link>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(chapter.releaseDate)}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link
                              href={`/manhwa/${params.id}/chapter/${chapter.number}`}
                            >
                              Read
                            </Link>
                          </Button>
                        </div>
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
                            <span>{manhwaData.author}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Artist
                            </span>
                            <span>{manhwaData.artist}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Release Year
                            </span>
                            <span>{manhwaData.releaseYear}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span>{manhwaData.status}</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {manhwaData.genres.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
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
