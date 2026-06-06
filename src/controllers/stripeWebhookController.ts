// src/controllers/stripeWebhookController.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';
import { syncStripeSubscription } from '../services/subscriptionService';
import { logger } from '../utils/logger';

/**
 * Stripe webhook handler for web billing.
 *
 * IMPORTANT: this route must be mounted with a raw body parser
 * (express.raw({ type: 'application/json' })) BEFORE express.json(), because
 * Stripe signature verification needs the exact raw request bytes.
 */
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!stripe) {
    logger.error('Stripe webhook: Stripe is not configured on the server.');
    res.status(500).send('Stripe not configured.');
    return;
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    logger.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set.');
    res.status(500).send('Webhook secret not configured.');
    return;
  }

  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer (see express.raw mount in app.ts)
      signature as string,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Stripe webhook: signature verification failed: ${msg}`);
    res.status(400).send(`Webhook Error: ${msg}`);
    return;
  }

  logger.info(`Stripe webhook: received event ${event.type} (${event.id}).`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Only subscription checkouts concern us here.
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncStripeSubscription(sub);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await syncStripeSubscription(sub);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        // Subscription ended for good — drop the user back to the free tier.
        await syncStripeSubscription(sub, { downgradeToFree: true });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subField = (invoice as unknown as { subscription?: string | Stripe.Subscription })
          .subscription;
        const subId = typeof subField === 'string' ? subField : subField?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncStripeSubscription(sub); // status will map to past_due
        }
        break;
      }

      default:
        logger.info(`Stripe webhook: unhandled event type ${event.type}.`);
    }

    // Acknowledge receipt so Stripe stops retrying.
    res.status(200).json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Stripe webhook: error processing ${event.type} (${event.id}): ${msg}`);
    // 500 tells Stripe to retry later.
    res.status(500).send('Internal server error processing Stripe webhook.');
  }
};
