# How to Run MyToDoo on iOS Simulator

## ✅ CORRECT Way (Development Build)

### Step 1: Start Metro Bundler
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
npx expo start
```

You'll see output like:
```
› Metro waiting on exp://192.168.1.2:8081
› Press i │ open iOS simulator
```

### Step 2: Launch iOS Simulator
**In the Metro terminal, press the `i` key**

This will:
- ✅ Open Xcode Simulator automatically
- ✅ Build and install the app
- ✅ Connect to Metro bundler at the correct URL
- ✅ Load all JavaScript code from Metro
- ✅ Enable Fast Refresh for instant updates

### Step 3: Test Your App
The app will launch with full UI screens showing.

---

## ❌ WRONG Way (What You Were Doing)

**Building directly from Xcode without Metro running:**
- ❌ App can't connect to Metro (localhost:8081 not found)
- ❌ Shows blank white screen
- ❌ "Could not connect to server" errors
- ❌ No Fast Refresh

---

## 🔧 If App Shows Blank Screen

If the app is already running but showing blank screen:

1. **In Simulator:** Press `Cmd + D` (or shake device)
2. Select "Configure Bundler"
3. Change host to: `192.168.1.2:8081`
4. Reload app

OR just kill the app and use Metro to launch (press `i`)

---

## 📱 For Production Build (With Embedded Bundle)

Only use this when deploying to App Store:

```bash
# Create production build
npx expo prebuild --platform ios
cd ios
xcodebuild -workspace MyToDoo.xcworkspace -scheme MyToDoo -configuration Release

# Or use EAS Build
npx eas build --platform ios
```

Production builds embed the JavaScript bundle in the app, so they don't need Metro.

---

## 🎯 Current Setup

- ✅ Metro bundler running on: `exp://192.168.1.2:8081`
- ✅ Firebase configured in AppDelegate.swift
- ✅ Hermes inspector errors fixed
- ✅ All tablet responsive code implemented

**Just press `i` in Metro terminal to launch!**
