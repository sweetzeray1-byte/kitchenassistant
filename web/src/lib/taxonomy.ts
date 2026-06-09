/**
 * Programmatic SEO hub taxonomy.
 *
 * Each hub is a server-rendered landing page that targets a high-volume keyword
 * cluster (see the keyword research) and is populated from the existing
 * `/api/recipes/discover` endpoint via its `filter`. This file is pure data +
 * helpers (no I/O) so it can be imported from both server and client components.
 *
 * Three hub kinds / route prefixes:
 *   - ingredient → /ingredients/[slug]  (filter by `ingredient`: title + ingredients[] match)
 *   - meal       → /meals/[slug]        (filter by real recipe `category`)
 *   - category   → /recipes/[slug]      (filter by real recipe `category`: dish type / diet)
 *
 * Deeper modifier/audience intersections (e.g. /meals/lunch/work) come later, once the
 * backend supports the matching filters.
 */

export type HubKind = "ingredient" | "meal" | "category";

export interface HubDef {
  kind: HubKind;
  /** URL segment, e.g. "ground-beef". */
  slug: string;
  /** On-page H1. */
  h1: string;
  /** <title> (the layout template appends "| Kitchen Assistant"). */
  metaTitle: string;
  metaDescription: string;
  /** Unique 2–3 sentence intro under the H1 — establishes relevance and avoids thin content. */
  intro: string;
  /**
   * Filter passed to GET /api/recipes/discover to populate the grid.
   * `ingredient` matches title + ingredients[]; `category`/`query`/`tags` use standard discovery.
   */
  filter: { category?: string; ingredient?: string; query?: string; tags?: string[] };
  /** Slugs of sibling hubs (same kind) to cross-link for PageRank sculpting. */
  related: string[];
  /** Seed query for the "generate with AI" funnel when the grid is sparse. */
  generateSeed: string;
}

export const INGREDIENT_HUBS: HubDef[] = [
  {
    kind: "ingredient",
    slug: "ground-beef",
    h1: "Ground Beef Recipes",
    metaTitle: "Ground Beef Recipes — Easy Dinner Ideas",
    metaDescription:
      "Easy, crowd-pleasing ground beef recipes and dinner ideas — from skillet meals to casseroles, each with step-by-step instructions and nutrition.",
    intro:
      "Ground beef is the ultimate weeknight workhorse: affordable, fast, and endlessly versatile. Browse easy ground beef dinner ideas below — skillet suppers, casseroles, and family-friendly meals — or generate a brand-new one with AI in seconds.",
    filter: { ingredient: "ground beef" },
    related: ["hamburger", "chicken"],
    generateSeed: "easy ground beef dinner",
  },
  {
    kind: "ingredient",
    slug: "hamburger",
    h1: "Hamburger Recipes",
    metaTitle: "Hamburger Recipes — Quick Hamburger Meat Ideas",
    metaDescription:
      "Simple hamburger recipes and hamburger meat dinner ideas the whole family will love, each with ingredients, steps, and nutrition.",
    intro:
      "From classic burgers to hearty hamburger meat dinners, these recipes turn a pound of beef into something delicious. Explore the ideas below or let our AI chef build a custom hamburger recipe for you.",
    filter: { query: "hamburger" },
    related: ["ground-beef", "chicken"],
    generateSeed: "easy hamburger meat dinner",
  },
  {
    kind: "ingredient",
    slug: "chicken",
    h1: "Chicken Recipes",
    metaTitle: "Chicken Recipes — Easy Chicken Dinner Ideas",
    metaDescription:
      "Easy chicken recipes for dinner — quick skillet dishes, bakes, and healthy mains with step-by-step instructions and nutrition.",
    intro:
      "Lean, quick, and a fit for almost any cuisine, chicken is the perfect base for an easy dinner. Browse popular chicken recipes below, or generate a new one tailored to what's in your kitchen.",
    filter: { ingredient: "chicken" },
    related: ["ground-beef", "hamburger"],
    generateSeed: "easy chicken dinner",
  },
];

export const MEAL_HUBS: HubDef[] = [
  {
    kind: "meal",
    slug: "lunch",
    h1: "Lunch Ideas & Recipes",
    metaTitle: "Lunch Ideas — Easy Recipes for Work & Home",
    metaDescription:
      "Easy lunch ideas and recipes for work or home — quick, satisfying midday meals with step-by-step instructions and nutrition.",
    intro:
      "Beat the midday slump with lunch ideas that actually fit your schedule — quick enough for a work break, satisfying enough to keep you going. Browse easy lunch recipes below or generate one around whatever you have on hand.",
    filter: { category: "lunch" },
    related: ["dinner", "breakfast"],
    generateSeed: "easy lunch for work",
  },
  {
    kind: "meal",
    slug: "dinner",
    h1: "Dinner Ideas & Recipes",
    metaTitle: "Dinner Ideas — Easy Recipes for Tonight",
    metaDescription:
      "Easy dinner ideas and recipes for tonight — family-friendly mains with step-by-step instructions and nutrition.",
    intro:
      "Stuck on what to make tonight? These easy dinner ideas cover quick weeknight meals and comforting family favorites alike. Explore the recipes below or let AI plan dinner around your cravings.",
    filter: { category: "dinner" },
    related: ["lunch", "breakfast"],
    generateSeed: "easy dinner for tonight",
  },
  {
    kind: "meal",
    slug: "breakfast",
    h1: "Breakfast Recipes",
    metaTitle: "Breakfast Recipes — Easy Morning Meal Ideas",
    metaDescription:
      "Easy breakfast recipes and morning meal ideas — from quick weekday eats to weekend brunch, with steps and nutrition.",
    intro:
      "Start the day right with breakfast recipes for every kind of morning — five-minute weekday fuel and slow weekend brunches. Browse the ideas below or generate a custom breakfast in seconds.",
    filter: { category: "breakfast" },
    related: ["lunch", "dinner"],
    generateSeed: "easy breakfast",
  },
  {
    kind: "meal",
    slug: "dessert",
    h1: "Dessert Recipes",
    metaTitle: "Dessert Recipes — Easy Sweet Treats",
    metaDescription:
      "Easy dessert recipes and sweet treats — cakes, cookies, and more with step-by-step instructions and nutrition.",
    intro:
      "Satisfy any sweet tooth with dessert recipes ranging from quick no-bake treats to showstopping bakes. Explore the ideas below or have our AI chef whip up something new.",
    filter: { category: "dessert" },
    related: ["lunch", "dinner"],
    generateSeed: "easy dessert",
  },
];

export const CATEGORY_HUBS: HubDef[] = [
  {
    kind: "category",
    slug: "healthy",
    h1: "Healthy Recipes",
    metaTitle: "Healthy Recipes — Easy & Nutritious Meal Ideas",
    metaDescription:
      "Easy healthy recipes for every meal — balanced, nutritious dishes with step-by-step instructions and full nutrition info.",
    intro:
      "Eating well doesn't have to mean bland or complicated. These healthy recipes balance flavor and nutrition — every one comes with a full macro breakdown so you know exactly what's on your plate. Browse below or generate a healthy meal around your goals.",
    filter: { category: "healthy" },
    related: ["quick-easy", "salad", "vegetarian"],
    generateSeed: "healthy dinner",
  },
  {
    kind: "category",
    slug: "quick-easy",
    h1: "Quick & Easy Recipes",
    metaTitle: "Quick & Easy Recipes — Fast Meals for Busy Days",
    metaDescription:
      "Quick and easy recipes for busy days — fast meals with minimal prep, step-by-step instructions, and nutrition.",
    intro:
      "Short on time? These quick and easy recipes get dinner on the table fast, with simple ingredients and minimal cleanup. Browse the fastest crowd-pleasers below or generate a speedy meal in seconds.",
    filter: { category: "quick-easy" },
    related: ["healthy", "pasta", "soup"],
    generateSeed: "quick easy dinner",
  },
  {
    kind: "category",
    slug: "vegetarian",
    h1: "Vegetarian Recipes",
    metaTitle: "Vegetarian Recipes — Easy Meat-Free Meals",
    metaDescription:
      "Easy vegetarian recipes and meat-free meal ideas — hearty, satisfying dishes with step-by-step instructions and nutrition.",
    intro:
      "Meat-free doesn't mean missing out. These vegetarian recipes are hearty, colorful, and satisfying — from veggie-packed mains to comforting classics. Explore the ideas below or generate a vegetarian meal that fits your taste.",
    filter: { category: "vegetarian" },
    related: ["vegan", "gluten-free", "salad"],
    generateSeed: "easy vegetarian dinner",
  },
  {
    kind: "category",
    slug: "vegan",
    h1: "Vegan Recipes",
    metaTitle: "Vegan Recipes — Easy Plant-Based Meals",
    metaDescription:
      "Easy vegan recipes and plant-based meal ideas — dairy- and egg-free dishes with step-by-step instructions and nutrition.",
    intro:
      "Fully plant-based and full of flavor — these vegan recipes skip the animal products without skipping satisfaction. Browse dairy- and egg-free mains, bowls, and bakes below, or generate a vegan dish on demand.",
    filter: { category: "vegan" },
    related: ["vegetarian", "gluten-free", "healthy"],
    generateSeed: "easy vegan dinner",
  },
  {
    kind: "category",
    slug: "gluten-free",
    h1: "Gluten-Free Recipes",
    metaTitle: "Gluten-Free Recipes — Easy Wheat-Free Meals",
    metaDescription:
      "Easy gluten-free recipes and wheat-free meal ideas — naturally gluten-free dishes with step-by-step instructions and nutrition.",
    intro:
      "Living gluten-free is easier with recipes built around it from the start. These gluten-free meals are naturally wheat-free and never an afterthought. Browse the dishes below or generate a gluten-free recipe around what you can eat.",
    filter: { category: "gluten-free" },
    related: ["vegan", "vegetarian", "healthy"],
    generateSeed: "easy gluten-free dinner",
  },
  {
    kind: "category",
    slug: "pasta",
    h1: "Pasta Recipes",
    metaTitle: "Pasta Recipes — Easy Pasta Dinner Ideas",
    metaDescription:
      "Easy pasta recipes and dinner ideas — comforting Italian-inspired dishes with step-by-step instructions and nutrition.",
    intro:
      "Few dinners please a crowd like a great bowl of pasta. These pasta recipes run from 20-minute weeknight skillets to rich, slow-simmered sauces. Browse the favorites below or have AI build a pasta dish around your pantry.",
    filter: { category: "pasta" },
    related: ["quick-easy", "soup", "vegetarian"],
    generateSeed: "easy pasta dinner",
  },
  {
    kind: "category",
    slug: "soup",
    h1: "Soup Recipes",
    metaTitle: "Soup Recipes — Easy Soups & Stews",
    metaDescription:
      "Easy soup and stew recipes — cozy, comforting bowls with step-by-step instructions and nutrition.",
    intro:
      "Cozy, comforting, and easy to batch-cook, soups are a kitchen staple all year round. These soup and stew recipes warm you up without much fuss. Browse the bowls below or generate a soup around whatever's in the fridge.",
    filter: { category: "soup" },
    related: ["salad", "quick-easy", "healthy"],
    generateSeed: "easy soup",
  },
  {
    kind: "category",
    slug: "salad",
    h1: "Salad Recipes",
    metaTitle: "Salad Recipes — Fresh & Healthy Salad Ideas",
    metaDescription:
      "Fresh, healthy salad recipes — vibrant bowls and sides with step-by-step instructions and nutrition.",
    intro:
      "Crisp, fresh, and endlessly customizable, salads are so much more than a side. These salad recipes go from light lunches to hearty, protein-packed mains. Browse the bowls below or generate a salad around your favorite ingredients.",
    filter: { category: "salad" },
    related: ["healthy", "vegetarian", "soup"],
    generateSeed: "healthy salad",
  },
  {
    kind: "category",
    slug: "seafood",
    h1: "Seafood Recipes",
    metaTitle: "Seafood Recipes — Easy Fish & Shellfish Dishes",
    metaDescription:
      "Easy seafood recipes — fish and shellfish dishes with step-by-step instructions and nutrition.",
    intro:
      "Quick-cooking and packed with lean protein, seafood makes for an effortless, elegant dinner. These recipes span flaky fish, garlicky shrimp, and more. Browse the dishes below or generate a seafood meal in seconds.",
    filter: { category: "seafood" },
    related: ["healthy", "salad", "quick-easy"],
    generateSeed: "easy seafood dinner",
  },
];

export const ALL_HUBS: HubDef[] = [...INGREDIENT_HUBS, ...MEAL_HUBS, ...CATEGORY_HUBS];

/** Site-relative path for a hub. */
export function hubPath(hub: HubDef): string {
  switch (hub.kind) {
    case "ingredient":
      return `/ingredients/${hub.slug}`;
    case "meal":
      return `/meals/${hub.slug}`;
    case "category":
      return `/recipes/${hub.slug}`;
  }
}

/** Look up a hub by kind + slug. Returns undefined for unknown slugs (→ 404). */
export function getHub(kind: HubKind, slug: string): HubDef | undefined {
  const pool =
    kind === "ingredient" ? INGREDIENT_HUBS : kind === "meal" ? MEAL_HUBS : CATEGORY_HUBS;
  return pool.find((h) => h.slug === slug);
}
