"use client";

import type { Recipe } from "@/lib/types";
import { Button } from "./ui";

function stageLabel(progress: number): string {
  if (progress < 15) return "Warming up the kitchen…";
  if (progress < 35) return "Writing your recipe…";
  if (progress < 45) return "Plating the ingredients…";
  if (progress < 95) return "Illustrating each step…";
  return "Adding the finishing touches…";
}

export function GenerationProgress({
  query,
  progress,
  partial,
  onCancel,
}: {
  query: string;
  progress: number;
  partial: Recipe | null;
  onCancel: () => void;
}) {
  const pct = Math.max(5, Math.min(100, Math.round(progress)));

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 animate-pulse place-items-center rounded-xl bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
            </svg>
          </span>
          <div>
            <h2 className="font-bold">
              {partial?.title || "Creating your recipe"}
            </h2>
            <p className="text-sm text-muted-foreground">{stageLabel(pct)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
            <span className="line-clamp-1">&ldquo;{query}&rdquo;</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Partial preview */}
        {partial && (
          <div className="mt-6 space-y-3">
            {partial.ingredients?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {partial.ingredients.length} ingredients · {partial.steps?.length ?? 0} steps
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {partial.steps?.slice(0, 8).map((s, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} alt={`Step ${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="shimmer h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
