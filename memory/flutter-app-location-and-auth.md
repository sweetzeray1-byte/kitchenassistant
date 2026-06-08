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

Google sign-in **root cause** of "Google Sign-In failed: , null, null)": that old string was a truncation bug already fixed in `lib/providers/auth_provider.dart` (`signInWithGoogle`); the real underlying error is `ApiException: 10` (DEVELOPER_ERROR). The Dart code is correct (uses `serverClientId` on Android). The fix is **console config**, not code: register the SHA-1s above in an Android OAuth client for the package name in the SAME Google Cloud project as the web client, and add the web client id to Supabase → Auth → Google → Authorized Client IDs.

RevenueCat: offering identifier `Offerings`, entitlement `Pro` → maps to backend `premium` tier. See [[stripe-web-billing-mirrors-app-pro]].
