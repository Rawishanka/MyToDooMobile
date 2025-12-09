# Logout Loading Loop Fix

## Problem Summary
After logging out, navigating to the login screen caused continuous loading with repeated backend errors:
```
❌ Authentication Error: jwt expired
📍 Request Path: /profile
```

The login screen was stuck in a loading state, continuously trying to fetch the profile with an expired token.

## Root Cause

### Race Condition After Logout
1. User clicks logout
2. `clearAuth()` is called - starts clearing AsyncStorage asynchronously
3. User is redirected to login screen
4. **AuthProvider's useEffect** runs and checks for `storedToken` in AsyncStorage
5. Since AsyncStorage clear is async, expired token is still there briefly
6. AuthProvider **restores the expired token** to auth store
7. Profile hooks become enabled (`isAuthenticated: true`, `token: expired_token`)
8. Profile API is called with expired token
9. Backend returns 401 "jwt expired"
10. API interceptor tries to refresh with expired token
11. **Infinite loop** of failed requests

### API Interceptor Issue
The API request interceptor was retrieving tokens from AsyncStorage even when the user had explicitly logged out:
```typescript
// OLD CODE - Would use AsyncStorage token even after logout
let token = useAuthStore.getState().token;
if (!token && !isAuthEndpoint) {
  const storedToken = await AsyncStorage.getItem('token');
  if (storedToken) {
    token = storedToken; // ❌ Uses expired token after logout
  }
}
```

## Solution

### Fix #1: AuthProvider - Don't Restore After Logout
Prevent AuthProvider from restoring auth state when user has explicitly logged out:

```typescript
// src/shared/AuthProvider.tsx
useEffect(() => {
  const restoreAuthState = async () => {
    if (isLoading) return;
    
    // ✅ NEW: Check if user explicitly logged out
    const currentAuthState = useAuthStore.getState();
    if (currentAuthState.isAuthenticated === false && !currentAuthState.token) {
      console.log("⚠️ User logged out - not restoring auth from AsyncStorage");
      return; // Don't restore expired tokens after logout
    }
    
    if (storedToken && !token) {
      // Restore auth state...
    }
  };
  
  restoreAuthState();
}, [isLoading, storedToken, token]);
```

**Why this works:**
- When `clearAuth()` is called, it sets `isAuthenticated = false` IMMEDIATELY
- Even if AsyncStorage hasn't cleared yet, AuthProvider sees `isAuthenticated === false`
- AuthProvider won't restore the expired token
- No profile fetch is triggered on login screen

### Fix #2: API Interceptor - Don't Use AsyncStorage After Logout
Prevent API interceptor from using AsyncStorage tokens when user is logged out:

```typescript
// src/shared/utils/api.ts
const authState = useAuthStore.getState();
let token = authState.token;

// ✅ NEW: Only use AsyncStorage if NOT logged out
if (!token && !isAuthEndpoint && authState.isAuthenticated !== false) {
  const storedToken = await AsyncStorage.getItem('token');
  if (storedToken) {
    token = storedToken;
  }
} else if (!token && !isAuthEndpoint && authState.isAuthenticated === false) {
  console.log("ℹ️ User logged out - not using AsyncStorage token");
}
```

**Why this works:**
- Checks `isAuthenticated` state before retrieving from AsyncStorage
- If `isAuthenticated === false`, expired token is ignored
- No expired token is sent to backend
- No 401 errors after logout

## Testing

### Test Logout Flow:
1. Log in to the app
2. Navigate to Profile screen
3. Click Logout
4. Verify:
   - ✅ Login screen appears immediately
   - ✅ No continuous loading spinner
   - ✅ No backend errors in console
   - ✅ No repeated profile API calls
   - ✅ Can log in again successfully

### Expected Console Logs After Logout:
```
🧹 Clearing all caches...
🧹 Resetting task creation form...
🚫 Disabling authentication immediately (for logout)...
🧹 Clearing auth data...
✅ All auth data cleared successfully
⚠️ User logged out - not restoring auth from AsyncStorage
ℹ️ User logged out - not using AsyncStorage token
```

### What You Should NOT See:
- ❌ "🔄 Restoring auth state from AsyncStorage..."
- ❌ "🔐 Added auth header to request: /profile"
- ❌ "❌ Authentication Error: jwt expired"
- ❌ Continuous loading spinner on login screen

## Files Modified

1. **src/shared/AuthProvider.tsx**
   - Added check to prevent restoring auth state when user logged out
   - Checks `isAuthenticated === false` before restoration

2. **src/shared/utils/api.ts**
   - Modified request interceptor to check auth state
   - Won't use AsyncStorage tokens when `isAuthenticated === false`

## How Logout Works Now

### Complete Logout Flow:
1. **Logout Component** calls sequence:
   ```typescript
   clearAllCaches();           // Clear React Query cache
   resetTask();                // Clear task form
   disableAuth();              // Set isAuthenticated = false IMMEDIATELY
   clearAuth();                // Clear tokens from store & AsyncStorage
   router.replace('/(auth)/login'); // Navigate to login
   ```

2. **Auth Store** (`clearAuth()`):
   ```typescript
   set({ token: null, user: null, isAuthenticated: false });
   await AsyncStorage.multiRemove(['token', 'user', 'expiresIn', ...]);
   ```

3. **AuthProvider** checks before restoring:
   ```typescript
   if (isAuthenticated === false && !token) {
     return; // Don't restore
   }
   ```

4. **API Interceptor** checks before using AsyncStorage:
   ```typescript
   if (authState.isAuthenticated === false) {
     // Don't use AsyncStorage token
   }
   ```

5. **Login Screen** renders clean:
   - No profile fetch triggered
   - No expired token sent
   - No backend errors
   - Ready for fresh login

## Benefits

✅ **Immediate logout** - No loading loops
✅ **Clean state** - No stale data after logout
✅ **Better UX** - Login screen appears instantly
✅ **No backend spam** - No repeated 401 errors
✅ **Reliable** - Works even with AsyncStorage delays

## Related Issues Fixed

- Continuous loading on login screen after logout
- Repeated "jwt expired" errors in backend logs
- Profile endpoint being called with expired tokens
- Race condition between clearAuth() and AuthProvider restoration
- AsyncStorage expired tokens being reused after logout
