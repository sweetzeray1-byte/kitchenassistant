import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverClient } from "@/components/discover-client";
import { jsonLdScript, recipeItemListJsonLd } from "@/lib/seo";
import type { DiscoverResponse, RecipeCategory } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

export const metadata: Metadata = {
  title: "Discover Recipes — Browse & Search AI Recipes",
  description:
    "Browse the Kitchen Assistant catalog of illustrated AI recipes by category, or search and let AI cook up something new.",
  // Canonicalize to the bare /discover so ?q= and ?category= variants don't dilute it.
  alternates: { canonical: "/discover" },
  openGraph: {
    url: "/discover",
    title: "Discover Recipes",
    description: "Browse illustrated AI recipes by category, or search for anything.",
  },
};

// Server-fetch the initial grid so crawlers receive indexable recipe HTML (not an empty shell).
async function getInitialDiscover(
  query?: string,
  category?: string,
): Promise<DiscoverResponse | null> {
  try {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category) params.set("category", category);
    params.set("limit", "24");
    const res = await fetch(`${API_BASE_URL}/api/recipes/discover?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as DiscoverResponse;
  } catch {
    return null;
  }
}

async function getCategories(): Promise<{ categories: RecipeCategory[] } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as { categories: RecipeCategory[] };
  } catch {
    return null;
  }
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [initialDiscover, initialCategories] = await Promise.all([
    getInitialDiscover(q, category),
    getCategories(),
  ]);

  const itemList = initialDiscover?.recipes?.length
    ? recipeItemListJsonLd(initialDiscover.recipes, { name: "Discover Recipes" })
    : null;

  return (
    <>
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(itemList) }}
        />
      )}
      <Suspense fallback={<div className="flex-1" />}>
        <DiscoverClient
          initialDiscover={initialDiscover ?? undefined}
          initialCategories={initialCategories ?? undefined}
        />
      </Suspense>
    </>
  );
}
