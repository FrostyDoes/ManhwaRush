"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ManhwaGrid } from "@/components/manhwa-grid";

interface GenreTabsProps {
  genres: {
    id: string;
    name: string;
    items: {
      id: string;
      title: string;
      coverImage: string;
      genres: string[];
      rating: number;
      isPremium?: boolean;
      coinPrice?: number;
    }[];
  }[];
}

export function GenreTabs({ genres }: GenreTabsProps) {
  const [activeTab, setActiveTab] = useState(genres[0]?.id || "");

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto py-2 h-auto flex-wrap">
        {genres.map((genre) => (
          <TabsTrigger key={genre.id} value={genre.id} className="px-4 py-2">
            {genre.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {genres.map((genre) => (
        <TabsContent key={genre.id} value={genre.id} className="mt-6">
          <ManhwaGrid items={genre.items} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
