import type { Metadata } from "next";
import type { Recipe } from "@/lib/types";
import { HomeClient } from "@/components/home-client";
import { jsonLdScript, recipeItemListJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Recipe Generation — Illustrated Recipes & Cooking Chat",
  description:
    "Generate beautiful, illustrated recipes with AI. Discover popular dishes, chat with your personal AI chef, and cook with confidence.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Kitchen Assistant — AI Recipe Generation",
    description:
      "Generate beautiful, illustrated recipes with AI. Discover dishes and cook with confidence.",
  },
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

// Revalidate the cached popular list every 5 minutes (ISR). It's public + slow-changing,
// so this serves an edge-cached HTML response with recipe image URLs already inlined.
export const revalidate = 300;

// Server-side fetch of the public "popular" recipes (GET /api/recipes/popular is
// optionalAuthenticate, so no token needed). Returning [] degrades gracefully — the
// client still revalidates on mount.
async function getPopular(): Promise<Recipe[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/popular?limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { recipes?: Recipe[] };
    return data.recipes ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialPopular = await getPopular();
  const itemList = recipeItemListJsonLd(initialPopular, {
    name: "Popular AI Recipes",
  });

  return (
    <>
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(itemList) }}
        />
      )}
      <HomeClient initialPopular={initialPopular} />
    </>
  );
}
