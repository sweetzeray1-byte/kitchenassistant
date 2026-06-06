// src/services/subscriptionService.ts
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  Subscription,
  SubscriptionTier as ModelSubscriptionTier,
  SubscriptionStatus as ModelSubscriptionStatus,
  SUBSCRIPTION_FEATURE_LIMITS,
  SubscriptionResponse,
} from '../models/Subscription';
import Stripe from 'stripe';
import {
  isStripeConfigured,
  stripe,
  priceIdForTier,
  tierForPriceId,
} from '../config/stripe';

export interface SubscriptionSyncParams {
  userId: string;
  tier: ModelSubscriptionTier;
  status: ModelSubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error(`Error getting user subscription for ${userId}:`, { message: error.message, code: error.code });
      return null;
    }

    if (!data) {
      logger.info(`No subscription found in DB for user ${userId}. Attempting to create/ensure free tier.`);
      return await createFreeSubscription(userId);
    }

    const currentPeriodStart = data.current_period_start ? new Date(data.current_period_start) : null;
    const currentPeriodEnd = data.current_period_end ? new Date(data.current_period_end) : null;

    return {
      id: data.id,
      userId: data.user_id,
      stripeCustomerId: data.stripe_customer_id ?? undefined,
      stripeSubscriptionId: data.stripe_subscription_id ?? undefined,
      tier: data.tier as ModelSubscriptionTier,
      status: data.status as ModelSubscriptionStatus,
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      cancelAtPeriodEnd: data.cancel_at_period_end,
    };
  } catch (error) {
    logger.error(`Unexpected error in getUserSubscription for ${userId}:`, error);
    return null;
  }
};

export const createFreeSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

    const subscriptionDataToInsert = {
      user_id: userId,
      tier: 'free' as ModelSubscriptionTier,
      status: 'active' as ModelSubscriptionStatus,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    };

    const { data: subInsertData, error: subInsertError } = await supabase
      .from('subscriptions')
      .insert(subscriptionDataToInsert)
      .select()
      .single();

    if (subInsertError) {
      if (subInsertError.code === '23505') {
        logger.warn(`createFreeSubscription: Unique violation for user ${userId}, subscription likely already exists. Fetching existing.`);
        const existingSub = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
        if (existingSub.data) {
            return {
                id: existingSub.data.id, userId: existingSub.data.user_id,
                tier: existingSub.data.tier as ModelSubscriptionTier, status: existingSub.data.status as ModelSubscriptionStatus,
                currentPeriodStart: existingSub.data.current_period_start ? new Date(existingSub.data.current_period_start) : null,
                currentPeriodEnd: existingSub.data.current_period_end ? new Date(existingSub.data.current_period_end) : null,
                createdAt: new Date(existingSub.data.created_at), updatedAt: new Date(existingSub.data.updated_at),
                cancelAtPeriodEnd: existingSub.data.cancel_at_period_end,
                stripeCustomerId: existingSub.data.stripe_customer_id ?? undefined,
                stripeSubscriptionId: existingSub.data.stripe_subscription_id ?? undefined,
            };
        }
        logger.error(`createFreeSubscription: Unique violation for user ${userId}, but failed to fetch existing after.`);
        return null;
      }
      logger.error(`Error creating free subscription in DB for user ${userId}:`, subInsertError);
      return null;
    }
    if (!subInsertData || !subInsertData.current_period_start || !subInsertData.current_period_end) {
        logger.error(`No data or period dates returned after inserting free subscription for ${userId}.`);
        return null;
    }
    
    const newPeriodStart = new Date(subInsertData.current_period_start);
    const newPeriodEnd = new Date(subInsertData.current_period_end);

    await resetUsageCounter(userId, newPeriodStart, newPeriodEnd);

    logger.info(`Free subscription and initial usage records created/ensured for user ${userId}`);
    return {
      id: subInsertData.id, userId: subInsertData.user_id,
      tier: subInsertData.tier as ModelSubscriptionTier, status: subInsertData.status as ModelSubscriptionStatus,
      currentPeriodStart: newPeriodStart, currentPeriodEnd: newPeriodEnd,
      createdAt: new Date(subInsertData.created_at), updatedAt: new Date(subInsertData.updated_at),
      cancelAtPeriodEnd: subInsertData.cancel_at_period_end,
      stripeCustomerId: subInsertData.stripe_customer_id ?? undefined,
      stripeSubscriptionId: subInsertData.stripe_subscription_id ?? undefined,
    };
  } catch (error) {
    logger.error(`Unexpected error in createFreeSubscription for user ${userId}:`, error);
    return null;
  }
};

export const resetUsageCounter = async (userId: string, newPeriodStart: Date | null, newPeriodEnd: Date | null): Promise<void> => {
  if (!newPeriodStart || !newPeriodEnd) {
    logger.warn(`resetUsageCounter: Cannot reset usage for user ${userId} due to null period start or end dates.`);
    return;
  }
  logger.info(`Resetting/Ensuring usage counters for user ${userId} for period ${newPeriodStart.toISOString()} to ${newPeriodEnd.toISOString()}`);
  try {
    const commonUsageData = {
      user_id: userId, count: 0,
      period_start: newPeriodStart.toISOString(), period_end: newPeriodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: recipeError } = await supabase.from('recipe_usage').upsert(commonUsageData, { onConflict: 'user_id, period_start' });
    if (recipeError) logger.error(`Error resetting/upserting recipe_usage for user ${userId}:`, recipeError);
    else logger.info(`Recipe usage counter reset/upserted for user ${userId}.`);

    const { error: chatError } = await supabase.from('ai_chat_usage').upsert(commonUsageData, { onConflict: 'user_id, period_start' });
    if (chatError) logger.error(`Error resetting/upserting ai_chat_usage for user ${userId}:`, chatError);
    else logger.info(`AI chat usage counter reset/upserted for user ${userId}.`);
  } catch (error) {
    logger.error(`Unexpected error in resetUsageCounter for user ${userId}:`, error);
  }
};

export const subscriptionSync = async (params: SubscriptionSyncParams): Promise<Subscription | null> => {
  let { userId, tier, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd } = params;

  try {
    if (tier === 'free' && !currentPeriodStart) {
      logger.info(`subscriptionSync: Tier is 'free' and currentPeriodStart is null for user ${userId}. Initializing period dates.`);
      const now = new Date();
      currentPeriodStart = now;
      currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      status = 'active';
    }

    const subscriptionUpsertData = {
      user_id: userId,
      tier: tier,
      status: status,
      current_period_start: currentPeriodStart ? currentPeriodStart.toISOString() : null,
      current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    };

    logger.info(`Service: Upserting subscription for user ${userId} with tier "${tier}", status "${status}", cancelAtEnd: ${cancelAtPeriodEnd}`, { start: subscriptionUpsertData.current_period_start, end: subscriptionUpsertData.current_period_end });
    
    const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionUpsertData, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
      logger.error(`Error upserting subscription in service for user ${userId}:`, error);
      throw error; 
    }
    if (!data) {
      logger.error(`No data returned after upserting subscription for user ${userId} in service.`);
      throw new Error('Subscription sync (service) failed to return data after upsert.');
    }
    
    logger.info(`Subscription successfully synced in DB for user ${userId}. DB ID: ${data.id}, Tier: ${data.tier}, Status: ${data.status}`);

    const dbPeriodStartDate = data.current_period_start ? new Date(data.current_period_start) : null;
    const dbPeriodEndDate = data.current_period_end ? new Date(data.current_period_end) : null;
    const dbCreatedAt = new Date(data.created_at);
    const dbUpdatedAt = new Date(data.updated_at);
    const isNewRecord = dbCreatedAt.getTime() === dbUpdatedAt.getTime();
    const periodJustSetOrConfirmed = currentPeriodStart && dbPeriodStartDate && 
                               (dbPeriodStartDate.getTime() === currentPeriodStart.getTime());

    if (isNewRecord || periodJustSetOrConfirmed) {
      if (dbPeriodStartDate && dbPeriodEndDate) {
        logger.info(`New subscription or new/confirmed billing period detected for ${userId} during sync. Resetting usage counters.`);
        await resetUsageCounter(userId, dbPeriodStartDate, dbPeriodEndDate);
      } else {
        logger.warn(`Not resetting usage counters for ${userId} due to null period dates in synced DB record (after potential free tier init). Start: ${data.current_period_start}, End: ${data.current_period_end}`);
      }
    }

    return {
      id: data.id, userId: data.user_id, stripeCustomerId: data.stripe_customer_id ?? undefined,
      stripeSubscriptionId: data.stripe_subscription_id ?? undefined, tier: data.tier as ModelSubscriptionTier,
      status: data.status as ModelSubscriptionStatus,
      currentPeriodStart: dbPeriodStartDate, currentPeriodEnd: dbPeriodEndDate,
      createdAt: dbCreatedAt, updatedAt: dbUpdatedAt,
      cancelAtPeriodEnd: data.cancel_at_period_end,
    };
  } catch (error) {
    logger.error(`Unexpected error in subscriptionSync service for user ${userId}:`, error);
    throw error;
  }
};

export const getUserRecipeUsage = async (userId: string, periodStart: Date | null): Promise<number> => {
  if (!periodStart) {
    logger.warn(`getUserRecipeUsage: periodStart is null for user ${userId}, returning 0 usage.`);
    return 0;
  }
  try {
    const { data, error } = await supabase
      .from('recipe_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('period_start', periodStart.toISOString())
      .maybeSingle();
    if (error) {
      logger.error(`Error getting recipe usage for user ${userId}, period ${periodStart.toISOString()}:`, error);
      return 0;
    }
    return data?.count || 0;
  } catch (error) {
    logger.error(`Unexpected error in getUserRecipeUsage for user ${userId}:`, error);
    return 0;
  }
};

export const getAiChatUsageCount = async (userId: string, periodStart: Date | null): Promise<number> => {
  if (!periodStart) {
    logger.warn(`getAiChatUsageCount: periodStart is null for user ${userId}, returning 0 usage.`);
    return 0;
  }
  try {
    const { data, error } = await supabase
      .from('ai_chat_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('period_start', periodStart.toISOString())
      .maybeSingle();
    if (error) {
      logger.error(`Error getting AI chat usage for user ${userId}, period ${periodStart.toISOString()}:`, error);
      return 0;
    }
    return data?.count || 0;
  } catch (error) {
    logger.error(`Unexpected error in getAiChatUsageCount for user ${userId}:`, error);
    return 0;
  }
};

export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionResponse | null> => {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      logger.warn(`getSubscriptionStatus: No subscription object ultimately retrieved for user ${userId} (even after potential free tier creation). Cannot provide status.`);
      return null;
    }

    const userTier = subscription.tier;
    const limits = SUBSCRIPTION_FEATURE_LIMITS[userTier] || SUBSCRIPTION_FEATURE_LIMITS.free;

    let recipeUsageCount = 0;
    let aiChatUsageCount = 0;

    if (subscription.currentPeriodStart) {
      recipeUsageCount = await getUserRecipeUsage(userId, subscription.currentPeriodStart);
      if (limits.aiChatRepliesPerPeriod !== Infinity) {
          aiChatUsageCount = await getAiChatUsageCount(userId, subscription.currentPeriodStart);
      }
    } else {
      logger.info(`getSubscriptionStatus for User ${userId} (Tier: ${userTier}): currentPeriodStart is null. Assuming 0 usage for recipe and AI chat for this state.`);
    }

    const recipeLimit = limits.recipeGenerationsPerMonth;
    const recipeRemaining = recipeLimit === Infinity ? -1 : Math.max(0, recipeLimit - recipeUsageCount);
    const aiChatLimit = limits.aiChatRepliesPerPeriod;
    const aiChatRemaining = aiChatLimit === Infinity ? -1 : Math.max(0, aiChatLimit - aiChatUsageCount);

    logger.info(`Service getSubscriptionStatus for ${userId}: Tier=${userTier}, Status=${subscription.status}, Recipes (U/L/R): ${recipeUsageCount}/${recipeLimit === Infinity ? 'Inf' : recipeLimit}/${recipeRemaining === -1 ? 'Inf' : recipeRemaining}, AI Chat (U/L/R): ${aiChatUsageCount}/${aiChatLimit === Infinity ? 'Inf' : aiChatLimit}/${aiChatRemaining === -1 ? 'Inf' : aiChatRemaining}`);

    // Derive where a paid plan is billed so clients can route management correctly.
    // A Stripe subscription id means it was bought on the web; a paid tier without
    // one means it came through in-app purchase (RevenueCat).
    const provider: 'stripe' | 'app' | null =
      userTier === 'free'
        ? null
        : subscription.stripeSubscriptionId
          ? 'stripe'
          : 'app';

    return {
      tier: userTier,
      status: subscription.status,
      provider,
      currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      recipeGenerationsLimit: recipeLimit === Infinity ? -1 : recipeLimit,
      recipeGenerationsUsed: recipeUsageCount,
      recipeGenerationsRemaining: recipeRemaining,
      aiChatRepliesLimit: aiChatLimit === Infinity ? -1 : aiChatLimit,
      aiChatRepliesUsed: aiChatUsageCount,
      aiChatRepliesRemaining: aiChatRemaining,
    };
  } catch (error) {
    logger.error(`Error in service getSubscriptionStatus for user ${userId}:`, error);
    return null;
  }
};

// ***** START IMPLEMENTATION OF trackAiChatReplyGeneration *****
export const trackAiChatReplyGeneration = async (userId: string): Promise<boolean> => {
  logger.info(`trackAiChatReplyGeneration called for ${userId}`);
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription || !subscription.currentPeriodStart || !subscription.currentPeriodEnd) {
      logger.error(`trackAiChatReplyGeneration: User ${userId} has no active subscription or periodStart/End is missing. Cannot track usage.`);
      return false;
    }

    const periodStartISO = subscription.currentPeriodStart.toISOString();
    const periodEndISO = subscription.currentPeriodEnd.toISOString();

    // Option 1: Fetch current count then update (Non-atomic, but simpler without RPC)
    // Check if a record for the current period exists
    const { data: existingUsage, error: fetchError } = await supabase
      .from('ai_chat_usage')
      .select('id, count')
      .eq('user_id', userId)
      .eq('period_start', periodStartISO)
      .maybeSingle();

    if (fetchError) {
      logger.error(`trackAiChatReplyGeneration: Error fetching existing AI chat usage for user ${userId}, period ${periodStartISO}:`, fetchError);
      return false;
    }

    let newCount = 1;
    if (existingUsage) {
      newCount = existingUsage.count + 1;
    }

    const usageDataToUpsert = {
      user_id: userId,
      count: newCount,
      period_start: periodStartISO,
      period_end: periodEndISO,
      updated_at: new Date().toISOString(),
      ...(existingUsage ? {} : { created_at: new Date().toISOString(), id: undefined }), // Set created_at and new id only if inserting
    };
    
    // If existingUsage.id is available, we ensure we are updating that specific row by its id.
    // Otherwise, the onConflict will handle new inserts.
    const onConflictConstraint = 'user_id, period_start'; 
    const upsertQuery = existingUsage?.id 
      ? supabase.from('ai_chat_usage').update(usageDataToUpsert).eq('id', existingUsage.id)
      : supabase.from('ai_chat_usage').upsert(usageDataToUpsert, { onConflict: onConflictConstraint });


    const { error: upsertError } = await upsertQuery.select().single(); // select().single() to ensure it returns something or errors

    if (upsertError) {
      logger.error(`trackAiChatReplyGeneration: Error upserting AI chat usage for user ${userId}, period ${periodStartISO}:`, upsertError);
      return false;
    }

    logger.info(`trackAiChatReplyGeneration: Successfully tracked AI chat reply for user ${userId}. New count: ${newCount} for period ${periodStartISO}.`);
    return true;

  } catch (error) {
    logger.error(`trackAiChatReplyGeneration: Unexpected error for user ${userId}:`, error);
    return false;
  }
};
// ***** END IMPLEMENTATION OF trackAiChatReplyGeneration *****


// --- Stripe specific functions (web billing via direct Stripe integration) ---

/** Translate a Stripe subscription status into our internal status enum. */
const mapStripeStatus = (status: Stripe.Subscription.Status): ModelSubscriptionStatus => {
  switch (status) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'unpaid': return 'past_due';
    case 'incomplete': return 'incomplete';
    case 'canceled':
    case 'incomplete_expired':
    case 'paused':
    default:
      return 'canceled';
  }
};

/**
 * Resolve our internal Supabase user_id for a Stripe subscription. We prefer the
 * metadata we set at checkout, then fall back to matching the stored customer id,
 * and finally the customer's own metadata.
 */
const resolveStripeUserId = async (
  sub: Stripe.Subscription,
  customerId?: string,
): Promise<string | null> => {
  const metaId = sub.metadata?.supabase_user_id;
  if (metaId) return metaId;

  if (customerId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;

    if (stripe) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !(customer as Stripe.DeletedCustomer).deleted) {
          const id = (customer as Stripe.Customer).metadata?.supabase_user_id;
          if (id) return id;
        }
      } catch (err) {
        logger.warn(`resolveStripeUserId: could not retrieve customer ${customerId}:`, err);
      }
    }
  }
  return null;
};

/**
 * Get (or lazily create) the Stripe customer for a user, persisting the customer
 * id on the user's subscription row so the webhook can map events back to them.
 */
export const getOrCreateStripeCustomer = async (
  userId: string,
  email?: string,
): Promise<string | null> => {
  if (!stripe) {
    logger.error('getOrCreateStripeCustomer: Stripe is not configured.');
    return null;
  }
  try {
    // getUserSubscription ensures a (free) subscription row exists for this user.
    const existing = await getUserSubscription(userId);
    if (existing?.stripeCustomerId) return existing.stripeCustomerId;

    const customer = await stripe.customers.create({
      email: email || undefined,
      metadata: { supabase_user_id: userId },
    });

    const { error } = await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) {
      logger.error(`getOrCreateStripeCustomer: failed to persist customer id for ${userId}:`, error);
    }
    return customer.id;
  } catch (error) {
    logger.error(`getOrCreateStripeCustomer: unexpected error for ${userId}:`, error);
    return null;
  }
};

/** Create a Stripe Checkout Session for a paid tier and return its hosted URL. */
export const createCheckoutSession = async (
  userId: string,
  email: string | undefined,
  priceTier: 'basic' | 'premium',
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> => {
  if (!stripe) {
    logger.error('createCheckoutSession: Stripe is not configured.');
    return null;
  }
  const price = priceIdForTier(priceTier);
  if (!price) {
    logger.error(`createCheckoutSession: no Stripe price configured for tier "${priceTier}".`);
    return null;
  }
  try {
    const customerId = await getOrCreateStripeCustomer(userId, email);
    if (!customerId) return null;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: userId, tier: priceTier },
      },
    });
    return session.url;
  } catch (error) {
    logger.error(`createCheckoutSession: unexpected error for ${userId}:`, error);
    return null;
  }
};

/** Create a Stripe Billing Portal session so the user can manage/cancel their plan. */
export const createCustomerPortalSession = async (
  userId: string,
  returnUrl: string,
): Promise<string | null> => {
  if (!stripe) {
    logger.error('createCustomerPortalSession: Stripe is not configured.');
    return null;
  }
  try {
    const existing = await getUserSubscription(userId);
    const customerId = existing?.stripeCustomerId;
    if (!customerId) {
      logger.warn(`createCustomerPortalSession: user ${userId} has no Stripe customer id.`);
      return null;
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  } catch (error) {
    logger.error(`createCustomerPortalSession: unexpected error for ${userId}:`, error);
    return null;
  }
};

/** Flag the user's Stripe subscription to cancel at the end of the current period. */
export const cancelSubscription = async (userId: string): Promise<boolean> => {
  if (!stripe) {
    logger.error('cancelSubscription: Stripe is not configured.');
    return false;
  }
  try {
    const existing = await getUserSubscription(userId);
    if (!existing?.stripeSubscriptionId) {
      logger.warn(`cancelSubscription: user ${userId} has no Stripe subscription id.`);
      return false;
    }
    await stripe.subscriptions.update(existing.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    // Reflect immediately; the webhook will confirm.
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    return true;
  } catch (error) {
    logger.error(`cancelSubscription: unexpected error for ${userId}:`, error);
    return false;
  }
};

/**
 * Write the state of a Stripe subscription into our shared `subscriptions` table
 * — the single source of truth read by both the web and the mobile app. Mirrors
 * the RevenueCat webhook: resets usage on a new billing period and unlocks the
 * user's teased recipes once they are on a paid, active tier.
 */
export const syncStripeSubscription = async (
  sub: Stripe.Subscription,
  opts: { downgradeToFree?: boolean } = {},
): Promise<boolean> => {
  try {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
    const userId = await resolveStripeUserId(sub, customerId);
    if (!userId) {
      logger.error(`syncStripeSubscription: could not resolve user for subscription ${sub.id}.`);
      return false;
    }

    const priceId = sub.items?.data?.[0]?.price?.id;
    const derivedTier = tierForPriceId(priceId) || 'free';
    const tier: ModelSubscriptionTier = opts.downgradeToFree ? 'free' : derivedTier;
    const status: ModelSubscriptionStatus = opts.downgradeToFree
      ? 'canceled'
      : mapStripeStatus(sub.status);

    const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
    const cancelAtPeriodEnd = !!sub.cancel_at_period_end;

    const existing = await getUserSubscription(userId);

    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          tier,
          status,
          current_period_start: periodStart ? periodStart.toISOString() : null,
          current_period_end: periodEnd ? periodEnd.toISOString() : null,
          cancel_at_period_end: cancelAtPeriodEnd,
          stripe_customer_id: customerId || existing?.stripeCustomerId || null,
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) {
      logger.error(`syncStripeSubscription: failed to upsert subscription for ${userId}:`, error);
      return false;
    }

    logger.info(`syncStripeSubscription: user ${userId} synced to tier "${tier}", status "${status}" (sub ${sub.id}).`);

    // Reset usage counters only when the billing period actually advanced.
    const periodChanged =
      !!periodStart &&
      (!existing?.currentPeriodStart ||
        existing.currentPeriodStart.getTime() !== periodStart.getTime());
    if (periodChanged && periodStart && periodEnd) {
      await resetUsageCounter(userId, periodStart, periodEnd);
    }

    // Tease & lock: unlock everything the user previously teased once they're paid + active.
    if (tier !== 'free' && status === 'active') {
      const { error: unlockError } = await supabase
        .from('recipes')
        .update({ is_locked: false })
        .eq('user_id', userId)
        .eq('is_locked', true);
      if (unlockError) {
        logger.error(`syncStripeSubscription: failed to mass-unlock recipes for ${userId}:`, unlockError);
      }
    }

    return true;
  } catch (error) {
    logger.error(`syncStripeSubscription: unexpected error for subscription ${sub.id}:`, error);
    return false;
  }
};
export const trackRecipeGeneration = async (userId: string): Promise<boolean> => { 
    logger.warn(`trackRecipeGeneration called for ${userId} - STUBBED (should ideally interact with recipe_usage table)`); 
    return false; 
};

export const hasReachedRecipeLimit = async (userId: string): Promise<boolean> => { 
    logger.warn(`hasReachedRecipeLimit called for ${userId} - STUBBED (should check usage against limits)`); 
    return true;
};