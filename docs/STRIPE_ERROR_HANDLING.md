# Stripe Connect Error Handling Guide

## Common Errors and Solutions

### 1. "Failed to generate account link"

**Possible Causes:**
- No Stripe Connect account exists yet (must create account first)
- Invalid returnUrl or refreshUrl format
- Backend Stripe API configuration issue

**Solutions:**
1. Ensure account is created before getting onboarding link
2. Verify URLs are correct: `https://mytodoo.com/stripe-onboarding/return` and `https://mytodoo.com/stripe-onboarding/refresh`
3. Check backend logs for Stripe API errors
4. Verify Stripe API keys are configured correctly

**What the app does:**
- Shows detailed error alert with message
- Logs complete error details to console
- Provides "Try Again" option

### 2. "No Stripe Connect account found" (404)

**Expected Behavior:**
- This is normal for new users who haven't set up payout account yet
- App shows "Add Payout Account" button
- Not logged as error (only info)

**User Flow:**
1. User clicks "Setup Payout Account"
2. Gets 404 (no account)
3. Sees "Add Payout Account" button
4. Clicks button to create account

### 3. "Account already exists" (400)

**Cause:**
- User already has Stripe Connect account
- Trying to create duplicate account

**What the app does:**
- Shows "Account Exists" alert
- Automatically refreshes account status
- Returns existing account data if available

### 4. "Authentication Error" (401)

**Cause:**
- Auth token expired or invalid
- User not logged in

**What the app does:**
- Shows "Session expired" message
- User needs to log in again

### 5. "Server Error" (500)

**Cause:**
- Backend processing error
- Stripe API error
- Database connection issue

**What the app does:**
- Shows user-friendly "try again later" message
- Logs full error for debugging
- Provides retry option

## API Request/Response Logging

### Create Account
```
📤 Creating Stripe Connect account...
📥 Create account response: { status: 200, statusText: 'OK', ok: true }
✅ Account created successfully: { accountId: 'acct_...', status: 'pending' }
```

### Get Account Link
```
📤 Getting account link with params: {
  returnUrl: 'https://mytodoo.com/stripe-onboarding/return',
  refreshUrl: 'https://mytodoo.com/stripe-onboarding/refresh',
  endpoint: 'https://api.mytodoo.com/stripe/connect/account-link'
}
📦 Request body: { returnUrl: '...', refreshUrl: '...' }
📥 Account link response: { status: 200, statusText: 'OK', ok: true }
✅ Got account link: { hasUrl: true, urlPreview: 'https://connect.stripe.com/setup/...' }
```

### Error Logging
```
❌ Account link API error: {
  status: 400,
  statusText: 'Bad Request',
  error: { message: 'No account found', code: 'NO_ACCOUNT' }
}
❌ Get account link error: {
  message: 'Failed to generate account link',
  status: 400,
  details: { message: 'No account found', code: 'NO_ACCOUNT' }
}
```

## Debugging Steps

### If onboarding link fails:

1. **Check Console Logs**
   - Look for 📤 request logs
   - Check 📥 response status
   - Review ❌ error details

2. **Verify Account Exists**
   ```
   - Navigate to Payout Account screen
   - Check if account status shows or 404 error
   - If 404: Create account first
   ```

3. **Check URLs**
   ```javascript
   returnUrl: 'https://mytodoo.com/stripe-onboarding/return'
   refreshUrl: 'https://mytodoo.com/stripe-onboarding/refresh'
   ```
   - Must be HTTPS
   - Must be valid domain
   - Backend may need to whitelist these URLs

4. **Test Backend Directly**
   ```bash
   # Test create account
   curl -X POST https://api.mytodoo.com/stripe/connect/account \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Test get account link
   curl -X POST https://api.mytodoo.com/stripe/connect/account-link \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "returnUrl": "https://mytodoo.com/stripe-onboarding/return",
       "refreshUrl": "https://mytodoo.com/stripe-onboarding/refresh"
     }'
   ```

5. **Check Backend Configuration**
   - Verify Stripe API keys (test/live mode)
   - Check if Express account type is enabled
   - Verify webhook endpoints configured
   - Check CORS settings for mytodoo.com

## Error Messages for Users

### Clear & Actionable
✅ **Good:** "Your session has expired. Please log in again."
✅ **Good:** "Unable to connect to payment service. Please try again later."
✅ **Good:** "You already have a payout account. Refreshing status..."

❌ **Bad:** "Error: 401"
❌ **Bad:** "Failed"
❌ **Bad:** "Something went wrong"

### Error Message Structure
```typescript
if (err?.status === 400) {
  Alert.alert(
    'Title',                    // Brief, clear title
    'Detailed explanation',     // What happened and what to do
    [{ text: 'Action' }]       // Clear action button
  );
}
```

## WebView Navigation Handling

### Success Flow
```
1. User completes Stripe onboarding
2. Stripe redirects to: https://mytodoo.com/stripe-onboarding/return
3. WebView detects URL contains 'stripe-onboarding/return'
4. Closes WebView
5. Refreshes account status (after 1 second delay)
6. Shows success alert
```

### Refresh Flow
```
1. Onboarding link expires or needs refresh
2. Stripe redirects to: https://mytodoo.com/stripe-onboarding/refresh
3. WebView detects URL contains 'stripe-onboarding/refresh'
4. Closes WebView
5. Gets new onboarding link
6. Reopens WebView with fresh link
```

## Testing Checklist

### Error Scenarios to Test
- [ ] No account exists → Shows "Add Account" button
- [ ] Create account fails (500) → Shows error with retry
- [ ] Account link fails → Shows detailed error message
- [ ] Auth token invalid (401) → Shows "log in again" message
- [ ] Duplicate account (400) → Shows "account exists" and refreshes
- [ ] Network timeout → Shows connection error
- [ ] WebView close button → Returns to previous screen
- [ ] Success return URL → Closes WebView and shows success
- [ ] Refresh return URL → Gets new link and reopens

### What to Check in Logs
```
✅ Look for: 📤 📥 ✅ (normal flow)
❌ Look for: ❌ (errors with details)
ℹ️ Look for: 🔐 🔗 🔄 (info messages)
```

## Quick Fixes

### Problem: "Failed to generate account link"
**Fix:** Make sure account is created first, then get link

### Problem: Link shows but WebView doesn't open
**Fix:** Check onboardingUrl state and showWebView state

### Problem: WebView shows blank page
**Fix:** Verify URL is HTTPS Stripe Connect URL

### Problem: Return URL doesn't close WebView
**Fix:** Check WebView navigation handler for URL pattern match

### Problem: All API calls return 401
**Fix:** User needs to log in again (token expired)

## Support Information

### For Users
- Check internet connection
- Try logging out and back in
- Contact support if error persists
- Provide error screenshot if reporting issue

### For Developers
- Check Metro console for detailed logs
- Review backend API logs
- Verify Stripe dashboard for account status
- Test with Stripe test mode first
