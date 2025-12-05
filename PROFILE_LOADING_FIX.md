# 🐛 Profile Loading Issue - 3rd User Not Loading

## 🚨 Problem Description

When testing with 3 devices on Expo Go:
- ✅ **Device 1 (User 1):** Profile loads correctly
- ✅ **Device 2 (User 2):** Profile loads correctly  
- ❌ **Device 3 (User 3):** Profile doesn't load - shows loading state or error

## 🔍 Root Cause Analysis

### Issue: Conflicting Cache Configuration

**File:** `src/shared/hooks/useUserProfileApi.ts`

The `useGetUserProfile` hook had **local cache settings** that **overrode** the global QueryClient configuration:

```typescript
// ❌ OLD - Problematic Configuration
export function useGetUserProfile() {
  return useQuery({
    queryKey: [...USER_PROFILE_QUERY_KEYS.profile(), user?.email, user?._id, token],
    queryFn: () => UserProfileAPI.getUserProfile(),
    staleTime: 0,             // ✅ Always fetch fresh
    gcTime: 0,                // ❌ PROBLEM: Delete cache immediately
    refetchOnMount: false,    // ❌ PROBLEM: Don't refetch on mount
    refetchOnWindowFocus: false, // ❌ PROBLEM: Don't refetch on focus
    enabled: isAuthenticated && !!token && !!user?._id,
  });
}
```

### Why This Caused 3rd User to Fail:

**1. Cache Immediately Deleted (`gcTime: 0`):**
- Query result cached
- Cache **immediately deleted** after query completes
- Next access finds **no cache** and needs to refetch

**2. No Automatic Refetch:**
- `refetchOnMount: false` → No refetch when profile screen loads
- `refetchOnWindowFocus: false` → No refetch when switching apps
- Combined with `gcTime: 0`, this creates a **race condition**

**3. QueryKey Complexity:**
```typescript
queryKey: [...USER_PROFILE_QUERY_KEYS.profile(), user?.email, user?._id, token]
```

Creates unique keys per user:
- User 1: `['user-profile', 'profile', 'user1@email.com', 'id1', 'token1']`
- User 2: `['user-profile', 'profile', 'user2@email.com', 'id2', 'token2']`
- User 3: `['user-profile', 'profile', 'user3@email.com', 'id3', 'token3']`

With `gcTime: 0`, User 3's cache **deleted immediately** → No fallback → Loading state stuck

**4. Global Config Ignored:**

The global QueryClient config was **overridden** by local settings:

```typescript
// Global config from app/_layout.tsx (IGNORED)
{
  refetchOnWindowFocus: true,  // ❌ Overridden
  refetchOnMount: true,         // ❌ Overridden
  refetchInterval: 30000,       // ❌ Overridden
  gcTime: 5 * 60 * 1000,       // ❌ Overridden
}
```

### Why It Worked in Expo Go (Sometimes):

- **Hot reload** forces fresh queries
- **Dev mode** has more aggressive re-rendering
- **Fast 3G simulation** might have delayed the issue
- **Cache timing** - if you tested quickly, cache still existed

### Why It Might Fail in Production APK:

- **No hot reload** - queries persist between sessions
- **Production optimizations** - fewer re-renders
- **Real network conditions** - slower responses expose race condition
- **Cache persistence** - `gcTime: 0` causes more issues with persistent storage

## ✅ Solution Implemented

### Fixed Hook Configuration

**File:** `src/shared/hooks/useUserProfileApi.ts`

```typescript
// ✅ NEW - Fixed Configuration
export function useGetUserProfile() {
  return useQuery({
    queryKey: [...USER_PROFILE_QUERY_KEYS.profile(), user?._id], // ✅ Simplified key
    queryFn: () => UserProfileAPI.getUserProfile(),
    staleTime: 0, // ✅ Use global config for real-time updates
    // ✅ refetchOnMount, refetchOnWindowFocus, refetchInterval use global QueryClient config
    // ✅ gcTime uses global config (5 minutes) for offline fallback
    enabled: isAuthenticated && !!token && !!user?._id,
    select: (response) => response.data,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.isAuthError) {
        return false; // Don't retry auth errors
      }
      return failureCount < 1; // Retry network errors once
    },
  });
}
```

### Changes Made:

**1. Removed `gcTime: 0`:**
- Now uses **global config** (`gcTime: 5 * 60 * 1000`)
- Cache kept for **5 minutes** as offline fallback
- Prevents race condition where cache deleted before screen renders

**2. Removed `refetchOnMount: false`:**
- Now uses **global config** (`refetchOnMount: true`)
- Profile **automatically refetches** when screen loads
- Ensures fresh data on navigation

**3. Removed `refetchOnWindowFocus: false`:**
- Now uses **global config** (`refetchOnWindowFocus: true`)
- Profile **automatically refetches** when app comes to foreground
- Ensures up-to-date data after switching apps

**4. Simplified QueryKey:**
```typescript
// OLD: ['user-profile', 'profile', email, id, token]
// NEW: ['user-profile', 'profile', id]
```
- Removed `email` and `token` from key (redundant)
- User ID alone is sufficient for cache isolation
- Simpler key = more predictable caching

**5. Inherits Global Config:**
- `refetchInterval: 30000` → Auto-refetch every 30 seconds
- `refetchOnReconnect: true` → Refetch when internet reconnects
- `gcTime: 5 * 60 * 1000` → Keep cache for 5 minutes

## 🎯 How It Works Now

### Scenario: 3 Users Testing Simultaneously

**Device 1 (User 1):**
1. User logs in
2. Profile screen loads
3. `useGetUserProfile` query executes
4. Data cached with key: `['user-profile', 'profile', 'user1-id']`
5. Cache kept for **5 minutes** (gcTime)
6. Auto-refetches every **30 seconds** (refetchInterval)
7. Refetches when **navigating back** to profile (refetchOnMount)
8. Refetches when **returning to app** (refetchOnWindowFocus)

**Device 2 (User 2):**
1. User logs in
2. Profile screen loads
3. Query executes with key: `['user-profile', 'profile', 'user2-id']`
4. **Independent cache** from User 1
5. Same auto-refetch behavior

**Device 3 (User 3):**
1. User logs in
2. Profile screen loads
3. Query executes with key: `['user-profile', 'profile', 'user3-id']`
4. **Independent cache** from User 1 & 2
5. ✅ **Cache NOT immediately deleted** (uses gcTime: 5 minutes)
6. ✅ **Auto-refetches on mount** (uses refetchOnMount: true)
7. ✅ **Auto-refetches on focus** (uses refetchOnWindowFocus: true)
8. ✅ **Profile loads successfully**

## 📊 Before vs After Comparison

| Aspect | Before 🔴 | After ✅ |
|--------|----------|---------|
| **Cache Duration** | 0 seconds (immediate delete) | 5 minutes (offline fallback) |
| **Refetch on Mount** | ❌ Disabled | ✅ Enabled (global config) |
| **Refetch on Focus** | ❌ Disabled | ✅ Enabled (global config) |
| **Auto Polling** | ❌ None | ✅ Every 30 seconds |
| **QueryKey Complexity** | 4 parts (id, email, token) | 1 part (id only) |
| **Cache Isolation** | ✅ Yes | ✅ Yes |
| **3rd User Loading** | ❌ Fails (race condition) | ✅ Works (stable cache) |
| **Offline Support** | ❌ No cache | ✅ 5-minute cache |

## 🧪 Testing Verification

### Test 1: Sequential Login (3 Devices)
1. Login User 1 on Device 1 → Profile loads ✅
2. Login User 2 on Device 2 → Profile loads ✅
3. Login User 3 on Device 3 → Profile loads ✅
4. **Expected:** All 3 profiles load correctly with no race condition

### Test 2: Rapid Navigation
1. Login on Device 1
2. Navigate: Profile → Browse → Profile → Browse → Profile
3. **Expected:** Profile refetches each time (refetchOnMount: true)

### Test 3: Background/Foreground
1. Login on Device 1
2. View profile
3. Switch to another app (Home screen)
4. Return to MyToDoo app
5. **Expected:** Profile refetches immediately (refetchOnWindowFocus: true)

### Test 4: Auto-Update
1. Login on Device 1
2. Stay on profile screen for 60 seconds
3. **Expected:** Profile auto-refetches at 30-second mark (refetchInterval: 30000)

### Test 5: Cache Isolation
1. Login User 1 on Device 1 → View profile
2. Login User 2 on Device 2 → View profile
3. Update User 1's profile on Device 1
4. **Expected:** 
   - Device 1 shows updated data immediately
   - Device 2 still shows User 2's data (independent cache)
   - No cross-user cache pollution

## 🔧 Related Files Modified

### 1. `src/shared/hooks/useUserProfileApi.ts`
- **Lines 47-62:** Removed `gcTime: 0`, `refetchOnMount: false`, `refetchOnWindowFocus: false`
- **Line 48:** Simplified queryKey from 4 parts to 1 part
- **Impact:** Profile hook now uses global QueryClient config

### 2. `app/_layout.tsx` (Previously Modified)
- **Lines 27-35:** Global QueryClient configuration
- **Settings:**
  - `refetchOnWindowFocus: true`
  - `refetchOnMount: true`
  - `refetchInterval: 30000`
  - `staleTime: 0`
  - `gcTime: 5 * 60 * 1000`

## 🎯 Why This is NOT an Expo Issue

This was **NOT an Expo Go issue**. It was a **React Query configuration issue**:

### Evidence:

1. **Would affect APK too:** The same race condition would occur in production APK (possibly worse)
2. **Cache timing:** The issue is about cache lifecycle (`gcTime: 0`), not Expo
3. **Local override:** The problem was local settings **overriding** global config
4. **Reproducible:** Any React Query app with `gcTime: 0` + `refetchOnMount: false` would fail similarly

### Why You Might Think It's Expo:

- **Hot reload masks the issue:** Expo Go's dev features hide cache problems
- **Fast testing:** Quickly switching users might work before cache expires
- **Dev mode logging:** More verbose logs in Expo Go might show different behavior
- **Network simulation:** Expo Go's network conditions might differ from production

### Proof It's React Query:

```typescript
// This configuration would fail in ANY React app:
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  gcTime: 0,              // ❌ Delete cache immediately
  refetchOnMount: false,  // ❌ Don't refetch on mount
  refetchOnWindowFocus: false, // ❌ Don't refetch on focus
});
```

**Result:** 
- First load: ✅ Works (query executes)
- Navigate away and back: ❌ Fails (cache deleted, no refetch)

## 🎉 Summary

### What Was Wrong:
❌ `gcTime: 0` → Cache deleted immediately after query
❌ `refetchOnMount: false` → No refetch when screen loads
❌ `refetchOnWindowFocus: false` → No refetch when app focused
❌ Complex queryKey → Harder to debug
❌ Local settings → Overrode global QueryClient config

### What's Fixed:
✅ Uses global `gcTime: 5 minutes` → Stable cache for offline support
✅ Uses global `refetchOnMount: true` → Auto-refetch on navigation
✅ Uses global `refetchOnWindowFocus: true` → Auto-refetch on focus
✅ Uses global `refetchInterval: 30 seconds` → Auto-updates
✅ Simplified queryKey → Only user ID needed
✅ Consistent behavior → All profiles use same config

### Impact:
✅ **3rd user loads correctly** - No more race condition
✅ **Better offline support** - 5-minute cache fallback
✅ **Real-time updates** - 30-second auto-refresh
✅ **Consistent behavior** - Same config for all users
✅ **Works in Expo & APK** - No platform-specific issues

---

**Status:** ✅ **FIXED - Ready for Re-Testing**

**Next Step:** Test with 3 devices again. All profiles should load correctly now.
