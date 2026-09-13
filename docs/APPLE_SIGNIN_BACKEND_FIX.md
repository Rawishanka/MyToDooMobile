# 🍎 Apple Sign-In — Backend Configuration Required

## Problem

Apple Sign-In is returning `400 Invalid Apple ID token` from the backend.

**Error from backend:**
```json
{
  "success": false,
  "error": "Invalid Apple ID token",
  "message": "Failed to authenticate with Apple. Please try again."
}
```

**Endpoint failing:** `POST https://au-live-api.mytodoo.com/api/auth/apple`

**Root cause:** The backend is not configured with the required Apple Developer credentials to verify the Apple ID token (JWT) sent from the mobile app.

---

## What the Mobile App Sends

The mobile app sends a `POST` to `/api/auth/apple` with this body:

```json
{
  "id_token": "<Apple JWT ID Token — signed by Apple>",
  "code":     "<Apple Authorization Code>",
  "user": {
    "name": {
      "firstName": "Janidu",
      "lastName":  "Pasan"
    }
  },
  "mode": "signin"
}
```

- `id_token` — A JWT signed by Apple's private key. Backend must verify it using Apple's public keys.
- `code` — One-time authorization code (can be exchanged for tokens).
- `user` — Only present on **first sign-in**. Will be `null` on subsequent logins.
- `mode` — `"signin"` or `"signup"`.

**App Bundle ID (audience in the JWT):** `com.mytodoo.mytodoolive`

---

## What the Backend Needs to Do

### Step 1 — Verify the `id_token` JWT

Apple's `id_token` is a standard JWT. To verify it:

1. Fetch Apple's public keys from: `https://appleid.apple.com/auth/keys`
2. Decode the JWT header to get the `kid` (key ID)
3. Find the matching public key from Apple's JWKS
4. Verify the JWT signature
5. Validate claims:
   - `iss` = `https://appleid.apple.com`
   - `aud` = `com.mytodoo.mytodoolive` ← **must match the app's bundle ID**
   - `exp` = token not expired

### Step 2 — Extract user info from JWT

After verification:
```
sub       → unique Apple user ID (permanent, use as user identifier)
email     → user's email (may be a relay address like xxxx@privaterelay.appleid.com)
```

### Step 3 — Create or find user in database, return JWT

---

## Required Backend Environment Variables

Add these to the backend `.env`:

```env
# Apple Sign-In Configuration
APPLE_CLIENT_ID=com.mytodoo.mytodoolive
APPLE_TEAM_ID=75D9C2GF7W
APPLE_KEY_ID=<Your Key ID from Apple Developer Portal>
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<contents of .p8 file>\n-----END PRIVATE KEY-----"
```

### How to get these values:

| Variable | Where to find it |
|---|---|
| `APPLE_CLIENT_ID` | The iOS app Bundle ID: `com.mytodoo.mytodoolive` |
| `APPLE_TEAM_ID` | Apple Developer → Membership → Team ID: `75D9C2GF7W` |
| `APPLE_KEY_ID` | Apple Developer → Certificates, IDs & Profiles → Keys → Your "Sign in with Apple" key → Key ID |
| `APPLE_PRIVATE_KEY` | Download the `.p8` file from same page (only downloadable once). Paste full contents. |

---

## How to Create the Apple Key (if not done yet)

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, IDs & Profiles → Keys**
3. Click **+** to create a new key
4. Enable **Sign In with Apple**
5. Click **Configure** → set Primary App ID to **MyToDoo Live** (`com.mytodoo.mytodoolive`)
6. Register the key → **Download the `.p8` file** (only once!)
7. Note the **Key ID**

---

## Recommended Node.js Library

Use `apple-signin-auth` npm package:

```bash
npm install apple-signin-auth
```

```js
const appleSignin = require('apple-signin-auth');

async function verifyAppleToken(idToken) {
  const clientId = process.env.APPLE_CLIENT_ID; // com.mytodoo.mytodoolive

  const payload = await appleSignin.verifyIdToken(idToken, {
    audience: clientId,
    ignoreExpiration: false,
  });

  return {
    appleUserId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
  };
}
```

---

## Important Notes

1. **`user` field is only sent on FIRST sign-in.** After that, Apple does NOT send name/email again. Store the user's name on first sign-in.

2. **Private Relay emails** — Apple may send `xxxx@privaterelay.appleid.com`. This is real and must be stored as-is.

3. **`sub` is the permanent user identifier** — Use `payload.sub` as the unique key to find/create the user, NOT email.

4. **Token is short-lived** — The `id_token` expires after ~10 minutes. Don't cache it.

5. **App Bundle ID must match `aud` claim** — If you test with a different bundle ID or Service ID, it will fail.

---

## Quick Verification Test

You can decode the `id_token` JWT (without verifying) at [jwt.io](https://jwt.io) to check:
- `aud` should be `com.mytodoo.mytodoolive`
- `iss` should be `https://appleid.apple.com`
- `exp` should be a future timestamp

---

## Summary of Required Actions for Backend Developer

- [ ] Create an "Sign in with Apple" key in Apple Developer Portal
- [ ] Download the `.p8` private key file
- [ ] Add `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` to backend `.env`
- [ ] In `/api/auth/apple` endpoint: verify `id_token` using Apple's public JWKS
- [ ] Handle first-sign-in (store name from `user` field) vs returning user
- [ ] Return a backend JWT token on success (same as email/Google login response)

**Contact for questions:** Mobile team — Bundle ID is `com.mytodoo.mytodoolive`, Team ID is `75D9C2GF7W`
