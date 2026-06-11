import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { ALL_HUBS, hubPath } from "@/lib/taxonomy";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

// Google's hard limit is 50,000 URLs per sitemap file.
const PER_SITEMAP = 50000;

type SitemapRecipe = { id: string; updatedAt: string };

// Cached for an hour; generateSitemaps and sitemap share this result via the Data Cache.
async function fetchSitemapRecipes(): Promise<SitemapRecipe[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { recipes?: SitemapRecipe[] };
    return data.recipes ?? [];
  } catch {
    return [];
  }
}

// Public, indexable static routes. Emitted only in the first sitemap shard.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
  { url: `${SITE_URL}/discover`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/generate`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  // Programmatic SEO hubs (ingredient + meal landing pages).
  ...ALL_HUBS.map((hub) => ({
    url: `${SITE_URL}${hubPath(hub)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  })),
];

export async function generateSitemaps() {
  const recipes = await fetchSitemapRecipes();
  const shards = Math.max(1, Math.ceil(recipes.length / PER_SITEMAP));
  return Array.from({ length: shards }, (_, i) => ({ id: i }));
}

// Next.js 16: `id` is a Promise that resolves to a string.
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id) || 0;
  const recipes = await fetchSitemapRecipes();

  const start = id * PER_SITEMAP;
  const recipeRoutes: MetadataRoute.Sitemap = recipes
    .slice(start, start + PER_SITEMAP)
    .map((r) => ({
      url: `${SITE_URL}/recipe/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return id === 0 ? [...STATIC_ROUTES, ...recipeRoutes] : recipeRoutes;
}
