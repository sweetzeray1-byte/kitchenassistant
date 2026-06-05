"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { formatMinutes, titleCase } from "@/lib/utils";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const time = formatMinutes(recipe.totalTime ?? recipe.cookTime ?? recipe.prepTime);
  const img = recipe.thumbnail_url || recipe.steps?.find((s) => s.image_url)?.image_url;

  return (
    <Link
      href={recipe.id ? `/recipe/${recipe.id}` : "#"}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-200">
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
              <path d="M7 21h10a1 1 0 0 0 1-1v-3H6v3a1 1 0 0 0 1 1Zm9.5-16A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-8.96.86A3.5 3.5 0 0 0 6 15h12a3.5 3.5 0 0 0 .96-6.86A4.49 4.49 0 0 0 16.5 5Z" />
            </svg>
          </div>
        )}
        {recipe.isLocked && (
          <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 1 1 6 0v3Z" />
            </svg>
          </div>
        )}
        {recipe.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-brand-700">
            {titleCase(recipe.category)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-brand">
          {recipe.title}
        </h3>
        <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
          {time && (
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 2" />
              </svg>
              {time}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 18 0" />
            </svg>
            {recipe.servings}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="shimmer aspect-[4/3] w-full bg-muted" />
      <div className="space-y-2 p-3">
        <div className="shimmer h-4 w-3/4 rounded bg-muted" />
        <div className="shimmer h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
