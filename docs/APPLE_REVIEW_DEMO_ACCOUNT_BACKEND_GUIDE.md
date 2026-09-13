# Apple App Store Review — Demo Account Setup (Backend Team)

> **Audience:** Backend / DevOps team  
> **Requested by:** Mobile team (iOS App Store resubmission)  
> **Environment:** **LIVE production only** — `https://au-live-api.mytodoo.com/api`  
> **Updated:** June 2026

---

## Why this is needed

Apple rejected iOS build **1.0.8 (54)** under **Guideline 2.1 — Information Needed**:

> The app binary includes **PassKit** (Apple Pay via Stripe), but reviewers could not find Apple Pay in the app.

Apple Pay is **not on the home screen**. It only appears when a **task poster accepts a pending offer** and the **Stripe Payment Sheet** opens.

The mobile app connects to **live API** in production builds. The demo account and test data must exist on **live**, not UAT only.

**Mobile team does not create this data** — backend/admin must seed it so Apple reviewers can log in and reach the payment flow immediately.

---

## What Apple reviewers will do (mobile app path)

After logging in with the demo account:

1. Bottom tab → **My Tasks**
2. Top toggle → **Poster** (default is Tasker — must switch)
3. Sub-tab → **Posted**
4. Open a task showing **Offers: 1** (or more)
5. Tap **Offers** → tap **Accept Offer**
6. Stripe Payment Sheet opens → **Apple Pay** button (if Wallet has a card) or card form

If step 4 fails (no task with pending offer), Apple rejects again.

---

## Accounts to create / maintain

### 1. Primary — Apple Review demo account (Poster)

| Field | Value |
|-------|-------|
| Email | `appreviewer@mytodoo.com` |
| Password | `AppReview2026!` |
| Role | Task **poster** (task creator) |
| Email verified | **Yes** (required) |
| Profile | Complete (name, photo if required by app) |
| Onboarding | Fully completed |
| Account status | Active — **never disable or delete during review** |

Create via Firebase Auth + backend user record (same as normal signup), or admin panel if available.

### 2. Secondary — Tasker account (creates the pending offer)

| Field | Suggested value |
|-------|-----------------|
| Email | `appreviewer-tasker@mytodoo.com` (or any internal test tasker) |
| Password | Strong internal password (not shared with Apple) |
| Role | Task **tasker** (makes offers) |
| Profile | Complete enough to submit offers |

This account is **only for seeding data**. Apple does **not** need these credentials — only the poster demo account.

---

## Data to seed on LIVE

### Minimum required (critical for Apple Pay review)

| Item | Requirement |
|------|-------------|
| **1 open task** | Created by `appreviewer@mytodoo.com` |
| Task `status` | `open` or `active` (shows in **Posted** tab — **not** `assigned` / `accepted`) |
| **1 pending offer** | Created by tasker account on that task |
| Offer `status` | `pending` |
| Offer amount | e.g. `50.00` AUD (any reasonable test amount) |
| Location / category | Valid live data (Melbourne/Sydney AU recommended) |

### Recommended (better review experience)

| Item | Notes |
|------|-------|
| 2–3 posted tasks | Variety for browsing |
| 1 task with pending offer | **Required** for payment / Apple Pay |
| 1–2 chat threads | Optional — smoother general review |
| No accepted/paid tasks blocking flow | Do not pre-accept the offer used for Apple Pay testing |

### Do NOT

- Pre-accept the demo offer (payment would already be done)
- Set demo task to `assigned`, `in_progress`, `completed`, or `cancelled`
- Create data on UAT only — **App Store build uses live API**
- Delete or reset demo account during Apple review (2–5 days)
- Expire or lock the demo password

---

## API endpoints (mobile app uses these)

Base URL: **`https://au-live-api.mytodoo.com/api`**

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Login | POST | `/auth/login` (or your auth route) | No |
| Create task | POST | `/tasks` | Poster token |
| List my tasks | GET | `/tasks/my-tasks` | User token |
| Create offer | POST | `/tasks/:taskId/offers` | Tasker token |
| List offers | GET | `/tasks/:taskId/offers` | User token |
| Accept offer (after payment) | POST | `/tasks/:taskId/offers/:offerId/accept` | Poster token |
| **Create payment intent** | POST | `/payments/create-intent` | Poster token |

### Create offer (tasker) — request body (mobile sends)

```json
{
  "amount": 50,
  "message": "Apple Review test offer — please do not accept until testing payment."
}
```

### Create payment intent (poster, when Accept Offer tapped) — request body

```json
{
  "taskId": "<task_id>",
  "offerId": "<offer_id>",
  "amount": 50,
  "currency": "AUD"
}
```

Backend must return a valid Stripe **PaymentIntent** `clientSecret` for live Stripe keys on production.

---

## Suggested setup procedure (backend)

### Step 1 — Create poster demo user

1. Register `appreviewer@mytodoo.com` / `AppReview2026!` on **live**
2. Verify email
3. Complete profile (match app requirements: name, location AU, etc.)

### Step 2 — Create tasker user

1. Register `appreviewer-tasker@mytodoo.com` (or use existing internal tasker)
2. Complete profile

### Step 3 — Poster posts a task

1. Log in as `appreviewer@mytodoo.com`
2. Create a task via API or app:
   - Title e.g. `Apple Review Test Task — Do Not Complete`
   - Status must end as **`open`** or **`active`**
   - Valid AU location, category, budget

### Step 4 — Tasker submits pending offer

1. Log in as tasker account
2. `POST /tasks/{taskId}/offers` with amount + message
3. Confirm offer `status === pending` in DB

### Step 5 — Verify poster view

1. Log in as `appreviewer@mytodoo.com`
2. `GET /tasks/my-tasks` (or equivalent) — task visible with pending offer
3. Confirm task status still `open` / `active`

### Step 6 — Smoke test payment intent (no real charge required for this step)

1. As poster, call `POST /payments/create-intent` with `taskId`, `offerId`, `amount`, `currency: AUD`
2. Must return `clientSecret` without 4xx/5xx
3. Optional: complete test payment with Stripe test card in staging — on **live**, Apple may use real Wallet; intent creation succeeding is the minimum backend check

---

## Acceptance criteria (backend sign-off)

Before telling mobile team “ready”, confirm all of:

- [ ] `appreviewer@mytodoo.com` logs in on **live** mobile app
- [ ] **My Tasks → Poster → Posted** shows at least one task
- [ ] Task card shows **Offers: 1** (or more)
- [ ] Tapping **Accept Offer** opens Stripe sheet (mobile test)
- [ ] `POST /payments/create-intent` succeeds for that task/offer
- [ ] Demo account will stay active for **14+ days**
- [ ] Credentials shared with mobile team for App Store Connect

---

## Credentials for App Store Connect (mobile team fills these)

Mobile team will enter in **App Store Connect → App Review Information**:

| Field | Value |
|-------|-------|
| Username | `appreviewer@mytodoo.com` |
| Password | `AppReview2026!` |

Backend must ensure this password works on live and is not forced to reset.

---

## Stripe / Apple Pay notes (backend)

- iOS live app uses **live Stripe publishable key** (`pk_live_...`)
- Apple Pay merchant ID: `merchant.com.mytodoo.mytodoolive`
- `POST /payments/create-intent` must work for the demo task/offer pair
- If intent creation fails, reviewers see an error instead of Apple Pay — fix backend/Stripe before resubmit

---

## Maintenance during review

| When | Action |
|------|--------|
| Before resubmit | Re-test demo login + pending offer |
| During review (2–5 days) | Do not delete demo users/tasks/offers |
| After accidental accept | Re-seed new open task + pending offer |
| Password policy | Whitelist demo account from forced password reset |

---

## Contact

If task/offer/payment APIs behave differently on live, document the actual admin steps or scripts used and notify the mobile team.

**Related mobile docs:** `docs/STRIPE_GOOGLE_PAY_APPLE_PAY_INTEGRATION.md`, `docs/SUBMISSION_CHECKLIST.md`

---

## Quick summary (සිංහල — backend lead)

| Item | Detail |
|------|--------|
| Environment | **Live** — `au-live-api.mytodoo.com` |
| Demo login | `appreviewer@mytodoo.com` / `AppReview2026!` |
| Main work | Account create + **open task** + **pending offer** seed |
| Why | Apple reviewer Accept Offer → Stripe → Apple Pay path test කරන්න |
| UAT enough? | **නැහැ** — App Store build live API use කරනවා |
