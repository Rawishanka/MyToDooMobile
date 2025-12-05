# Authentication & Profile Loading Fixes

## Issues Fixed

### 1. **Infinite Loading Loop on Profile Screen**
**Problem:** Profile screen was stuck in infinite loading state with logs showing:
- `isAuthenticated: true`
- `hasToken: true` 
- `user: undefined`
- "Not authenticated - cannot fetch profile" error

**Root Cause:** 
- Token was stored in AsyncStorage but user data wasn't being loaded on app start
- Profile API required `user._id` but it was undefined
- useEffect auto-redirect checked `isAuthenticated` and `token` (both true) so didn't redirect
- Created infinite loop: token exists → try to fetch profile → no user ID → error → show loading → repeat

**Solution:**
1. **Removed problematic auto-redirect useEffect** - it was checking wrong conditions
2. **Updated profile API hook** - now only requires `isAuthenticated` and `token`, not `user._id`
3. **Added proper auth error detection** - detects 401, auth errors, token expiration
4. **Added auth error handling** - automatically clears auth and redirects on auth errors
5. **Improved loading state logic** - shows loading only while fetching, not for missing auth

### 2. **Missing User Data After App Restart**
**Problem:** After app restart, token was restored but user object was undefined

**Solution:**
- AuthProvider already handles this in `restoreAuthState()` function
- It loads both token AND user data from AsyncStorage
- If user data missing, it fetches from API using token

### 3. **API Base URL Configuration**
**Problem:** URLs were using old IP address or wrong domain

**Solution:** Updated all URLs to use `https://api.mytodoo.com/api`:
- `.env` file (3 places)
- `src/api/config.ts` (fallback URL)
- `app.config.ts` (EAS build config)
- `src/api/auth-api.ts` (2 functions)
- `eas.json` (preview & production)

### 4. **Review Links Using Old Domain**
**Problem:** Review request links showed `http://134.199.172.167:3000/review/...`

**Solution:** Updated to use production domain `https://mytodoo.com/review/${userId}`:
- `RequestReviewModal.tsx`
- `GetMoreReviewsSection.tsx`

### 5. **ID Verification Auto-Loading**
**Problem:** ID Verification screen was loading immediately instead of requiring admin approval

**Solution:** Implemented request access flow:
- Added 3 states: `locked` → `pending` → `approved`
- Shows "Request access to verify" when locked
- User clicks → Modal appears asking to send request
- After sending → Shows "Pending admin approval"
- Only allows verification after admin approves

## Files Modified

### Core Authentication Files:
1. **src/features/profile/screens/profile-screen.tsx**
   - Removed auto-redirect useEffect causing loops
   - Added auth error detection and handling
   - Improved loading state logic
   - Added ID verification request flow

2. **src/shared/hooks/useUserProfileApi.ts**
   - Changed to only require `token` instead of `user._id`
   - Removed manual "Not authenticated" error throwing
   - Better error retry logic

### Configuration Files:
3. **.env** - Updated 3 API URL references
4. **src/api/config.ts** - Updated fallback URL
5. **app.config.ts** - Updated EAS API URL
6. **src/api/auth-api.ts** - Updated 2 fallback URLs
7. **eas.json** - Updated preview & production URLs

### Review Component Files:
8. **src/features/profile/screens/user-profile/components/RequestReviewModal.tsx**
9. **src/features/profile/screens/user-profile/components/GetMoreReviewsSection.tsx**

## How Authentication Now Works

### App Start Flow:
1. **AuthProvider** loads token + user from AsyncStorage
2. If token exists but no user data → fetches user from API
3. **Profile screen** checks for auth errors
4. If 401 or auth error → clears auth → redirects to login
5. If token valid → fetches and displays profile

### Token Expiration Flow:
1. API returns 401 when token expires
2. **API interceptor** (in `api.ts`) detects 401
3. Calls `clearAuth()` to clear token
4. **Profile screen** detects auth error via `isAuthError`
5. Clears auth and redirects to login
6. User sees login screen (not infinite loading)

### Logout Flow:
1. User clicks logout
2. Calls `clearAuth()` in auth store
3. Clears token, user, and AsyncStorage
4. Logout component handles redirect to login
5. Clean logout, no loops

## Testing Checklist

✅ **App Start:**
- Opens to correct screen based on auth state
- If token expired → redirects to login
- If token valid → shows tabs/profile

✅ **Profile Screen:**
- Loads profile data correctly
- Shows loading spinner while fetching
- No infinite loops
- Handles errors gracefully

✅ **Token Expiration:**
- Auto-detects when token expires
- Clears auth state
- Redirects to login screen
- No crashes or loops

✅ **Logout:**
- Clears all auth data
- Redirects to login
- Cannot access protected screens after logout

✅ **API Calls:**
- All use `https://api.mytodoo.com/api`
- Review links use `https://mytodoo.com/review/...`
- No hardcoded IP addresses in code

✅ **ID Verification:**
- Shows "Request access to verify" when locked
- Modal appears when clicked
- Shows "Pending approval" after request sent
- Only opens verification screen when approved

## Known Behavior

### Expected Loading States:
1. **Initial app load:** Shows splash screen while checking auth
2. **Profile first load:** Shows spinner while fetching user data
3. **After logout:** Brief loading then login screen appears

### What NOT to see:
- ❌ Infinite loading loops
- ❌ Flickering between screens
- ❌ "Not authenticated" errors when token is valid
- ❌ Screens loading repeatedly without stopping

## Debugging Tips

If you see loading loops again:
1. Check console for "Not authenticated - redirecting to login"
2. Check if user object exists in auth store: `authUser`
3. Check if profile API is returning 401
4. Clear app data and restart: `npx expo start --clear`
5. Check AsyncStorage has both 'token' and 'user' keys

## Production Deployment

Before building APK/IPA:
1. ✅ Verify `.env` has `EXPO_PUBLIC_API_URL=https://api.mytodoo.com/api`
2. ✅ Verify `eas.json` has correct production URL
3. ✅ Test token expiration flow
4. ✅ Test logout flow
5. ✅ Build with `eas build --platform android --profile production`
