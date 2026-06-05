"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LinkButton } from "@/components/ui";
import { RecipeRail, CategoryRail } from "@/components/recipe-rail";
import { titleCase } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Quick weeknight dinner",
  "Use what's in my fridge",
  "Something healthy",
  "Surprise me",
];

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const sendPrompt = (text: string) => router.push(`/chat?q=${encodeURIComponent(text)}`);

  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular-landing"],
    queryFn: () => api.popular(12),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories(),
  });

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    // Route into the unified AI Chef chat, which converses, detects intent, and generates.
    router.push(query ? `/chat?q=${encodeURIComponent(query)}` : "/chat");
  };

  const categories = (categoriesData?.categories ?? []).filter(
    (c) => (c.id || c.name) && (c.count ?? 1) > 0,
  );

  return (
    <div className="flex flex-col pb-4">
      {/* Hero — start a chat with the AI Chef */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-medium text-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
            </svg>
            AI Chef
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            What are you <span className="text-brand">cooking</span> today?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            Tell me a craving, a dish, or what&apos;s in your fridge — I&apos;ll make the recipe.
          </p>

          {/* Chat composer — typing here continues straight into the AI Chef */}
          <form
            onSubmit={go}
            className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-white p-2 shadow-sm transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Message the AI Chef…"
              className="h-11 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Send to AI Chef"
              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-800"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>

          {/* Quick prompts — show, in a tap, what you can ask */}
          <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendPrompt(p)}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by category (quick jumps) */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Browse by category</h2>
          <div className="-mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.slice(0, 14).map((c) => {
              const id = (c.id || c.category || c.name) as string;
              return (
                <Link
                  key={id}
                  href={`/discover?category=${encodeURIComponent(id)}`}
                  className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-50 hover:text-brand"
                >
                  {titleCase((c.name || c.id || c.category || "") as string)}
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

      {/* Popular rail */}
      <RecipeRail
        title="Popular right now"
        href="/discover?sort=popular"
        recipes={popular?.recipes}
        loading={loadingPopular}
      />

      {/* One rail per category (each self-fetches; empties hide themselves) */}
      {categories.slice(0, 8).map((c) => (
        <CategoryRail key={(c.id || c.category || c.name) as string} category={c} />
      ))}

      {/* CTA */}
      <section className="mt-14 bg-brand">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Cook smarter with your own AI chef</h2>
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
