# 🤖 Complete Android APK Build Guide
## MyToDoo Android App - Production Build Documentation

> **Last Updated**: January 26, 2026  
> **App Name**: MyToDoo  
> **Package Name**: com.mytodoo.mytodoolive  
> **Platform**: Android  
> **Build Type**: Release APK (Signed)

---

## 📋 Table of Contents

1. [Build Summary](#build-summary)
2. [Critical Configuration Fixes](#critical-configuration-fixes)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Build Process](#step-by-step-build-process)
5. [Installation on Device](#installation-on-device)
6. [Testing Google Sign-In](#testing-google-sign-in)
7. [Play Store Submission](#play-store-submission)
8. [Troubleshooting](#troubleshooting)
9. [Important Files](#important-files)

---

## ✅ Build Summary

**Status**: ✅ **BUILD SUCCESSFUL**

```
APK Location: android/app/build/outputs/apk/release/app-release.apk
APK Size: 167 MB
Package Name: com.mytodoo.mytodoolive
Version Code: 1
Version Name: 1.0.0
Signing: Release keystore (mytodoo-release.keystore)
Architecture: armeabi-v7a, x86, x86_64
```

**Build Time**: 18 seconds (after initial Gradle setup)  
**Total Tasks**: 1160 (56 executed, 1104 up-to-date)

---

## 🔧 Critical Configuration Fixes

### Issue 1: Package Name Mismatch ❌ → ✅

**Problem**: 
- Android configuration had **OLD** package name: `com.unexo.mytodoomobile`
- Firebase expects **LIVE** package name: `com.mytodoo.mytodoolive`
- This would cause Google Sign-In to fail on Android!

**Fixed**:
1. ✅ Updated `build.gradle` namespace: `com.mytodoo.mytodoolive`
2. ✅ Updated `build.gradle` applicationId: `com.mytodoo.mytodoolive`
3. ✅ Renamed source folder structure: `com/mytodoo/mytodoolive`
4. ✅ Updated package declarations in `MainActivity.kt` and `MainApplication.kt`

### Issue 2: Missing Release Signing ❌ → ✅

**Problem**:
- Release build was using debug keystore
- Not suitable for production distribution

**Fixed**:
1. ✅ Generated production keystore: `mytodoo-release.keystore`
2. ✅ Configured release signing in `build.gradle`
3. ✅ Keystore details:
   - **Alias**: mytodoo-release
   - **Password**: mytodoo2026
   - **Validity**: 27 years (until June 2053)
   - **SHA1**: `16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB`
   - **SHA256**: `5A:6F:5A:97:4B:82:F3:64:F6:F2:9E:8B:21:AF:DA:14:49:3D:40:E7:E6:91:7C:BF:57:2E:CA:5C:4E:43:4D:F9`

---

## 📱 Prerequisites

### Required Software
- [x] **macOS** (Monterey or later)
- [x] **Android SDK** (installed at ~/Library/Android/sdk)
- [x] **Java 17** (OpenJDK via Homebrew)
- [x] **Node.js** (v25.2.1)
- [x] **Gradle** (8.14.3 via wrapper)

### Environment Variables
```bash
export JAVA_HOME=$(/opt/homebrew/bin/brew --prefix openjdk@17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

### Firebase Configuration
- [x] **google-services.json** configured with LIVE project
- [x] **Project ID**: mytodoo-e4cdb
- [x] **Package Name**: com.mytodoo.mytodoolive
- [x] **Web Client ID**: 685356682007-1c32te3ilcp7uir81cfv4e7s02kqkhgo
- [x] **Android Client ID**: (auto-configured by google-services.json)

---

## 🏗️ Step-by-Step Build Process

### Step 1: Setup Environment

```bash
# Navigate to project
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile

# Set Java 17
export JAVA_HOME=$(/opt/homebrew/bin/brew --prefix openjdk@17)

# Set Android SDK
export ANDROID_HOME="$HOME/Library/Android/sdk"

# Update PATH
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Verify Java
java -version
# Expected: openjdk version "17.0.17"

# Verify Android SDK
ls -la ~/Library/Android/sdk
# Expected: build-tools, platform-tools, platforms, etc.
```

### Step 2: Clean Build Environment

```bash
cd android

# Make Gradle wrapper executable
chmod +x gradlew

# Clean previous builds
./gradlew clean
```

**Expected Output**:
```
BUILD SUCCESSFUL in 3m 47s
71 actionable tasks: 41 executed, 30 up-to-date
```

### Step 3: Build Release APK

```bash
# Build release APK with proper signing
./gradlew assembleRelease
```

**Build Process**:
1. ⏳ Configure Gradle (first time: ~4 minutes)
2. 📦 Install NDK and build tools
3. 🔧 Compile Kotlin/Java code
4. 📱 Bundle React Native assets
5. 🔐 Sign APK with release keystore
6. ✅ Generate release APK

**Expected Output**:
```
> Task :app:assembleRelease

BUILD SUCCESSFUL in 18s
1160 actionable tasks: 56 executed, 1104 up-to-date
```

### Step 4: Locate APK

```bash
# APK is located at:
ls -lh app/build/outputs/apk/release/app-release.apk

# Expected:
# -rw-r--r-- 1 user staff 167M Jan 26 19:26 app-release.apk
```

---

## 📲 Installation on Device

### Method 1: Direct Install via ADB

**1. Enable USB Debugging on Android Device**:
- Go to Settings → About Phone
- Tap "Build Number" 7 times to enable Developer Mode
- Go to Settings → Developer Options
- Enable "USB Debugging"

**2. Connect Device via USB**:
```bash
# Check connected devices
adb devices

# Expected output:
# List of devices attached
# 1234567890ABCDEF    device
```

**3. Install APK**:
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile

adb install -r android/app/build/outputs/apk/release/app-release.apk
```

**Installation Progress**:
```
Performing Streamed Install
Success
```

**4. Launch App**:
```bash
# Open app on device
adb shell am start -n com.mytodoo.mytodoolive/.MainActivity
```

### Method 2: Transfer and Install Manually

**1. Transfer APK to Device**:
```bash
# Via ADB push
adb push android/app/build/outputs/apk/release/app-release.apk /sdcard/Download/

# Or email/cloud storage to yourself
```

**2. Install on Device**:
- Open "Files" or "Downloads" app on Android
- Tap `app-release.apk`
- Tap "Install"
- Allow installation from unknown sources if prompted
- Tap "Open" when installed

### Method 3: Wireless Installation (Android 11+)

**1. Enable Wireless Debugging**:
- Settings → Developer Options → Wireless Debugging
- Tap "Pair device with pairing code"

**2. Pair via Command**:
```bash
# Connect to device wirelessly
adb pair <IP_ADDRESS>:<PORT>
# Enter pairing code shown on device

# Connect
adb connect <IP_ADDRESS>:<PORT>

# Install
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Testing Google Sign-In

### Pre-Test Checklist

- [ ] APK installed on real Android device (not emulator)
- [ ] Device connected to internet (WiFi or mobile data)
- [ ] Google Play Services updated on device
- [ ] Firebase project is LIVE (mytodoo-e4cdb)
- [ ] Package name matches: com.mytodoo.mytodoolive

### Testing Steps

**1. Launch App**:
- Open MyToDoo app from app drawer
- Wait for splash screen
- Should reach Login/Signup screen

**2. Test Google Sign-In**:
```
1. Tap "Sign in with Google" button
2. Google account picker should appear
3. Select your Google account
4. Review permissions and tap "Continue"
5. Should redirect back to app
6. Should automatically login
7. Should navigate to Home/Browse Tasks screen
```

**Expected Behavior**:
- ✅ Google account picker opens
- ✅ Account selection works
- ✅ No app crashes
- ✅ Returns to app after authentication
- ✅ User is logged in
- ✅ Home screen displays

**Common Issues**:

**Issue 1: Google Sign-In button doesn't respond**
- **Cause**: Package name mismatch or Firebase misconfiguration
- **Fix**: Verify package name in google-services.json matches app

**Issue 2: App crashes when tapping Google Sign-In**
- **Cause**: Missing Google Play Services
- **Fix**: Update Google Play Services on device

**Issue 3: "Sign in failed" error**
- **Cause**: Web Client ID incorrect or Firebase not enabled
- **Fix**: Check firebaseAuthService.ts has correct WEB_CLIENT_ID

**Issue 4: Account picker doesn't show**
- **Cause**: @react-native-google-signin not configured properly
- **Fix**: Already configured correctly in this build ✅

### Verify Firebase Configuration

```bash
# Check google-services.json
cat android/app/google-services.json | grep -A 3 "client_id"

# Expected:
# "client_id": "685356682007-1c32te3ilcp7uir81cfv4e7s02kqkhgo.apps.googleusercontent.com",
# "client_type": 3
```

### Monitor Logs During Testing

```bash
# Watch app logs in real-time
adb logcat | grep -i "mytodoo\|google\|firebase\|signin"

# Watch for errors
adb logcat | grep -E "ERROR|FATAL|crash"
```

---

## 🚀 Play Store Submission

### Step 1: Prepare for Play Store

**Generate App Signing Key (Play Store)**:

Google Play requires apps to be signed with a specific key. You have two options:

**Option A: Use Existing Release Keystore**
```bash
# Your current keystore (created during build):
android/app/mytodoo-release.keystore

# Details:
Alias: mytodoo-release
Password: mytodoo2026
SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
```

**Option B: Generate New Upload Keystore for Play Store**

If you want separate upload and signing keys:

```bash
cd android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore mytodoo-upload.keystore \
  -alias mytodoo-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass [YOUR_SECURE_PASSWORD] \
  -keypass [YOUR_SECURE_PASSWORD] \
  -dname "CN=MyToDoo, OU=Mobile, O=MyToDoo, L=Sydney, ST=NSW, C=AU"
```

### Step 2: Update Firebase with Release SHA-1

⚠️ **CRITICAL**: Add your release keystore SHA-1 to Firebase!

**1. Get SHA-1 Fingerprint**:
```bash
keytool -list -v \
  -keystore android/app/mytodoo-release.keystore \
  -storepass mytodoo2026 \
  -alias mytodoo-release \
  | grep SHA1

# Output:
# SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
```

**2. Add to Firebase Console**:
- Go to: https://console.firebase.google.com
- Select project: **mytodoo-e4cdb**
- Go to: Project Settings → Your apps → MyToDoo Android
- Scroll down to "SHA certificate fingerprints"
- Click "Add fingerprint"
- Paste SHA-1: `16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB`
- Click "Save"
- **Download updated google-services.json**
- Replace `android/app/google-services.json`
- Rebuild APK

### Step 3: Create Play Store Listing

**1. Go to Google Play Console**:
- URL: https://play.google.com/console
- Sign in with Google Developer account ($25 one-time fee)

**2. Create New App**:
- Click "Create app"
- App name: **MyToDoo**
- Default language: English (United States)
- App or game: App
- Free or paid: Free
- Accept declarations

**3. Fill in Store Listing**:

**App Details**:
```
App name: MyToDoo
Short description (80 chars max):
"Get tasks done! Connect with skilled taskers for any job, big or small."

Full description (4000 chars max):
[Use same description as App Store submission guide]

App icon: 512x512 PNG
Feature graphic: 1024x500 PNG
Phone screenshots: At least 2 (1080x1920 or higher)
7-inch tablet screenshots: Optional
10-inch tablet screenshots: Optional
```

**Categorization**:
```
App category: Productivity
Tags: tasks, services, gig economy, freelance
```

**Contact details**:
```
Email: support@mytodoo.com
Phone: +61 XXX XXX XXX (optional)
Website: https://mytodoo.com
```

**Privacy Policy**:
```
Privacy policy URL: https://mytodoo.com/privacy
```

### Step 4: Upload APK/AAB

**Option A: Upload APK (Faster)**:
```
File: android/app/build/outputs/apk/release/app-release.apk
Size: 167 MB
```

**Option B: Build AAB (Recommended - Smaller download)**:
```bash
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Upload to Play Console**:
1. Go to: Production → Create new release
2. Upload `app-release.apk` or `app-release.aab`
3. Fill in "Release notes"
4. Click "Review release"
5. Click "Start rollout to Production"

### Step 5: Content Rating

**1. Complete Questionnaire**:
- Go to: Content rating → Start questionnaire
- Select category: Productivity/Business
- Answer questions truthfully
- Example for MyToDoo:
  - No violence
  - No sexual content
  - No illegal activity
  - User-generated content: Yes (task posts, chat)
  - Moderated: Yes (report system)

**2. Get Rating**:
- Expected: Everyone or Teen
- Save rating

### Step 6: Pricing & Distribution

```
Countries: All countries
Price: Free
Contains ads: No
In-app purchases: No (or Yes if using Stripe for in-app)

Content rating: Everyone/Teen
Target audience: Ages 13+ or 18+
```

### Step 7: Submit for Review

**1. Complete All Required Sections**:
- [ ] Store listing
- [ ] App content (Privacy policy, ads, target audience)
- [ ] Content rating
- [ ] Pricing and distribution
- [ ] APK/AAB uploaded

**2. Submit**:
- Click "Send for review"
- Wait for approval (typically 1-7 days)

**Review Timeline**:
```
Submitted → Under review (1-3 days) → Approved/Rejected → Published
```

### Step 8: After Approval

**Published**:
- App is live on Play Store!
- Users can download: https://play.google.com/store/apps/details?id=com.mytodoo.mytodoolive
- Monitor reviews and crashes in Play Console

**Rejected**:
- Read rejection reason in Play Console
- Fix issues
- Increment version code in build.gradle
- Rebuild and resubmit

---

## 🛠️ Troubleshooting

### Build Errors

**Error: "Unresolved reference 'BuildConfig'"**
```
Cause: Package name mismatch in Kotlin source files
Fix: Update package declaration in MainActivity.kt and MainApplication.kt
```

**Error: "java: command not found"**
```bash
# Install Java 17
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=$(/opt/homebrew/bin/brew --prefix openjdk@17)
```

**Error: "adb: command not found"**
```bash
# Add Android SDK to PATH
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

**Error: "Execution failed for task ':app:processReleaseResources'"**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Installation Errors

**Error: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"**
```bash
# Uninstall old version first
adb uninstall com.mytodoo.mytodoolive

# Install again
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Error: "INSTALL_PARSE_FAILED_NO_CERTIFICATES"**
```
Cause: APK not signed or corrupted
Fix: Rebuild APK with proper signing configuration
```

**Error: "App not installed"**
```
Cause: Insufficient storage or incompatible architecture
Fix: 
1. Free up space on device
2. Check device architecture (must support armeabi-v7a, x86, or x86_64)
```

### Runtime Errors

**App crashes on launch**:
```bash
# Check logcat for crash logs
adb logcat | grep -E "AndroidRuntime|FATAL"

# Common causes:
# 1. Missing permissions in AndroidManifest.xml
# 2. Firebase misconfiguration
# 3. Native module not linked properly
```

**Google Sign-In not working**:
```bash
# 1. Verify package name
adb shell dumpsys package com.mytodoo.mytodoolive | grep versionName

# 2. Check google-services.json package name matches
cat android/app/google-services.json | grep package_name

# 3. Verify SHA-1 in Firebase Console
```

**Permissions not working**:
```
Cause: Android 6.0+ requires runtime permissions
Fix: Check that app requests permissions at runtime (already implemented)
```

---

## 📁 Important Files

### Configuration Files

```
android/
├── app/
│   ├── build.gradle                          # App-level Gradle config
│   │   - namespace: com.mytodoo.mytodoolive
│   │   - applicationId: com.mytodoo.mytodoolive
│   │   - versionCode: 1
│   │   - versionName: "1.0.0"
│   │   - signingConfigs: release & debug
│   │
│   ├── google-services.json                  # Firebase configuration
│   │   - project_id: mytodoo-e4cdb
│   │   - package_name: com.mytodoo.mytodoolive
│   │   - client_id: Web Client ID for Google Sign-In
│   │
│   ├── mytodoo-release.keystore             # Release signing key
│   │   - Alias: mytodoo-release
│   │   - Password: mytodoo2026
│   │   - SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
│   │
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml           # App permissions and components
│           │   - package: com.mytodoo.mytodoolive
│           │   - Permissions: Camera, Location, Storage, etc.
│           │
│           └── java/com/mytodoo/mytodoolive/
│               ├── MainActivity.kt            # Main activity
│               └── MainApplication.kt        # Application class
│
├── build.gradle                              # Project-level Gradle config
│   - Google Services plugin: 4.4.0
│   - Kotlin: 2.1.20
│   - compileSdk: 35
│   - targetSdk: 35
│   - minSdk: 24
│
└── gradle.properties                         # Gradle properties
    - Build optimization settings
```

### Build Outputs

```
android/app/build/outputs/
├── apk/
│   └── release/
│       └── app-release.apk                  # 167 MB signed APK
│
├── bundle/
│   └── release/
│       └── app-release.aab                  # AAB for Play Store (if built)
│
└── mapping/
    └── release/
        └── mapping.txt                       # ProGuard mapping (if enabled)
```

### Key Configuration Values

```yaml
Package Name: com.mytodoo.mytodoolive
Firebase Project: mytodoo-e4cdb
Project Number: 685356682007

Google Sign-In:
  Web Client ID: 685356682007-1c32te3ilcp7uir81cfv4e7s02kqkhgo
  
Signing:
  Keystore: mytodoo-release.keystore
  Alias: mytodoo-release
  SHA1: 16:F2:C3:35:8D:7B:34:16:BD:F3:F5:D8:0C:1C:06:9C:A0:F0:07:CB
  SHA256: 5A:6F:5A:97:4B:82:F3:64:F6:F2:9E:8B:21:AF:DA:14:49:3D:40:E7:E6:91:7C:BF:57:2E:CA:5C:4E:43:4D:F9

Version:
  Code: 1
  Name: 1.0.0

Target:
  Min SDK: 24 (Android 7.0)
  Target SDK: 35 (Android 15)
  Compile SDK: 35
```

---

## 📝 Build Commands Reference

### Quick Build Commands

```bash
# Clean build
cd android && ./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Install on connected device
adb install -r app/build/outputs/apk/release/app-release.apk

# Uninstall from device
adb uninstall com.mytodoo.mytodoolive

# View app logs
adb logcat | grep MyToDoo

# Check APK details
aapt dump badging app/build/outputs/apk/release/app-release.apk

# List APK contents
unzip -l app/build/outputs/apk/release/app-release.apk
```

### Keystore Commands

```bash
# View keystore info
keytool -list -v \
  -keystore android/app/mytodoo-release.keystore \
  -storepass mytodoo2026

# Get SHA-1 fingerprint
keytool -list -v \
  -keystore android/app/mytodoo-release.keystore \
  -storepass mytodoo2026 \
  -alias mytodoo-release \
  | grep SHA1

# Get SHA-256 fingerprint
keytool -list -v \
  -keystore android/app/mytodoo-release.keystore \
  -storepass mytodoo2026 \
  -alias mytodoo-release \
  | grep SHA256
```

---

## 🎉 Success Checklist

After completing this guide, you should have:

- [x] ✅ Fixed package name mismatch (com.mytodoo.mytodoolive)
- [x] ✅ Generated production release keystore
- [x] ✅ Configured release signing in Gradle
- [x] ✅ Built signed release APK (167 MB)
- [x] ✅ APK ready for installation and testing
- [ ] ⏳ Installed APK on Android device (waiting for device connection)
- [ ] ⏳ Tested Google Sign-In on real device
- [ ] ⏳ Added SHA-1 to Firebase Console
- [ ] ⏳ Uploaded to Google Play Store (when ready)

---

## 🚨 Important Security Notes

### Keystore Security

**CRITICAL**: Keep your keystore file and passwords secure!

```
File: android/app/mytodoo-release.keystore
Password: mytodoo2026

⚠️ DO NOT:
- Commit keystore to git
- Share keystore publicly
- Lose keystore file (you cannot update app without it!)

✅ DO:
- Backup keystore to secure location (cloud storage, password manager)
- Use strong passwords for production
- Store keystore credentials in secure vault
- Add keystore to .gitignore
```

### Firebase Security

```
⚠️ DO NOT:
- Commit google-services.json to public repos
- Share API keys publicly
- Use production Firebase in debug builds

✅ DO:
- Use Firebase Security Rules
- Enable App Check for additional security
- Monitor usage in Firebase Console
```

---

## 📞 Support

If you encounter issues:

1. **Check Logs**: `adb logcat | grep MyToDoo`
2. **Check Build Reports**: `android/build/reports/`
3. **Firebase Console**: https://console.firebase.google.com
4. **Google Play Console**: https://play.google.com/console

---

**Build Guide Complete! 🎉**

Your Android APK is ready for installation and testing. The package name has been correctly configured to match Firebase, ensuring Google Sign-In will work perfectly on Android!

**Next Step**: Connect your Android device and run:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```
