// src/config/stripe.ts

import Stripe from 'stripe';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';
import { SubscriptionTier } from '../models/Subscription';

dotenv.config();

// Get Stripe API key from environment
const stripeApiKey = process.env.STRIPE_SECRET_KEY;

// Check if Stripe API key is configured
if (!stripeApiKey) {
  logger.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * Secret used to verify Stripe webhook signatures.
 * Set this to the signing secret of your Stripe webhook endpoint (whsec_...).
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * The "Pro" plan billing intervals, mirroring the mobile app (RevenueCat):
 * Weekly / Monthly / Annual. They all grant the same entitlement and map to the
 * `premium` tier in our system — only the Stripe price (and cadence) differs.
 */
export type ProPlan = 'weekly' | 'monthly' | 'annual';

/**
 * Stripe recurring Price IDs for each Pro billing interval. Create these as
 * recurring prices in the Stripe dashboard and set them in the environment.
 * The free tier has no Stripe price.
 */
export const STRIPE_PRO_PRICE_IDS: Record<ProPlan, string> = {
  weekly: process.env.STRIPE_PRICE_PRO_WEEKLY || '',
  monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
};

/** Map a Pro billing interval to its configured Stripe Price ID (or null). */
export const priceIdForPlan = (plan: ProPlan): string | null => {
  return STRIPE_PRO_PRICE_IDS[plan] || null;
};

/**
 * Reverse-map a Stripe Price ID back to a subscription tier. Every configured
 * Pro price (any interval) is the `premium` tier.
 */
export const tierForPriceId = (priceId?: string | null): SubscriptionTier | null => {
  if (!priceId) return null;
  if (Object.values(STRIPE_PRO_PRICE_IDS).some((id) => id && id === priceId)) {
    return 'premium';
  }
  return null;
};

// Create Stripe client with updated API version
export const stripe = stripeApiKey ? new Stripe(stripeApiKey, {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion, // Updated to the latest version supported by the types
}) : null;

// Helper function to check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  return !!stripe;
};
