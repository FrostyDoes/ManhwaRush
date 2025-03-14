"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ReadingProgressTrackerProps {
  userId: string;
  manhwaId: string;
  chapterId: string;
  chapterNumber: number;
  totalPages: number;
}

export function ReadingProgressTracker({
  userId,
  manhwaId,
  chapterId,
  chapterNumber,
  totalPages,
}: ReadingProgressTrackerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(0);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Update progress when page changes
  useEffect(() => {
    if (!userId) return;

    // Calculate progress as a percentage (0 to 1)
    const newProgress = totalPages > 0 ? currentPage / totalPages : 0;
    setProgress(newProgress);

    // Debounce progress updates to avoid too many database writes
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    progressUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/reading-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            manhwaId,
            chapterId,
            chapterNumber,
            progress: newProgress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update reading progress",
          );
        }
      } catch (error: any) {
        console.error("Error updating reading progress:", error);
        toast({
          title: "Error",
          description: "Failed to save your reading progress",
          variant: "destructive",
        });
      }
    }, 2000); // Update after 2 seconds of no page changes

    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [
    userId,
    manhwaId,
    chapterId,
    chapterNumber,
    currentPage,
    totalPages,
    toast,
  ]);

  // Listen for scroll events to track current page
  useEffect(() => {
    const handleScroll = () => {
      // This is a simplified approach - in a real implementation, you would
      // need to determine which page is currently most visible in the viewport
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If we're at the bottom of the page, mark as complete
      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setCurrentPage(totalPages);
        return;
      }

      // Otherwise, estimate current page based on scroll position
      // This is very simplified and would need to be adapted to your actual page layout
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
      const estimatedPage = Math.max(
        1,
        Math.ceil(scrollPercentage * totalPages),
      );
      setCurrentPage(estimatedPage);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  // No visible UI - this component just tracks progress
  return null;
}
