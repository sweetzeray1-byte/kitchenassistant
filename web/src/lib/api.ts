import { getAccessToken } from "./supabase";
import type {
  ChatHistoryItem,
  ChatResponse,
  DiscoverResponse,
  Recipe,
  RecipeCategory,
  RecipeStatusResponse,
  SubscriptionInfo,
  UserPreferences,
  UserProfile,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://kitchenassistant-production.up.railway.app";

export class ApiError extends Error {
  status: number;
  errorType?: string;
  payload?: unknown;
  constructor(message: string, status: number, errorType?: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorType = errorType;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Attach the Supabase access token if available. Default: true. */
  auth?: boolean;
  /** Require auth — throw if no token. Default: false. */
  requireAuth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, requireAuth = false, query, signal } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth || requireAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new ApiError("You must be signed in to do that.", 401, "NOT_AUTHENTICATED");
    }
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const obj = (data ?? {}) as Record<string, unknown>;
    const nestedMessage =
      typeof obj.error === "object" && obj.error
        ? (obj.error as Record<string, unknown>).message
        : undefined;
    const message =
      (nestedMessage as string) ||
      (obj.message as string) ||
      (obj.reply as string) ||
      `Request failed (${res.status})`;
    const errorType =
      (obj.error_type as string) ||
      (typeof obj.error === "object" && obj.error
        ? ((obj.error as Record<string, unknown>).type as string)
        : undefined);
    throw new ApiError(message, res.status, errorType, data);
  }

  return data as T;
}

// ---------- Recipes ----------
export const api = {
  async generateRecipe(query: string, save = false) {
    return request<{ requestId: string; status: string; message: string }>(
      "/api/recipes",
      { method: "POST", body: { query, save } },
    );
  },

  async getRecipeStatus(requestId: string, signal?: AbortSignal) {
    return request<RecipeStatusResponse>(`/api/recipes/status/${requestId}`, { signal });
  },

  async cancelRecipe(requestId: string) {
    return request<{ success: boolean; message: string }>("/api/recipes/cancel", {
      method: "POST",
      body: { requestId },
      auth: false,
    });
  },

  async discover(params: {
    query?: string;
    category?: string;
    tags?: string[];
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    return request<DiscoverResponse>("/api/recipes/discover", {
      query: {
        query: params.query,
        category: params.category,
        tags: params.tags?.join(","),
        sort: params.sort ?? "recent",
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
  },

  async popular(limit = 10) {
    return request<{ recipes: Recipe[] }>("/api/recipes/popular", {
      query: { limit },
    });
  },

  async categories() {
    return request<{ categories: RecipeCategory[] }>("/api/recipes/categories", {
      auth: false,
    });
  },

  async categoryRecipes(
    category: string,
    params: { sort?: string; limit?: number; offset?: number } = {},
  ) {
    return request<{ recipes: Recipe[] }>(`/api/recipes/category/${category}`, {
      query: {
        sort: params.sort ?? "recent",
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
  },

  async getRecipe(id: string) {
    return request<{ recipe: Recipe; isFavorite: boolean }>(`/api/recipes/${id}`);
  },

  async userRecipes() {
    return request<{ recipes: Recipe[] }>("/api/users/recipes", { requireAuth: true });
  },

  async deleteRecipe(id: string) {
    return request<{ message: string }>(`/api/recipes/${id}`, {
      method: "DELETE",
      requireAuth: true,
    });
  },

  // ---------- Favorites ----------
  async favorites() {
    return request<{ recipes: Recipe[] }>("/api/recipes/favorites", {
      requireAuth: true,
    });
  },

  async addFavorite(id: string) {
    return request<{ message: string }>(`/api/recipes/${id}/favorite`, {
      method: "POST",
      requireAuth: true,
    });
  },

  async removeFavorite(id: string) {
    return request<{ message: string }>(`/api/recipes/${id}/favorite`, {
      method: "DELETE",
      requireAuth: true,
    });
  },

  // ---------- Chat ----------
  async chat(payload: {
    conversation_id: string;
    message: string;
    message_history: ChatHistoryItem[];
  }) {
    return request<ChatResponse>("/api/chat", { method: "POST", body: payload });
  },

  // ---------- Subscription ----------
  async subscriptionStatus() {
    const res = await request<{ subscription: SubscriptionInfo }>(
      "/api/subscriptions/status",
      { requireAuth: true },
    );
    return res.subscription;
  },

  /** Start Stripe Checkout for a paid tier; returns the hosted checkout URL. */
  async createCheckout(tier: "basic" | "premium") {
    const res = await request<{ checkoutUrl: string }>(
      "/api/subscriptions/checkout",
      { method: "POST", body: { tier }, requireAuth: true },
    );
    return res.checkoutUrl;
  },

  /** Open the Stripe Billing Portal to manage/cancel an existing subscription. */
  async billingPortal(returnUrl?: string) {
    const res = await request<{ portalUrl: string }>(
      "/api/subscriptions/portal",
      { method: "POST", body: { returnUrl }, requireAuth: true },
    );
    return res.portalUrl;
  },

  // ---------- Auth / profile ----------
  async me() {
    const res = await request<{ user: UserProfile }>("/api/auth/me", {
      requireAuth: true,
    });
    return res.user;
  },

  async updatePreferences(prefs: UserPreferences) {
    const res = await request<{ preferences: UserPreferences }>(
      "/api/auth/preferences",
      { method: "PUT", body: prefs, requireAuth: true },
    );
    return res.preferences;
  },
};

/**
 * Decide whether a recipe-status payload represents a finished recipe.
 * The backend either returns { status: 'completed', ...recipe } or spreads
 * the bare recipe (with id/title and no status) onto the root object.
 */
export function isRecipeComplete(res: RecipeStatusResponse): boolean {
  if (res.status === "completed") return true;
  if (!res.status && (res.title || res.id)) return true;
  return false;
}

export function extractRecipeFromStatus(res: RecipeStatusResponse): Recipe | null {
  if (isRecipeComplete(res)) {
    return res as unknown as Recipe;
  }
  return (res.partialRecipe as Recipe) ?? null;
}
