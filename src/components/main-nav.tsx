import Link from "next/link";
import { Button } from "./ui/button";
import { BookOpen, Clock, Menu, Star } from "lucide-react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: <BookOpen className="h-4 w-4 mr-2" /> },
  {
    name: "Popular",
    href: "/popular",
    icon: <Flame className="h-4 w-4 mr-2" />,
  },
  { name: "New", href: "/new", icon: <Clock className="h-4 w-4 mr-2" /> },
  { name: "Genres", href: "/genres", icon: <Star className="h-4 w-4 mr-2" /> },
];

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => (
        <Button
          asChild
          variant="ghost"
          key={item.name}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          <Link href={item.href} className="flex items-center">
            {item.icon}
            {item.name}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

export function MobileNav() {
  return (
    <div className="lg:hidden">
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
}
