# 🍎 Apple Sign-In — Web Integration Guide
## MyToDoo Website (mytodoo.com)

---

## 📌 Key Answer First: Can the Web Use the Same API?

**YES — web app can use the EXACT same backend endpoint as the mobile app.**

```
POST https://au-live-api.mytodoo.com/api/auth/apple
```

```json
Body (same for both mobile and web):
{
  "id_token": "eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ...",
  "code":     "c12345abc.0.nrvxt.abc123...",
  "user":     { "name": { "firstName": "John", "lastName": "Doe" } },
  "mode":     "signin"
}
```

```json
Response (same for both):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user":  { "id": "...", "email": "...", "firstName": "...", "lastName": "..." },
  "isNewUser": false
}
```

The **only difference** between mobile and web is **how you get** `id_token` and `code`.
- **Mobile**: iOS native SDK gives them automatically
- **Web**: Apple OAuth2 popup/redirect flow gives them — you just need to set it up

---

## 🔄 Flow Comparison

### Mobile App Flow (Already Working ✅)
```
User taps "Continue with Apple"
       ↓
iOS Native Framework (ASAuthorizationAppleIDProvider)
  - client_id = Bundle ID (com.mytodoo.mytodoolive)  ← iOS sets this automatically
  - No extra config needed
       ↓
Gets: credential.identityToken + credential.authorizationCode
       ↓
POST /api/auth/apple  { id_token, code, user, mode }
       ↓
Backend returns: { token, user }
       ↓
User logged in ✅
```

### Web App Flow (What You Need to Build)
```
User clicks "Continue with Apple"
       ↓
Apple OAuth2 Popup / Redirect
  - client_id = Services ID (com.mytodoo.web)  ← You must create this
  - redirect_uri = https://mytodoo.com/auth/apple/callback
       ↓
Gets: id_token + code (from Apple's response)
       ↓
POST /api/auth/apple  { id_token, code, user, mode }  ← SAME endpoint!
       ↓
Backend returns: { token, user }
       ↓
User logged in ✅
```

---

## 🛠️ STEP 1 — Apple Developer Portal Setup (One-Time)

### 1.1 — Create a Services ID

> This is the web equivalent of the iOS Bundle ID.

1. Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → click `+` → choose **Services IDs** → Continue
3. Fill in:
   - **Description**: `MyToDoo Web`
   - **Identifier**: `com.mytodoo.web` ← this will be your `client_id`
4. Click **Continue** → **Register**
5. Click on the newly created Services ID
6. Check ✅ **Sign In with Apple** → Click **Configure**
7. Fill in:
   - **Primary App ID**: `com.mytodoo.mytodoolive` (your existing iOS app)
   - **Domains and Subdomains**: `mytodoo.com`
   - **Return URLs**: `https://mytodoo.com/auth/apple/callback`
8. Click **Next** → **Done** → **Continue** → **Save**

### 1.2 — Create a Private Key

> This is needed by the **backend** to generate the `client_secret`.

1. **Keys** → click `+`
2. **Key Name**: `MyToDoo Apple Sign-In Key`
3. Check ✅ **Sign In with Apple** → Click **Configure**
4. Select Primary App ID: `com.mytodoo.mytodoolive`
5. Click **Save** → **Continue** → **Register**
6. **DOWNLOAD the `.p8` file immediately** — you can only download it once!
7. Note down:
   - **Key ID**: `XXXXXXXXXX` (10 characters shown on page)
   - **Team ID**: Visible at top-right of developer portal (e.g. `ABC123DEF4`)

---

## 🛠️ STEP 2 — Backend Configuration

> The backend must generate a `client_secret` JWT to verify the authorization code with Apple.
> This is **only needed for web** because the web uses a Services ID (not a Bundle ID).

### 2.1 — Environment Variables to Add to Backend

```env
# Apple Sign-In — Web
APPLE_TEAM_ID=ABC123DEF4              # Your Apple Team ID
APPLE_KEY_ID=XXXXXXXXXX               # Key ID from the .p8 key
APPLE_SERVICES_ID=com.mytodoo.web    # Services ID you created
APPLE_PRIVATE_KEY_PATH=./AuthKey_XXXXXXXXXX.p8   # Path to downloaded .p8 file
# OR store the key content directly:
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 2.2 — Backend `client_secret` Generation (Node.js)

Add this utility to the backend (if not already present):

```javascript
// utils/appleClientSecret.js
const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateAppleClientSecret() {
  const privateKey = process.env.APPLE_PRIVATE_KEY
    ? process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8');

  return jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',          // Max 6 months
    audience: 'https://appleid.apple.com',
    issuer: process.env.APPLE_TEAM_ID,
    subject: process.env.APPLE_SERVICES_ID,  // com.mytodoo.web  (for web)
    keyid: process.env.APPLE_KEY_ID,
  });
}

module.exports = { generateAppleClientSecret };
```

### 2.3 — Backend `/api/auth/apple` Endpoint Check

The existing backend endpoint already handles the mobile case. It needs to be aware of which
`client_id` / `subject` to use when calling Apple's token verification endpoint.

The `mode` field in the request can help differentiate:

```javascript
// In your backend auth/apple controller:
const clientId = body.mode === 'web'
  ? process.env.APPLE_SERVICES_ID      // com.mytodoo.web
  : 'com.mytodoo.mytodoolive';         // iOS Bundle ID (mobile)
```

> **Ask your backend developer to check:** Does `POST /api/auth/apple` already handle
> both web (`com.mytodoo.web`) and iOS (`com.mytodoo.mytodoolive`) as the `audience`?
> If not, pass `mode: 'web'` from the web frontend so the backend knows which to use.

---

## 🛠️ STEP 3 — Web Frontend Implementation

### 3.1 — Option A: Using Apple's JS SDK (Recommended — Simplest)

Add this to your website's login HTML/JS:

**In `<head>` of your HTML:**
```html
<script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
```

**Initialize in your JS/TS:**
```javascript
AppleID.auth.init({
  clientId:    'com.mytodoo.web',                        // Your Services ID
  scope:       'name email',
  redirectURI: 'https://mytodoo.com/auth/apple/callback', // Must match Apple portal
  state:       'origin:web',
  usePopup:    true,  // Use popup instead of redirect (better UX)
});
```

**Handle the Sign-In button click:**
```javascript
async function handleAppleSignIn() {
  try {
    // Apple popup opens, user authenticates
    const response = await AppleID.auth.signIn();

    // response.authorization contains what you need:
    const { id_token, code } = response.authorization;

    // User info is only provided on FIRST sign-in
    const user = response.user
      ? {
          name: {
            firstName: response.user.name?.firstName || '',
            lastName:  response.user.name?.lastName  || '',
          },
        }
      : undefined;

    // ✅ Call the SAME backend API as the mobile app
    const result = await fetch('https://au-live-api.mytodoo.com/api/auth/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: id_token,
        code:     code,
        user:     user,
        mode:     'web',   // tells backend to use Services ID (com.mytodoo.web)
      }),
    });

    const data = await result.json();

    if (data.token) {
      // Store the JWT token (same as mobile does it)
      localStorage.setItem('auth_token', data.token);
      // Redirect or update UI
      window.location.href = '/dashboard';
    }
  } catch (error) {
    if (error.error === 'popup_closed_by_user') {
      // User closed the popup — no error needed
      return;
    }
    console.error('Apple Sign-In failed:', error);
    alert('Could not sign in with Apple. Please try again.');
  }
}
```

**Apple Sign-In button HTML:**
```html
<!-- Official Apple-styled button — required by Apple's HIG -->
<div
  id="appleid-signin"
  class="signin-button"
  data-color="black"
  data-border="true"
  data-type="sign in"
  onclick="handleAppleSignIn()"
></div>
```

---

### 3.2 — Option B: Using Redirect Flow (If Popup Is Blocked)

Some browsers block popups. Use the redirect flow as a fallback:

```javascript
// On button click — redirect to Apple
function handleAppleSignInRedirect() {
  const params = new URLSearchParams({
    client_id:     'com.mytodoo.web',
    redirect_uri:  'https://mytodoo.com/auth/apple/callback',
    response_type: 'code id_token',
    scope:         'name email',
    response_mode: 'form_post',   // Apple POSTs form data to your redirect_uri
    state:         'csrf_token_here',   // Generate a random CSRF token
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params}`;
}

// On your callback page (https://mytodoo.com/auth/apple/callback)
// Apple sends a POST with: code, id_token, user (first time only), state
async function handleAppleCallback(postData) {
  const { code, id_token, user: userJson, state } = postData;

  // Verify CSRF state matches
  // Parse user JSON if present (first sign-in only)
  const user = userJson ? JSON.parse(userJson) : undefined;

  // ✅ Same API call as the popup method
  const response = await fetch('https://au-live-api.mytodoo.com/api/auth/apple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_token: id_token,
      code:     code,
      user:     user ? { name: { firstName: user.name?.firstName, lastName: user.name?.lastName } } : undefined,
      mode:     'web',
    }),
  });

  const data = await response.json();
  localStorage.setItem('auth_token', data.token);
  window.location.href = '/dashboard';
}
```

---

### 3.3 — Option C: If Website Uses React/Next.js

Install the library:
```bash
npm install @react-oauth/apple
# OR
npm install react-apple-signin-auth
```

Example with `react-apple-signin-auth`:
```tsx
import AppleSignin from 'react-apple-signin-auth';

function LoginPage() {
  const handleAppleSuccess = async (response: any) => {
    const { id_token, code } = response.authorization;
    const user = response.user
      ? { name: { firstName: response.user.name?.firstName, lastName: response.user.name?.lastName } }
      : undefined;

    // ✅ Same backend API as mobile
    const result = await fetch('https://au-live-api.mytodoo.com/api/auth/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token, code, user, mode: 'web' }),
    });

    const data = await result.json();
    // Store token, redirect user
  };

  return (
    <AppleSignin
      authOptions={{
        clientId: 'com.mytodoo.web',     // Your Services ID
        scope: 'email name',
        redirectURI: 'https://mytodoo.com/auth/apple/callback',
        usePopup: true,
      }}
      onSuccess={handleAppleSuccess}
      onError={(error: any) => console.error('Apple Sign-In error:', error)}
      render={(props: any) => (
        <button {...props} className="apple-signin-btn">
          🍎 Continue with Apple
        </button>
      )}
    />
  );
}
```

---

## 📊 Request/Response Reference

### Request to Backend (Web — identical to mobile, just `mode: 'web'`)
```http
POST https://au-live-api.mytodoo.com/api/auth/apple
Content-Type: application/json

{
  "id_token": "eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIi...",
  "code":     "c12345abc.0.nrvxt.abcdefgh123456",
  "user": {
    "name": {
      "firstName": "John",
      "lastName":  "Doe"
    }
  },
  "mode": "web"
}
```

> ⚠️ `user` is only sent on the **FIRST** Apple Sign-In. On subsequent logins, Apple doesn't
> return name/email again. The backend should handle `user` being `undefined` (it already does for mobile).

### Successful Response (Same as mobile)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id":        "64abc123...",
    "email":     "user@privaterelay.appleid.com",
    "firstName": "John",
    "lastName":  "Doe"
  },
  "isNewUser": false
}
```

### Error Responses
| Status | Meaning | Action |
|--------|---------|--------|
| `400` | Invalid token or code | Try sign-in again |
| `401` | Apple token validation failed | Token expired — try again |
| `500` | Backend server error | Report to backend team |

---

## ✅ Complete Checklist

### Apple Developer Portal (One-Time Setup)
- [ ] Create **Services ID** → `com.mytodoo.web`
- [ ] Add domain: `mytodoo.com`
- [ ] Add return URL: `https://mytodoo.com/auth/apple/callback`
- [ ] Create **Private Key** with "Sign In with Apple" enabled
- [ ] Download `.p8` file (only downloadable once!)
- [ ] Note: **Team ID**, **Key ID**

### Backend (Backend Developer Task)
- [ ] Add env vars: `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_SERVICES_ID`, `APPLE_PRIVATE_KEY`
- [ ] Update `/api/auth/apple` to handle `mode: 'web'` using `com.mytodoo.web` as `client_id`
- [ ] Implement `client_secret` JWT generation for web flow verification
- [ ] Test endpoint with a real web-generated `id_token` and `code`

### Web Frontend (Frontend Developer Task)
- [ ] Add Apple JS SDK `<script>` to login page
- [ ] Initialize `AppleID.auth.init()` with `clientId: 'com.mytodoo.web'`
- [ ] Implement `handleAppleSignIn()` function
- [ ] On success, call `POST /api/auth/apple` with `mode: 'web'`
- [ ] Store returned JWT token
- [ ] Handle errors (popup closed, network error, etc.)

### Testing
- [ ] Test with a real Apple ID account in **Safari** (Apple recommends Safari)
- [ ] Test in Chrome/Firefox (popup flow)
- [ ] Test first sign-in (user data returned) vs repeat sign-in (no user data)
- [ ] Test on mobile browser (Apple redirects to app if installed)

---

## ⚠️ Important Notes

### 1. `user` data is ONLY sent on first sign-in
Apple only sends `name` and `email` the **very first time** a user signs in.
On all future sign-ins, `user` will be `null`. The backend must handle this — and it already
does for mobile, so the web should work the same way.

### 2. Apple requires HTTPS
The `redirect_uri` must use `https://`. Localhost won't work in production config.
For local testing, use: `https://localhost` (HTTPS only).

### 3. Safari is required for testing in some cases
Apple Sign-In on web works best in Safari. Chrome/Firefox use a popup.

### 4. The mobile app needs NO changes
The iOS mobile app already works correctly using:
- `client_id` = `com.mytodoo.mytodoolive` (Bundle ID, set automatically by iOS)
- `mode: 'signin'` (existing behavior)

Do NOT change any mobile code.

### 5. `mode: 'web'` tells the backend which `client_id` to use
The backend uses `client_id` when calling Apple's token API to verify the `code`.
- Mobile sends `mode: 'signin'` → backend uses `com.mytodoo.mytodoolive`
- Web sends `mode: 'web'` → backend uses `com.mytodoo.web`

---

## 🔍 Debugging the `invalid_client` Error

The error you saw:
```
appleid.apple.com/auth/authorize?client_id=your_production_apple_service_id
```

**Cause**: The web frontend has a placeholder `your_production_apple_service_id` that was never
replaced with the real Services ID.

**Fix**: Replace it with `com.mytodoo.web` (or whatever Services ID you create in Step 1).

---

## 📋 Summary

| What | Mobile App | Web App |
|------|-----------|---------|
| **Library** | `expo-apple-authentication` | Apple JS SDK or `react-apple-signin-auth` |
| **client_id** | `com.mytodoo.mytodoolive` (auto) | `com.mytodoo.web` (Services ID you create) |
| **How tokens obtained** | iOS native SDK | OAuth2 popup or redirect |
| **Backend endpoint** | `POST /api/auth/apple` | `POST /api/auth/apple` ← **SAME!** |
| **Request body** | `{ id_token, code, user, mode: 'signin' }` | `{ id_token, code, user, mode: 'web' }` |
| **Response** | `{ token, user, isNewUser }` | `{ token, user, isNewUser }` ← **SAME!** |
| **Changes needed** | ❌ None | ✅ Services ID + Frontend code |
