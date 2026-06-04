"use client";

import { useRouter } from "next/navigation";

/** Mirrors the Flutter MagicSearchCard — the "create this recipe with AI" funnel. */
export function MagicSearchCard({ query }: { query: string }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-brand to-brand-600 p-8 text-center text-white shadow-lg shadow-brand/30">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
          <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
        </svg>
      </div>
      <h3 className="mt-5 text-2xl font-bold">Create Magic with AI</h3>
      <p className="mt-3 text-white/90">
        We couldn&apos;t find an exact match for &ldquo;{query}&rdquo;, but our AI Chef
        can create a custom recipe for you right now!
      </p>
      <button
        onClick={() => router.push(`/chat?q=${encodeURIComponent(query)}`)}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand transition-colors hover:bg-brand-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M7 21h10" />
        </svg>
        Generate This Recipe
      </button>
    </div>
  );
}
