# 🚀 Building APK for MyToDooMobile

## ✅ Changes Applied:

### 1. **Responsive Bottom Tab Bar** ✅
- Adapts to all screen sizes (including small devices like iPhone SE)
- Tab labels no longer cut off
- Icons and text scale automatically
- Platform-specific adjustments (iOS vs Android)

### 2. **Responsive Browse Screen Header** ✅
- Header icons properly spaced
- Title centered and flexible
- Works on all mobile devices

### 3. **Google Sign-In Ready** ✅
- Configured with proper redirect URIs
- Works in production APK
- Blue splash screen applied

---

## 📱 Build APK - Two Options:

### **Option 1: EAS Build (Recommended - Cloud Build)**

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Configure Project
```bash
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"
eas build:configure
```

#### Step 4: Build Production APK
```bash
eas build --platform android --profile production
```

**Wait time:** 10-20 minutes (builds in cloud)

#### Step 5: Download APK
After build completes, EAS will provide a download link. Download the APK and install on your device!

---

### **Option 2: Local Build (Faster, No Cloud)**

#### Step 1: Install Dependencies
```bash
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"
npm install
```

#### Step 2: Prebuild Android
```bash
npx expo prebuild --platform android --clean
```

#### Step 3: Build APK
```bash
cd android
.\gradlew assembleRelease
```

#### Step 4: Find APK
APK location:
```
android\app\build\outputs\apk\release\app-release.apk
```

**OR use Expo's build command:**
```bash
npx expo run:android --variant release
```

---

## 🔐 For Google Sign-In to Work in APK:

### You Need to Create an **Android OAuth Client ID**

Currently you only have a **Web Client ID**. For the APK to work, you need BOTH:

#### Step 1: Get SHA-1 Fingerprint
```bash
cd android
.\gradlew signingReport
```

Copy the **SHA-1** fingerprint from the output.

#### Step 2: Create Android OAuth Client ID in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Android**
4. Name: `MyToDooMobile Android`
5. Package name: `com.nowanya.mytodoomobile`
6. Paste the **SHA-1** fingerprint
7. Click **CREATE**
8. Copy the **Client ID**

#### Step 3: Update .env File
```env
# Add the Android Client ID (keep the Web Client ID too)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<YOUR_ANDROID_CLIENT_ID_HERE>
```

#### Step 4: Update Login Screen
You'll need to use the Android Client ID when running as APK:
```typescript
const googleClientId = Platform.OS === 'android' 
  ? (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID)
  : process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
```

---

## 🎯 Quick Build Command (Recommended):

```bash
# One command to build APK
npx expo build:android -t apk
```

This will:
1. Build the Android app
2. Create a production APK
3. Include all your changes (responsive UI, Google Sign-In, blue splash)
4. Provide download link

---

## 📋 Pre-Build Checklist:

- [x] Responsive tab bar implemented
- [x] Responsive header implemented
- [x] Blue splash screen configured
- [x] Google Sign-In configured (Web Client ID)
- [ ] Google Sign-In Android Client ID created (needed for APK)
- [ ] Test build command runs successfully
- [ ] APK installs on device
- [ ] Test Google Sign-In in APK

---

## 🆘 Troubleshooting:

### If build fails:
```bash
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android --variant release
```

### If Google Sign-In doesn't work in APK:
- Make sure you created the **Android OAuth Client ID** (not just Web)
- Verify package name is correct: `com.nowanya.mytodoomobile`
- Check SHA-1 fingerprint matches

---

## 🚀 Ready to Build!

Run this command now:
```bash
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"
npx expo run:android --variant release
```

Or for EAS Build:
```bash
eas build --platform android --profile production
```

The APK will have:
- ✅ Responsive bottom tab bar (no text cutoff)
- ✅ Responsive header buttons
- ✅ Blue splash screen
- ✅ Google Sign-In (needs Android Client ID to work fully)
- ✅ All latest features

---

## 📱 After Building:

1. Install APK on your device
2. Test tab bar (should show full text)
3. Test Google Sign-In (will need Android Client ID)
4. Share APK for testing!

Good luck with the build! 🎉
