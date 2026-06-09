# Memory Index

- [Web is a separate Next.js app](web-is-separate-nextjs.md) — the web platform is Next.js, NOT Flutter web; never convert the Flutter app for web.
- [Dev machine flaky outbound TLS](dev-machine-flaky-outbound-tls.md) — local Node can't reliably reach Supabase/Upstash (ECONNRESET/ENOTFOUND/fetch failed); suspect this for "can't fetch" bugs; prefer Railway backend.
- [Railway deployment setup](railway-deployment-setup.md) — backend/worker/web topology, ports, and the admin-server-on-import gotcha.
- [Public recipes filter](delisio-public-recipes-filter.md) — Discover/Trending/Categories only show recipes with user_id IS NULL.
- [Flutter app location & auth](flutter-app-location-and-auth.md) — app is at C:\Users\mukas\StudioProjects\delisioapp; package, SHA-1s, and Google sign-in ApiException:10 root cause (console config, not code).
- [Stripe web billing mirrors app Pro](stripe-web-billing-mirrors-app-pro.md) — web bills via Stripe (Free + Pro weekly/monthly/annual), app via RevenueCat; shared subscriptions table; required env vars + Stripe setup.
- [SEO initiative plan](seo-initiative-plan.md) — web SEO audit + phased plan (sitemap/robots/canonical/ItemList → programmatic ground-beef & lunch hubs); open questions on domain, slugs, hub intros.
