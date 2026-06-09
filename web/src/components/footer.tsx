"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Cook",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "AI Chef", href: "/chat" },
      { label: "Generate a recipe", href: "/generate" },
      { label: "Favorites", href: "/favorites" },
    ],
  },
  {
    heading: "Browse",
    links: [
      { label: "Ground Beef Recipes", href: "/ingredients/ground-beef" },
      { label: "Chicken Recipes", href: "/ingredients/chicken" },
      { label: "Lunch Ideas", href: "/meals/lunch" },
      { label: "Dinner Ideas", href: "/meals/dinner" },
      { label: "Healthy Recipes", href: "/recipes/healthy" },
      { label: "Pasta Recipes", href: "/recipes/pasta" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  // The chat is a full-height experience — no footer under the composer.
  if (pathname?.startsWith("/chat")) return null;

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Turn any craving into a beautiful, illustrated recipe with your personal AI chef.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-sm font-semibold text-foreground">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kitchen Assistant. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Recipes are AI-generated — always use your own judgment around allergens and food safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
