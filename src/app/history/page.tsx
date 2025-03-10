import { SiteHeader } from "@/components/site-header";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default async function ReadingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=history");
  }

  // Get user's reading history with manhwa and chapter details
  const { getUserReadingHistory } = await import("@/utils/reading-progress");
  const readingHistory = await getUserReadingHistory(user.id);

  // Sample data for development/preview
  const sampleHistory = [
    {
      id: "1",
      last_read_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      progress: 0.75,
      manhwa: {
        id: "solo-leveling",
        title: "Solo Leveling",
        cover_image:
          "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
        slug: "solo-leveling",
      },
      chapter: {
        id: "sl-ch-45",
        number: 45,
        title: "The Power of the Shadow Monarch",
      },
    },
    {
      id: "2",
      last_read_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      progress: 1.0,
      manhwa: {
        id: "tower-of-god",
        title: "Tower of God",
        cover_image:
          "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
        slug: "tower-of-god",
      },
      chapter: {
        id: "tog-ch-32",
        number: 32,
        title: "The 20th Floor Test",
      },
    },
    {
      id: "3",
      last_read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      progress: 0.4,
      manhwa: {
        id: "omniscient-reader",
        title: "Omniscient Reader",
        cover_image:
          "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=800&q=80",
        slug: "omniscient-reader",
      },
      chapter: {
        id: "or-ch-18",
        number: 18,
        title: "The Disaster of Floods",
      },
    },
  ];

  // Use real data if available, otherwise use sample data
  const historyItems = readingHistory?.length ? readingHistory : sampleHistory;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Reading History</h1>
              <p className="text-muted-foreground mt-1">
                Continue where you left off
              </p>
            </div>
          </div>

          {historyItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No reading history yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start reading manhwa to see your history here
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
            <div className="space-y-6">
              {historyItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/4 md:w-1/5 h-[180px] sm:h-auto relative">
                      <Image
                        src={item.manhwa.cover_image}
                        alt={item.manhwa.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {item.manhwa.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Chapter {item.chapter.number}: {item.chapter.title}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.last_read_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${item.progress * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {Math.round(item.progress * 100)}% complete
                          </span>
                          {item.progress === 1 ? (
                            <span className="text-xs text-green-500 font-medium">
                              Completed
                            </span>
                          ) : (
                            <span className="text-xs text-amber-500 font-medium">
                              In progress
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button asChild>
                          <Link
                            href={`/manhwa/${item.manhwa.slug}/chapter/${item.chapter.number}`}
                          >
                            {item.progress < 1
                              ? "Continue Reading"
                              : "Read Again"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/manhwa/${item.manhwa.slug}`}>
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
