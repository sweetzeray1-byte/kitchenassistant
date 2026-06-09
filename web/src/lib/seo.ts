import type { Recipe } from "./types";

/**
 * Canonical production origin used for metadataBase, canonical tags, sitemap, and
 * absolute JSON-LD URLs. Override per environment with NEXT_PUBLIC_SITE_URL
 * (set this in Vercel to the real custom domain when one is attached).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenassistant-pi.vercel.app"
).replace(/\/$/, "");

/** Compose an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * schema.org/ItemList for a grid of recipes. Marking listing pages as an ItemList
 * makes them eligible for Google's "summary page" recipe carousels for broad,
 * high-volume head terms (e.g. "hamburger recipe ideas").
 */
export function recipeItemListJsonLd(
  recipes: Recipe[],
  opts?: { name?: string },
): Record<string, unknown> | null {
  const items = recipes.filter((r) => r.id);
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(opts?.name ? { name: opts.name } : {}),
    itemListElement: items.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/recipe/${r.id}`),
      name: r.title,
    })),
  };
}

/**
 * schema.org/BreadcrumbList. Pass ordered crumbs from root to the current page
 * (the last entry is the current page). Reinforces site taxonomy in the SERP.
 */
export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Serialize JSON-LD for safe inlining via dangerouslySetInnerHTML. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
