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
 * Stripe recurring Price IDs for each paid tier. Create these as monthly
 * recurring prices in the Stripe dashboard and set them in the environment.
 * The free tier has no Stripe price.
 */
export const STRIPE_PRICE_IDS: Record<Exclude<SubscriptionTier, 'free'>, string> = {
  basic: process.env.STRIPE_PRICE_BASIC || '',
  premium: process.env.STRIPE_PRICE_PREMIUM || '',
};

/** Map a paid tier to its configured Stripe Price ID (or null if not configured). */
export const priceIdForTier = (tier: Exclude<SubscriptionTier, 'free'>): string | null => {
  return STRIPE_PRICE_IDS[tier] || null;
};

/** Reverse-map a Stripe Price ID back to one of our subscription tiers. */
export const tierForPriceId = (priceId?: string | null): SubscriptionTier | null => {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_IDS.premium) return 'premium';
  if (priceId === STRIPE_PRICE_IDS.basic) return 'basic';
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
