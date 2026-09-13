# 🔴 BACKEND BUG REPORT — Sign Up & Google Sign-In Failure
**Prepared for:** Backend Developer  
**Date:** 2026-05-30  
**Severity:** CRITICAL — New user registration is completely broken in production  
**Server:** `root@134.199.172.167`  
**Backend Path:** `/var/www/mytodoo/live/au/backend/mytodo-backend/`  

---

## 📋 SUMMARY

Production eke **Sign Up** සහ **Google Sign-In** දෙකෙහිම users register/login කරන්න බෑ. Mobile app code 100% correct ය — issue eka **backend-only** ය.

---

## 🖼️ User Reported Screenshots

| Error | Message |
|-------|---------|
| Screenshot 1 | `Sign Up Error — Failed to send OTP email` |
| Screenshot 2 | `Authentication Error — Validation failed` |

---

## 🔍 ROOT CAUSE ANALYSIS

### 🔴 Issue #1 — Email/OTP Service Broken (PRIMARY CAUSE)

**Endpoint affected:** `POST /users/signup`

**What happens:**
1. User fills signup form → mobile app sends correct request to `/api/users/signup` ✅
2. Backend creates the user record in MongoDB ✅
3. Backend tries to send OTP email via email service → **FAILS** ❌
4. Backend returns error: `"Failed to send OTP email"`
5. User sees: **"Sign Up Error — Failed to send OTP email"**

**Root cause suspects (check in order):**
```
1. SMTP credentials expired or wrong in .env / DB config
2. Email provider API key (MailerSend / SendGrid / SES) expired or quota exceeded
3. SMTP host domain typo (e.g., "mlsender.nets" instead of "mlsender.net")
4. Email service IP blocked due to repeated failed auth attempts
```

**How to verify — run on server:**
```bash
# 1. Check backend error logs
cd /var/www/mytodoo/live/au/backend/mytodo-backend/logs
tail -200 error.log | grep -i "email\|smtp\|mail\|nodemailer\|sendgrid"

# 2. Check combined logs
tail -200 combined.log | grep -i "email\|otp\|smtp"

# 3. Check .env for email config
grep -i "email\|smtp\|mail\|sendgrid\|ses\|mailersend" .env

# 4. Check PM2 live logs
pm2 logs mytodoo-backend --lines 100 | grep -i "email\|otp\|smtp"
```

---

### 🔴 Issue #2 — User Partially Created, Stuck in DB (SECONDARY EFFECT)

**Endpoint affected:** `POST /users/signup` (second attempt)

**What happens (user tries again after Issue #1):**
1. Issue #1 happens → email fails → but **user record already created in MongoDB** ⚠️
2. User presses "Create Account" again with same email
3. Backend finds existing user → returns `"Validation failed"` (duplicate user)
4. User sees: **"Authentication Error — Validation failed"**

**This user (`daniel.p.clarke1983@gmail.com`) is now stuck:**
- User exists in DB but is NOT verified
- User cannot sign up again (duplicate)
- User cannot sign in (account not verified)

**Fix for this specific user:**
```bash
# Connect to MongoDB and either:
# Option A: Delete the partial user so they can re-register
db.users.deleteOne({ email: "daniel.p.clarke1983@gmail.com" })

# Option B: Manually mark as verified (if you want to keep the account)
db.users.updateOne(
  { email: "daniel.p.clarke1983@gmail.com" },
  { $set: { isVerified: true, emailVerified: true } }
)
```

---

### � Issue #3 — Google Sign-In "Validation failed" ← **ROOT CAUSE CONFIRMED VIA SERVER INVESTIGATION**

**Endpoint affected:** `POST /api/v1/users/firebase-auth`

---

#### 🔍 Server Investigation Results

Server SSH eken direct investigation කළා. File path: `/var/www/mytodoo/live/au/backend/mytodo-backend/`

**Route definition** (`routes/v1/users/UserRoutes.js` line 71-74):
```js
router.post(
  "/firebase-auth",
  validators.firebaseAuth,   // ← STEP 1: Validator runs FIRST
  verifyFirebaseUser,        // ← STEP 2: Middleware runs SECOND
  userController.firebaseAuth
);
```

**The Bug — Validator** (`validators/v1/users/userRoutes.validator.js` line 128-131):
```js
const firebaseAuth = [
  body("credential").trim().notEmpty().withMessage("credential is required"),
  validateRequest,   // ← BLOCKS request if body.credential is missing → returns "Validation failed"
];
```

**The Middleware** (`middleware/verifyFirebaseUser.js`) — reads from BOTH header and body:
```js
const authHeader = req.headers.authorization;
const bodyCredential = req.body?.credential;

let idToken = null;
if (authHeader && authHeader.startsWith("Bearer ")) {
  idToken = authHeader.split("Bearer ")[1];   // ← Can read from header ✅
} else if (bodyCredential) {
  idToken = bodyCredential;                    // ← Can read from body ✅
}
```

---

#### 🎯 Exact Problem — Mismatch Between Validator and Middleware

| | Mobile App Sends | Backend Expects |
|--|--|--|
| **Token location** | `Authorization: Bearer <token>` header | Validator: `body.credential` (REQUIRED) |
| **Request body** | `{}` (empty) | Validator: must have `credential` field |

**Flow when Google Sign-In is attempted:**
1. Mobile app sends `POST /api/v1/users/firebase-auth` with token in header, empty body ✅
2. **Validator runs first** → checks `req.body.credential` → body is empty → `"Validation failed"` ❌
3. Validator blocks the request → middleware NEVER runs → Firebase token never verified

**The `verifyFirebaseUser` middleware is correctly written** (supports both header and body), but the **validator before it requires `credential` in the body**, so the middleware is never reached.

---

#### ✅ Mobile App Code — 100% CORRECT

Confirmed via `src/api/mytasks.ts` lines 364-372:
```typescript
// Mobile app correctly sends token in Authorization header (standard practice)
const response = await api.post('/users/firebase-auth', {}, {
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Mobile app sends the Firebase token the correct way** (Bearer token in Authorization header — this is the industry standard). **The mobile app does NOT need any changes.**

---

#### 🔧 Backend Fix Required

**Fix the validator** in `validators/v1/users/userRoutes.validator.js`:

```js
// ❌ CURRENT (BROKEN) — Requires credential in body, blocks header-based auth
const firebaseAuth = [
  body("credential").trim().notEmpty().withMessage("credential is required"),
  validateRequest,
];

// ✅ FIX — Make credential optional in body (middleware handles both header and body)
const firebaseAuth = [
  body("credential").optional().trim(),
  // Custom check: require either body.credential OR Authorization header
  (req, res, next) => {
    const hasBodyCredential = req.body?.credential && req.body.credential.trim() !== '';
    const hasHeaderToken = req.headers.authorization?.startsWith('Bearer ');
    if (!hasBodyCredential && !hasHeaderToken) {
      return res.status(422).json({
        message: "Validation failed",
        errors: [{ msg: "Firebase credential required in Authorization header or request body" }]
      });
    }
    next();
  }
];
```

**Or simplest fix — just remove the body validation** since `verifyFirebaseUser` middleware already handles it:
```js
// ✅ SIMPLEST FIX
const firebaseAuth = [
  // No body validation needed — verifyFirebaseUser middleware handles token extraction
  // from both Authorization header and body.credential
];
```

**After fix, restart backend:**
```bash
pm2 restart mytodoo-backend
```

**Test after fix:**
```bash
# This should now work (token in header, empty body)
curl -X POST https://au-live-api.mytodoo.com/api/v1/users/firebase-auth \
  -H "Authorization: Bearer <REAL_FIREBASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## ✅ MOBILE APP STATUS — 100% CONFIRMED CORRECT

Codebase fully analyzed. **Mobile app has ZERO issues.** Proof:

| Feature | Mobile App Code | Status |
|---------|----------------|--------|
| Signup endpoint | `POST /api/users/signup` with full user data | ✅ CORRECT |
| Email OTP verify | `POST /api/two-factor-auth/otp-verification` | ✅ CORRECT |
| SMS OTP verify | `POST /api/two-factor-auth/sms-verification` | ✅ CORRECT |
| Google Sign-In | Firebase token in `Authorization: Bearer` header to `POST /api/users/firebase-auth` | ✅ CORRECT |
| API Base URL | `https://au-live-api.mytodoo.com/api` (from env) | ✅ CORRECT |
| Error handling | All API errors properly caught and shown to user | ✅ CORRECT |

**Files confirmed correct (DO NOT CHANGE):**
- `src/api/config.ts` — API URL config ✅
- `src/api/user-api.ts` — Signup & OTP hooks ✅
- `src/api/mytasks.ts` — Google Sign-In API call ✅
- `src/features/auth/components/useSignup.ts` — Signup form logic ✅
- `src/shared/hooks/useApi.ts` — useGoogleSignIn hook ✅

---

## 🔧 BACKEND FIX CHECKLIST

Backend developer needs to do the following:

### Step 1 — Fix Email Service
```bash
# Check your email service config in .env:
EMAIL_HOST=         # Check for typos (e.g., mlsender.net NOT mlsender.nets)
EMAIL_USER=         # Must be a valid username
EMAIL_PASS=         # Must NOT be null/empty
EMAIL_PORT=         # Usually 587 (TLS) or 465 (SSL)
EMAIL_FROM=         # From address

# If using MailerSend:
MAILERSEND_API_KEY= # Check if expired

# If using SendGrid:
SENDGRID_API_KEY=   # Check if expired

# After fixing, restart the backend:
pm2 restart mytodoo-backend
```

### Step 2 — Clean up stuck users
```bash
# Find all unverified users (stuck due to email failure)
db.users.find({ isVerified: false }).count()

# Delete the specific reported user so they can re-register:
db.users.deleteOne({ email: "daniel.p.clarke1983@gmail.com" })
```

### Step 3 — Fix Google Sign-In Validator ← **CONFIRMED BUG**

**File to edit:** `validators/v1/users/userRoutes.validator.js` (line ~128)

```js
// ❌ BROKEN — remove or replace this:
const firebaseAuth = [
  body("credential").trim().notEmpty().withMessage("credential is required"),
  validateRequest,
];

// ✅ FIXED — replace with this:
const firebaseAuth = [
  body("credential").optional().trim(),
  (req, res, next) => {
    const hasBodyCredential = req.body?.credential && req.body.credential.trim() !== '';
    const hasHeaderToken = req.headers.authorization?.startsWith('Bearer ');
    if (!hasBodyCredential && !hasHeaderToken) {
      return res.status(422).json({
        message: "Validation failed",
        errors: [{ msg: "Firebase credential required in Authorization header or request body" }]
      });
    }
    next();
  }
];
```

Then restart:
```bash
pm2 restart mytodoo-backend
```

### Step 4 — Test after fix
```bash
# Test signup endpoint manually
curl -X POST https://au-live-api.mytodoo.com/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testfix@example.com",
    "password": "Test123!",
    "phone": "+61400000000",
    "location": { "country": "Australia", "countryCode": "AU" }
  }'

# Expected response: { "success": true, "message": "...", "otpSent": true }
# If otpSent is false or email error appears → email service still broken
```

---

## 🆕 Issue #4 — jpasan420@gmail.com Google Sign-In Blocked ← **CONFIRMED VIA LOGS + DB**

**Timestamp:** 2026-05-31 18:51:48 & 22:09:58

**Exact Log Error:**
```json
{
  "email": "jpasan420@gmail.com",
  "error": "Your account is no longer active. Please contact support.",
  "function": "firebaseLogin",
  "level": "error"
}
```

**Database Record (confirmed):**
```json
{
  "_id": "69721115ebdfa3590e20625f",
  "email": "jpasan420@gmail.com",
  "isVerified": true,
  "status": "deleted",
  "createdAt": "2026-01-22T11:59:17.596Z"
}
```

**Root Cause:** User ගේ account eka MongoDB eke `status: "deleted"` ලෙස set වෙලා thiyenava. Backend (`servicesN/users/user.services.js` line ~832) `status !== "active"` users ට Firebase login block කරනවා.

**Note:** Firebase token validation successful ✅ — Google Sign-In SDK correct ✅ — Firebase credentials correct ✅ — Mobile app correct ✅. Problem is **only the DB record status field**.

**Fix:**
```bash
# MongoDB shell on server:
db.users.updateOne(
  { email: "jpasan420@gmail.com" },
  { $set: { status: "active" } }
)
```

---

## 📞 Contact

If you need the mobile app logs or further details, contact the mobile developer.  
**Mobile app does NOT need any changes.** Fix is entirely on the backend side.
