# Testing Password Reset Deep Links on Mobile

## The Problem
Password reset works on web but not on mobile - the email link doesn't open the app.

## The Solution
Updated mobile app configuration and deep link handler to properly handle password reset links.

## What Was Fixed

### 1. Updated `app.config.ts`
- ✅ Added Android `intentFilters` for deep linking
- ✅ Added iOS `bundleIdentifier` and `associatedDomains`
- ✅ Configured `scheme: 'mytodoomobile'`

### 2. Enhanced `DeepLinkHandler.tsx`
- ✅ Better URL parsing for multiple formats
- ✅ Added error handling with user alerts
- ✅ Added delay for app initialization
- ✅ More comprehensive logging

## Testing After Changes

### Step 1: Rebuild the App
**IMPORTANT:** After changing `app.config.ts`, you MUST rebuild the app:

```bash
# Stop the current dev server
# Then rebuild:

# For Android
npx expo run:android

# For iOS
npx expo run:ios

# Or for development build
npx expo prebuild --clean
```

### Step 2: Test Deep Link Manually

#### On Android Device/Emulator:
```bash
# Test the deep link directly
adb shell am start -W -a android.intent.action.VIEW -d "mytodoomobile://reset-password?token=test123&email=test@example.com" com.nowanya.mytodoomobile
```

#### On iOS Simulator:
```bash
xcrun simctl openurl booted "mytodoomobile://reset-password?token=test123&email=test@example.com"
```

### Step 3: Test with Real Email

1. Request password reset from the app
2. Check your email (including spam folder)
3. Click the reset link in email
4. App should open automatically to the set password screen

## Expected Email Link Format

The backend should send emails with links in this format:

```
mytodoomobile://reset-password?token=<RESET_TOKEN>&email=<USER_EMAIL>
```

Example:
```
mytodoomobile://reset-password?token=a1b2c3d4e5f6g7h8&email=user@example.com
```

## Troubleshooting

### Link doesn't open app:
1. **Did you rebuild the app?** (Most common issue!)
   - After changing `app.config.ts`, you must rebuild
   - Development server refresh is NOT enough

2. **Check app scheme registration:**
   ```bash
   # Android - check if scheme is registered
   adb shell dumpsys package com.nowanya.mytodoomobile | grep -A 5 "android.intent.action.VIEW"
   ```

3. **Check logs while clicking link:**
   ```bash
   # Android logs
   adb logcat | grep -i "mytodoomobile"
   
   # iOS logs
   # Use Xcode console
   ```

### App opens but doesn't navigate:
1. Check the app logs for deep link handling
2. Verify token and email are in the URL
3. Check `DeepLinkHandler.tsx` logs

### Still not working:
1. Try using a universal link instead of deep link
2. Check if backend is sending correct URL format
3. Test with the manual commands above first

## Alternative: Universal Links (If Deep Links Don't Work)

If deep links still don't work, you can use universal links:

1. Set up a web domain (e.g., `mytodoomobile.com`)
2. Add Apple App Site Association file
3. Add Android Asset Links file
4. Email links become: `https://mytodoomobile.com/reset-password?token=xxx`
5. These work more reliably across all email clients

## Quick Verification Checklist

- [ ] Rebuilt the app after config changes
- [ ] Tested manual deep link command (works = config is correct)
- [ ] Requested password reset from app
- [ ] Received email with reset link
- [ ] Clicked link in email
- [ ] App opened automatically
- [ ] Navigated to set password screen
- [ ] Token and email pre-filled
- [ ] Successfully reset password

## Need More Help?

If it still doesn't work after rebuilding:
1. Share the exact email link format backend is sending
2. Share the logs when clicking the email link
3. Share the result of manual deep link test command
