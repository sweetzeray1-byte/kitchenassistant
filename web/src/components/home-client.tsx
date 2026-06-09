"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Recipe } from "@/lib/types";
import { LinkButton } from "@/components/ui";
import { RecipeRail, CategoryRail } from "@/components/recipe-rail";
import { titleCase } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: "⚡", label: "Quick weeknight dinner" },
  { icon: "🧊", label: "Use what's in my fridge" },
  { icon: "🥗", label: "Something healthy" },
  { icon: "✨", label: "Surprise me" },
];

// Example cravings the placeholder "types" out, one after another, to signal
// the input is live and show the kind of thing you can ask.
const PLACEHOLDER_EXAMPLES = [
  "cozy pasta for two",
  "use up my chicken & spinach",
  "a healthy 20-minute lunch",
  "something with chocolate",
  "dinner for picky kids",
];

/** Cycles a typewriter-style placeholder (type → hold → erase → next phrase). */
function useTypewriterPlaceholder(phrases: string[], active: boolean) {
  const [text, setText] = useState("");
  const ref = useRef({ phrase: 0, char: 0, deleting: false });

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = ref.current;
      const full = phrases[s.phrase];

      if (!s.deleting) {
        s.char++;
        setText(full.slice(0, s.char));
        if (s.char === full.length) {
          s.deleting = true;
          timer = setTimeout(tick, 1600); // hold the finished phrase
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        s.char--;
        setText(full.slice(0, s.char));
        if (s.char === 0) {
          s.deleting = false;
          s.phrase = (s.phrase + 1) % phrases.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [phrases, active]);

  return text;
}

/**
 * Client home body. The "Popular right now" recipes are fetched on the server (see page.tsx)
 * and passed in as `initialPopular`, so their image URLs are present in the initial HTML —
 * the browser can start downloading the (Vercel-optimized) images during HTML parse instead
 * of waiting for the JS bundle + a client fetch.
 */
export function HomeClient({ initialPopular }: { initialPopular: Recipe[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  // Animate the placeholder only when there's nothing to read/type over.
  const typed = useTypewriterPlaceholder(PLACEHOLDER_EXAMPLES, q === "" && !focused);

  const sendPrompt = (text: string) => router.push(`/chat?q=${encodeURIComponent(text)}`);

  const { data: popular } = useQuery({
    queryKey: ["popular-landing"],
    queryFn: () => api.popular(12),
    initialData: { recipes: initialPopular },
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
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50/40 to-white">
        {/* Soft warm glows for depth — keep the eye centred on the composer */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl"
        />

        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand shadow-sm backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
            </svg>
            AI Chef
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            What are you{" "}
            <span className="bg-gradient-to-r from-brand-500 to-brand bg-clip-text text-transparent">
              cooking
            </span>{" "}
            today?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-foreground/70 sm:text-lg">
            Tell me a craving, a dish, or what&apos;s in your fridge — I&apos;ll make the recipe.
          </p>

          {/* Chat composer — the focal point. Elevated "command bar" so it's the
              obvious thing to use; a glow sits behind it to draw the eye. */}
          <div className="relative mx-auto mt-9 max-w-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 -bottom-3 h-10 rounded-full bg-brand/20 blur-2xl"
            />
            <form
              onSubmit={go}
              className="relative flex items-center gap-2 rounded-2xl border border-brand-100 bg-white p-2 pl-4 shadow-xl shadow-brand/10 ring-1 ring-black/5 transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-brand/70" fill="currentColor" aria-hidden>
                <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={
                  focused
                    ? "Message the AI Chef…"
                    : `Try "${typed}│"` // typed text + blinking-ish caret bar
                }
                className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Send to AI Chef"
                className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm transition-colors hover:bg-brand-800 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Quick prompts — filled, icon-led chips so they read as tappable */}
          <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendPrompt(p.label)}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand-50 hover:text-brand"
              >
                <span aria-hidden>{p.icon}</span>
                {p.label}
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

      {/* Popular rail (server-seeded → images present on first paint) */}
      <RecipeRail
        title="Popular right now"
        href="/discover?sort=popular"
        recipes={popular?.recipes}
        eagerFirst
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
