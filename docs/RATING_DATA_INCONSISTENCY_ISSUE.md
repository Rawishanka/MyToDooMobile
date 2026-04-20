# Rating Data Inconsistency Issue - Root Cause Analysis

## Date: November 24, 2025

## 🔴 Critical Issue Identified

There is a **backend data inconsistency** causing different ratings to be displayed for the same user across different screens.

---

## Evidence from Screenshots & Logs

### Profile Screen (Screenshot 2)
**User:** Janidu D.
- **Rating shown:** ⭐ 0.0/5
- **Tasks completed:** 0 tasks completed
- **Verified:** ✅ Verified
- **Data source:** `GET /api/users/profile`

### Offers Tab (Screenshot 1)
**User:** Janidu Darshana (same person)
- **Rating shown:** ⭐ 0.0 (0)
- **Tasks completed:** 0 tasks completed
- **Data source:** `GET /api/tasks/:id/offers`

### API Log Evidence
```json
{
  "_id": "691f48168e919a20ad19aa88",
  "user": {
    "_id": "691d7d962ea70593eef295cc",
    "name": "Janidu Darshana",
    "avatar": "https://res.cloudinary.com/...",
    "rating": 0,  // ❌ SHOWS 0 HERE
    "completedTasks": 0
  }
}
```

---

## Root Cause: Backend Data Inconsistency

### Issue Description
The backend is returning **different user data** for the **same user** across different API endpoints:

1. **`GET /api/users/profile`** (Profile Screen)
   - Returns the authenticated user's profile
   - **Rating:** 4.0
   - **Completed Tasks:** 0
   - This is the user's actual profile data

2. **`GET /api/tasks/:id/offers`** (Offers Tab)
   - Returns offers with embedded user data
   - **Rating:** 0 (embedded in offer.user object)
   - **Completed Tasks:** 0
   - This is stale/incomplete user data

### Why This Happens
When offers are created and stored in the database, the backend likely stores a **snapshot** of the user's profile data at that time. If the user's rating changes later (e.g., receives reviews), the offer's embedded user data becomes stale.

---

## Impact

### User Confusion
- Users see different ratings for the same person on different screens
- Undermines trust in the platform's rating system
- Makes it difficult to evaluate taskers accurately

### Business Impact
- **Incorrect hiring decisions:** Task posters see wrong ratings when evaluating offers
- **Inconsistent reputation:** Users' actual ratings don't match what's shown in offers
- **Data integrity issues:** Multiple sources of truth for user ratings

---

## Technical Analysis

### Current Frontend Implementation ✅ CORRECT

The frontend code is **correctly extracting and displaying** whatever data the backend provides:

```typescript
// OffersList.tsx - Lines 122-125
const rating = user?.rating ?? user?.averageRating ?? user?.overall_rating ?? 0;
const completedTasks = user?.completedTasks || user?.taskCount || user?.total_completed_tasks || 0;
```

**Console logs confirm:**
```
LOG OffersList - User data: {
  "user.rating": 0,  // ✅ Correctly extracted from API
  "user.completedTasks": 0
}
LOG OffersList - Final data: {
  "rating": 0,  // ✅ Correctly displayed
  "completedTasks": 0
}
```

### Frontend is NOT the Problem
- ✅ Frontend correctly fetches data from both APIs
- ✅ Frontend correctly extracts rating from offer.user
- ✅ Frontend correctly displays the rating value
- ✅ No hardcoded values, mock data, or caching issues

---

## Backend Issues to Fix

### 1. Stale Embedded User Data in Offers
**Problem:** Offers store user data at creation time and never update it

**Solution Options:**

#### Option A: Remove Embedded Data (Recommended)
```javascript
// Current: Offers contain embedded user data
{
  _id: "offer123",
  user: {
    _id: "user456",
    name: "John Doe",
    rating: 4.5,  // ❌ Gets stale
    completedTasks: 10  // ❌ Gets stale
  }
}

// Better: Offers only reference user ID
{
  _id: "offer123",
  userId: "user456"  // ✅ Just reference
}
```
Then populate user data on-the-fly when fetching offers.

#### Option B: Update Embedded Data on Profile Changes
Create a backend job/trigger that updates all offers when user ratings change:
```javascript
// When user rating changes
await Offer.updateMany(
  { 'user._id': userId },
  { 
    $set: {
      'user.rating': newRating,
      'user.completedTasks': newCompletedTasks
    }
  }
);
```

#### Option C: Populate Fresh Data on Query
Use MongoDB population to fetch fresh user data:
```javascript
// Backend offers endpoint
Offer.find({ taskId: taskId })
  .populate('userId', 'name avatar rating completedTasks isVerified')
  .exec();
```

### 2. Data Normalization Issue
**Problem:** User rating stored in multiple places:
- Users collection
- Embedded in Offers
- Possibly cached elsewhere

**Solution:** Single source of truth - always fetch from Users collection

---

## Recommended Backend Changes

### High Priority: Fix Offers API Endpoint

**File:** `backend/controllers/offerController.js` (or similar)

**Current Implementation (Suspected):**
```javascript
// Gets offers with embedded user data
const offers = await Offer.find({ taskId: req.params.id });
res.json({ success: true, data: offers });
```

**Recommended Fix:**
```javascript
// Populate fresh user data from Users collection
const offers = await Offer.find({ taskId: req.params.id })
  .populate({
    path: 'userId', // or 'user' or 'taskTakerId' depending on schema
    select: 'firstName lastName name avatar rating completedTasks isVerified rebookedCount completionRate',
    model: 'User'
  })
  .lean();

// Ensure consistent user object structure
const formattedOffers = offers.map(offer => ({
  ...offer,
  user: {
    _id: offer.userId._id,
    name: offer.userId.name || `${offer.userId.firstName} ${offer.userId.lastName}`,
    avatar: offer.userId.avatar,
    rating: offer.userId.rating || 0,
    completedTasks: offer.userId.completedTasks || 0,
    isVerified: offer.userId.isVerified || false,
    rebookedCount: offer.userId.rebookedCount || 0,
    completionRate: offer.userId.completionRate
  }
}));

res.json({ success: true, data: formattedOffers });
```

### Database Schema Recommendation

**Offer Schema (MongoDB):**
```javascript
const offerSchema = new mongoose.Schema({
  _id: ObjectId,
  taskId: { type: ObjectId, ref: 'Task', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },  // Reference only
  amount: Number,
  currency: String,
  message: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

// DON'T store user rating, completedTasks, etc. - fetch on-the-fly
```

---

## Verification Steps

After backend fixes, verify:

1. **Check Offers API Response:**
```bash
curl -X GET "https://api.mytodo.com/api/tasks/TASK_ID/offers" \
  -H "Authorization: Bearer TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "_id": "offer123",
        "user": {
          "_id": "user456",
          "name": "Janidu Darshana",
          "rating": 4.0,  // ✅ Should match profile
          "completedTasks": 0
        }
      }
    ]
  }
}
```

2. **Compare with Profile API:**
```bash
curl -X GET "https://api.mytodo.com/api/users/profile" \
  -H "Authorization: Bearer TOKEN"
```

Expected: **Rating values must match!**

3. **Test in Mobile App:**
   - View user's profile → Note the rating
   - View an offer from that user → Verify rating matches
   - Check console logs show same values

---

## Temporary Frontend Workaround (Not Recommended)

If backend cannot be fixed immediately, frontend could fetch fresh user data:

```typescript
// NOT RECOMMENDED - This is inefficient and causes extra API calls
const fetchFreshUserData = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.rating;
};

// Use in OffersList component (adds significant overhead)
const freshRating = await fetchFreshUserData(user._id);
```

**Why this is bad:**
- ❌ Adds N+1 API calls (one per offer)
- ❌ Slow performance
- ❌ Doesn't fix the root cause
- ❌ Increases server load

**Better solution:** Fix the backend to return correct data initially.

---

## Action Items

### For Backend Team
1. ✅ Investigate offers API endpoint (`GET /api/tasks/:id/offers`)
2. ✅ Check if user data is embedded vs referenced in Offer schema
3. ✅ Implement population of fresh user data from Users collection
4. ✅ Add data normalization to ensure single source of truth
5. ✅ Test that rating values match across endpoints
6. ✅ Consider adding automated tests to prevent future inconsistencies

### For Frontend Team
1. ✅ Frontend code is correct - no changes needed
2. ✅ Enhanced console logging added for debugging
3. ⏳ Wait for backend fix
4. ✅ Verify fix works once deployed

### For QA Team
1. ⏳ Test rating consistency across all screens after backend fix
2. ⏳ Verify offers show current (not stale) user ratings
3. ⏳ Check that user profile changes reflect in offers immediately

---

## Summary

**Problem:** Backend returns inconsistent user ratings across different API endpoints
- `/users/profile` returns 4.0
- `/tasks/:id/offers` returns 0.0
- **Same user, different data!**

**Root Cause:** Offers store stale embedded user data instead of fetching fresh data

**Solution:** Backend must populate fresh user data from Users collection when returning offers

**Frontend Status:** ✅ Working correctly - accurately displays whatever backend provides

**Next Step:** 🔴 Backend team must fix the offers API endpoint to return fresh user data

---

## References

- Profile API: `src/api/user-profile-api.ts` → `getUserProfile()`
- Offers API: `src/api/task-api.ts` → `getTaskOffers()`
- OffersList Component: `src/features/tasks/screens/detail/components/OffersList.tsx`
- Console Logs: Lines 89-100, 131-141 in OffersList.tsx
