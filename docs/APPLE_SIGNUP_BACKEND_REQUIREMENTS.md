# Apple Sign Up - Backend Implementation Requirements

## Overview

The mobile app now supports **Apple Sign Up** on the signup page (iOS only). Currently, the backend endpoint `POST /api/auth/apple` only handles Apple **Sign In** (existing users). The backend needs to be updated to also handle Apple **Sign Up** (new user registration) when `mode: 'signup'` is sent.

---

## Current State

### Existing Endpoint
- **URL**: `POST https://au-live-api.mytodoo.com/api/auth/apple`
- **Purpose**: Apple Sign In for existing users only
- **Mode**: Currently receives `mode: 'signin'`

### What the Mobile App Sends

```json
{
  "id_token": "<Apple Identity Token (JWT)>",
  "code": "<Apple Authorization Code>",
  "user": {
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "mode": "signin" | "signup"
}
```

### Expected Response (Current - Working for Sign In)

```json
{
  "token": "<JWT Auth Token>",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "isNewUser": true | false
}
```

---

## What Needs to Change

### 1. Handle `mode: 'signup'` in `POST /api/auth/apple`

When the backend receives `mode: 'signup'`, it should:

1. **Validate the Apple `id_token`** (same as sign-in flow)
   - Verify the JWT with Apple's public keys
   - Extract the user's email and Apple user ID (`sub` claim)

2. **Check if user already exists**
   - If the user already exists → **Log them in** (return token + user, `isNewUser: false`)
   - If the user does NOT exist → **Create a new account** (see below)

3. **Create new user account** with the following data:
   - **Email**: Extracted from the Apple ID token (`email` claim)
   - **First Name**: From `user.name.firstName` in the request body
   - **Last Name**: From `user.name.lastName` in the request body
   - **Apple ID**: The `sub` claim from the `id_token` (unique Apple user identifier)
   - **Auth Provider**: Set to `'apple'`
   - **Email Verified**: Set to `true` (Apple has already verified the email)
   - **Password**: Not required (Apple auth users don't use passwords)
   - **Country**: Default to `'Australia'` / `'AU'` (Australia-only app)

4. **Return the same response format**:
   ```json
   {
     "token": "<JWT Auth Token>",
     "user": { ... },
     "isNewUser": true
   }
   ```

---

### 2. Important Notes About Apple Sign In/Sign Up

#### ⚠️ Apple Only Sends User Info ONCE
- Apple **only provides the user's name and email on the FIRST authorization**.
- On subsequent sign-ins, `user.name` and `credential.email` will be `null`.
- The backend **MUST save the name on first sign-up** because it won't be available again.
- If a user signs up but the backend fails to save their name, the name is **lost forever** unless the user manually updates their profile.

#### ⚠️ Apple Private Relay Email
- Some users may choose to hide their email. Apple will provide a **private relay email** like `abc123@privaterelay.appleid.com`.
- The backend should accept and store this email as the user's primary email.
- Communications should be sent to this relay email — Apple forwards them to the user's real email.

#### ⚠️ Token Validation
- The `id_token` is a JWT signed by Apple.
- Validate using Apple's public keys: `https://appleid.apple.com/auth/keys`
- Verify the `aud` (audience) claim matches the app's Bundle ID: `com.mytodoo.mytodoolive`
- Verify the `iss` (issuer) is `https://appleid.apple.com`

---

## Flow Diagram

```
Mobile App (iOS)                          Backend Server
─────────────────                         ──────────────

1. User taps "Continue with Apple"
   on Signup page

2. Apple Authentication popup
   (Face ID / Touch ID / Password)

3. Apple returns:
   - identityToken (JWT)
   - authorizationCode
   - fullName (first sign-in only)
   - email (first sign-in only)

4. App sends POST /api/auth/apple ──────► 5. Backend receives request
   {                                         - Validates id_token with Apple
     id_token: "...",                        - Extracts email from JWT
     code: "...",                            - Checks mode: 'signup'
     user: {
       name: {                            6. If user exists:
         firstName: "John",                  → Log in, return token
         lastName: "Doe"                     → isNewUser: false
       }
     },                                   7. If user doesn't exist:
     mode: "signup"                          → Create new user
   }                                         → Save Apple ID, name, email
                                             → Set email_verified: true
                                             → Return token + user
                                             → isNewUser: true

8. App receives response ◄────────────── 9. Backend returns:
   - Stores auth token                      {
   - Navigates to home screen                 token: "...",
                                               user: { ... },
                                               isNewUser: true
                                             }
```

---

## Suggested Backend Code Changes

### Pseudocode for the `/api/auth/apple` endpoint:

```javascript
// POST /api/auth/apple
async function handleAppleAuth(req, res) {
  const { id_token, code, user, mode } = req.body;

  // 1. Validate Apple ID token
  const appleUser = await verifyAppleToken(id_token);
  // appleUser = { sub: "apple_user_id", email: "user@email.com", email_verified: true }

  // 2. Check if user exists in database
  let existingUser = await User.findOne({
    $or: [
      { appleId: appleUser.sub },
      { email: appleUser.email }
    ]
  });

  if (existingUser) {
    // User exists - log them in regardless of mode
    // Update Apple ID if not already set
    if (!existingUser.appleId) {
      existingUser.appleId = appleUser.sub;
      await existingUser.save();
    }
    
    const token = generateJWT(existingUser);
    return res.json({
      token,
      user: existingUser,
      isNewUser: false
    });
  }

  // 3. User doesn't exist
  if (mode === 'signup' || mode === 'signin') {
    // Create new user (Apple auth can create users on both modes)
    const newUser = await User.create({
      email: appleUser.email,
      firstName: user?.name?.firstName || '',
      lastName: user?.name?.lastName || '',
      appleId: appleUser.sub,
      authProvider: 'apple',
      emailVerified: true,   // Apple already verified
      smsVerified: false,    // Not verified via SMS
      country: 'Australia',
      countryCode: 'AU',
      // No password needed for Apple auth users
    });

    const token = generateJWT(newUser);
    return res.json({
      token,
      user: newUser,
      isNewUser: true
    });
  }

  // If mode is 'signin' and user doesn't exist (strict mode)
  // return res.status(404).json({ message: 'No account found. Please sign up first.' });
}
```

---

## Database Schema Changes

The User model may need the following field if not already present:

| Field | Type | Description |
|-------|------|-------------|
| `appleId` | String (unique, sparse) | Apple's unique user identifier (`sub` claim from JWT) |
| `authProvider` | String | `'email'`, `'google'`, or `'apple'` |
| `emailVerified` | Boolean | Set `true` for Apple users (Apple verifies email) |

---

## Testing Checklist

- [ ] Apple Sign Up creates new user with `mode: 'signup'`
- [ ] Apple Sign In returns existing user with `mode: 'signin'`  
- [ ] If user signs up via Apple but already has email account → Link accounts or return error
- [ ] Apple private relay emails are accepted and stored
- [ ] User name is saved on first authorization
- [ ] Token validation works with Apple's public keys
- [ ] Audience (`aud`) matches Bundle ID `com.mytodoo.mytodoolive`
- [ ] Response format matches: `{ token, user, isNewUser }`

---

## Environment Details

- **LIVE API**: `https://au-live-api.mytodoo.com/api`
- **UAT API**: `https://api.mytodoo.com/api`
- **LIVE Bundle ID**: `com.mytodoo.mytodoolive`
- **UAT Bundle ID**: `com.unexo.mytodoomobile`
- **Apple Team ID**: `75D9C2GF7W`
- **Apple Developer Account**: KCK BUSINESS SOLUTIONS PTY LTD

---

*Document created: $(date)*
*Mobile app changes: Apple Sign Up button added to signup page (iOS only)*
*Files modified: `useSignup.ts`, `SignupForm.tsx`, `signup-screen.tsx`*
