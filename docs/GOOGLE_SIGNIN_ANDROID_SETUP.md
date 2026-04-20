# Google Sign-In Setup Complete - Testing Guide

## ✅ Configuration Complete

### Files Updated:
1. **android/app/google-services.json** - Updated with new OAuth clients
2. **.env** - Updated with Web Client ID: `697863453994-r06h8627i1m4v66vv84113scanvpg1pv.apps.googleusercontent.com`

### Google Services Configuration:
- **Project ID**: mytodoo-40c87
- **Project Number**: 697863453994
- **Package Name**: com.unexo.mytodoomobile
- **API Key**: AIzaSyAnBkhj8hEx7paalRvbzGaszj6gCxGECso

### OAuth Clients Configured:
1. **Android Client (SHA-1: 5e8f1606...)**: For release/debug builds
2. **Android Client (SHA-1: 32ed6bd3...)**: For additional certificate
3. **Web Client**: For Google Sign-In SDK

---

## 📱 How to Run on Your Android Phone

### Prerequisites:
1. Enable Developer Options on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. Connect your phone via USB cable

3. Verify connection:
   ```powershell
   adb devices
   ```
   You should see your device listed

---

## 🚀 Running the App

### Option 1: Using Expo Development Build (Recommended)

1. **Start the development server:**
   ```powershell
   npx expo start --clear
   ```

2. **Run on Android device:**
   - Press `a` in the terminal, OR
   - Run: `npx expo run:android`

3. The app will be installed on your connected phone

---

### Option 2: Build APK for Testing

1. **Create a development build:**
   ```powershell
   eas build --profile development --platform android --local
   ```

2. **Or create a preview build:**
   ```powershell
   eas build --profile preview --platform android
   ```

3. **Install on your phone:**
   ```powershell
   adb install path/to/your-app.apk
   ```

---

## 🧪 Testing Google Sign-In

### What to Test:
1. **Open the app** on your phone
2. **Navigate to Login/Signup screen**
3. **Tap "Sign in with Google" button**
4. **Google account picker should appear**
5. **Select your Google account**
6. **Grant permissions**
7. **You should be signed in successfully**

### Expected Behavior:
- ✅ Google Sign-In dialog opens
- ✅ Can select Google account
- ✅ Permissions screen appears
- ✅ Successfully authenticates
- ✅ Redirects to main app screen
- ✅ User data is saved

### If Google Sign-In Doesn't Work:

1. **Check SHA-1 Certificate:**
   ```powershell
   cd android
   ./gradlew signingReport
   ```
   - Compare the SHA-1 with the ones in google-services.json
   - If different, add the new SHA-1 to Firebase Console

2. **Verify Google Play Services:**
   - Ensure Google Play Services is installed on your phone
   - Update to the latest version

3. **Check Logs:**
   ```powershell
   npx expo start
   # In another terminal
   adb logcat | Select-String -Pattern "GoogleSignIn|Firebase"
   ```

4. **Clear App Data:**
   - Settings > Apps > MyToDoo > Storage > Clear Data
   - Reinstall the app

---

## 🔑 Key Points

### Certificate Hashes in google-services.json:
- **5e8f16062ea3cd2c4a0d547876baa6f38cabf625** - First certificate
- **32ed6bd380bf18c52a2b136d793f1682697b2c2c** - Second certificate

These must match your signing certificates. If you get authentication errors, you may need to add your debug keystore's SHA-1 to Firebase Console.

### To Get Your Debug SHA-1:
```powershell
cd android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Then add this SHA-1 to Firebase Console:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select mytodoo-40c87 project
3. Go to Project Settings
4. Under "Your apps" > Android app
5. Click "Add fingerprint"
6. Paste your SHA-1

---

## 📋 Quick Commands

```powershell
# Check connected devices
adb devices

# Start Expo dev server
npx expo start --clear

# Run on Android
npx expo run:android

# View logs
adb logcat | Select-String -Pattern "MyToDoo|GoogleSignIn"

# Clear app data
adb shell pm clear com.unexo.mytodoomobile

# Uninstall app
adb uninstall com.unexo.mytodoomobile

# Install APK
adb install -r path/to/app.apk
```

---

## ✅ Configuration Status

- [x] google-services.json updated with OAuth clients
- [x] Google Client ID configured in .env
- [x] Google Services plugin applied in build.gradle
- [x] Package name matches: com.unexo.mytodoomobile
- [x] API key configured
- [x] Firebase project linked

---

## 🎯 Next Steps

1. Connect your phone via USB
2. Run `adb devices` to verify connection
3. Run `npx expo start --clear`
4. Press `a` to run on Android
5. Test Google Sign-In on your phone

The app should now properly connect to Google Sign-In services! 🎉
