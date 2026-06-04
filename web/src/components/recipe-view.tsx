"use client";

import { useEffect, useState } from "react";
import type { Recipe } from "@/lib/types";
import { Badge, Card, LinkButton } from "./ui";
import { formatMinutes, titleCase, nutritionValue, scaleIngredient } from "@/lib/utils";

function MetaChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
      <span className="text-brand">{icon}</span>
      <div className="leading-tight">
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function RecipeView({
  recipe,
  headerActions,
  locked = false,
}: {
  recipe: Recipe;
  headerActions?: React.ReactNode;
  /** When true, ingredients + steps are blurred behind a paywall (hero/title/meta/nutrition tease). */
  locked?: boolean;
}) {
  const hero =
    recipe.thumbnail_url || recipe.steps?.find((s) => s.image_url)?.image_url;
  const prep = formatMinutes(recipe.prepTime);
  const cook = formatMinutes(recipe.cookTime);
  const total = formatMinutes(recipe.totalTime);

  // Servings scaling — only interactive when the recipe is unlocked.
  const originalServings = recipe.servings > 0 ? recipe.servings : 1;
  const [servings, setServings] = useState(originalServings);
  useEffect(() => {
    setServings(originalServings);
  }, [originalServings]);
  const factor = locked ? 1 : servings / originalServings;
  const isScaled = !locked && Math.abs(factor - 1) > 1e-9;

  return (
    <article className="space-y-8">
      {/* Hero (the "main photo" — always visible) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt={recipe.title} className="max-h-[420px] w-full object-cover" />
        ) : (
          <div className="grid aspect-[16/7] w-full place-items-center text-brand-200">
            <svg viewBox="0 0 24 24" className="h-16 w-16" fill="currentColor">
              <path d="M7 21h10a1 1 0 0 0 1-1v-3H6v3a1 1 0 0 0 1 1Zm9.5-16A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-8.96.86A3.5 3.5 0 0 0 6 15h12a3.5 3.5 0 0 0 .96-6.86A4.49 4.49 0 0 0 16.5 5Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + actions (visible) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{recipe.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {recipe.category && <Badge>{titleCase(recipe.category)}</Badge>}
            {recipe.tags?.slice(0, 4).map((t) => (
              <Badge key={t} className="bg-muted text-muted-foreground">
                {titleCase(t)}
              </Badge>
            ))}
          </div>
        </div>
        {headerActions}
      </div>

      {/* Meta chips (visible). Servings stepper only when unlocked. */}
      <div className="flex flex-wrap gap-3">
        {locked ? (
          <MetaChip icon={<PeopleIcon />} label="Servings" value={String(recipe.servings)} />
        ) : (
          <ServingsStepper
            servings={servings}
            setServings={setServings}
            originalServings={originalServings}
            isScaled={isScaled}
          />
        )}
        {prep && <MetaChip icon={<ClockIcon />} label="Prep" value={prep} />}
        {cook && <MetaChip icon={<ClockIcon />} label="Cook" value={cook} />}
        {total && <MetaChip icon={<ClockIcon />} label="Total" value={total} />}
      </div>

      {locked ? (
        <div className="space-y-6">
          {/* Nutrition stays as a tease */}
          <div className="max-w-md">
            <NutritionCard recipe={recipe} />
          </div>

          {/* Ingredients + steps blurred behind a paywall */}
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <div className="pointer-events-none select-none blur-[7px]" aria-hidden="true">
              <div className="grid gap-8 p-5 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <IngredientsCard recipe={recipe} factor={1} isScaled={false} servings={recipe.servings} />
                </div>
                <div className="lg:col-span-2">
                  <StepsList recipe={recipe} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-white/40" />
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-12 sm:pt-20">
              <PaywallCard />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <IngredientsCard
              recipe={recipe}
              factor={factor}
              isScaled={isScaled}
              servings={servings}
            />
            <div className="mt-6">
              <NutritionCard recipe={recipe} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <StepsList recipe={recipe} />
          </div>
        </div>
      )}
    </article>
  );
}

function ServingsStepper({
  servings,
  setServings,
  originalServings,
  isScaled,
}: {
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  originalServings: number;
  isScaled: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
      <span className="text-brand">
        <PeopleIcon />
      </span>
      <div className="leading-tight">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="grid h-6 w-6 place-items-center rounded-md border border-border text-base font-bold leading-none text-brand transition-colors hover:bg-brand-50 disabled:opacity-40"
            disabled={servings <= 1}
            aria-label="Fewer servings"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={100}
            value={servings}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) setServings(Math.min(100, Math.max(1, v)));
            }}
            className="w-11 rounded-md border border-border bg-white py-0.5 text-center text-sm font-semibold outline-none focus:border-brand [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Number of servings"
          />
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(100, s + 1))}
            className="grid h-6 w-6 place-items-center rounded-md border border-border text-base font-bold leading-none text-brand transition-colors hover:bg-brand-50 disabled:opacity-40"
            disabled={servings >= 100}
            aria-label="More servings"
          >
            +
          </button>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Servings{isScaled ? ` · from ${originalServings}` : ""}
        </div>
      </div>
    </div>
  );
}

function IngredientsCard({
  recipe,
  factor,
  isScaled,
  servings,
}: {
  recipe: Recipe;
  factor: number;
  isScaled: boolean;
  servings: number;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Ingredients</h2>
        {isScaled && <span className="text-xs font-medium text-brand">for {servings}</span>}
      </div>
      <ul className="space-y-2.5">
        {recipe.ingredients.map((ing, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
            <span>{scaleIngredient(ing, factor)}</span>
          </li>
        ))}
      </ul>
      {isScaled && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Amounts scaled for {servings} servings. Seasoning, spices &amp; leavening scale roughly —
          taste and adjust to your preference.
        </p>
      )}
    </Card>
  );
}

function NutritionCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-bold">Nutrition</h2>
      <div className="grid grid-cols-2 gap-3">
        <NutriStat label="Calories" value={String(recipe.nutrition.calories ?? "—")} />
        <NutriStat label="Protein" value={nutritionValue(recipe.nutrition.protein)} />
        <NutriStat label="Fat" value={nutritionValue(recipe.nutrition.fat)} />
        <NutriStat label="Carbs" value={nutritionValue(recipe.nutrition.carbs)} />
      </div>
    </Card>
  );
}

function StepsList({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold">Instructions</h2>
      <ol className="space-y-6">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-start gap-3 sm:w-2/3">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed">{step.text}</p>
            </div>
            {step.image_url && (
              <div className="overflow-hidden rounded-xl border border-border sm:w-1/3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image_url}
                  alt={`Step ${i + 1}`}
                  className="h-40 w-full object-cover sm:h-32"
                  loading="lazy"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

function PaywallCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-white/95 p-6 text-center shadow-xl backdrop-blur">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 1 1 6 0v3Z" />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-bold">Unlock the full recipe</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Upgrade to Pro to reveal the full ingredient list and step-by-step instructions with
        photos — for this and every recipe.
      </p>
      <LinkButton href="/pricing" className="mt-5" fullWidth>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6L12 2Z" />
        </svg>
        Go Pro &amp; Unlock
      </LinkButton>
    </div>
  );
}

function NutriStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 text-center">
      <div className="text-lg font-bold text-brand">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 18 0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}
