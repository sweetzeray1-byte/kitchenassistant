---
name: railway-deployment-setup
description: How Delisio's backend + workers + web deploy on Railway/Vercel and the gotchas
metadata:
  type: project
---

Delisio (a.k.a. KitchenAssistant) deployment topology, confirmed working as of 2026-06-05:

- **Backend API** → Railway service `kitchenassistant`, public URL `https://kitchenassistant-production.up.railway.app`. Runs `node dist/server.js` (entry [src/server.ts] → [src/app.ts]). Listens on `$PORT` = 8080. Railway **Networking public port must be 8080** (it was wrongly pinned to 3003 once).
- **Background worker** → separate Railway service `WORKER`, URL `worker-production-26a4.up.railway.app`, custom start command `node dist/workers/chat.worker.js`. Only runs the chat worker; recipe/image workers are NOT in this service (the API process itself also boots all three queue workers).
- **Web frontend** → Vercel `https://kitchenassistant-pi.vercel.app` (Next.js 16). Needs `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel (NEXT_PUBLIC_* are build-time → must redeploy after changing).
- Both Railway services build via Railpack/Nixpacks: `npm ci` → postinstall `npm run build` (tsc) → start command. No railway.json/Dockerfile, so per-service start commands live in the dashboard (don't add a root railway.json — it would apply to both services and break the worker).

**Gotcha that wasted hours:** [src/admin/index.ts] is a full standalone Express admin server that ALSO gets imported by [src/app.ts] as a mounted router at `/api/admin`. Its top-level `app.listen` is now guarded with `require.main === module` so it doesn't bind port 3003 when imported — otherwise Railway auto-detects 3003 (bound first, at import) and routes the public domain to the admin server, which has no `/api/recipes` routes → all API calls 404.

**Public recipe feeds** (discover/popular/categories in [src/services/supabaseService.ts]) only return rows where `user_id IS NULL`. User-generated recipes have a user_id and never show in public feeds. See [[delisio-public-recipes-filter]].
