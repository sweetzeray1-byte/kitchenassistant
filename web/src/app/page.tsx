import type { Recipe } from "@/lib/types";
import { HomeClient } from "@/components/home-client";

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
  return <HomeClient initialPopular={initialPopular} />;
}
