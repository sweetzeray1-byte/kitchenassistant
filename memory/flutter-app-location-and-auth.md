---
name: flutter-app-location-and-auth
description: Flutter mobile app location, package name, signing SHA-1s, and Google sign-in root cause (cross-repo, not in this backend repo).
metadata:
  type: reference
---

The Kitchen Assistant **Flutter mobile app** lives at `C:\Users\mukas\StudioProjects\delisioapp` (separate from this backend/web repo). It uses `supabase_flutter`, `google_sign_in: ^6.3.0`, and `purchases_flutter` (RevenueCat).

- Android **package name (applicationId):** `com.rosexlab.kitchenassistant`. No Firebase (`google-services.json` is absent) — Google Sign-In relies purely on a Google Cloud **Android OAuth client** matched by package name + SHA-1.
- **Debug SHA-1:** `B1:36:12:83:07:4F:E0:51:65:85:19:16:F0:D2:B4:BC:40:3C:AA:31`
- **Upload/release keystore** (`android/app/upload-keystore.jks`, creds in `android/key.properties`) **SHA-1:** `84:3E:1D:E3:7A:B1:33:E7:51:EB:93:68:95:35:FD:88:84:23:C2:45` (if Play App Signing is on, the *production* SHA-1 also lives in Play Console → App signing).
- **Web OAuth client id** used as `serverClientId`: `601707002682-2gna6etmp9k6jak25v5m7n3mrar683t4.apps.googleusercontent.com`.

Google sign-in **RESOLVED (2026-06-09)** — now working on Android. Root cause of "Google Sign-In failed: , null, null)" was a Dart truncation bug (already fixed in `lib/providers/auth_provider.dart` `signInWithGoogle`) hiding the real `ApiException: 10` (DEVELOPER_ERROR). The Dart code is correct (passes `serverClientId` on Android). The fix was **console config**, not code. Final working setup:
- Two Android OAuth clients in Google Cloud (project `kitchen-assistant`): "Android Debug" (SHA `B1:36:…`) and "Android Release" (SHA `84:3E:…`), both package `com.rosexlab.kitchenassistant`.
- **Play App Signing SHA-1** (from Play Console → App signing) registered as a third Android OAuth client — this was the missing piece for **closed-testing** builds (Play re-signs with its own key).
- Supabase → Auth → Google: enabled, **Skip nonce checks ON**, Authorized Client IDs = web + both Android client ids: `601707002682-2gna6…` (web/serverClientId), `601707002682-sr9cabvomnb12o831oics0ip0il27p2a` (Android Release), `601707002682-rak3nr43on1ufl0hs82llh09f3jcafoh` (Android Debug).
- OAuth consent screen published to Production (scopes email/profile/openid are non-sensitive → no verification needed).
- `INSTALL_FAILED_UPDATE_INCOMPATIBLE` on `flutter run` is benign (signature changed) — `flutter` auto-uninstalls and reinstalls.

RevenueCat: offering identifier `Offerings`, entitlement `Pro` → maps to backend `premium` tier. See [[stripe-web-billing-mirrors-app-pro]].
