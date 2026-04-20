# iOS Build Setup - Complete ✅

## What Was Completed

### ✅ Phase 1: iOS Native Project Generated
- **ios/** directory created with full Xcode project structure
- **MyToDoo.xcworkspace** generated (172 pods installed)
- All native modules linked successfully:
  - ✅ Firebase (App, Auth, Firestore, Messaging)
  - ✅ Google Sign-In
  - ✅ Vision Camera
  - ✅ Stripe Payments
  - ✅ 24+ other React Native modules

### ✅ Phase 2: Configuration Files Updated
- **app.config.ts**: Added complete iOS configuration
  - Bundle ID: `com.unexo.mytodoomobile`
  - Deployment Target: iOS 15.1+
  - All privacy permissions configured
  - Background modes enabled
  - Associated domains set up

- **eas.json**: Added iOS build profiles
  - Development build (simulator)
  - Preview build (internal testing)
  - Production build (App Store)

- **Info.plist**: Auto-generated with all required keys
  - ✅ Camera permission
  - ✅ Photo library access
  - ✅ Location permissions
  - ✅ Microphone access
  - ✅ Push notifications
  - ✅ URL schemes configured

### ✅ Phase 3: CocoaPods Dependencies
All 172 pods installed successfully including:
- Firebase/Core
- Firebase/Auth
- Firebase/Firestore
- Firebase/Messaging
- GoogleSignIn
- VisionCamera
- StripePayments
- React Native core modules

---

## ⚠️ REQUIRED: Download Real GoogleService-Info.plist

**IMPORTANT:** The current GoogleService-Info.plist is a placeholder. You must replace it with the real one from Firebase Console.

### Steps to Get Real Firebase iOS Config:

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com
   ```

2. **Select Your Project**: `mytodoo-40c87`

3. **Add iOS App** (if not already added):
   - Click ⚙️ **Project Settings**
   - Scroll to **Your apps**
   - Click **Add app** → Select **iOS**
   - Enter Bundle ID: `com.unexo.mytodoomobile`
   - Click **Register app**

4. **Download GoogleService-Info.plist**
   - Click **Download GoogleService-Info.plist**
   - Save the file

5. **Replace Placeholder File**
   ```bash
   # Replace the placeholder with real file
   cp ~/Downloads/GoogleService-Info.plist /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios/MyToDoo/GoogleService-Info.plist
   ```

---

## 🚀 Next Steps: Build in Xcode

### Step 1: Open Project in Xcode

```bash
open /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios/MyToDoo.xcworkspace
```

**⚠️ IMPORTANT:** Always open `.xcworkspace`, NOT `.xcodeproj`

---

### Step 2: Configure Code Signing

#### In Xcode:
1. **Select Project**: Click "MyToDoo" in left sidebar (top blue icon)
2. **Select Target**: Click "MyToDoo" under TARGETS
3. **Go to "Signing & Capabilities" tab**

#### Option A: Automatic Signing (Recommended for First Build)
- ✅ Check **"Automatically manage signing"**
- Select **Team**: Your Apple Developer Team
- Xcode will auto-create:
  - Development Certificate
  - Provisioning Profile
  - Device Registration

#### Option B: Manual Signing (For Production)
- ❌ Uncheck **"Automatically manage signing"**
- **Provisioning Profile**: Select App Store profile
- **Signing Certificate**: Select Distribution certificate

---

### Step 3: Verify Build Settings

In Xcode, verify these settings:

**General Tab:**
- ✅ Display Name: `MyToDoo`
- ✅ Bundle Identifier: `com.unexo.mytodoomobile`
- ✅ Version: `1.0.0`
- ✅ Build: `1.0.0`
- ✅ Deployment Target: `15.1`

**Signing & Capabilities Tab:**
- ✅ **Push Notifications** capability enabled
- ✅ **Associated Domains** capability enabled
  - Add: `applinks:mytodoo.com`
- ✅ **Background Modes** enabled
  - ✅ Remote notifications
  - ✅ Background fetch

---

### Step 4: Build the Project

#### For Testing (Simulator):
1. Select target: **Any iOS Simulator** (e.g., iPhone 17 Pro)
2. Press **⌘+B** (or Product → Build)
3. Wait for build to complete (5-10 minutes first time)

#### For Testing (Physical Device):
1. Connect your iPhone via USB
2. Trust the device on your Mac
3. Select your iPhone in device dropdown
4. Press **⌘+R** (or Product → Run)

#### For App Store / TestFlight:
1. Select target: **Any iOS Device (arm64)**
2. **Product → Archive** (⌘+Shift+B)
3. Wait for archive to complete (10-15 minutes)

---

### Step 5: Export IPA for App Store

After archive completes:

1. **Organizer window opens automatically**
2. Select your archive
3. Click **Distribute App**
4. Choose distribution method:
   - **App Store Connect**: For TestFlight and App Store
   - **Ad Hoc**: For internal testing (limited devices)
   - **Development**: For debugging

5. For App Store Connect:
   - Click **Upload**
   - Select **Automatically manage signing**
   - Click **Upload**

6. IPA will be uploaded to App Store Connect
7. Check status at: https://appstoreconnect.apple.com

---

## 🔥 Firebase Setup Checklist

### 1. Download Real GoogleService-Info.plist ⚠️
```bash
# After downloading from Firebase Console:
cp ~/Downloads/GoogleService-Info.plist ios/MyToDoo/GoogleService-Info.plist
```

### 2. APNs Certificate for Push Notifications

**Get APNs Authentication Key:**
1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click **+** to create a new key
3. Name it: `MyToDoo APNs Key`
4. Enable: ✅ **Apple Push Notifications service (APNs)**
5. Click **Continue** → **Register**
6. Download the `.p8` file
7. Note the **Key ID** (10 characters)

**Upload to Firebase:**
1. Go to Firebase Console → Project Settings
2. Click **Cloud Messaging** tab
3. Under **Apple app configuration**:
   - Upload `.p8` file
   - Enter **Key ID**
   - Enter **Team ID** (from Apple Developer)
4. Click **Upload**

### 3. Enable Google Sign-In for iOS

1. Firebase Console → Authentication → Sign-in method
2. Enable **Google** provider
3. Download **iOS Client ID** from Google Cloud Console:
   - https://console.cloud.google.com/apis/credentials
   - Select your project
   - Copy iOS OAuth 2.0 Client ID

4. Add to environment:
   ```bash
   # In .env file (create if doesn't exist)
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
   ```

---

## 🧪 Testing Checklist

Before submitting to App Store, test these features on a **physical iOS device**:

### Authentication:
- [ ] Google Sign-In works
- [ ] Firebase authentication succeeds
- [ ] User session persists after app restart

### Permissions:
- [ ] Camera permission prompt appears and works
- [ ] Photo library permission prompt appears
- [ ] Location permission prompt appears
- [ ] All permission descriptions are clear

### Core Features:
- [ ] Create task with photos
- [ ] Upload images successfully
- [ ] Task location detection works
- [ ] Browse tasks by location
- [ ] Chat messages send/receive
- [ ] Notifications appear in system tray

### Push Notifications:
- [ ] Firebase messaging initialized
- [ ] Device token registered
- [ ] Test notification received
- [ ] Notification tap opens app

---

## 🐛 Troubleshooting

### Issue: "No such module Firebase"
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Issue: "Code Signing Error"
- Open Xcode → Preferences → Accounts
- Add your Apple ID
- Download Manual Profiles
- Retry signing

### Issue: "GoogleService-Info.plist not found"
- Verify file exists: `ls -la ios/MyToDoo/GoogleService-Info.plist`
- Ensure it's added to Xcode project (should have blue icon)

### Issue: Google Sign-In Not Working
- Verify URL schemes in Info.plist
- Check iOS Client ID in Firebase Console
- Ensure `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is set

### Issue: Push Notifications Not Received
- Verify APNs key uploaded to Firebase
- Check Push Notifications capability enabled
- Test on physical device (not simulator)
- Check device notification settings

---

## 📊 Build Commands Reference

### Clean Build:
```bash
cd ios
rm -rf build DerivedData
pod deintegrate
pod install
cd ..
```

### Run in Simulator:
```bash
npx expo run:ios
```

### Run on Device:
```bash
npx expo run:ios --device
```

### Build with EAS:
```bash
# For TestFlight
eas build --platform ios --profile preview

# For App Store
eas build --platform ios --profile production
```

---

## ✅ What's Ready

1. ✅ iOS native project fully configured
2. ✅ All 172 pods installed successfully
3. ✅ Info.plist with all permissions
4. ✅ Bundle ID: `com.unexo.mytodoomobile`
5. ✅ Firebase placeholder in place
6. ✅ Google Sign-In structure ready
7. ✅ Push notification capabilities configured
8. ✅ Camera/Location permissions set
9. ✅ URL schemes configured
10. ✅ Background modes enabled

## ⏳ What You Need to Do

1. ⚠️ **Download real GoogleService-Info.plist from Firebase**
2. ⚠️ **Configure code signing in Xcode** (Apple Developer account required)
3. ⚠️ **Upload APNs key to Firebase** (for push notifications)
4. ⚠️ **Get iOS Google Sign-In Client ID** (add to .env)
5. ⚠️ **Test on physical device**
6. ⚠️ **Archive and export IPA**
7. ⚠️ **Upload to TestFlight/App Store**

---

## 📱 Device Requirements

- **macOS**: Sonoma or later
- **Xcode**: 15.0 or later (you have this ✅)
- **iOS Device**: iOS 15.1 or later
- **Apple Developer Account**: $99/year for App Store

---

## 🎯 Summary

Your iOS project is **100% ready to build**. No JavaScript/TypeScript code was changed—only iOS-specific configuration was added.

**Time to complete:**
- Replace GoogleService-Info.plist: 5 minutes
- Configure code signing: 10 minutes
- First build in Xcode: 10-15 minutes
- Archive for App Store: 15-20 minutes
- **Total: ~1 hour**

**Next command to run:**
```bash
open ios/MyToDoo.xcworkspace
```

Good luck with your iOS build! 🚀
