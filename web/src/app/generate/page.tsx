"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input, ErrorBanner, LinkButton, Spinner } from "@/components/ui";
import { GenerationProgress } from "@/components/generation-progress";
import { RecipeView } from "@/components/recipe-view";
import { useRecipeGeneration } from "@/lib/use-recipe-generation";
import { useRequireAuth } from "@/lib/use-require-auth";

const EXAMPLES = [
  "Creamy garlic butter shrimp pasta",
  "Healthy 20-minute chicken stir-fry",
  "Vegan chocolate avocado mousse",
  "Spicy Korean beef bowl",
  "Classic Margherita pizza from scratch",
  "Fluffy weekend buttermilk pancakes",
];

function GenerateInner() {
  const { isAuthenticated, loading } = useRequireAuth();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");

  const [input, setInput] = useState("");
  const { status, progress, partial, recipe, error, start, cancel, reset } =
    useRecipeGeneration();
  const autoStarted = useRef(false);

  useEffect(() => {
    // Only auto-start once auth has resolved and the user is signed in.
    if (qParam && !autoStarted.current && status === "idle" && isAuthenticated) {
      autoStarted.current = true;
      setInput(qParam);
      void start(qParam);
    }
  }, [qParam, status, start, isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q.length < 3) return;
    void start(q);
  };

  const busy = status === "starting" || status === "processing";

  // Generating requires sign-in. useRequireAuth redirects to /login?next=/generate,
  // so after signing in the user lands back here (and auto-starts if a ?q= was set).
  if (loading || !isAuthenticated) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Idle / input */}
      {status === "idle" && (
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            What do you want to cook?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Describe any dish, ingredient, or craving — our AI chef will create a
            full illustrated recipe just for you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. cozy mushroom risotto"
              className="h-12 text-base"
              autoFocus
            />
            <Button type="submit" size="lg" disabled={input.trim().length < 3}>
              Generate
            </Button>
          </form>

          <div className="mt-10">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Try one of these</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setInput(ex);
                    void start(ex);
                  }}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generating */}
      {busy && (
        <GenerationProgress
          query={input}
          progress={progress}
          partial={partial}
          onCancel={() => void cancel()}
        />
      )}

      {/* Failed / cancelled */}
      {(status === "failed" || status === "cancelled") && (
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          {status === "failed" ? (
            <ErrorBanner message={error || "Recipe generation failed."} />
          ) : (
            <p className="text-muted-foreground">Generation cancelled.</p>
          )}
          <Button onClick={reset}>Try again</Button>
        </div>
      )}

      {/* Completed */}
      {status === "completed" && recipe && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={reset}>
              ← Generate another
            </Button>
            {recipe.id && !recipe.isLocked && (
              <LinkButton href={`/recipe/${recipe.id}`} variant="ghost" size="sm">
                Open full page →
              </LinkButton>
            )}
          </div>

          <RecipeView recipe={recipe} locked={!!recipe.isLocked} />

          {recipe.isLocked && (
            <p className="text-center text-sm text-muted-foreground">
              This recipe is locked on the free plan.{" "}
              <Link href="/pricing" className="font-semibold text-brand hover:underline">
                Upgrade to unlock
              </Link>{" "}
              the full ingredients &amp; steps.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <GenerateInner />
    </Suspense>
  );
}
