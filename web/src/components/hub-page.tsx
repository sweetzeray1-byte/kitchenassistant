import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { type HubDef, getHub, hubPath } from "@/lib/taxonomy";
import { RecipeCard } from "@/components/recipe-card";

/**
 * Shared, server-rendered UI for a programmatic hub page: breadcrumb, H1, unique
 * intro, recipe grid (or an AI-generate funnel when sparse), and related-hub links.
 */
export function HubView({ hub, recipes }: { hub: HubDef; recipes: Recipe[] }) {
  const related = hub.related
    .map((slug) => getHub(hub.kind, slug))
    .filter((h): h is HubDef => Boolean(h));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/discover" className="hover:text-brand">
          Discover
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{hub.h1}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{hub.h1}</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">{hub.intro}</p>

      {recipes.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((r, i) => (
            <RecipeCard key={r.id ?? i} recipe={r} eager={i < 4} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">
            No {hub.h1.toLowerCase()} here yet — be the first to create one.
          </p>
          <Link
            href={`/discover?q=${encodeURIComponent(hub.generateSeed)}`}
            className="mt-4 inline-flex items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Generate a {hub.generateSeed} recipe with AI
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-semibold text-foreground">Related</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((h) => (
              <Link
                key={h.slug}
                href={hubPath(h)}
                className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                {h.h1}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
