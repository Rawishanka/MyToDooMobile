# 🔧 Fix Android Google Sign-In
## Complete Guide to Enable Google Sign-In on Android APK

> **Issue**: "Sign-In Failed - Unable to complete Google Sign-In. Please try again."  
> **Root Cause**: SHA-1 fingerprint not registered in Firebase Console  
> **Solution**: Add SHA-1 to Firebase and download updated google-services.json

---

## 📋 Problem Overview

### Why Google Sign-In Fails on Android

**Current Configuration Issue**:
```
❌ Android google-services.json only has Web OAuth client (type 3)
❌ Missing Android OAuth client (type 1) 
❌ SHA-1 fingerprint not registered in Firebase
✅ iOS Google Sign-In works (iOS client is registered)
```

**Your Release Keystore SHA-1**:
```
SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
SHA256: 5A:6F:5A:97:4B:82:F3:64:F6:F2:9E:8B:21:AF:DA:14:49:3D:40:E7:E6:91:7C:BF:57:2E:CA:5C:4E:43:4D:F9

Keystore: /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android/app/mytodoo-release.keystore
Alias: mytodoo-release
```

---

## ✅ Complete Fix (Step-by-Step)

### Step 1: Access Firebase Console

1. **Open Browser** and go to: https://console.firebase.google.com
2. **Sign in** with your Google account
3. **Select Project**: `mytodoo-e4cdb` (your LIVE project)
4. **Click**: Project Overview (top left)

### Step 2: Add SHA-1 Fingerprint to Android App

1. **Click**: ⚙️ (Settings icon) next to "Project Overview"
2. **Click**: "Project settings"
3. **Scroll down** to "Your apps" section
4. **Find**: Android app with package `com.mytodoo.mytodoolive`
   - If you don't see it, you need to add the Android app first (see Step 3)
5. **Click**: The Android app to expand settings
6. **Scroll down** to "SHA certificate fingerprints" section
7. **Click**: "Add fingerprint" button
8. **Paste**: `16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB`
9. **Click**: "Save"

**Screenshot Location**: You should see the SHA-1 listed under your Android app

### Step 3: Add Android App (If Not Already Added)

**If you don't see Android app with package `com.mytodoo.mytodoolive`:**

1. **In Firebase Console** → Project Settings → Your apps section
2. **Click**: "+ Add app" button
3. **Select**: Android icon
4. **Fill in**:
   ```
   Android package name: com.mytodoo.mytodoolive
   App nickname (optional): MyToDoo Live Android
   Debug signing certificate SHA-1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
   ```
5. **Click**: "Register app"
6. **Download** google-services.json
7. **Click**: "Next" → "Next" → "Continue to console"

**If app already exists but wrong package name:**
- ⚠️ You cannot change package name of existing app
- You must add a NEW Android app with correct package: `com.mytodoo.mytodoolive`

### Step 4: Enable Google Sign-In in Firebase Authentication

1. **In Firebase Console** → Click "Authentication" (left sidebar)
2. **Click**: "Sign-in method" tab
3. **Find**: Google sign-in provider
4. **Click**: Google row to edit
5. **Toggle**: "Enable" switch to ON
6. **Fill in**:
   ```
   Project public-facing name: MyToDoo
   Project support email: [Your email]
   ```
7. **Click**: "Save"

**Verify**: Google should show "Enabled" status in the providers list

### Step 5: Download Updated google-services.json

1. **Go back to**: Project Settings → Your apps
2. **Find**: Android app `com.mytodoo.mytodoolive`
3. **Click**: "google-services.json" download button
4. **Save file** to your Downloads folder

**Expected File Content**:
The new file should contain TWO OAuth clients:
```json
{
  "client": [
    {
      "client_id": "...",
      "client_type": 3,  // Web client (existing)
      "oauth_client": [...]
    },
    {
      "client_id": "...",
      "client_type": 1,  // Android client (NEW!)
      "oauth_client": [...]
    }
  ]
}
```

### Step 6: Replace google-services.json in Project

1. **Open Terminal**:
   ```bash
   cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android/app
   ```

2. **Backup old file**:
   ```bash
   mv google-services.json google-services.json.backup
   ```

3. **Copy new file**:
   ```bash
   cp ~/Downloads/google-services.json .
   ```

4. **Verify** the new file:
   ```bash
   cat google-services.json | grep -A 5 '"client_type"'
   ```
   
   **Expected output**: Should show BOTH client_type 1 and 3

### Step 7: Verify Package Name Matches

**Double-check everything matches**:

1. **In google-services.json**:
   ```bash
   grep "package_name" google-services.json
   ```
   **Should show**: `"package_name": "com.mytodoo.mytodoolive"`

2. **In build.gradle**:
   ```bash
   grep "applicationId" build.gradle
   ```
   **Should show**: `applicationId "com.mytodoo.mytodoolive"`

3. **In AndroidManifest.xml**:
   ```bash
   grep "package=" src/main/AndroidManifest.xml
   ```
   **Should show**: `package="com.mytodoo.mytodoolive"`

**All three MUST match exactly!**

### Step 8: Clean and Rebuild APK

1. **Clean build**:
   ```bash
   cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android
   ./gradlew clean
   ```

2. **Build release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

3. **Wait for build** (2-5 minutes)
   
4. **Verify success**:
   ```bash
   ls -lh app/build/outputs/apk/release/app-release.apk
   ```

### Step 9: Install APK on Device

1. **Uninstall old APK** from your phone:
   - Settings → Apps → MyToDoo → Uninstall
   - This clears old OAuth cache

2. **Connect phone** via USB

3. **Install new APK**:
   ```bash
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

4. **Launch app** on phone

5. **Test Google Sign-In**:
   - Tap "Continue with Google"
   - Select Google account
   - Should complete successfully! ✅

---

## 🔍 Verification Checklist

### Before Rebuild

- [ ] SHA-1 fingerprint added to Firebase Console
- [ ] Android app registered in Firebase (com.mytodoo.mytodoolive)
- [ ] Google Sign-In enabled in Firebase Authentication
- [ ] Downloaded new google-services.json
- [ ] Replaced google-services.json in android/app/
- [ ] Verified package name matches in all files

### After Rebuild

- [ ] Build succeeded without errors
- [ ] APK file exists: android/app/build/outputs/apk/release/app-release.apk
- [ ] APK size is reasonable (30-50 MB)
- [ ] Uninstalled old app from phone
- [ ] Installed new APK successfully
- [ ] App launches without crashes
- [ ] Google Sign-In works! ✅

---

## 🧪 Testing Google Sign-In

### Test Flow

1. **Launch app** on phone
2. **Tap**: "Continue with Google" button
3. **Google OAuth screen appears** (web view)
4. **Select** your Google account
5. **Approve** permissions
6. **App receives token** and signs you in
7. **Navigate to app** (home screen or onboarding)

### Expected Behavior

✅ **Success**:
- Google account picker appears
- After selecting account, redirects back to app
- User is logged in
- Profile shows Google account info

❌ **Failure** (if still not working):
- "Sign-In Failed" dialog
- App doesn't receive token
- Stuck on login screen

### If Still Failing

Check these:

1. **Verify google-services.json has Android client**:
   ```bash
   cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android/app
   cat google-services.json | grep '"client_type"'
   ```
   **Should show**: Both `"client_type": 1` and `"client_type": 3`

2. **Check Firebase Console**:
   - Settings → Your apps → Android app
   - Verify SHA-1 is listed
   - Verify package name: com.mytodoo.mytodoolive

3. **Check logcat for errors**:
   ```bash
   adb logcat | grep -i "google\|oauth\|signin"
   ```

4. **Verify internet connection** on phone

5. **Check backend API**:
   - Ensure https://au-live-api.mytodoo.com/api/auth/google is working

---

## 📱 Quick Command Reference

### Get SHA-1 Fingerprint
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android
export JAVA_HOME=$(/opt/homebrew/bin/brew --prefix openjdk@17)
$JAVA_HOME/bin/keytool -list -v \
  -keystore app/mytodoo-release.keystore \
  -storepass mytodoo2026 \
  -alias mytodoo-release \
  2>/dev/null | grep -A 1 "SHA1:"
```

**Output**:
```
SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
```

### Verify google-services.json
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android/app
cat google-services.json | grep -A 10 '"client"'
```

### Build Release APK
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/android
./gradlew clean
./gradlew assembleRelease
```

### Install on Connected Device
```bash
adb devices  # Verify device connected
adb install -r app/build/outputs/apk/release/app-release.apk
```

### View Live Logs
```bash
adb logcat | grep -i "mytodoo\|google\|oauth"
```

---

## 🔐 Current Configuration Summary

### Keystore Details
```yaml
Keystore File: android/app/mytodoo-release.keystore
Store Password: mytodoo2026
Key Alias: mytodoo-release
Key Password: mytodoo2026

SHA-1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
SHA-256: 5A:6F:5A:97:4B:82:F3:64:F6:F2:9E:8B:21:AF:DA:14:49:3D:40:E7:E6:91:7C:BF:57:2E:CA:5C:4E:43:4D:F9
```

### Firebase Configuration
```yaml
Project: mytodoo-e4cdb
Project Number: 685356682007
Package Name: com.mytodoo.mytodoolive

Required OAuth Clients:
  - Web Client (type 3): ✅ Exists
  - Android Client (type 1): ❌ Missing → ADD THIS!
```

### Required Files
```
android/app/google-services.json → Must contain Android OAuth client
android/app/build.gradle → applicationId "com.mytodoo.mytodoolive"
android/app/src/main/AndroidManifest.xml → package="com.mytodoo.mytodoolive"
```

---

## ⚠️ Important Notes

### Do NOT Change
- ✅ Keep package name: `com.mytodoo.mytodoolive`
- ✅ Keep keystore file and passwords
- ✅ Keep SHA-1 fingerprint
- ✅ Keep API endpoint: au-live-api.mytodoo.com

### Must Match Everywhere
All these files must have `com.mytodoo.mytodoolive`:
1. android/app/build.gradle → applicationId
2. android/app/src/main/AndroidManifest.xml → package
3. android/app/google-services.json → package_name
4. Firebase Console → Android app package
5. Kotlin source files → package declarations

### After Adding SHA-1
- ⏱️ Firebase takes 1-2 minutes to generate Android OAuth client
- 📥 Download new google-services.json AFTER adding SHA-1
- 🔄 Must rebuild APK with new google-services.json
- 🗑️ Uninstall old app before installing new one

---

## 🎯 Summary

**What You Need to Do**:

1. ✅ **Add SHA-1 to Firebase Console**
   - Go to Firebase → Settings → Your apps → Android app
   - Add fingerprint: `16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB`

2. ✅ **Download Updated google-services.json**
   - After adding SHA-1, download new file
   - Replace android/app/google-services.json

3. ✅ **Rebuild APK**
   - `./gradlew clean assembleRelease`

4. ✅ **Install on Phone**
   - Uninstall old app first
   - `adb install -r app/build/outputs/apk/release/app-release.apk`

5. ✅ **Test Google Sign-In**
   - Tap "Continue with Google"
   - Should work! 🎉

---

## 📞 Troubleshooting

### Still Getting "Sign-In Failed"?

1. **Check internet connection** on phone
2. **Verify Firebase Console**:
   - SHA-1 is listed under Android app
   - Google Sign-In is enabled in Authentication
3. **Check google-services.json**:
   - Contains `"client_type": 1` (Android client)
   - Package name matches: com.mytodoo.mytodoolive
4. **Check app logs**:
   ```bash
   adb logcat | grep -E "Google|OAuth|SignIn"
   ```
5. **Verify backend**:
   - API endpoint is reachable
   - /auth/google endpoint works

### Firebase Console Access Issues?

If you don't have access to Firebase Console:
- Ask the Firebase project owner
- Need "Editor" or "Owner" role
- Or get the updated google-services.json from project owner

---

**After completing these steps, Google Sign-In will work perfectly on Android! 🚀**
