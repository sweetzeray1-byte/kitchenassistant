"use client";

import { useRouter } from "next/navigation";
import type { IntentMeta } from "@/lib/types";

/**
 * Mirrors the Flutter RecipeIntentCard shown inside chat when the AI detects cooking intent.
 * If `onGenerate` is provided, the button generates inline (in the chat thread); otherwise it
 * falls back to navigating to the standalone generate page.
 */
export function RecipeIntentCard({
  meta,
  onGenerate,
}: {
  meta: IntentMeta;
  onGenerate?: (title: string) => void;
}) {
  const router = useRouter();
  const title = meta.hero_recipe_title;
  if (!title) return null;

  const handleGenerate = () => {
    if (onGenerate) onGenerate(title);
    else router.push(`/generate?q=${encodeURIComponent(title)}`);
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-brand/20 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-brand-50 px-4 py-2.5">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="currentColor">
          <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
          AI Recipe Suggestion
        </span>
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold">{title}</h4>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {meta.prep_time && (
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 2" />
              </svg>
              {meta.prep_time}
            </span>
          )}
          {meta.tags?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          className="mt-4 w-full rounded-xl bg-brand py-3 font-bold text-white transition-colors hover:bg-brand-800"
        >
          Generate Full Recipe
        </button>
      </div>
    </div>
  );
}
