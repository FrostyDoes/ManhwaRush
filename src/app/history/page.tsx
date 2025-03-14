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
import { ReadingHistoryClient } from "@/components/reading-history-client";

export default async function ReadingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=history");
  }

  // Get initial reading history for server-side rendering
  const { data: readingHistory } = await supabase
    .from("reading_history")
    .select(
      `
      id,
      progress,
      last_read_at,
      manhwa:manhwa_id(id, title, cover_image, slug),
      chapter:chapter_id(id, number, title)
    `,
    )
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false });

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

          <ReadingHistoryClient
            userId={user.id}
            initialHistory={readingHistory || []}
          />
        </div>
      </main>
    </div>
  );
}
