"use client";

import { LinkButton } from "./ui";

/**
 * Tease & Lock overlay — mirrors the Flutter LockedRecipeOverlay.
 * Blurs the recipe content and presents an upgrade call-to-action.
 */
export function LockedOverlay({
  isLocked,
  children,
}: {
  isLocked: boolean;
  children: React.ReactNode;
}) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 flex items-start justify-center px-4 pt-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white/95 p-6 text-center shadow-xl backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 1 1 6 0v3Z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold">Unlock Full Recipe</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your custom recipe is ready! Upgrade to Pro to unlock the ingredients,
            step-by-step instructions, and unlimited cooking.
          </p>
          <LinkButton href="/pricing" className="mt-5" fullWidth>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
            </svg>
            Go Pro &amp; Unlock
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
