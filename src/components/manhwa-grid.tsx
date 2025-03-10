import { ManhwaCard } from "@/components/manhwa-card";

interface ManhwaGridProps {
  items: {
    id: string;
    title: string;
    coverImage: string;
    genres: string[];
    rating: number;
    isPremium?: boolean;
    coinPrice?: number;
  }[];
}

export function ManhwaGrid({ items }: ManhwaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map((item) => (
        <ManhwaCard
          key={item.id}
          id={item.id}
          title={item.title}
          coverImage={item.coverImage}
          genres={item.genres}
          rating={item.rating}
          isPremium={item.isPremium}
          coinPrice={item.coinPrice}
        />
      ))}
    </div>
  );
}
