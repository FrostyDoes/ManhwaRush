import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";

interface HeroBannerProps {
  featured: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    bannerImage: string;
    genres: string[];
    rating: number;
  };
}

export function HeroBanner({ featured }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-[500px] w-full">
        <Image
          src={featured.bannerImage}
          alt={featured.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16 max-w-3xl">
        <div className="flex flex-wrap gap-2 mb-4">
          {featured.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {featured.title}
        </h1>

        <div className="flex items-center mb-4">
          <div className="flex items-center mr-4">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="text-white font-medium">
              {featured.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-200 mb-6 line-clamp-3 md:line-clamp-4">
          {featured.description}
        </p>

        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href={`/manhwa/${featured.id}`}>Read Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/manhwa/${featured.id}`} className="flex items-center">
              More Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
