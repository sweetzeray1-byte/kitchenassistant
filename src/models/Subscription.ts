// src/models/Subscription.ts

/**
 * Subscription tiers available in the application.
 */
export type SubscriptionTier = 'free' | 'basic' | 'premium';

/**
 * Subscription status values.
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

/**
 * Interface for the subscription object (reflecting your DB structure).
 * Dates can now be null based on updated supabase.ts and database schema.
 */
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null; // MODIFIED: Can be null
  currentPeriodEnd: Date | null;   // MODIFIED: Can be null
  createdAt: Date;
  updatedAt: Date;
  cancelAtPeriodEnd: boolean;
}

// UsageRecord
export interface UsageRecord {
  id: string;
  userId: string;
  count: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI Chat Usage
export interface AiChatUsageRecord {
  id: string;
  userId: string;
  count: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for feature limits.
 */
export interface FeatureLimits {
  recipeGenerationsPerMonth: number;
  aiChatRepliesPerPeriod: number;
  imageQuality: 'standard' | 'hd';
  imageSize: '1024x1024' | '1792x1024';
}

export const SUBSCRIPTION_FEATURE_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    recipeGenerationsPerMonth: 1,
    aiChatRepliesPerPeriod: 40, // Registered free users
    imageQuality: 'standard',
    imageSize: '1024x1024',
  },
  basic: {
    recipeGenerationsPerMonth: 10,
    aiChatRepliesPerPeriod: 100,
    imageQuality: 'hd',
    imageSize: '1024x1024',
  },
  premium: {
    recipeGenerationsPerMonth: Infinity,
    aiChatRepliesPerPeriod: Infinity,
    imageQuality: 'hd',
    imageSize: '1792x1024',
  },
};

export function getFeatureLimits(tier: SubscriptionTier): FeatureLimits {
  return SUBSCRIPTION_FEATURE_LIMITS[tier] || SUBSCRIPTION_FEATURE_LIMITS.free;
}

/**
 * AI chat replies allowed for an UNREGISTERED (anonymous) user before they must
 * register. After this many replies the chat endpoint returns a
 * REGISTRATION_REQUIRED response and the app shows a mandatory sign-up prompt.
 * Registered free users get the higher SUBSCRIPTION_FEATURE_LIMITS.free limit (40).
 */
export const ANONYMOUS_AI_CHAT_REPLY_LIMIT = 10;

/**
 * Type for subscription response to clients (Flutter app).
 */
export interface SubscriptionResponse {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  /**
   * Where the current paid plan is billed, so clients can route management
   * correctly across platforms:
   *  - 'stripe' → bought on the web; manage via the Stripe billing portal.
   *  - 'app'    → bought via in-app purchase (RevenueCat); manage in the mobile app.
   *  - null     → free tier / no active paid plan.
   */
  provider: 'stripe' | 'app' | null;
  currentPeriodEnd: string | null; // Already string | null, which is good
  cancelAtPeriodEnd: boolean;
  recipeGenerationsLimit: number;
  recipeGenerationsUsed: number;
  recipeGenerationsRemaining: number;
  aiChatRepliesLimit: number;
  aiChatRepliesUsed: number;
  aiChatRepliesRemaining: number;
}