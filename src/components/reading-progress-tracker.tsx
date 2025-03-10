"use client";

import { useEffect, useState, useRef } from "react";
// Custom hook to replace react-intersection-observer
const useInView = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, inView];
};

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
  const [progress, setProgress] = useState(0);
  const lastSavedProgress = useRef(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create refs for each page to track visibility
  const pageRefs = Array.from({ length: totalPages }).map(() => {
    return useInView({
      threshold: 0.5, // Consider page viewed when 50% visible
      triggerOnce: true, // Only trigger once per page
    });
  });

  // Calculate progress based on which pages are in view
  useEffect(() => {
    const viewedPages = pageRefs.filter((ref) => ref[1]).length;
    const newProgress = Math.min(viewedPages / totalPages, 1);

    if (newProgress > progress) {
      setProgress(newProgress);
    }
  }, [pageRefs, totalPages, progress]);

  // Save progress to the database
  useEffect(() => {
    // Don't save if progress hasn't changed significantly (at least 5%)
    if (progress - lastSavedProgress.current < 0.05 && progress < 1) return;

    // Don't save for non-logged in users
    if (!userId) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a timeout to avoid too many database writes
    saveTimeoutRef.current = setTimeout(async () => {
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
            progress,
          }),
        });

        if (response.ok) {
          lastSavedProgress.current = progress;
          console.log(`Progress saved: ${Math.round(progress * 100)}%`);
        }
      } catch (error) {
        console.error("Failed to save reading progress:", error);
      }
    }, 2000); // Wait 2 seconds before saving

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [progress, userId, manhwaId, chapterId, chapterNumber]);

  // Return refs to be attached to page elements
  return {
    pageRefs,
    progress,
  };
}
