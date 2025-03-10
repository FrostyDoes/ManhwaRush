"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
// Import IntersectionObserver polyfill if needed
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

interface ChapterPageContentProps {
  pages: {
    id: string;
    number: number;
    imageUrl: string;
  }[];
  userId?: string;
  manhwaId: string;
  chapterId: string;
  chapterNumber: number;
}

export function ChapterPageContent({
  pages,
  userId,
  manhwaId,
  chapterId,
  chapterNumber,
}: ChapterPageContentProps) {
  // Track which pages have been viewed
  const viewedPages = useRef(new Set<number>());
  const totalPages = pages.length;
  const lastProgressUpdate = useRef(0);

  // Function to update reading progress
  const updateProgress = async (progress: number) => {
    if (!userId) return;

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
  const createPageObserver = (pageNumber: number) => {
    const [ref, inView] = useInView({
      threshold: 0.5, // Consider page viewed when 50% visible
      triggerOnce: false, // Keep tracking as user scrolls
    });

    // When page comes into view, mark it as viewed
    useEffect(() => {
      if (inView && !viewedPages.current.has(pageNumber)) {
        viewedPages.current.add(pageNumber);
        const progress = viewedPages.current.size / totalPages;
        updateProgress(progress);
      }
    }, [inView, pageNumber]);

    return ref;
  };

  // Mark chapter as complete when user reaches the last page
  const lastPageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          updateProgress(1.0); // 100% complete
        }
      },
      { threshold: 0.8 }, // Trigger when 80% of last page is visible
    );

    if (lastPageRef.current) {
      observer.observe(lastPageRef.current);
    }

    return () => {
      if (lastPageRef.current) {
        observer.unobserve(lastPageRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {pages.map((page, index) => {
        const isLastPage = index === pages.length - 1;
        const pageRef = createPageObserver(page.number);

        return (
          <div
            key={page.id}
            className="w-full"
            ref={isLastPage ? lastPageRef : undefined}
          >
            <div ref={pageRef}>
              <Image
                src={page.imageUrl}
                alt={`Page ${page.number}`}
                width={1000}
                height={1500}
                className="w-full h-auto rounded-md"
                priority={index < 3} // Prioritize loading first 3 pages
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
