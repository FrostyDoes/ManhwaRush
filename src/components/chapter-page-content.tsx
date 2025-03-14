"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { ReadingProgressTracker } from "@/components/reading-progress-tracker";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Page {
  id: string;
  number: number;
  imageUrl: string;
}

interface ChapterPageContentProps {
  pages: Page[];
  userId?: string;
  manhwaId: string;
  chapterId: string;
  chapterNumber: number;
  isPreview?: boolean;
  previewPageCount?: number;
}

export function ChapterPageContent({
  pages,
  userId,
  manhwaId,
  chapterId,
  chapterNumber,
  isPreview = false,
  previewPageCount = 3,
}: ChapterPageContentProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Track which pages have been viewed
  const viewedPages = useRef(new Set<number>());
  const totalPages = pages.length;
  const lastProgressUpdate = useRef(0);

  // Display only preview pages if in preview mode
  const displayPages = isPreview ? pages.slice(0, previewPageCount) : pages;

  useEffect(() => {
    // Reset loaded images when pages change
    setLoadedImages(new Set());
    setIsLoading(true);

    // Show toast for preview mode
    if (isPreview) {
      toast({
        title: "Preview Mode",
        description: "Purchase this chapter to read the full content",
        duration: 5000,
      });
    }
  }, [pages, isPreview, toast]);

  const handleImageLoad = (pageNumber: number) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(pageNumber);

      // If all visible pages are loaded, set loading to false
      if (newSet.size === displayPages.length) {
        setIsLoading(false);
      }

      return newSet;
    });
  };

  // Function to update reading progress
  const updateProgress = async (progress: number) => {
    if (!userId || isPreview) return;

    // Only update if progress has changed by at least 5% or reached 100%
    const progressPercentage = Math.round(progress * 100);
    if (
      progressPercentage <= lastProgressUpdate.current + 5 &&
      progressPercentage < 100
    ) {
      return;
    }

    lastProgressUpdate.current = progressPercentage;

    try {
      await fetch("/api/reading-progress", {
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
    } catch (error) {
      console.error("Failed to update reading progress:", error);
    }
  };

  // Create a page observer for each page
  const PageObserver = ({
    pageNumber,
    children,
  }: {
    pageNumber: number;
    children: React.ReactNode;
  }) => {
    const [ref, inView] = useInView({
      threshold: 0.5, // Consider page viewed when 50% visible
      triggerOnce: false, // Keep tracking as user scrolls
    });

    // When page comes into view, mark it as viewed
    useEffect(() => {
      if (inView && !viewedPages.current.has(pageNumber) && !isPreview) {
        viewedPages.current.add(pageNumber);
        const progress = viewedPages.current.size / totalPages;
        updateProgress(progress);
      }
    }, [inView, pageNumber]);

    return <div ref={ref}>{children}</div>;
  };

  // Mark chapter as complete when user reaches the last page
  const LastPageObserver = ({ children }: { children: React.ReactNode }) => {
    const [ref, inView] = useInView({
      threshold: 0.8, // Trigger when 80% of last page is visible
      triggerOnce: false,
    });

    useEffect(() => {
      if (inView && !isPreview) {
        updateProgress(1.0); // 100% complete
      }
    }, [inView]);

    return <div ref={ref}>{children}</div>;
  };

  return (
    <div className="relative">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-2 bg-card p-6 rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading chapter...</p>
          </div>
        </div>
      )}

      {/* Chapter pages */}
      <div className="space-y-4">
        {displayPages.map((page, index) => {
          const isLastPage = index === displayPages.length - 1;

          const pageContent = (
            <Image
              src={page.imageUrl}
              alt={`Page ${page.number}`}
              width={1000}
              height={1500}
              className="w-full h-auto rounded-md"
              priority={index < 3} // Prioritize loading first 3 pages
              onLoad={() => handleImageLoad(page.number)}
            />
          );

          return (
            <div key={page.id} className="w-full">
              {isLastPage ? (
                <LastPageObserver>{pageContent}</LastPageObserver>
              ) : (
                <PageObserver pageNumber={page.number}>
                  {pageContent}
                </PageObserver>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview overlay */}
      {isPreview && (
        <div className="mt-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <div className="relative h-[200px]"></div>
        </div>
      )}

      {/* Reading progress tracker (only for full chapter view) */}
      {userId && !isPreview && (
        <ReadingProgressTracker
          userId={userId}
          manhwaId={manhwaId}
          chapterId={chapterId}
          chapterNumber={chapterNumber}
          totalPages={pages.length}
        />
      )}
    </div>
  );
}
