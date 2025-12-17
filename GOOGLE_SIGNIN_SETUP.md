# Google Sign-In Setup Guide

## Current Status
✅ Firebase Auth packages installed  
✅ Google Sign-In SDK installed  
✅ google-services.json configured  
✅ Code implemented in login and signup screens  

## CRITICAL: Missing OAuth Client Configuration

### Issue
The `android/app/google-services.json` file has an empty `oauth_client` array. This is why APK might crash or Google Sign-In doesn't work.

### Solution: Download Complete google-services.json from Firebase Console

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: `mytodoo-40c87`

2. **Navigate to Project Settings:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"

3. **Go to Your Android App:**
   - Scroll down to "Your apps" section
   - Find the Android app with package name: `com.unexo.mytodoomobile`

4. **Download google-services.json:**
   - Click "google-services.json" download button
   - This will download the COMPLETE file with OAuth clients

5. **Replace the File:**
   ```powershell
   # Backup current file
   Copy-Item android\app\google-services.json android\app\google-services.json.backup
   
   # Replace with downloaded file
   # Copy the downloaded google-services.json to: android\app\google-services.json
   ```

6. **Get Web Client ID:**
   - In the downloaded google-services.json, find the `oauth_client` array
   - Look for the client with `"client_type": 3`
   - Copy the `client_id` value
   - Update in `src/features/auth/screens/login-screen.tsx` at line ~507:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'PASTE_YOUR_WEB_CLIENT_ID_HERE', // From google-services.json
   });
   ```

## Enable Google Sign-In in Firebase

1. **Go to Firebase Console Authentication:**
   - https://console.firebase.google.com/project/mytodoo-40c87/authentication/providers

2. **Enable Google Sign-In:**
   - Click on "Google" in the Sign-in providers list
   - Toggle "Enable"
   - Add support email (your email)
   - Click "Save"

## Build and Test

1. **Build APK:**
   ```powershell
   eas build --platform android --profile preview --non-interactive
   ```

2. **Install APK:**
   - Download the APK from EAS build
   - Install on Android device
   - Test Google Sign-In

## Troubleshooting

### APK Crashes on Launch
- Ensure google-services.json has proper OAuth clients
- Re-download from Firebase Console
- Rebuild APK

### "Developer Error" in Google Sign-In
- Web Client ID is incorrect
- Check google-services.json for correct Web Client ID
- Update in login-screen.tsx

### "Sign-in Failed"
- Google Sign-In not enabled in Firebase Console
- Enable it in Authentication > Sign-in providers

## Testing Without APK

You **cannot** test Google Sign-In in Expo Go because it requires:
- Native Firebase modules
- Google Play Services
- Properly configured OAuth clients

You **can** test in Expo Go:
- ✅ Email/Password login
- ✅ Email/Password signup
- ✅ All other app features

## Backend Endpoint

Ensure your backend has this endpoint:
```
POST /users/firebase-auth
Body: { firebaseToken: "FIREBASE_ID_TOKEN" }
Response: { token: "JWT_TOKEN", user: {...} }
```

## Files Modified

1. `package.json` - Added Firebase Auth & Google Sign-In packages
2. `src/config/firebase.ts` - Firebase Auth initialization
3. `src/features/auth/screens/login-screen.tsx` - Google Sign-In flow
4. `src/api/mytasks.ts` - Backend integration endpoint
5. `android/app/google-services.json` - Firebase configuration (needs proper OAuth clients)
