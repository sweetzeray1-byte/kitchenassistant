# Memory Index

- [Web is a separate Next.js app](web-is-separate-nextjs.md) — the web platform is Next.js, NOT Flutter web; never convert the Flutter app for web.
- [Dev machine flaky outbound TLS](dev-machine-flaky-outbound-tls.md) — local Node can't reliably reach Supabase/Upstash (ECONNRESET/ENOTFOUND/fetch failed); suspect this for "can't fetch" bugs; prefer Railway backend.
- [Railway deployment setup](railway-deployment-setup.md) — backend/worker/web topology, ports, and the admin-server-on-import gotcha.
- [Public recipes filter](delisio-public-recipes-filter.md) — Discover/Trending/Categories only show recipes with user_id IS NULL.
