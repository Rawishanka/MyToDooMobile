# Tasker Notify Feature — Complete Implementation Guide
## `notifyNewTask` / `notifySkillMatch`

> **Date:** May 2026  
> **Feature:** Allow taskers to control whether they receive push notifications for new tasks, and optionally filter to only skillset-matched tasks.  
> **Status:** Mobile ✅ Done | Web ✅ Done | Backend Controller ❌ **Fix Required**

---

## 📋 Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Architecture — Data Flow](#2-architecture--data-flow)
3. [Mobile App Changes (React Native / Expo)](#3-mobile-app-changes-react-native--expo)
4. [Web Frontend Changes (React / Vite)](#4-web-frontend-changes-react--vite)
5. [Backend Fix Required](#5-backend-fix-required)
6. [Backend — Already Correct Files (No Changes)](#6-backend--already-correct-files-no-changes)
7. [How to Apply the Backend Fix](#7-how-to-apply-the-backend-fix)
8. [Testing Checklist](#8-testing-checklist)
9. [Summary Table](#9-summary-table)

---

## 1. Feature Overview

Two boolean fields are added to the user profile:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `notifyNewTask` | Boolean | `true` | User wants to receive push notifications when new tasks are posted |
| `notifySkillMatch` | Boolean | `false` | Only notify if the task matches the user's skill categories |

**Business Logic:**
- If `notifyNewTask = false` → user gets NO new-task notifications (regardless of skillMatch)
- If `notifyNewTask = true` AND `notifySkillMatch = false` → user gets ALL new task notifications
- If `notifyNewTask = true` AND `notifySkillMatch = true` → user gets notifications ONLY for tasks in their skill categories

**UI Rule:** The `notifySkillMatch` toggle is **disabled** when `notifyNewTask` is OFF.

---

## 2. Architecture — Data Flow

```
┌──────────────────────────────────────────────────────┐
│              Mobile App (React Native)               │
│  SignupForm.tsx ──────────────────────────────────── │
│    POST /users/signup                                │
│    { notifyNewTask, notifySkillMatch }               │
│                                                      │
│  NotificationPreferences.jsx ─────────────────────  │
│    PUT /users/profile                                │
│    { notifyNewTask, notifySkillMatch }               │
└─────────────────────┬────────────────────────────────┘
                      │  HTTP API
┌─────────────────────▼────────────────────────────────┐
│              Web Frontend (React/Vite)               │
│  Auth/hooks/useAuthApi.ts ────────────────────────── │
│    POST /users/signup                                │
│    { notifyNewTask, notifySkillMatch }               │
│                                                      │
│  services/profileService.ts ──────────────────────  │
│    PUT /users/profile                                │
│    { notifyNewTask, notifySkillMatch }               │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│                   Backend (Node.js)                  │
│  controllers/users/users.controller.js               │
│    ❌ BUG: Does NOT pass notifyNewTask/notifySkillMatch│
│    to userService.updateProfile()                    │
│                                                      │
│  servicesN/users/user.services.js                    │
│    ✅ Handles both fields correctly                  │
│                                                      │
│  validators/userRoutes.validator.js                  │
│    ✅ Validates both fields as optional booleans     │
│                                                      │
│  models/user/User.js                                 │
│    ✅ Both fields defined with DB indexes            │
└──────────────────────────────────────────────────────┘
```

---

## 3. Mobile App Changes (React Native / Expo)

**Project:** `/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile`

### 3.1 — New Screen: `NotificationPreferences.jsx` ✅

**File:** `src/features/profile/screens/notificationpreferences.jsx`  
**Status:** Fully implemented (228 lines)

**What it does:**
- Shows "Tasker Preferences" screen with two Switch toggles
- Reads initial values from `userData` props (`notifyNewTask`, `notifySkillMatch`)
- On Save → calls `PUT /users/profile { notifyNewTask, notifySkillMatch }`
- Uses `useUpdateUserProfile()` hook from `src/shared/hooks/useUserProfileApi.ts`
- `notifySkillMatch` toggle is disabled when `notifyNewTask = false`
- Header has back button + Save button + bottom Save Preferences button

**Key code:**
```jsx
const handleSave = async () => {
  await updateProfile.mutateAsync({
    notifyNewTask,
    notifySkillMatch,
  });
  Alert.alert('Saved', 'Tasker preferences updated successfully.');
  onBack();
};
```

---

### 3.2 — Profile Screen Navigation ✅

**File:** `src/features/profile/screens/profile-screen.tsx`

**Changes made:**
1. Uncommented the `if (currentScreen === 'notifications')` routing block (line ~603)
2. Uncommented the "NOTIFICATION SETTINGS" menu section (line ~1107)
3. MenuItem text = `"Tasker Preferences"`, subtext = `"Manage task notification settings"`
4. `navigateToNotifications()` → `setCurrentScreen('notifications')`

**Key code:**
```tsx
// Route to screen
if (currentScreen === 'notifications') {
  return <NotificationPreferences onBack={navigateToAccount} userData={userData} />;
}

// Menu item in profile
<Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
<MenuItem
  icon={<Ionicons name="notifications-outline" size={20} color="#0052A2" />}
  text="Tasker Preferences"
  subtext="Manage task notification settings"
  onPress={navigateToNotifications}
/>
```

---

### 3.3 — Signup Form ✅

**File:** `src/features/auth/components/SignupForm.tsx`

**What it does:**
- Two checkboxes shown during signup:
  1. "Register as a Tasker" → `notifyNewTask`
  2. "Only notify me of tasks in my skillset" → `notifySkillMatch` (disabled if notifyNewTask=false)
- Props: `notifyNewTask`, `notifySkillMatch`, `setNotifyNewTask`, `setNotifySkillMatch`

---

### 3.4 — Signup Hook ✅

**File:** `src/features/auth/components/useSignup.ts`

**Changes:**
- Default: `notifyNewTask = true` (line 65), `notifySkillMatch = false` (line 66)
- Both sent in `POST /users/signup` payload (lines 329–330)

---

### 3.5 — API Type Definitions ✅

**File:** `src/api/user-profile-api.ts`

```typescript
// UserProfile interface (lines 44-45)
notifyNewTask?: boolean;
notifySkillMatch?: boolean;

// UpdateProfileRequest interface (lines 65-66)
notifyNewTask?: boolean;
notifySkillMatch?: boolean;
```

---

### 3.6 — React Query Hook ✅

**File:** `src/shared/hooks/useUserProfileApi.ts`

- `useUpdateUserProfile()` hook at line 164
- Accepts full `UpdateProfileRequest` including both fields
- Calls `PUT /users/profile`

---

### 3.7 — Version ✅

**File:** `android/app/build.gradle`
- `versionCode 23`, `versionName "1.2.2"`
- APK: `builds/Mytodoo_uat_v1.2.2.apk` (185MB)

---

## 4. Web Frontend Changes (React / Vite)

**Project:** `/Users/janidu/Documents/mytodoo_frntnend/mytodo-frontend`

> **The web frontend already has all required code in place.** The bug is the same backend controller bug — once the backend is fixed, the web will also work correctly automatically.

### 4.1 — Profile Service ✅

**File:** `src/services/profileService.ts` (lines 127–151)

```typescript
async updateTaskerSettings(settings: {
  isTasker: boolean;
  notifyAllTasks: boolean;   // frontend name
  notifyMySkillset: boolean; // frontend name
  taskerCategories: string[];
}): Promise<UserProfile> {
  const apiPayload = {
    isTasker: settings.isTasker,
    notifyNewTask: settings.notifyAllTasks,      // ✅ mapped to backend name
    notifySkillMatch: settings.notifyMySkillset, // ✅ mapped to backend name
    taskerCategories: settings.taskerCategories,
  };
  // PUT /users/profile
  const response = await axios.put(`${getApiUrl()}/users/profile`, apiPayload, { ... });
  return response.data.data;
}
```

---

### 4.2 — Profile Page ✅

**File:** `src/pages/ProfilePage.tsx`

- State: `taskerSettings = { isTasker, notifyAllTasks, notifyMySkillset, taskerCategories }`
- On load (useEffect), maps backend fields to frontend names:
  ```typescript
  notifyAllTasks: (userData.notifyNewTask ?? userData.notifyAllTasks) !== false,
  notifyMySkillset: (userData.notifySkillMatch ?? userData.notifyMySkillset) || false,
  ```
- Save button calls `profileService.updateTaskerSettings(taskerSettings)` ✅

---

### 4.3 — Signup Hook ✅

**File:** `src/pages/Auth/hooks/useAuthApi.ts` (lines 73–75)

```typescript
notifyNewTask: formData.isTasker ? (formData.notifyAllTasks !== false) : false,
notifySkillMatch: formData.isTasker ? (formData.notifyMySkillset || false) : false,
```

---

## 5. Backend Fix Required

> ❌ **This is the ONLY remaining bug. Both Mobile and Web already send correct API requests.**

### 5.1 — The Bug

**File:** `/var/www/mytodoo/mytodo-backend/controllers/users/users.controller.js`  
**Line:** ~425

#### ❌ Current Code (BROKEN):
```javascript
const { firstName, lastName, phone, location, bio, skills } = req.body;

const profile = await userService.updateProfile(userId, {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  // ❌ notifyNewTask and notifySkillMatch NOT here — they are lost
});
```

#### What happens:
1. Client sends: `PUT /users/profile { notifyNewTask: true, notifySkillMatch: false }`
2. Controller ignores `notifyNewTask` / `notifySkillMatch` from `req.body`
3. Service receives `{ firstName: undefined, lastName: undefined, ... }` → all undefined
4. Service finds no valid fields to update → throws `"No changes provided for update"`
5. Client gets error → shows "Failed to save preferences. Please try again." ❌

---

### 5.2 — The Fix

#### ✅ Fixed Line 425 — Add to destructure:
```javascript
const {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  notifyNewTask,    // ✅ ADD THIS
  notifySkillMatch, // ✅ ADD THIS
} = req.body;
```

#### ✅ Fixed Service Call — Pass both fields:
```javascript
const profile = await userService.updateProfile(userId, {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  notifyNewTask,    // ✅ ADD THIS
  notifySkillMatch, // ✅ ADD THIS
});
```

> **That's it — only 2 additions. Everything else (service, validator, DB model) is already correct.**

---

## 6. Backend — Already Correct Files (No Changes)

### 6.1 — User Service ✅

**File:** `servicesN/users/user.services.js` (lines 1035–1065)

```javascript
// Already destructures both fields
const { firstName, lastName, phone, location, bio, skills, notifyNewTask, notifySkillMatch } = profileData;

// Already updates DB
if (notifyNewTask !== undefined) updateData.notifyNewTask = notifyNewTask;
if (notifySkillMatch !== undefined) updateData.notifySkillMatch = notifySkillMatch;
```

### 6.2 — Validator ✅

**File:** `validators/v1/users/userRoutes.validator.js` (lines 200–207)

```javascript
body("notifyNewTask").optional().isBoolean()...
body("notifySkillMatch").optional().isBoolean()...
```

### 6.3 — DB Model ✅

**File:** `models/user/User.js` (lines 277–278, 367–368)

```javascript
notifyNewTask: { type: Boolean, default: true, index: true },
notifySkillMatch: { type: Boolean, default: false, index: true },
```

### 6.4 — Signup Model ✅

**File:** `models/user/PendingUser.js` (lines 33–34)

```javascript
notifyNewTask: { type: Boolean, default: true },
notifySkillMatch: { type: Boolean, default: false },
```

### 6.5 — Task Notification Service ✅

**File:** `servicesN/notifications/taskNotification.service.js` (lines 40–49)

```javascript
// Correctly queries only users who want notifications
const taskers = await User.find({
  notifyNewTask: true,
  ...(task.category && { $or: [
    { notifySkillMatch: false },
    { notifySkillMatch: true, taskerCategories: task.category }
  ]})
});
```

---

## 7. How to Apply the Backend Fix

### Step 1 — SSH into the server
```bash
ssh root@134.199.172.167
# password: [server password]
```

### Step 2 — Backup the controller
```bash
cp /var/www/mytodoo/mytodo-backend/controllers/users/users.controller.js \
   /var/www/mytodoo/mytodo-backend/controllers/users/users.controller.js.bak_$(date +%Y%m%d)
```

### Step 3 — Edit the controller
```bash
nano /var/www/mytodoo/mytodo-backend/controllers/users/users.controller.js
```

Use `Ctrl+W` to search for: `firstName, lastName, phone, location, bio, skills`

**Find this line (~line 425):**
```javascript
const { firstName, lastName, phone, location, bio, skills } = req.body;
```

**Replace with:**
```javascript
const { firstName, lastName, phone, location, bio, skills, notifyNewTask, notifySkillMatch } = req.body;
```

Then find the `userService.updateProfile(userId, {` call below it and add the two fields to the object:
```javascript
const profile = await userService.updateProfile(userId, {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  notifyNewTask,    // ADD THIS LINE
  notifySkillMatch, // ADD THIS LINE
});
```

Save: `Ctrl+O` then `Enter`, then exit: `Ctrl+X`

### Step 4 — Restart PM2
```bash
pm2 restart mytodo-backend
pm2 logs mytodo-backend --lines 20
```

### Step 5 — Verify fix
Look for logs like:
```
Profile update request received
Profile updated successfully
```
(NOT "No changes provided for update")

### Alternative: sed command (one-liner)
```bash
# On the server, run this to verify the line number first:
grep -n "firstName, lastName, phone, location, bio, skills" \
  /var/www/mytodoo/mytodo-backend/controllers/users/users.controller.js
```

---

## 8. Testing Checklist

### Mobile App (APK v1.2.2)

**After backend fix:**

- [ ] Open app → Profile → Account → "Tasker Preferences" menu item is visible
- [ ] Tap "Tasker Preferences" → screen opens with two switches
- [ ] Toggle "Register as a Tasker" ON → "Only notify tasks in my skillset" becomes enabled
- [ ] Toggle "Register as a Tasker" OFF → skillset switch becomes disabled (grayed out)
- [ ] Toggle both ON → press Save → Alert shows "Tasker preferences updated successfully." ✅
- [ ] Go back and re-open "Tasker Preferences" → switches reflect saved values ✅
- [ ] Toggle both OFF → Save → Re-open → both show OFF ✅

**PM2 logs should show (no errors):**
```
Profile update request received
Profile updated successfully
```

### Web Frontend

**After backend fix (same test):**

- [ ] Login → Profile → "Tasker Preferences" or settings section visible
- [ ] Toggle "Register as Tasker" and "Notify my skillset" → Save
- [ ] Success message shows ✅
- [ ] Reload page → values persist ✅

### Signup Flow (Mobile + Web)

- [ ] Register new user with "Register as Tasker" checked
- [ ] User's `notifyNewTask` = `true` in DB
- [ ] Register without "Tasker" checked → `notifyNewTask` = `false`

### Push Notification Delivery

- [ ] Post a new task from another account
- [ ] Users with `notifyNewTask=true` AND matching skills (or `notifySkillMatch=false`) receive push notification
- [ ] Users with `notifyNewTask=false` do NOT receive notification

---

## 9. Summary Table

| Component | File | Change | Status |
|---|---|---|---|
| **Mobile** — Preferences Screen | `src/features/profile/screens/notificationpreferences.jsx` | New screen, 228 lines, UI + API call | ✅ Done |
| **Mobile** — Profile Navigation | `src/features/profile/screens/profile-screen.tsx` | Uncommented notifications screen + menu item | ✅ Done |
| **Mobile** — Signup Form | `src/features/auth/components/SignupForm.tsx` | Two checkboxes for notifyNewTask/notifySkillMatch | ✅ Done |
| **Mobile** — Signup Hook | `src/features/auth/components/useSignup.ts` | Sends both fields in signup payload | ✅ Done |
| **Mobile** — API Types | `src/api/user-profile-api.ts` | Both fields in `UserProfile` + `UpdateProfileRequest` | ✅ Done |
| **Mobile** — React Query Hook | `src/shared/hooks/useUserProfileApi.ts` | `useUpdateUserProfile()` accepts both fields | ✅ Done |
| **Web** — Profile Service | `src/services/profileService.ts` | Maps frontend names → backend API names | ✅ Done |
| **Web** — Profile Page | `src/pages/ProfilePage.tsx` | State, load from API, save via service | ✅ Done |
| **Web** — Signup Hook | `src/pages/Auth/hooks/useAuthApi.ts` | Sends both fields in signup payload | ✅ Done |
| **Backend** — Controller | `controllers/users/users.controller.js` Line ~425 | Add `notifyNewTask, notifySkillMatch` to destructure + service call | ❌ **FIX NEEDED** |
| **Backend** — Service | `servicesN/users/user.services.js` | Handles both fields | ✅ No change needed |
| **Backend** — Validator | `validators/v1/users/userRoutes.validator.js` | Validates both fields | ✅ No change needed |
| **Backend** — DB Model | `models/user/User.js` | Fields with indexes | ✅ No change needed |
| **Backend** — Signup Model | `models/user/PendingUser.js` | Fields in signup model | ✅ No change needed |
| **Backend** — Task Notifier | `servicesN/notifications/taskNotification.service.js` | Queries using both fields | ✅ No change needed |

---

## ⚡ Quick Summary

> **ONE backend fix, 2 lines of code, fixes BOTH mobile app and web frontend simultaneously.**

```javascript
// File: controllers/users/users.controller.js  (~line 425)

// BEFORE:
const { firstName, lastName, phone, location, bio, skills } = req.body;

// AFTER:
const { firstName, lastName, phone, location, bio, skills, notifyNewTask, notifySkillMatch } = req.body;
```

```javascript
// In the userService.updateProfile() call below:

// ADD these two lines:
notifyNewTask,
notifySkillMatch,
```

```bash
# Then restart:
pm2 restart mytodo-backend
```

**That's all. Both platforms will work instantly after this.**
