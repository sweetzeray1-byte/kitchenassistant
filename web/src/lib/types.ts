// Shared types mirroring the Delisio backend contracts (and the Flutter models).

export interface NutritionInfo {
  calories: number;
  protein: string | number;
  fat: string | number;
  carbs: string | number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  sodium?: number;
}

export interface RecipeStep {
  text: string;
  illustration?: string;
  image_url?: string | null;
}

export interface Recipe {
  id?: string;
  title: string;
  servings: number;
  ingredients: string[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
  query?: string;
  createdAt?: string;
  prepTime?: number | null;
  cookTime?: number | null;
  totalTime?: number | null;
  requestId?: string;
  isFavorite?: boolean;
  category?: string | null;
  tags?: string[] | null;
  views?: number | null;
  quality_score?: number | null;
  isLocked?: boolean;
  thumbnail_url?: string | null;
  // Progressive-display only
  progress?: number;
  isPartial?: boolean;
}

export type RecipeStatusState =
  | "waiting"
  | "active"
  | "delayed"
  | "completed"
  | "failed"
  | "cancelled"
  | "not_found"
  | "processing";

export interface RecipeStatusResponse {
  status?: RecipeStatusState;
  progress?: number;
  requestId?: string;
  partialRecipe?: Recipe | null;
  message?: string;
  // When completed, the backend may spread the full recipe onto the root object.
  [key: string]: unknown;
}

export interface DiscoverResponse {
  recipes: Recipe[];
  can_generate?: boolean;
  suggested_query?: string | null;
}

export interface RecipeCategory {
  id?: string;
  name?: string;
  category?: string;
  count?: number;
  [key: string]: unknown;
}

// ---- Chat ----
export interface IntentMeta {
  is_recipe_intent: boolean;
  hero_recipe_title?: string | null;
  prep_time?: string | null;
  tags?: string[];
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[] | null;
  intent_meta?: IntentMeta | null;
  error_type?: string;
  status_code?: number;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

// ---- Subscription ----
export type SubscriptionTier = "free" | "basic" | "premium";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "trialing";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  recipeGenerationsLimit: number; // -1 = unlimited
  recipeGenerationsUsed: number;
  recipeGenerationsRemaining: number; // -1 = unlimited
  aiChatRepliesLimit: number; // -1 = unlimited
  aiChatRepliesUsed: number;
  aiChatRepliesRemaining: number; // -1 = unlimited
}

// ---- User / preferences ----
export interface UserPreferences {
  dietaryRestrictions?: string[];
  favoriteCuisines?: string[];
  allergies?: string[];
  cookingSkill?: "beginner" | "intermediate" | "advanced";
  likedFoodCategoryIds?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  preferences?: UserPreferences;
}
