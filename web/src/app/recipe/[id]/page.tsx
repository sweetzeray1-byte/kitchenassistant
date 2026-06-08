import type { Metadata } from "next";
import { RecipeDetail } from "@/components/recipe-detail";
import type { Recipe } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

// Server-side fetch of a PUBLIC recipe (GET /api/recipes/:id uses optionalAuthenticate,
// so no token is needed). Used for SEO: <meta> tags + schema.org/Recipe JSON-LD.
// Requests are deduped + cached for an hour so generateMetadata and the page share one call.
async function fetchRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { recipe?: Recipe };
    return data.recipe ?? null;
  } catch {
    return null;
  }
}

// Trim a headnote to a clean ~155-char meta description (whole words, no mid-word cut).
function toMetaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

// schema.org NutritionInformation wants strings; our values may be number or "15g".
function withUnit(value: string | number | undefined, unit: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return typeof value === "number" ? `${value} ${unit}` : String(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await fetchRecipe(id);

  if (!recipe) {
    return { title: "Recipe", description: "View this recipe on Delisio." };
  }

  const title = `${recipe.title} Recipe`;
  const description = recipe.description
    ? toMetaDescription(recipe.description)
    : `Ingredients, step-by-step instructions, and nutrition for ${recipe.title}.`;
  const ogImages = recipe.thumbnail_url ? [{ url: recipe.thumbnail_url }] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: "article", images: ogImages },
    twitter: {
      card: recipe.thumbnail_url ? "summary_large_image" : "summary",
      title,
      description,
      images: recipe.thumbnail_url ? [recipe.thumbnail_url] : undefined,
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await fetchRecipe(id);

  // schema.org/Recipe structured data → eligible for Google rich results.
  const jsonLd = recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.title,
        ...(recipe.description ? { description: recipe.description } : {}),
        ...(recipe.thumbnail_url ? { image: [recipe.thumbnail_url] } : {}),
        ...(recipe.servings ? { recipeYield: `${recipe.servings} servings` } : {}),
        ...(recipe.category ? { recipeCategory: recipe.category } : {}),
        ...(recipe.tags && recipe.tags.length ? { keywords: recipe.tags.join(", ") } : {}),
        ...(recipe.prepTime ? { prepTime: `PT${recipe.prepTime}M` } : {}),
        ...(recipe.cookTime ? { cookTime: `PT${recipe.cookTime}M` } : {}),
        ...(recipe.totalTime ? { totalTime: `PT${recipe.totalTime}M` } : {}),
        ...(recipe.ingredients?.length ? { recipeIngredient: recipe.ingredients } : {}),
        ...(recipe.steps?.length
          ? {
              recipeInstructions: recipe.steps.map((step, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                text: step.text,
                ...(step.image_url ? { image: step.image_url } : {}),
              })),
            }
          : {}),
        ...(recipe.nutrition
          ? {
              nutrition: {
                "@type": "NutritionInformation",
                ...(recipe.nutrition.calories
                  ? { calories: `${recipe.nutrition.calories} calories` }
                  : {}),
                ...(withUnit(recipe.nutrition.protein, "g")
                  ? { proteinContent: withUnit(recipe.nutrition.protein, "g") }
                  : {}),
                ...(withUnit(recipe.nutrition.fat, "g")
                  ? { fatContent: withUnit(recipe.nutrition.fat, "g") }
                  : {}),
                ...(withUnit(recipe.nutrition.carbs, "g")
                  ? { carbohydrateContent: withUnit(recipe.nutrition.carbs, "g") }
                  : {}),
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <RecipeDetail id={id} />
    </>
  );
}
