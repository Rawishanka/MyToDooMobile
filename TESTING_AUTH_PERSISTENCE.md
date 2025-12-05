# 🧪 Testing Auth Persistence (Token Persistence)

## Problem We Fixed
Previously, when users closed/minimized the app and reopened it, they had to login again because the token was only stored in memory (Zustand store) and not persisted to AsyncStorage.

## Solution Implemented
1. ✅ Token is saved to **AsyncStorage** when user logs in
2. ✅ User data is saved to **AsyncStorage** when user logs in
3. ✅ `AuthProvider` restores token + user from **AsyncStorage** on app startup
4. ✅ `index.tsx` checks auth status and auto-navigates to tabs if logged in

---

## 🎯 How to Test in Expo (Development Mode)

### Method 1: Manual Testing (Most Reliable)

1. **Login to the app**
   - Use email/password or Google Sign-In
   - You should see the main app (tabs screen)

2. **Reload the app (Fast Refresh)**
   - **Android**: Shake device → Tap "Reload" OR Press `R` in terminal
   - **iOS**: Shake device → Tap "Reload" OR Press `Cmd+R`
   - **Expected**: App should stay logged in, navigate to tabs automatically

3. **Check console logs**
   - Look for these messages:
     ```
     🔄 Restoring auth state from AsyncStorage...
     ✅ Restoring full auth state with user data
     ✅ Auth state restored successfully
     🔐 User is authenticated, navigating to tabs...
     ```

4. **Close and reopen Expo Go app**
   - **Android**: Swipe up to close Expo Go completely → Reopen
   - **iOS**: Swipe up to close Expo Go → Reopen
   - **Expected**: App should stay logged in

---

### Method 2: Using Test Utilities (In Dev Console)

We've added testing utilities that you can call from the JavaScript console:

1. **Open Metro Bundler terminal**

2. **Run these commands:**

```javascript
// Check current auth state
testAuth.check()

// Simulate app reload (clears memory, keeps AsyncStorage)
testAuth.reload()

// Wait 1 second, then check again
setTimeout(() => testAuth.check(), 1000)

// Run complete test suite
testAuth.fullTest()

// Clear all auth (logout)
testAuth.clear()
```

**Example output:**
```
🔍 AUTH PERSISTENCE TEST
📦 Zustand Store:
  - isAuthenticated: true
  - hasToken: true
  - hasUser: true
💾 AsyncStorage:
  - token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
  - user: user@example.com
✅ Sync Status:
  - Token match: ✅
  - User match: ✅
```

---

### Method 3: Using React Native Debugger

1. Open React Native Debugger
2. Go to Console tab
3. Type: `testAuth.fullTest()`
4. Watch the complete auth flow test run

---

## 🏗️ How to Test in APK (Production Build)

### Build APK:
```bash
# Build development APK
eas build --profile development --platform android

# Or build production APK
eas build --profile production --platform android
```

### Test Steps:

1. **Install APK on device**
2. **Login to the app**
3. **Close app completely** (swipe from recent apps)
4. **Reopen app**
   - ✅ Should stay logged in
   - ✅ Should navigate directly to tabs
   - ❌ Should NOT show welcome/login screen

5. **Force stop app** (Settings → Apps → MyToDoo → Force Stop)
6. **Open app again**
   - ✅ Should STILL stay logged in

7. **Restart device**
8. **Open app**
   - ✅ Should STILL stay logged in

---

## 📋 Expected Behavior

### ✅ CORRECT Behavior:
1. Login → Token saved to AsyncStorage
2. Close app → Token remains in AsyncStorage
3. Reopen app → AuthProvider restores token from AsyncStorage
4. App checks auth → User is authenticated
5. Navigate to tabs automatically
6. **User stays logged in** ✅

### ❌ WRONG Behavior (Old):
1. Login → Token only in Zustand (memory)
2. Close app → Memory cleared
3. Reopen app → No token found
4. Show welcome screen
5. **User has to login again** ❌

---

## 🐛 Debugging Issues

### Issue: App still shows welcome screen after login

**Check:**
1. Open console logs
2. Look for: `🔄 Restoring auth state from AsyncStorage...`
3. If you see: `⚠️ Found token but no user data`
   - User data might not be saved properly
   - Check if `setAuthData()` is being awaited

**Solution:**
```javascript
// In console
testAuth.check()
// Should show token and user in AsyncStorage
```

---

### Issue: Token exists but not restoring

**Check:**
1. `AuthProvider.tsx` is running `restoreAuthState()`
2. `setAuthData()` is being called with token + user
3. No errors in console

**Debug:**
```javascript
// Check AsyncStorage directly
AsyncStorage.getItem('token').then(t => console.log('Token:', t?.substring(0, 30)))
AsyncStorage.getItem('user').then(u => console.log('User:', u))
```

---

### Issue: Infinite loop in Expo (Fast Refresh keeps reloading)

**Cause:** AuthProvider useEffect dependencies causing re-renders

**Fixed:** We removed `setAuthData` from dependencies and use `useAuthStore.getState()` instead

---

## 🔍 What to Look For in Logs

### ✅ Successful Auth Persistence:
```
🔐 Setting NEW auth data: { token: "eyJhbGci...", user: {...} }
💾 Auth data saved to AsyncStorage
✅ Auth data successfully set in store
🔄 Restoring auth state from AsyncStorage...
✅ Restoring full auth state with user data
✅ Auth state restored successfully
🔐 User is authenticated, navigating to tabs...
```

### ❌ Failed Auth Persistence:
```
❌ No token provided to setAuthData
⚠️ Found token but no user data
❌ Error restoring auth state: [error]
❌ User not authenticated, showing welcome screen
```

---

## 📊 Testing Checklist

### Expo Development:
- [ ] Login with email/password
- [ ] Reload app (R key) → Stays logged in
- [ ] Close Expo Go → Reopen → Stays logged in
- [ ] Run `testAuth.fullTest()` → All checks pass
- [ ] Logout → Clear auth data

### APK Production:
- [ ] Install APK
- [ ] Login
- [ ] Close app → Reopen → Stays logged in
- [ ] Force stop → Reopen → Stays logged in
- [ ] Restart device → Open app → Stays logged in
- [ ] Logout → Login screen shows

---

## 🚀 Key Files Changed

1. **`src/store/auth-task-store.ts`**
   - Made `setAuthData()` async
   - Saves to AsyncStorage

2. **`src/shared/AuthProvider.tsx`**
   - Restores from AsyncStorage on mount
   - No infinite loops

3. **`app/index.tsx`**
   - Checks auth status
   - Auto-navigates if authenticated

4. **`src/api/mytasks.ts`**
   - Awaits `setAuthData()` in login flows

5. **`src/shared/utils/test-auth-persistence.ts`**
   - Testing utilities for development

---

## 💡 Pro Tips

1. **Always check console logs** - They tell you exactly what's happening
2. **Use `testAuth.check()`** - Quick way to verify state in Expo
3. **Test in both Expo and APK** - Behavior might differ slightly
4. **Clear app data** - If testing gets messy, clear app data and start fresh
5. **Check AsyncStorage** - Use React Native Debugger to inspect AsyncStorage directly

---

## ✅ Success Criteria

- ✅ User logs in → Token saved
- ✅ App reloads in Expo → User stays logged in
- ✅ APK closes/reopens → User stays logged in
- ✅ Device restarts → User stays logged in
- ✅ Logout works → Auth data cleared

**This is NOW WORKING!** 🎉
