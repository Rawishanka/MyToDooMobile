# MyToDoo — Backend Auth Requirements

> **App Region:** Australia only  
> **Date:** 2025  
> **Version:** 1.0.2 (iOS) / 1.0.7 (Android)

---

## 1. Overview

MyToDoo is an **Australia-only** platform. All users must be registered with an Australian phone number (`+61`). The backend should enforce this rule at all auth endpoints.

---

## 2. Standard Sign-Up (Email + Phone + OTP)

### Flow
1. User fills in: First Name, Last Name, Email, Password, Phone, Date of Birth, Location (suburb)
2. App sends `POST /users/signup` → Backend sends Email OTP + SMS OTP
3. User verifies both OTPs
4. Account is created

### Request — `POST /users/signup`

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+61412345678",
  "dateOfBirth": "1995-06-15",
  "country": "Australia",
  "countryCode": "AU",
  "location": {
    "address": "Sydney, New South Wales",
    "coordinates": {
      "lat": -33.8688,
      "lng": 151.2093
    }
  }
}
```

### Validation Rules (Backend Must Enforce)
| Field | Rule |
|-------|------|
| `phone` | Must start with `+61` (Australian numbers only) |
| `countryCode` | Must be `AU` |
| `country` | Must be `Australia` |
| `email` | Valid email format |
| `dateOfBirth` | User must be 18+ years old |

### OTP Verification — `POST /users/verify-otp`

```json
{
  "userId": "user_id_from_signup_response",
  "emailOtp": "123456",
  "smsOtp": "654321"
}
```

---

## 3. Email / Password Login

### Request — `POST /users/login`

```json
{
  "username": "john@example.com",
  "password": "SecurePass123"
}
```

### Response

```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

---

## 4. Google Sign-In (Firebase)

### Flow
1. App signs in via Google → Firebase returns `idToken`
2. App sends Firebase `idToken` to backend
3. Backend validates token with Firebase Admin SDK
4. Backend creates/fetches user → returns own JWT

### Request — `POST /users/firebase-auth`

```json
{
  "credential": "FIREBASE_ID_TOKEN_HERE"
}
```

### Response

```json
{
  "token": "BACKEND_JWT_TOKEN",
  "user": {
    "id": "user_id",
    "email": "john@gmail.com",
    "firstName": "John",
    "lastName": "Smith"
  },
  "isNewUser": true
}
```

### Backend Notes for Google Sign-In
- Validate `credential` using Firebase Admin SDK (`admin.auth().verifyIdToken()`)
- If new user → create account with `countryCode: "AU"`, `country: "Australia"` as defaults
- Phone number is **not** available from Google — do NOT require phone for Google sign-in
- If existing user → just return JWT token
- `isNewUser` flag helps the app decide if profile completion is needed

---

## 5. Apple Sign-In

### Flow
1. App signs in via Apple → gets `identityToken` + `authorizationCode`
2. App sends both tokens to backend
3. Backend validates with Apple's servers
4. Backend creates/fetches user → returns own JWT

### Request — `POST /users/apple`

```json
{
  "id_token": "APPLE_IDENTITY_TOKEN_HERE",
  "code": "APPLE_AUTHORIZATION_CODE_HERE",
  "user": {
    "name": {
      "firstName": "John",
      "lastName": "Smith"
    }
  },
  "mode": "signin"
}
```

> ⚠️ `user.name` is **only available on the first Apple sign-in**. On subsequent sign-ins, Apple does not return name/email. The backend must store this on first sign-in.

### Response

```json
{
  "token": "BACKEND_JWT_TOKEN",
  "user": {
    "id": "user_id",
    "email": "privaterelay@icloud.com",
    "firstName": "John",
    "lastName": "Smith"
  },
  "isNewUser": false
}
```

### Backend Notes for Apple Sign-In
- Validate `id_token` with Apple's public keys (JWKS endpoint: `https://appleid.apple.com/auth/keys`)
- Validate `code` with Apple's token endpoint
- Apple may provide a private relay email (e.g., `xxx@privaterelay.appleid.com`) — store it as-is
- If new user → create account with `countryCode: "AU"`, `country: "Australia"` as defaults
- Phone number is **not** available from Apple — do NOT require phone for Apple sign-in
- Store Apple `user` (sub) ID to link future sign-ins

---

## 6. Country Enforcement Rules

| Sign-in Method | Country Handling |
|----------------|-----------------|
| Email/Phone signup | App sends `country: "Australia"`, `countryCode: "AU"`, `phone: "+61..."` |
| Google Sign-In | No phone. Backend defaults `countryCode: "AU"` |
| Apple Sign-In | No phone. Backend defaults `countryCode: "AU"` |

**Backend should reject any signup where:**
- `phone` does NOT start with `+61`
- `countryCode` is NOT `AU`

---

## 7. FCM Push Notifications

After any successful login (email, Google, Apple), the app registers an FCM token.

### Request — `POST /users/fcm-token` (or similar endpoint)

```json
{
  "fcmToken": "FCM_DEVICE_TOKEN_HERE",
  "platform": "ios"
}
```

> The app sends this after login. Backend should store and use it for push notifications.

---

## 8. Error Response Format

The app reads these fields from error responses:

```json
{
  "message": "Human-readable error message",
  "error": "Error type (optional)"
}
```

### Expected HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad request / validation error |
| `401` | Unauthorized / wrong credentials |
| `404` | User not found |
| `429` | Too many attempts (rate limit) |
| `500` | Server error |

---

## 9. Environment URLs

| Environment | Base URL |
|-------------|----------|
| UAT | Configured via `EXPO_PUBLIC_API_BASE_URL` (UAT) |
| Live | Configured via `EXPO_PUBLIC_API_BASE_URL` (Live) |

> Contact the mobile team for actual URLs.

---

*Document maintained by: MyToDoo Mobile Team*
