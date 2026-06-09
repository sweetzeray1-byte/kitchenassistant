"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DiscoverResponse, RecipeCategory } from "@/lib/types";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { MagicSearchCard } from "@/components/magic-search-card";
import { Input } from "@/components/ui";
import { cn, titleCase } from "@/lib/utils";

function categoryName(c: RecipeCategory): string {
  return c.name || c.category || c.id || "";
}

export function DiscoverClient({
  initialDiscover,
  initialCategories,
}: {
  initialDiscover?: DiscoverResponse;
  initialCategories?: { categories: RecipeCategory[] };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(urlQuery);
  const [category, setCategory] = useState(urlCategory);

  // The committed query is just the URL's ?q= — submitting navigates, which re-renders.
  const activeQuery = urlQuery;

  // Params present at first mount, so the server-fetched initialData only seeds the
  // matching react-query key (lazy initializer = safe to read during render).
  const [initialKey] = useState({ q: urlQuery, category: urlCategory });

  // Keep the search box in sync when ?q= changes via back/forward navigation.
  // (Render-time state adjustment — React's documented alternative to a setState effect.)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearch(urlQuery);
  }

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories(),
    staleTime: 5 * 60 * 1000,
    initialData: initialCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["discover", activeQuery, category],
    queryFn: () =>
      api.discover({
        query: activeQuery || undefined,
        category: category || undefined,
        limit: 24,
      }),
    initialData:
      activeQuery === initialKey.q && category === initialKey.category
        ? initialDiscover
        : undefined,
  });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    router.replace(`/discover${params.toString() ? `?${params}` : ""}`);
  };

  const recipes = data?.recipes ?? [];
  const showMagic = data?.can_generate && activeQuery;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover Recipes</h1>
        <p className="mt-2 text-muted-foreground">
          Browse the community catalog — or search and let AI cook up something new.
        </p>
      </div>

      <form onSubmit={submitSearch} className="mx-auto mt-6 flex max-w-xl gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes…"
          className="h-12"
        />
        <button
          type="submit"
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-brand text-white hover:bg-brand-800"
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      {/* Category chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <CategoryChip active={!category} onClick={() => setCategory("")}>
          All
        </CategoryChip>
        {categoriesData?.categories?.slice(0, 16).map((c) => {
          const name = categoryName(c);
          if (!name) return null;
          return (
            <CategoryChip
              key={name}
              active={category === name}
              onClick={() => setCategory(category === name ? "" : name)}
            >
              {titleCase(name)}
            </CategoryChip>
          );
        })}
      </div>

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : showMagic ? (
          <MagicSearchCard query={activeQuery} />
        ) : recipes.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No recipes found. Try a different search.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recipes.map((r, i) => (
              <RecipeCard key={r.id ?? i} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-white text-muted-foreground hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}
