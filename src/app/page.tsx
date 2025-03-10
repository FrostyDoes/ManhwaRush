import { SiteHeader } from "@/components/site-header";
import { HeroBanner } from "@/components/hero-banner";
import { SectionHeader } from "@/components/section-header";
import { ManhwaGrid } from "@/components/manhwa-grid";
import { GenreTabs } from "@/components/genre-tabs";
import { CoinPackages } from "@/components/coin-packages";
import { createClient } from "../../supabase/server";

// Sample data - in a real app, this would come from the database
const featuredManhwa = {
  id: "solo-leveling",
  title: "Solo Leveling",
  description:
    "When a portal connecting our world to a different dimension full of monsters opens up, some people gain the power to hunt them. These hunters possess magical abilities and are known as 'awakened'. The main character, Sung Jinwoo, is the weakest of all the hunters and barely stronger than a normal human.",
  coverImage:
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
  bannerImage:
    "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=1920&q=80",
  genres: ["Action", "Fantasy", "Adventure"],
  rating: 4.8,
};

const popularManhwa = [
  {
    id: "tower-of-god",
    title: "Tower of God",
    coverImage:
      "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
    genres: ["Fantasy", "Adventure"],
    rating: 4.7,
    isPremium: true,
    coinPrice: 5,
  },
  {
    id: "the-beginning-after-the-end",
    title: "The Beginning After The End",
    coverImage:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
    genres: ["Fantasy", "Action"],
    rating: 4.6,
  },
  {
    id: "omniscient-reader",
    title: "Omniscient Reader",
    coverImage:
      "https://images.unsplash.com/photo-1601513237763-10aaaa60fbcf?w=800&q=80",
    genres: ["Action", "Drama"],
    rating: 4.5,
    isPremium: true,
    coinPrice: 3,
  },
  {
    id: "god-of-high-school",
    title: "The God of High School",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80",
    genres: ["Action", "Martial Arts"],
    rating: 4.3,
  },
  {
    id: "noblesse",
    title: "Noblesse",
    coverImage:
      "https://images.unsplash.com/photo-1604431696980-07e518647bec?w=800&q=80",
    genres: ["Action", "Supernatural"],
    rating: 4.4,
    isPremium: true,
    coinPrice: 4,
  },
  {
    id: "sweet-home",
    title: "Sweet Home",
    coverImage:
      "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80",
    genres: ["Horror", "Drama"],
    rating: 4.2,
  },
];

const newReleases = [
  {
    id: "eleceed",
    title: "Eleceed",
    coverImage:
      "https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?w=800&q=80",
    genres: ["Action", "Comedy"],
    rating: 4.6,
    isPremium: true,
    coinPrice: 5,
  },
  {
    id: "hardcore-leveling-warrior",
    title: "Hardcore Leveling Warrior",
    coverImage:
      "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=800&q=80",
    genres: ["Action", "Fantasy"],
    rating: 4.3,
  },
  {
    id: "unordinary",
    title: "unOrdinary",
    coverImage:
      "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80",
    genres: ["Drama", "Supernatural"],
    rating: 4.5,
    isPremium: true,
    coinPrice: 3,
  },
  {
    id: "lookism",
    title: "Lookism",
    coverImage:
      "https://images.unsplash.com/photo-1607275121013-8e2ef0eabbf4?w=800&q=80",
    genres: ["Drama", "School Life"],
    rating: 4.4,
  },
  {
    id: "wind-breaker",
    title: "Wind Breaker",
    coverImage:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    genres: ["Sports", "Drama"],
    rating: 4.2,
    isPremium: true,
    coinPrice: 2,
  },
  {
    id: "the-gamer",
    title: "The Gamer",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    genres: ["Action", "Fantasy"],
    rating: 4.1,
  },
];

const genreData = [
  {
    id: "action",
    name: "Action",
    items: popularManhwa.filter((item) => item.genres.includes("Action")),
  },
  {
    id: "fantasy",
    name: "Fantasy",
    items: popularManhwa.filter((item) => item.genres.includes("Fantasy")),
  },
  {
    id: "drama",
    name: "Drama",
    items: newReleases.filter((item) => item.genres.includes("Drama")),
  },
  {
    id: "adventure",
    name: "Adventure",
    items: popularManhwa.filter((item) => item.genres.includes("Adventure")),
  },
  {
    id: "supernatural",
    name: "Supernatural",
    items: [...popularManhwa, ...newReleases].filter((item) =>
      item.genres.includes("Supernatural"),
    ),
  },
];

const coinPackages = [
  {
    id: "price_coin_100",
    name: "Basic Pack",
    coins: 100,
    price: 9.99,
  },
  {
    id: "price_coin_250",
    name: "Popular Pack",
    coins: 250,
    price: 19.99,
    popular: true,
    discount: 20,
  },
  {
    id: "price_coin_500",
    name: "Premium Pack",
    coins: 500,
    price: 34.99,
    discount: 30,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        <section className="mb-12">
          <HeroBanner featured={featuredManhwa} />
        </section>

        {/* Popular Manhwa */}
        <section className="mb-12">
          <SectionHeader
            title="Popular Manhwa"
            description="Trending titles that readers love"
            viewAllHref="/popular"
          />
          <ManhwaGrid items={popularManhwa} />
        </section>

        {/* New Releases */}
        <section className="mb-12">
          <SectionHeader
            title="New Releases"
            description="Fresh chapters and series just added"
            viewAllHref="/new"
          />
          <ManhwaGrid items={newReleases} />
        </section>

        {/* Browse by Genre */}
        <section className="mb-12">
          <SectionHeader
            title="Browse by Genre"
            description="Find manhwa in your favorite categories"
          />
          <GenreTabs genres={genreData} />
        </section>

        {/* Coin Packages */}
        <section className="mb-12 bg-card rounded-xl p-6 border">
          <SectionHeader
            title="Get Coins"
            description="Purchase coins to unlock premium manhwa"
          />
          <CoinPackages packages={coinPackages} user={user} />
        </section>
      </main>
    </div>
  );
}
