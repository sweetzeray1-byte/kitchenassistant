---
name: stripe-web-billing-mirrors-app-pro
description: Web uses direct Stripe billing mirroring the app's Pro plans; both write to the shared subscriptions table. Required env vars + Stripe dashboard setup.
metadata:
  type: project
---

The web app bills **directly via Stripe** (Option B), while the mobile app bills via **RevenueCat** (in-app purchase). Both write to the **same Supabase `subscriptions` table keyed by `user_id`**, which is the single source of truth read by web + app — so a plan bought on either platform is recognized on the other. `getSubscriptionStatus` returns a `provider` field (`'stripe' | 'app' | null`) so clients route management correctly (Stripe portal vs "manage in app").

Web pricing mirrors the app's **Pro** plan (one entitlement, three intervals → all map to backend `premium`/unlimited):
- Pro **Weekly** $10/wk, Pro **Monthly** $20/mo, Pro **Annual** $179.99/yr. (Free tier = $0.)
- There is NO "Basic" tier on web anymore; the old basic/premium scheme was replaced by Free + Pro.

**Required backend env vars** (Stripe won't work without them):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_WEEKLY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL` (recurring price IDs)
- `WEB_URL` (checkout return URLs; falls back to `FRONTEND_URL`)

**Stripe dashboard:** create the 3 recurring prices; add webhook endpoint `https://<api>/api/webhooks/stripe` for `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`; enable the Customer Billing Portal. The Stripe webhook is mounted with `express.raw()` BEFORE `express.json()` in `app.ts` (signature verification needs the raw body).

A server-side guard in `createCheckoutSessionController` blocks a new web checkout when an active/trialing paid plan already exists (prevents cross-platform double-billing). See [[flutter-app-location-and-auth]].
