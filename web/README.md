# Kitchen Assistant — Web

The Next.js website for Kitchen Assistant, an AI recipe generation platform. It
talks to the existing Delisio backend (the Express/BullMQ API in the parent repo)
and uses Supabase Auth directly in the browser, mirroring the Flutter app.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (brand theme in `src/app/globals.css`)
- **@supabase/supabase-js** for auth/session
- **@tanstack/react-query** for data fetching & the recipe-status polling

## Features (parity with the mobile app)

- Email/password auth (Supabase) + password reset
- AI recipe generation with live progress polling + cancel
- Recipe detail with **Tease & Lock** blur overlay for locked recipes
- Discover / search with the **Magic Search** "create with AI" funnel
- AI Chef chat with suggestion chips + **RecipeIntentCard**
- Favorites, profile, cooking preferences editor
- Subscription status + pricing (Stripe web checkout is stubbed — see below)

## Getting started

```bash
cd web
cp .env.example .env.local   # then fill in values (already populated for dev)
npm install
npm run dev                  # http://localhost:3000
```

### Environment

`.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL (e.g. Railway prod or `http://localhost:3002`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon** key (never the service-role key) |

> The backend must be reachable for recipes/chat/discover to work. If you point at
> a local backend, you also need Redis + the BullMQ workers running (`npm run dev`
> in the parent repo).

## Architecture notes

- `src/lib/supabase.ts` — browser Supabase client; source of the access token.
- `src/lib/api.ts` — typed API client; attaches `Authorization: Bearer <token>`
  to every backend call and normalizes errors (`ApiError`).
- `src/lib/types.ts` — shared types mirroring the backend/Flutter models.
- `src/lib/auth-context.tsx` — session + profile provider (`useAuth`).
- `src/lib/use-recipe-generation.ts` — start + poll `/api/recipes/status/:id`.

## Stripe (deferred)

Web checkout is intentionally not wired up yet. The pricing page shows plans and
the user's current tier, with upgrade buttons disabled. To enable it later:

1. Implement the stubbed Stripe service functions in the backend
   (`src/services/subscriptionService.ts`) and add a Stripe webhook.
2. Add `NEXT_PUBLIC_STRIPE_*` price IDs and call `/api/subscriptions/checkout`
   from the pricing page (returns `{ checkoutUrl }`).
