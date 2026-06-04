"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LinkButton } from "@/components/ui";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { titleCase } from "@/lib/utils";
import type { Recipe } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular-landing"],
    queryFn: () => api.popular(8),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories(),
  });
  const { data: latest, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-landing"],
    queryFn: () => api.discover({ sort: "recent", limit: 8 }),
  });

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    // Route into the unified AI Chef chat, which converses, detects intent, and generates.
    router.push(query ? `/chat?q=${encodeURIComponent(query)}` : "/chat");
  };

  const categories = (categoriesData?.categories ?? [])
    .filter((c) => (c.id || c.name) && (c.count ?? 1) > 0)
    .slice(0, 12);

  return (
    <div className="flex flex-col pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-medium text-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
            </svg>
            Powered by AI
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            What are you{" "}
            <span className="text-brand">cooking</span> today?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Search the catalog or describe a craving — our AI chef turns it into a complete,
            illustrated recipe with ingredients, steps, and nutrition.
          </p>

          <form onSubmit={go} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “creamy tuscan pasta” or “what can I make with chicken?”"
              className="h-[52px] flex-1 rounded-xl border border-border bg-white px-5 py-3.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-brand px-7 font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Cook with AI
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Browse recipes free — sign in to generate your own.
          </p>
        </div>
      </section>

      {/* Browse by category */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-12">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {categories.map((c) => {
              const id = (c.id || c.category || c.name) as string;
              const label = titleCase((c.name || c.id || c.category || "") as string);
              return (
                <Link
                  key={id}
                  href={`/discover?category=${encodeURIComponent(id)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-50 hover:text-brand"
                >
                  {label}
                  {typeof c.count === "number" && c.count > 0 && (
                    <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                      {c.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular recipes */}
      <RecipeSection
        title="Popular recipes"
        subtitle="What everyone's cooking right now."
        href="/discover?sort=popular"
        loading={loadingPopular}
        recipes={popular?.recipes}
      />

      {/* Fresh recipes */}
      <RecipeSection
        title="Fresh from the kitchen"
        subtitle="The latest additions to the catalog."
        href="/discover"
        loading={loadingLatest}
        recipes={latest?.recipes}
      />

      {/* CTA */}
      <section className="mt-16 bg-brand">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold">Cook smarter with your own AI chef</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Create a free account to generate personalized, illustrated recipes and save your
            favorites.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" variant="white" size="lg">
              Get started free
            </LinkButton>
            <LinkButton
              href="/chat"
              size="lg"
              className="border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Try the AI Chef
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecipeSection({
  title,
  subtitle,
  href,
  loading,
  recipes,
}: {
  title: string;
  subtitle?: string;
  href: string;
  loading: boolean;
  recipes?: Recipe[];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <LinkButton href={href} variant="ghost" size="sm">
          See all →
        </LinkButton>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((r, i) => (
            <RecipeCard key={r.id ?? i} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No recipes here yet — be the first to generate one!
        </p>
      )}
    </section>
  );
}
