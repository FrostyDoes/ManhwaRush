import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Coins, Star } from "lucide-react";

interface ManhwaCardProps {
  id: string;
  title: string;
  coverImage: string;
  genres: string[];
  rating: number;
  isPremium?: boolean;
  coinPrice?: number;
}

export function ManhwaCard({
  id,
  title,
  coverImage,
  genres,
  rating,
  isPremium = false,
  coinPrice = 0,
}: ManhwaCardProps) {
  return (
    <Link href={`/manhwa/${id}`}>
      <div className="group relative overflow-hidden rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 duration-300">
        <div className="aspect-[2/3] overflow-hidden rounded-lg">
          <Image
            src={coverImage}
            alt={title}
            width={300}
            height={450}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="font-bold text-white line-clamp-2 mb-2">{title}</h3>

          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" />
              <span className="text-xs text-white">{rating.toFixed(1)}</span>
            </div>

            {isPremium && (
              <div className="flex items-center">
                <Coins className="h-3.5 w-3.5 text-yellow-400 mr-1" />
                <span className="text-xs text-white">{coinPrice}</span>
              </div>
            )}
          </div>
        </div>

        {isPremium && (
          <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </div>
        )}
      </div>
    </Link>
  );
}
