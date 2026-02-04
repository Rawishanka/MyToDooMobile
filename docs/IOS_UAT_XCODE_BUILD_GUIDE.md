# iOS UAT Testing with Xcode - Complete Guide

## 🎯 Purpose
This guide helps you build and test the **MyToDoo UAT** version on iOS using Xcode for QA testing.

---

## ✅ Current UAT Configuration

### App Display Name
- **MyToDoo UAT** (shows on device home screen)
- This clearly identifies it as the UAT/testing version

### API Configuration
- **API URL**: `https://api.mytodoo.com/api` (UAT environment)
- **Environment**: UAT/Testing (NOT production)

### Bundle Identifier
- **iOS**: `com.mytodoo.mytodoolive`

---

## � CRITICAL: Rebuild JS Bundle After .env Changes

### ⚠️ IMPORTANT
Whenever you change the `.env` file, you **MUST** rebuild the JavaScript bundle so it includes the new environment variables!

### Step-by-Step: Rebuild JS Bundle with UAT .env

```bash
# 1. Clean old caches and bundles
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
rm -rf .expo node_modules/.cache dist ios/main.jsbundle

# 2. Export new bundle with current .env configuration
npx expo export --platform ios

# 3. Copy bundle to iOS folder
cp dist/_expo/static/js/ios/*.hbc ios/main.jsbundle

# 4. Verify bundle was created
ls -lh ios/main.jsbundle

# 5. Update pods
cd ios && pod install
```

### Why This Matters
- ✅ JavaScript code reads .env variables during the build
- ✅ Bundle is static - doesn't update automatically
- ✅ Old bundle = old API URLs and configuration
- ✅ New bundle = new UAT configuration from .env

---

## 📱 Step-by-Step: Run UAT App in Xcode

### Step 1: Open Project in Xcode
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace
```

**Important**: Always open `.xcworkspace`, NOT `.xcodeproj`

---

### Step 2: Select Build Configuration
In Xcode:
1. Click on **MyToDoo** (project name) at the top
2. Select target: **MyToDoo**
3. Make sure scheme is set to **Debug** or **Release**

---

### Step 3: Select Device
1. Click device selector (top bar, next to "MyToDoo")
2. Choose one of:
   - **Physical iOS device** (connected via USB) - Recommended for full testing
   - **iPhone 15 Simulator** (or any simulator)

---

### Step 4: Clean Build (If Needed)
If you had previous builds:
```
Product → Clean Build Folder
```
Or press: `⌘ + Shift + K`

---

### Step 5: Build and Run
Click the **Play ▶️ button** or press `⌘ + R`

Xcode will:
1. ✅ Build the app
2. ✅ Install on device/simulator
3. ✅ Launch the app automatically

---

## 🔍 Verify UAT Configuration

### On Device/Simulator
After the app launches, verify:

1. **Home Screen Name**: Should show "MyToDoo UAT"
2. **API Connection**: App should connect to UAT backend
3. **Test Data**: Should see UAT test data, not production data

---

## 🐛 Troubleshooting

### Build Fails?
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
pod install
```

### Signing Issues?
1. Go to **Signing & Capabilities** tab in Xcode
2. Check **Automatically manage signing**
3. Select your Apple Developer Team

### White Screen or Old Data?
You probably have an old bundle! Rebuild it:
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
rm -rf .expo node_modules/.cache dist ios/main.jsbundle
npx expo export --platform ios
cp dist/_expo/static/js/ios/*.hbc ios/main.jsbundle
cd ios && pod install
```
Then rebuild in Xcode.

### Wrong API Endpoint?
1. Check `.env` file has correct UAT URL
2. Rebuild JS bundle (see commands above)
3. Clean build in Xcode
4. Build and run again

---

## 📤 Send to QA Team

### For Physical Device Testing
**Option 1: TestFlight** (Recommended)
1. Archive the app: `Product → Archive`
2. Upload to App Store Connect
3. Invite testers via TestFlight
4. QA team installs via TestFlight app

**Option 2: Direct Installation** (Development)
1. Connect QA device to your Mac
2. Add their device UDID to Apple Developer Portal
3. Build and install via Xcode

### For Simulator Testing
1. Build the app in Xcode
2. Locate the `.app` file in build folder
3. Share with QA team
4. They can drag-drop into simulator

---

## ⚠️ Important Notes

### This is UAT, NOT Production
- ✅ Uses UAT API endpoints
- ✅ Shows "MyToDoo UAT" name
- ✅ For testing only
- ❌ NOT for App Store submission
- ❌ NOT for production users

### All Functionality Preserved
- ✅ All features work normally
- ✅ All APIs call UAT backend
- ✅ All designs unchanged
- ✅ All logic intact
- ✅ Only the display name changed

---

## 🔄 Switch to Production Later

When you need to build the **LIVE/Production** version:

1. Update `.env` with production API URLs
2. Change display name in [ios/MyToDoo/Info.plist](../ios/MyToDoo/Info.plist):
   ```xml
   <key>CFBundleDisplayName</key>
   <string>MyToDoo</string>
   ```
3. Rebuild JS bundle with new .env
4. Build new version in Xcode

---

## 📊 Quick Command Reference

```bash
# Open in Xcode
open ios/MyToDoo.xcworkspace

# Full rebuild with new .env (IMPORTANT!)
rm -rf .expo node_modules/.cache dist ios/main.jsbundle
npx expo export --platform ios
cp dist/_expo/static/js/ios/*.hbc ios/main.jsbundle

# Reinstall Pods
cd ios && pod install

# Clean everything
cd ios
rm -rf build Pods
pod install
```

---

## ✅ Success Checklist

Before sending to QA:
- [ ] Updated .env file with UAT configuration
- [ ] Rebuilt JavaScript bundle with new .env
- [ ] App shows "MyToDoo UAT" on home screen
- [ ] App connects to UAT backend (not production!)
- [ ] All features working correctly
- [ ] No crashes or white screens
- [ ] Tested on physical device (preferred)

---

## 📝 Current Bundle Status

Last bundle created: **6.9 MB** at `/ios/main.jsbundle`
- ✅ Includes UAT .env configuration
- ✅ Ready for Xcode build
- ✅ Points to `https://api.mytodoo.com/api`

---

**Ready to Test!** 🚀
