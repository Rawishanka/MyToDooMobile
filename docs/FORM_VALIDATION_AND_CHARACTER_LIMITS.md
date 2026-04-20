# 📋 MyToDoo Mobile — Form Validation & Character Limits
## Complete Reference — All Forms, All Fields

---

## 📌 Quick Summary Table

| Screen / Form | Field | Min | Max | Counter Shown | Extra Rules |
|---|---|---|---|---|---|
| **Signup** | First Name | 2 | 50 | ❌ | Letters only (`a-zA-Z '-`) |
| **Signup** | Last Name | 2 | 50 | ❌ | Letters only (`a-zA-Z '-`) |
| **Signup** | Email | — | — | ❌ | Must match `x@x.x` regex |
| **Signup** | Password | 8 | — | ❌ | Upper + lower + number required |
| **Signup** | Confirm Password | — | — | ❌ | Must match password |
| **Signup** | Phone (AU) | 9 digits | 9 digits | ❌ | Must start with `4`, no leading `0` |
| **Signup** | Date of Birth | — | — | ❌ | Must be 18+ years old |
| **OTP Verify** | OTP Code | 6 | 6 | ❌ | Digits only |
| **Login** | Email | — | — | ❌ | Required |
| **Login** | Password | — | — | ❌ | Required |
| **Forgot Password** | Email | — | — | ❌ | Required, valid format |
| **Set New Password** | Password | 8 | — | ❌ | Upper + lower + number required |
| **Welcome Screen** | Task Description (quick) | — | 100 | ❌ | No numbers, no special chars |
| **Create Task — Title** | Title | 10 | 200 | ✅ | No numbers, letters+punctuation only |
| **Create Task — Title** | Description | 1 | — | ❌ | Required |
| **Create Task (full)** | Title | 10 | 200 | ✅ | No numbers, letters+punctuation only |
| **Create Task (full)** | Description | 20 | 1000 | ✅ | No numbers, letters+punctuation only |
| **Create Task** | Photos | 0 | 10 | ✅ | OCR validates for sensitive data |
| **Budget Screen** | Budget | $20 AUD equiv. | $10,000 AUD | ✅ (error only) | Per-currency min/max |
| **Edit Task** | Title | 10 | 200 | ✅ | Same as Create Task |
| **Edit Task** | Description | 20 | 1000 | ✅ | Same as Create Task |
| **Edit Task** | Photos | 0 | 10 | ✅ | OCR validates for sensitive data |
| **Make Offer** | Offer Amount | ≥ task budget | — | ❌ | Must be ≥ task budget |
| **Make Offer** | Message | 10 | — | ❌ | No phone/email (content moderation) |
| **Ask Question** | Question | 10 | 500 | ✅ | No phone/email (content moderation) |
| **Answer Question** | Answer | 10 | 1000 | ✅ | No phone/email (content moderation) |
| **Ask Question (Modal)** | Question | — | 500 | ✅ | Same as Ask Question screen |
| **Answer Question (Modal)** | Answer | — | 1000 | ✅ | No phone/email (content moderation) |
| **Task Chat** | Message | — | 500 | ❌ | — |
| **Mark Task Complete** | Notes | 0 (optional) | 500 | ❌ | Optional field |
| **Payment Notes** | Notes | 0 (optional) | 300 (default) | ✅ | Configurable via prop |
| **Rate & Review** | Review Text | 0 (optional) | — | ❌ | Optional, attachments max 5 |
| **Review Attachments** | Files | 0 | 5 | ✅ | Images or PDF/DOC, max 10MB each |
| **Profile — Account Info** | First Name | 2 | 50 | ✅ | Required |
| **Profile — Account Info** | Last Name | 2 | 50 | ✅ | Required |
| **Profile — Account Info** | Bio | 0 | 300 | ✅ | Optional |
| **Profile — Delete Account** | Reason | 0 | 500 | ✅ | Optional |
| **Profile Update Form** | First Name | 2 | 50 | ❌ | Alert on submit |
| **Profile Update Form** | Last Name | 2 | 50 | ❌ | Alert on submit |
| **Profile Update Form** | Username | — | 20 | ❌ | — |
| **Profile Update Form** | Display Name | — | 100 | ❌ | — |
| **Profile Update Form** | Bio | 0 | 300 | ❌ | Alert on submit if exceeded |
| **Profile Update Form** | Website | — | 100 | ❌ | — |
| **Contact Us** | Name | 1 | — | ❌ | Required |
| **Contact Us** | Email | 1 | — | ❌ | Required, valid format |
| **Contact Us** | Category | — | — | ❌ | Required — select from list |
| **Contact Us** | Subject | 1 | — | ❌ | Required |
| **Contact Us** | Message | 1 | 1000 | ✅ | Required |
| **Support Token** | Token | 10 | — | ❌ | Must start with `SUP-` |
| **Location / Search** | Location text | 2–3 | — | ❌ | Min 2-3 chars to trigger search |

---

## 1. 🔐 Authentication Forms

### 1.1 — Signup Form
**File:** [src/features/auth/components/SignupForm.tsx](src/features/auth/components/SignupForm.tsx)
**Validation file:** [src/features/auth/components/signup-helpers.ts](src/features/auth/components/signup-helpers.ts)

#### First Name
- **Min:** 2 characters
- **Max:** 50 characters (`maxLength={50}`)
- **Allowed:** Letters, spaces, apostrophes, hyphens (`/^[a-zA-Z\s'-]+$/`)
- **Errors:** `"Required"` | `"Only letters allowed"` | `"First name must not exceed 50 characters"`
- **When validated:** On field blur (real-time), on form submit

#### Last Name
- Same rules as First Name
- **Errors:** `"Required"` | `"Only letters allowed"` | `"Last name must not exceed 50 characters"`

#### Email
- **Format:** Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Errors:** `"Required"` | `"Please enter a valid email address"`

#### Password
- **Min:** 8 characters
- **Rules:** Must contain at least:
  - ✅ One uppercase letter (`/(?=.*[A-Z])/`)
  - ✅ One lowercase letter (`/(?=.*[a-z])/`)
  - ✅ One number (`/(?=.*\d)/`)
- **Errors:**
  - `"Password must be at least 8 characters"`
  - `"Password must contain at least one lowercase letter"`
  - `"Password must contain at least one uppercase letter"`
  - `"Password must contain at least one number"`

#### Confirm Password
- Must exactly match password field
- **Error:** `"Passwords do not match"`

#### Phone Number (Australia-only)
- **Format:** Digits only — 9 digits exactly (no leading `0`)
- **Must start with:** `4` (Australian mobile)
- **Country code:** `+61` prefix handled by CountryPicker
- **Leading 0 rejection:** If user types `0412345678`, they are shown:
  > "For Australia (+61), please enter your mobile number without the leading 0."
- **Valid example:** `412345678`
- **Errors:**
  - `"Please enter a valid Australian mobile number"` (non-digit chars)
  - `"Australian mobile numbers must be 9 digits (e.g., 412345678)"`
  - `"Australian mobile numbers must start with 4."`

#### Date of Birth
- **Minimum age:** 18 years
- **Error:** `"You must be at least 18 years old to sign up. You are currently X years old."`

---

### 1.2 — OTP Verification
**File:** [src/features/auth/components/OTPModal.tsx](src/features/auth/components/OTPModal.tsx)

| Field | Max | Notes |
|---|---|---|
| OTP Code | `maxLength={6}` | 6 digits, numeric keyboard |

---

### 1.3 — Set New Password Screen
**File:** [src/features/auth/screens/set-new-password-screen.tsx](src/features/auth/screens/set-new-password-screen.tsx)

Same password rules as Signup:
- **Min:** 8 characters
- Must contain uppercase, lowercase, and a number
- **Errors:**
  - `"Password must be at least 8 characters long"`
  - `"Password must contain at least one uppercase letter"`
  - `"Password must contain at least one lowercase letter"`
  - `"Password must contain at least one number"`
  - `"Passwords do not match"`

---

## 2. 📝 Task Creation Forms

### 2.1 — Welcome Screen (Quick Task Entry)
**File:** [src/features/dashboard/screens/welcome-screen.tsx](src/features/dashboard/screens/welcome-screen.tsx)

| Field | Max | Notes |
|---|---|---|
| Task Description | `maxLength={100}` | No numbers allowed, no special chars |

- **No numbers rule:** If user types digits → auto-removed + error shown:
  > `"Numbers are not allowed. Only letters, spaces, and basic punctuation."`
- **Special char rule:** Only `'`, `-`, `,`, `.` allowed
  > `"Only letters, spaces, and basic punctuation (' - , .) are allowed."`
- **Too long error:** `"Task description is too long (max 100 characters)"`

---

### 2.2 — Title Screen (Multi-Step Flow)
**File:** [src/features/tasks/screens/create/title-screen.tsx](src/features/tasks/screens/create/title-screen.tsx)

#### Title
- **Min:** 10 characters
- **Max:** 200 characters (`maxLength={200}`)
- **Counter:** ✅ Shown as `X/200` near field
- **Validation hint:** `"Minimum 10 characters required"` shown below field
- **Form is invalid until:** category selected + title ≥ 10 chars + description not empty

#### Description (short)
- Required (non-empty)
- No explicit char counter shown here

---

### 2.3 — Create Task Screen (Combined/Full)
**File:** [src/features/tasks/screens/create/create-task-screen.tsx](src/features/tasks/screens/create/create-task-screen.tsx)

#### Title
- **Min:** 10 characters
- **Max:** 200 characters (`maxLength={200}`)
- **Counter:** ✅ `{titleLength}/200`
- **No numbers rule:** Numbers auto-stripped + Alert shown:
  > `"Task titles can only contain letters, spaces, and basic punctuation (apostrophes, hyphens, commas, periods)."`
- **Allowed chars:** `/[^a-zA-Z\s'\-,.]/` stripped
- **Errors (inline):**
  - `"Title is required"`
  - `"Minimum 10 characters required"`
- **Validated:** On change (if touched), on blur

#### Description
- **Min:** 20 characters
- **Max:** 1000 characters (`maxLength={1000}`)
- **Counter:** ✅ `{descriptionLength}/1000`
- **Allowed chars:** Same as title (`/[^a-zA-Z\s'\-,.]/` stripped)
- **Errors (inline):**
  - `"Description is required"`
  - `"Minimum 20 characters required"`

#### Photos / Images
- **Max:** 10 photos
- **Counter:** ✅ `({images.length}/10 photos)`
- **OCR Validation:** Each uploaded image is scanned for:
  - Phone numbers
  - Email addresses
  - If detected → upload blocked with alert:
    > `"This image contains sensitive information and cannot be uploaded:\n\n{reason}\n\nPlease remove phone numbers and addresses before uploading."`

---

### 2.4 — Budget Screen
**File:** [src/features/tasks/screens/create/budget-screen.tsx](src/features/tasks/screens/create/budget-screen.tsx)

| Rule | Value |
|---|---|
| **Minimum Budget (AUD)** | $20.00 |
| **Maximum Budget** | $10,000.00 |
| **Counter** | ❌ (error message shown instead) |

- **Min/Max are currency-aware** — see `getMinimumBudget()` in [src/shared/utils/currency.ts](src/shared/utils/currency.ts)
- **Minimum budget by currency (equivalent to ~$20 USD):**

| Currency | Min | Currency | Min |
|---|---|---|---|
| AUD | $20 | NZD | $35 |
| USD | $20 | GBP | £16 |
| EUR | €19 | SGD | $27 |
| LKR | Rs 6,000 | INR | ₹1,650 |
| JPY | ¥3,000 | PHP | ₱1,100 |

- **Error messages:**
  - `"Minimum budget is {symbol}{amount}"`
  - `"Maximum budget is {symbol}{amount}"`
- **Info hint:** `"Minimum budget is $20.00. Don't worry, you can always negotiate the final price later"`

---

### 2.5 — Edit Task Screen
**File:** [src/features/tasks/screens/mytasks/edit-mytasks-screen.tsx](src/features/tasks/screens/mytasks/edit-mytasks-screen.tsx)

Identical to Create Task:
- **Title:** Min 10, Max 200, counter `{titleLength}/200`
- **Description:** Min 20, Max 1000, counter `{descriptionLength}/1000`
- **Photos:** Max 10, counter `{images.length}/10 photos`
- **Budget:** Min = currency minimum, no hard max enforced in edit

---

## 3. 💬 Offers

### 3.1 — Make Offer Screen
**File:** [src/features/tasks/screens/offers/make-offer-screen.tsx](src/features/tasks/screens/offers/make-offer-screen.tsx)
**Logic:** [src/features/tasks/screens/offers/hooks/useOfferSubmission.ts](src/features/tasks/screens/offers/hooks/useOfferSubmission.ts)

#### Offer Amount
- **Minimum:** Must be ≥ task's posted budget
- **Format:** Decimal number, commas accepted (`1,500.00`)
- **Counter:** ❌ (error shown inline)
- **Errors:**
  - `"Please enter an offer amount."`
  - `"Please enter a valid positive amount."`
  - `"Offer amount must be at least {symbol}{budget} (task budget)."`

#### Message
- **Min:** 10 characters (trimmed)
- **Counter:** ❌ (hint shown: `"Explain your relevant experience and approach (min. 10 characters)"`)
- **Content Moderation:** ✅ Blocks phone numbers, email addresses, obfuscated contacts
- **Errors:**
  - `"Please include a message with your offer."`
  - `"Your message should be at least 10 characters long."`
  - `"Your message contains inappropriate content."` (from moderation)
- **1 offer per task:** User blocked from submitting if they already have an offer

---

## 4. ❓ Questions & Answers

### 4.1 — Ask Question Screen
**File:** [src/features/tasks/screens/questions/ask-question-screen.tsx](src/features/tasks/screens/questions/ask-question-screen.tsx)

| Field | Min | Max | Counter | Moderation |
|---|---|---|---|---|
| Question | 10 | 500 | ✅ `{question.length}/500 characters` | ✅ No phone/email |
| Attachments | 0 | 3 files | ✅ | ✅ OCR on images |

- **Submit disabled** when `question.trim().length < 10`
- **Error:** `"Question must be at least 10 characters"`
- **Content moderation error:** Blocks phone numbers, emails

---

### 4.2 — Ask Question Modal
**File:** [src/features/tasks/screens/detail/components/AskQuestionModal.tsx](src/features/tasks/screens/detail/components/AskQuestionModal.tsx)

| Field | Max | Counter |
|---|---|---|
| Question | 500 | ✅ `{questionText.length}/500` |
| Attachments | 3 | ✅ |

---

### 4.3 — Answer Question Screen
**File:** [src/features/tasks/screens/questions/answer-question-screen.tsx](src/features/tasks/screens/questions/answer-question-screen.tsx)

| Field | Min | Max | Counter | Moderation |
|---|---|---|---|---|
| Answer | 10 | 1000 | ✅ `{answer.length}/1000 characters` | ✅ No phone/email |
| Attachments | 0 | 3 files | ✅ | ✅ OCR on images |

- **Submit disabled** when `answer.trim().length < 10`

---

### 4.4 — Answer Question Modal
**File:** [src/features/tasks/screens/detail/components/AnswerQuestionModal.tsx](src/features/tasks/screens/detail/components/AnswerQuestionModal.tsx)

| Field | Min | Max | Counter | Moderation |
|---|---|---|---|---|
| Answer | — | 1000 | ✅ `{answer.length}/1000 characters` | ✅ No phone/email |

---

### 4.5 — Task Questions (Q&A Tab on Task Detail)
**File:** [src/features/tasks/screens/questions/task-questions.tsx](src/features/tasks/screens/questions/task-questions.tsx)

| Field | Min | Max | Counter |
|---|---|---|---|
| New Question | 10 | 500 | ✅ `{newQuestion.length}/500 characters` |

- **Submit disabled + opacity 0.5** when `newQuestion.trim().length < 10`

---

## 5. 💬 Chat / Messaging

### 5.1 — Chat Window
**File:** [src/features/messages/components/ChatWindow.tsx](src/features/messages/components/ChatWindow.tsx)

| Field | Max | Counter |
|---|---|---|
| Chat Message | 500 | ❌ |

---

## 6. ✅ Task Completion

### 6.1 — Mark Task Complete Modal
**File:** [src/features/task-completion/screens/completion/components/MarkCompleteModal.tsx](src/features/task-completion/screens/completion/components/MarkCompleteModal.tsx)

| Field | Max | Counter | Required? |
|---|---|---|---|
| Completion Notes | 500 | ❌ | ❌ Optional |

---

## 7. 💳 Payments

### 7.1 — Payment Notes Component
**File:** [src/features/tasks/screens/payment/components/PaymentNotes.tsx](src/features/tasks/screens/payment/components/PaymentNotes.tsx)

| Field | Max (default) | Counter | Notes |
|---|---|---|---|
| Payment Notes | 300 | ✅ `{notes.length}/{maxLength} characters` | `maxLength` is a prop (default 300) |

- Used in: Complete Payment Screen (`maxLength={300}`)

---

## 8. ⭐ Reviews & Ratings

### 8.1 — Rate & Review Modal
**File:** [src/features/tasks/components/RatingReviewModal.tsx](src/features/tasks/components/RatingReviewModal.tsx)

| Field | Max | Counter | Required? |
|---|---|---|---|
| Star Rating | 5 stars | N/A | ✅ Required to submit |
| Review Text | — (no hard limit) | ❌ | ❌ Optional |
| Attachments | 5 files | ✅ | ❌ Optional |

- **Attachment rules:** Images + PDF/DOC/DOCX, max 10MB each, max 5 files
- **Error if already reviewed:** `"You have already submitted a review for this task."`

---

## 9. 👤 Profile Forms

### 9.1 — Account Information Screen
**File:** [src/features/profile/screens/accountinformation.tsx](src/features/profile/screens/accountinformation.tsx)

| Field | Min | Max | Counter |
|---|---|---|---|
| First Name | 2 | 50 | ✅ `{firstName.length}/50` |
| Last Name | 2 | 50 | ✅ `{lastName.length}/50` |
| Bio | 0 | 300 | ✅ `{bio.length}/300` |
| Delete Account Reason | 0 | 500 | ✅ `{deleteReason.length}/500` |

- **Validation on submit:**
  - `"First name must be at least 2 characters."` (Alert)
  - `"Last name must be at least 2 characters."` (Alert)
- **Profile picture:** OCR validated before upload

---

### 9.2 — Profile Update Form
**File:** [src/shared/components/custom_components/profile-update-form.tsx](src/shared/components/custom_components/profile-update-form.tsx)

| Field | Min | Max | Counter |
|---|---|---|---|
| First Name | 2 | 50 | ❌ |
| Last Name | 2 | 50 | ❌ |
| Username | — | 20 | ❌ |
| Display Name | — | 100 | ❌ |
| Bio | 0 | 300 | ❌ |
| Website | — | 100 | ❌ |
| Skills (each) | — | 50 | ❌ |
| Location label | — | 100 | ❌ |

- **Validation errors (Alert on submit):**
  - `"First name must be at least 2 characters."`
  - `"Last name must be at least 2 characters."`
  - `"Bio must be 300 characters or less (currently X)."`

---

## 10. 📞 Contact & Support

### 10.1 — Contact Us
**File:** [src/shared/components/custom_components/contact-us.tsx](src/shared/components/custom_components/contact-us.tsx)

| Field | Required | Max | Counter |
|---|---|---|---|
| Full Name | ✅ | — | ❌ |
| Email | ✅ | — | ❌ |
| Category | ✅ | — | ❌ (dropdown) |
| Subject | ✅ | — | ❌ |
| Message | ✅ | 1000 | ✅ `{message.length} / 1000 characters` |

- **All Required Field errors:** Alert with `"Required Field"` title
- **Support Token check:** Must start with `"SUP-"` and be ≥ 10 characters
  - Error: `"Please enter a valid support token (e.g., SUP-MKC96L84-1DB89E2D)"`

---

## 11. 🛡️ Content Moderation System

**File:** [src/shared/utils/contentModeration.ts](src/shared/utils/contentModeration.ts)

This is applied on: **Offer messages**, **Questions**, **Answers**

### What is blocked:

| Type | Examples detected |
|---|---|
| **Phone numbers** | `0412 345 678`, `+61 412 345 678`, `+1 234 567 8900`, `(123) 456-7890` |
| **Email addresses** | `user@email.com`, `user [at] email [dot] com` |
| **Contact obfuscation** | `"call me at..."`, `"dm me"`, `"my number is..."`, `"inbox me"` |

- **Result:** `{ isClean: false, reason: "...", detectedType: 'phone'|'email'|'contact' }`
- **User sees:** Inline error under field explaining what was detected

---

## 12. 🖼️ Image OCR Validation

**File:** [src/shared/components/AttachmentPicker.tsx](src/shared/components/AttachmentPicker.tsx)
**Applied on:** Task photos, question attachments, answer attachments, profile picture

### What is blocked:
- Images containing phone numbers or email addresses (detected via OCR API)
- **Alert shown:**
  > `"This image contains sensitive information and cannot be uploaded:\n\n{reason}\n\nPlease remove phone numbers and addresses before uploading."`

---

## 13. 📍 Location Fields

### Location Autocomplete
**File:** [src/shared/components/LocationAutocomplete.tsx](src/shared/components/LocationAutocomplete.tsx)

- **Minimum chars to trigger search:** 2 characters
- **Minimum chars to validate:** 2–3 characters

### Simple Location Input
**File:** [src/shared/components/SimpleLocationInput.tsx](src/shared/components/SimpleLocationInput.tsx)

- **Min:** `address.trim().length < 3` → shows validation error

---

## 14. 🏷️ Attachment Picker (Reusable Component)

**File:** [src/shared/components/AttachmentPicker.tsx](src/shared/components/AttachmentPicker.tsx)

| Property | Default | Configurable |
|---|---|---|
| Max attachments | 5 | ✅ via `maxAttachments` prop |
| Counter shown | ✅ `(X/maxAttachments)` | — |
| OCR validation | ✅ | — |

**Used with:**
- `maxAttachments={3}` → Ask Question, Answer Question screens
- `maxAttachments={5}` → Default (Review attachments)

---

## 15. 🧩 How Validation Is Handled — Patterns Used

### Pattern A: `maxLength` prop (hard UI limit)
React Native `TextInput` `maxLength` prop — user physically cannot type beyond limit.
```tsx
<TextInput maxLength={500} />
```
Used by: most text fields

### Pattern B: Character counter display
```tsx
<Text>{field.length}/500 characters</Text>
```
Used by: Title, Description, Bio, Questions, Answers, Message, Contact

### Pattern C: Inline error text
```tsx
{error && <Text style={styles.errorText}>{error}</Text>}
```
Used by: Create Task (Title, Description), Offer form, Budget

### Pattern D: Alert on submit
```tsx
Alert.alert('Validation Error', 'First name must be at least 2 characters.');
```
Used by: Profile Update, Signup (legacy helper), Contact Us

### Pattern E: Button disabled
```tsx
disabled={question.trim().length < 10}
```
Used by: Ask Question, Answer Question, Task Questions

### Pattern F: Content Moderation (async check)
```tsx
const result = moderateContent(text);
if (!result.isClean) setError(result.reason);
```
Used by: Offer message, Questions, Answers

### Pattern G: OCR Image Validation (async)
```tsx
const validation = await OCRAPI.validateImageForUpload(imageUri);
if (!validation.isValid) Alert.alert('...', validation.reason);
```
Used by: All image upload areas

---

## 16. ⚠️ Known Inconsistencies

| Issue | Detail |
|---|---|
| **Offer Message** has no `maxLength` prop | `OfferForm.tsx` has no `maxLength` on the message `TextInput` — only min-10 validation via `useOfferSubmission.ts` |
| **Review Text** has no `maxLength` or counter | `RatingReviewModal.tsx` — review text field has no limit |
| **Mark Complete Notes** has no counter | `MarkCompleteModal.tsx` — `maxLength={500}` but no `{notes.length}/500` counter shown |
| **Chat messages** have no counter | `ChatWindow.tsx` — `maxLength={500}` but no counter visible |
| **Contact Us Subject** has no `maxLength` | Only `required` check, no character limit enforced |
| **Signup Phone** — UI allows typing digits | But length/format check only happens on submit, not real-time |
