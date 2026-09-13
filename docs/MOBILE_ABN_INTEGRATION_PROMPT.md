# MyToDoo Mobile — ABN Integration Prompt (v2)

**Full document:** same content as  
`/Users/janidu/Documents/mytodoo_frntnend/mytodo-frontend/docs/mobile-abn-integration-prompt.md`

Copy that file here or open it directly. Summary below.

---

## Status (2026-06-17)

| Layer | Status |
|-------|--------|
| Backend UAT ABN APIs | ✅ Live |
| Web ABN (signup + payout + profile) | ✅ Git `efc8597` on `main` |
| Mobile ABN | ❌ **Not built — use this prompt** |

---

## Mobile must implement (100% web parity)

### 1. Signup — optional ABN ✅ in web, ❌ mobile

- When **“Register as a Tasker”** checked (`notifyNewTask`) → show optional ABN field
- User can **skip** (empty = OK)
- If filled → validate checksum before signup
- Store in `AsyncStorage` (`pendingSignupAbn`)
- After **first login** → `PUT /users/me/tasker/abn`
- **Do NOT** send `abn` in `POST /users/signup`

**Files:** `SignupForm.tsx`, `useSignup.ts`, `login-screen.tsx`

### 2. Payout — ABN before Stripe ✅ web, ❌ mobile

- `GET /users/me/tasker/abn` on mount
- Show `TaskerAbnSection` first
- Block Stripe until `abnVerified`
- Handle 403 `ABN_REQUIRED`

**Files:** `payout-account-screen.tsx`, `stripe-connect-api.ts`

### 3. Profile — ABN section ✅ web, ❌ mobile

- Compact ABN card for taskers
- Gate “Setup Payout” button

**Files:** `accountinformation.tsx` or profile stack

### 4. New shared code

- `src/api/abn-api.ts`
- `src/shared/utils/abnValidation.ts`
- `src/features/profile/components/TaskerAbnSection.tsx`

### 5. Do NOT change

- Offer screens (no ABN API gate)
- Google / Apple signup (no ABN field)

---

## Web vs mobile signup difference

| | Web | Mobile |
|---|-----|--------|
| After OTP | JWT → submit ABN immediately | Go to login → submit ABN after login |
| Pending ABN | Router state `pendingAbn` | AsyncStorage `pendingSignupAbn` |

---

## API quick reference

```
GET  /users/me/tasker/abn
PUT  /users/me/tasker/abn   { "abn": "51 824 753 556" }
POST /stripe/connect/account  → 403 ABN_REQUIRED if no ABN
```

Test ABN: `51 824 753 556`

---

## Branch & build

```bash
git checkout flutter-migration
./build-uat-apk.sh
```

---

**For full code samples, file-by-file instructions, and test checklist → open the complete prompt file in frontend `docs/mobile-abn-integration-prompt.md` (v2).**
