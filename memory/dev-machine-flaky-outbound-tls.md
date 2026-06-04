---
name: dev-machine-flaky-outbound-tls
description: This dev machine has unreliable outbound TLS/DNS to cloud services (Supabase, Upstash Redis)
metadata:
  type: project
---

The local dev machine (Windows, `c:\Users\mukas\OneDrive\Desktop\Delisio\delisio`) has **recurring, intermittent outbound TLS/DNS failures** to cloud services when run from Node:
- Upstash Redis: `read ECONNRESET` and `getaddrinfo ENOTFOUND <host>.upstash.io` (DNS fails)
- Supabase REST: `TypeError: fetch failed` (often on a poisoned keep-alive connection)

System tools (PowerShell `Test-NetConnection`, `Resolve-DnsName`) frequently succeed at the exact moment Node's `fetch`/ioredis fails — classic signature of **AV/firewall TLS interception, flaky Wi-Fi, or DNS** issues, not a code bug. It has broken Redis ~4× and Supabase in a single session.

**Mitigations tried/known:** added a retrying fetch to the Supabase client ([[delisio-supabase-retry]]); `redis.ts` already retries. These help transient blips but can't fix a sustained outage.

**Durable fix:** run the web/app against the **deployed Railway backend** (cloud→cloud networking is reliable) rather than localhost. See [[web-is-separate-nextjs]]. When the user reports "can't fetch recipes / chat fails / Redis ECONNRESET" locally, suspect this first — diagnose with `Resolve-DnsName` + `Test-NetConnection`, and suggest: flush DNS (`ipconfig /flushdns`), set DNS to 1.1.1.1/8.8.8.8, try a mobile hotspot, or disable VPN/AV HTTPS-scanning.
