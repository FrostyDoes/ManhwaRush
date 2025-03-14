"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, ArrowRight, Loader2 } from "lucide-react";

interface ReadingHistoryItem {
  id: string;
  last_read_at: string;
  progress: number;
  manhwa: {
    id: string;
    title: string;
    cover_image: string;
    slug: string;
  };
  chapter: {
    id: string;
    number: number;
    title: string;
  };
}

interface ReadingHistoryClientProps {
  userId: string;
  initialHistory: ReadingHistoryItem[];
}

export function ReadingHistoryClient({
  userId,
  initialHistory,
}: ReadingHistoryClientProps) {
  const [historyItems, setHistoryItems] =
    useState<ReadingHistoryItem[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/history");
        if (!response.ok) {
          throw new Error("Failed to fetch reading history");
        }
        const data = await response.json();
        setHistoryItems(data.history || []);
      } catch (error: any) {
        console.error("Error fetching reading history:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load reading history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initial data
    if (initialHistory.length === 0) {
      fetchHistory();
    }

    // Set up real-time subscription for reading history updates
    const setupRealtimeSubscription = async () => {
      try {
        const { createClient } = await import("../../supabase/client");
        const supabase = createClient();

        const channel = supabase
          .channel("reading-history-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "reading_history",
              filter: `user_id=eq.${userId}`,
            },
            async (payload) => {
              // Refresh the entire history when changes occur
              fetchHistory();
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
  }, [userId, toast, initialHistory.length]);

  if (isLoading && historyItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No reading history yet</h3>
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
    );
  }

  return (
    <div className="space-y-6">
      {historyItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden">
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
                    <h3 className="text-xl font-bold">{item.manhwa.title}</h3>
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
                      {item.progress < 1 ? "Continue Reading" : "Read Again"}
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
        </motion.div>
      ))}
    </div>
  );
}
