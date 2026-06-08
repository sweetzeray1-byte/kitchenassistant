"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Recipe, RecipeCategory } from "@/lib/types";
import { RecipeCard, RecipeCardSkeleton } from "./recipe-card";
import { titleCase } from "@/lib/utils";

/**
 * A horizontal-scrolling row of recipe cards (a "rail"), with a header and a "See all" link.
 * Cards are fixed-width so the next one peeks in, inviting a sideways swipe on mobile.
 */
export function RecipeRail({
  title,
  href,
  recipes,
  loading,
  eagerFirst = false,
}: {
  title: string;
  href: string;
  recipes?: Recipe[];
  loading?: boolean;
  // When true, the first few cards load their images eagerly (above-the-fold rail).
  eagerFirst?: boolean;
}) {
  if (!loading && (!recipes || recipes.length === 0)) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-10">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        <Link
          href={href}
          className="whitespace-nowrap text-sm font-semibold text-brand hover:underline"
        >
          See all →
        </Link>
      </div>
      {/* -mx-4 + px-4 lets the row bleed to the screen edges on mobile while keeping the
          first card aligned under the header. */}
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(loading ? Array.from({ length: 6 }) : recipes!).map((item, i) => (
          <div key={(item as Recipe)?.id ?? i} className="w-40 flex-shrink-0 snap-start sm:w-48">
            {loading ? (
              <RecipeCardSkeleton />
            ) : (
              <RecipeCard recipe={item as Recipe} eager={eagerFirst && i < 4} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** A rail that fetches the top recipes for a single category and hides itself if empty. */
export function CategoryRail({ category }: { category: RecipeCategory }) {
  const id = (category.id || category.category || category.name || "") as string;
  const label = titleCase((category.name || category.id || category.category || "") as string);

  const { data, isLoading } = useQuery({
    queryKey: ["rail", id],
    queryFn: () => api.discover({ category: id, sort: "popular", limit: 12 }),
    enabled: !!id,
  });

  if (!isLoading && (!data?.recipes || data.recipes.length === 0)) return null;

  return (
    <RecipeRail
      title={label}
      href={`/discover?category=${encodeURIComponent(id)}`}
      recipes={data?.recipes}
      loading={isLoading}
    />
  );
}
