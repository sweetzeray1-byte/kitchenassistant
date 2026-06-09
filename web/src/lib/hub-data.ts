import type { Recipe } from "./types";
import type { HubDef } from "./taxonomy";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

/**
 * Server-side fetch of the recipes that populate a hub page, via the public
 * GET /api/recipes/discover endpoint. Cached (ISR) so hubs stay fast at the edge.
 * Degrades to an empty list — the hub page renders its intro + generate CTA instead.
 */
export async function fetchHubRecipes(hub: HubDef, limit = 24): Promise<Recipe[]> {
  try {
    const params = new URLSearchParams();
    if (hub.filter.category) params.set("category", hub.filter.category);
    if (hub.filter.ingredient) params.set("ingredient", hub.filter.ingredient);
    if (hub.filter.query) params.set("query", hub.filter.query);
    if (hub.filter.tags?.length) params.set("tags", hub.filter.tags.join(","));
    params.set("sort", "popular");
    params.set("limit", String(limit));

    const res = await fetch(`${API_BASE_URL}/api/recipes/discover?${params}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { recipes?: Recipe[] };
    return data.recipes ?? [];
  } catch {
    return [];
  }
}
