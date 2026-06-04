---
name: web-is-separate-nextjs
description: The web platform is a separate Next.js app — do NOT make the Flutter app run on web
metadata:
  type: project
---

Delisio has **two separate frontends** plus a shared backend:
- Flutter mobile app: `C:\Users\mukas\StudioProjects\delisioapp` (Android-only in practice)
- **Next.js web app**: a separate codebase (path provided by user when needed)
- Shared Node/Express + Supabase + Redis + BullMQ backend: `C:\Users\mukas\OneDrive\Desktop\Delisio\delisio`

**Do NOT try to make the Flutter app run on Flutter-web.** The user explicitly does not want that. "The web version" always means the **Next.js app**. Web feature-parity is achieved by the Next.js app calling the **same backend API** and mirroring the app's behaviour (browse/discover, chat Concierge, Tease & Lock recipe generation, auth, etc.).

**Why:** I previously started converting the Flutter app to web (kIsWeb guards, RevenueCat web limits) — that was wrong and got rejected.
**How to apply:** When asked about web, work in the Next.js project against the shared backend; leave the Flutter app untouched for web concerns. RevenueCat is mobile-only, so web payments would use a different path (e.g. Stripe) — see [[delisio-backend-architecture]] if/when written.
