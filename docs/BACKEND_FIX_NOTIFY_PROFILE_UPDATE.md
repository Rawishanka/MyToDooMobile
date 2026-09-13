# Backend Fix Required — Profile Update (notifyNewTask / notifySkillMatch)

## 🐛 Bug Summary

**Error:** `"No changes provided for update"`  
**When:** User presses "Save Preferences" on Tasker Preferences screen  
**Backend log:**
```
[error]: Profile update error
{ error: "No changes provided for update",
  at UserService.updateProfile (user.services.js:1158) }
```

---

## 🔍 Root Cause

**File:** `controllers/users/users.controller.js`  
**Line:** `425`

The `updateProfile` controller destructures `req.body` but is **missing `notifyNewTask` and `notifySkillMatch`**:

### ❌ Current Code (Line 425):
```js
const { firstName, lastName, phone, location, bio, skills } = req.body;
```

Then passes to service (missing the two fields):
```js
const profile = await userService.updateProfile(userId, {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  // ❌ notifyNewTask and notifySkillMatch NOT passed here
});
```

---

## ✅ Required Fix

### Step 1 — Add to destructure (Line 425):
```js
const { firstName, lastName, phone, location, bio, skills, notifyNewTask, notifySkillMatch } = req.body;
```

### Step 2 — Add to service call:
```js
const profile = await userService.updateProfile(userId, {
  firstName,
  lastName,
  phone,
  location,
  bio,
  skills,
  notifyNewTask,      // ✅ ADD THIS
  notifySkillMatch,   // ✅ ADD THIS
});
```

---

## ✅ Confirm — Service Already Handles It Correctly

`servicesN/users/user.services.js` — **already correct**, no changes needed there:
```js
// Line 1035-1036 — already destructures
const { firstName, lastName, phone, location, bio, skills, notifyNewTask, notifySkillMatch } = profileData;

// Line 1063-1065 — already updates DB
if (notifyNewTask !== undefined) updateData.notifyNewTask = notifyNewTask;
if (notifySkillMatch !== undefined) updateData.notifySkillMatch = notifySkillMatch;
```

The service is **100% ready** — only the controller is missing the two fields.

---

## ✅ Confirm — Validator Already Handles It

`validators/v1/users/userRoutes.validator.js` — **already validates both fields** (Lines 200-207):
```js
body("notifyNewTask").optional().isBoolean()...
body("notifySkillMatch").optional().isBoolean()...
```

---

## 🔄 After Fix — Restart PM2

```bash
pm2 restart mytodo-backend
```

---

## 📋 Summary

| File | Change | Status |
|---|---|---|
| `controllers/users/users.controller.js` Line 425 | Add `notifyNewTask, notifySkillMatch` to destructure | ❌ **FIX NEEDED** |
| `controllers/users/users.controller.js` service call | Pass both fields to `userService.updateProfile()` | ❌ **FIX NEEDED** |
| `servicesN/users/user.services.js` | Already handles both fields | ✅ No change |
| `validators/v1/users/userRoutes.validator.js` | Already validates both fields | ✅ No change |
| DB Model `models/user/User.js` | Fields defined with indexes | ✅ No change |
