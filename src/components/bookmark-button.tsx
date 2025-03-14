"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { createClient } from "../../supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  manhwaId: string;
  userId: string;
  initialIsBookmarked?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({
  manhwaId,
  userId,
  initialIsBookmarked = false,
  variant = "outline",
  size = "default",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if the manhwa is already bookmarked when component mounts
    const checkBookmarkStatus = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", userId)
          .eq("manhwa_id", manhwaId)
          .maybeSingle();

        if (error) throw error;
        setIsBookmarked(!!data);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };

    checkBookmarkStatus();
  }, [manhwaId, userId, supabase]);

  const toggleBookmark = async () => {
    if (!userId) {
      // Redirect to sign in if not logged in
      router.push(`/sign-in?redirect=manhwa/${manhwaId}`);
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("manhwa_id", manhwaId);

        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Manhwa removed from your bookmarks",
        });
      } else {
        // Add bookmark
        const { error } = await supabase.from("bookmarks").insert({
          user_id: userId,
          manhwa_id: manhwaId,
        });

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Bookmark added",
          description: "Manhwa added to your bookmarks",
        });
      }

      // Refresh the page to update UI
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleBookmark}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          <span>Bookmarked</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span>Bookmark</span>
        </>
      )}
    </Button>
  );
}
