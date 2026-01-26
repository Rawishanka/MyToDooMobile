# 🍎 iOS Build & Test Distribution Guide (Without App Store)

## Overview

Just like you built Android APK and sent it to testers, you can do the same with iOS! Here are your options:

---

## 🎯 **Option 1: Ad Hoc Distribution (RECOMMENDED - Like Android APK)**

This is the **closest** to Android APK distribution. Build an IPA file and share it directly with testers.

### ✅ Advantages:
- Share IPA file directly (via email, AirDrop, cloud storage)
- Up to 100 test devices
- No App Store review needed
- Builds never expire (unlike TestFlight's 90-day limit)
- Later submit same build to App Store

### ❌ Requirements:
- Apple Developer Account ($99/year)
- Register each tester's device UDID in Apple Developer Portal
- Testers install via link or iTunes/Apple Configurator

---

### **Step-by-Step: Ad Hoc Distribution**

#### **1. Get Tester Device UDIDs**

Ask your testers to:
```
Settings → General → About → scroll to "Serial Number"
Tap "Serial Number" to reveal UDID
```

Or use this method:
- Tester goes to https://www.udid.io on their iPhone
- Tap "Tap To Find Your UDID"
- Install profile → get UDID
- Send UDID to you

#### **2. Register Devices in Apple Developer Portal**

```bash
# Go to Apple Developer Portal
https://developer.apple.com/account/resources/devices/list
```

1. Click **"Devices"** → **"+"**
2. Select **"iOS, tvOS, watchOS"**
3. Enter:
   - **Device Name**: Tester's name (e.g., "John's iPhone 14")
   - **Device ID (UDID)**: Paste the UDID
4. Click **"Continue"** → **"Register"**

Repeat for each tester device (up to 100 devices).

#### **3. Create Ad Hoc Provisioning Profile**

```bash
# Go to Profiles
https://developer.apple.com/account/resources/profiles/list
```

1. Click **"+"** to create new profile
2. Select **"Ad Hoc"** → **"Continue"**
3. Select your App ID: **"com.unexo.mytodoomobile"**
4. Select your **Distribution Certificate**
5. **Select Devices**: Choose all registered test devices
6. Profile Name: **"MyToDoo Ad Hoc"**
7. Click **"Generate"** → **"Download"**

#### **4. Build IPA with Xcode**

```bash
# Open Xcode workspace
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace
```

**In Xcode:**

1. **Select Target Device**:
   - Top toolbar: Click device selector
   - Select **"Any iOS Device (arm64)"**

2. **Set Build Configuration**:
   - Menu: **Product** → **Scheme** → **Edit Scheme**
   - Build Configuration: **"Release"**
   - Click **"Close"**

3. **Archive the App**:
   - Menu: **Product** → **"Archive"**
   - Wait for build to complete (5-10 minutes)
   - Organizer window opens automatically

4. **Export IPA**:
   - In Organizer, select your archive
   - Click **"Distribute App"**
   - Select **"Ad Hoc"** → **"Next"**
   - Distribution options: Keep defaults → **"Next"**
   - Re-sign: **"Automatically manage signing"** → **"Next"**
   - Select **"Export"** 
   - Choose save location (e.g., Desktop/MyToDoo-AdHoc)
   - Click **"Export"**

**Result**: `MyToDoo.ipa` file ready to distribute!

#### **5. Distribute IPA to Testers**

**Option A: Using Install Link (Easiest)**
1. Upload IPA + manifest.plist to your web server
2. Create install page with `itms-services://` link
3. Testers open link in Safari → Install

**Option B: Using Third-Party Service (Recommended)**
- **TestApp.io**: https://testapp.io (free for small teams)
- **Diawi**: https://www.diawi.com (free, drag & drop IPA)
- **InstallOnAir**: https://www.installonair.com

Upload IPA → Get share link → Send to testers

**Option C: Using Apple Configurator (Wired Connection)**
1. Connect tester's iPhone via USB
2. Open **Apple Configurator 2** (download from Mac App Store)
3. Select device → **Add** → **Apps** → Choose `.ipa` file
4. App installs directly

**Option D: Email/AirDrop (Not Recommended)**
- IPA files are large (50-200MB)
- Testers need to use iTunes or third-party tools to install

---

## 🧪 **Option 2: TestFlight Distribution (Apple's Official)**

Like Google Play Internal Testing for Android.

### ✅ Advantages:
- No device UDID registration needed
- Testers use official **TestFlight app**
- Up to 10,000 testers
- Easy to manage builds & testers
- Apple-hosted (no need for your own server)

### ❌ Disadvantages:
- Requires Apple Developer Account ($99/year)
- First upload requires **App Store Connect** setup
- Builds expire after **90 days**
- **Basic review** by Apple (1-2 days) before testers can access

---

### **Step-by-Step: TestFlight**

#### **1. Set Up App in App Store Connect**

```bash
# Go to App Store Connect
https://appstoreconnect.apple.com
```

1. Click **"My Apps"** → **"+"** → **"New App"**
2. Fill in:
   - **Platform**: iOS
   - **Name**: MyToDoo
   - **Primary Language**: English
   - **Bundle ID**: com.unexo.mytodoomobile
   - **SKU**: mytodoo-mobile-001 (any unique ID)
   - **User Access**: Full Access
3. Click **"Create"**

#### **2. Build & Upload with EAS**

```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile

# Login to Expo
npx eas login

# Build for TestFlight (production profile)
npx eas build --platform ios --profile production

# Wait for build to complete (15-30 minutes)
# EAS automatically uploads to App Store Connect
```

**Or upload manually via Xcode:**
1. Archive app (Product → Archive)
2. In Organizer: **"Distribute App"** → **"TestFlight & App Store"**
3. Upload to Apple → Wait for processing (10-30 minutes)

#### **3. Add Testers in App Store Connect**

```bash
https://appstoreconnect.apple.com/apps → Select MyToDoo → TestFlight
```

1. Click **"Internal Testing"** or **"External Testing"**
2. Click **"+"** next to "Testers"
3. Enter tester emails
4. Click **"Add"**
5. Testers receive email invitation

#### **4. Testers Install TestFlight App**

Testers:
1. Download **TestFlight** from App Store
2. Open email invitation → Click **"View in TestFlight"**
3. Install MyToDoo app
4. Open and test!

#### **5. Upload New Builds**

Every time you fix bugs or add features:
```bash
npx eas build --platform ios --profile production
```

Testers get automatic update notification in TestFlight app.

---

## 🛠️ **Option 3: Development Build (Quick Local Testing)**

Fast for quick testing, but limited to developers.

### ✅ Advantages:
- Fastest build method
- No App Store Connect setup
- Test on physical devices & simulators

### ❌ Disadvantages:
- Requires Xcode on Mac
- Each tester device must be registered
- Must reinstall when certificate expires
- Not suitable for external testers

---

### **Step-by-Step: Development Build**

#### **1. Build & Run on Your iPhone**

```bash
# Open Xcode
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace
```

1. Connect your iPhone via USB
2. Select your iPhone from device selector (top toolbar)
3. Click **"Run"** button (▶️) or press `Cmd + R`
4. App installs and launches on your iPhone

#### **2. Test on Simulator**

```bash
# In Xcode, select any simulator from device selector
# Examples: iPhone 15 Pro, iPhone 14, iPad Pro
# Click "Run" (▶️)
```

#### **3. Export Development IPA**

1. Select **"Any iOS Device"** from device selector
2. Menu: **Product** → **Archive**
3. In Organizer: **"Distribute App"** → **"Development"**
4. Export IPA
5. Share with registered developers only

---

## 📊 **Comparison Table**

| Feature | Ad Hoc | TestFlight | Development |
|---------|--------|-----------|-------------|
| **Apple Dev Account** | Required ($99/year) | Required ($99/year) | Optional (free) |
| **Max Testers** | 100 devices | 10,000 users | Unlimited (but must register devices) |
| **Build Expiration** | Never | 90 days | When cert expires (~1 year) |
| **Setup Difficulty** | Medium | Easy | Very Easy |
| **Distribution Method** | IPA file share | TestFlight app | USB or IPA |
| **Apple Review** | None | Basic (1-2 days) | None |
| **Best For** | External testers (like Android APK) | Large beta testing | Quick dev testing |
| **Later Submit to App Store?** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🎯 **RECOMMENDED APPROACH FOR YOUR CASE**

Based on your Android APK experience, here's what I recommend:

### **Phase 1: Local Testing (Now)**
**Use Development Build** to test on your own devices:
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace
# Connect iPhone → Run
```

### **Phase 2: Beta Testing (Before App Store)**
**Use TestFlight** - easiest for multiple testers:
```bash
# Build and upload to TestFlight
npx eas build --platform ios --profile production

# Add testers in App Store Connect
# Testers download via TestFlight app
```

### **Phase 3: App Store Release**
**Submit same TestFlight build to App Store**:
```bash
# In App Store Connect:
# MyToDoo → App Store → + Version or Platform → iOS
# Select build from TestFlight → Submit for Review
```

---

## 🚀 **Quick Start: Run Locally NOW**

Let's start with the simplest approach:

### **1. First-Time Xcode Setup**

```bash
# Navigate to project
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile

# Install iOS dependencies (if not done)
npx expo prebuild --platform ios

# Open in Xcode
open ios/MyToDoo.xcworkspace
```

### **2. Configure Signing**

In Xcode:
1. Click **"MyToDoo"** project (blue icon at top-left)
2. Select **"MyToDoo"** target (under TARGETS)
3. Click **"Signing & Capabilities"** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple Developer account)

### **3. Select Device & Run**

**Option A: Run on Simulator** (no Apple account needed)
1. Click device selector → Select **"iPhone 15 Pro"** (or any simulator)
2. Click **Run** button (▶️)
3. Simulator launches with your app

**Option B: Run on Your iPhone**
1. Connect iPhone via USB cable
2. Trust computer (iPhone: Settings → General → Device Management)
3. Select your iPhone from device selector
4. Click **Run** button (▶️)
5. App installs on your iPhone

### **4. If You Get Signing Error**

```
"Signing for "MyToDoo" requires a development team. Select a development team in the Signing & Capabilities editor."
```

**Free Apple ID (for testing only):**
1. In Xcode: **Preferences** → **Accounts** → **"+"**
2. Sign in with your Apple ID (any @icloud.com or @gmail.com)
3. Go back to Signing & Capabilities
4. Select your personal team

**Paid Apple Developer Account (for distribution):**
1. Sign up: https://developer.apple.com/programs/enroll/
2. Pay $99/year
3. Wait for approval (1-2 days)
4. Add account in Xcode Preferences

---

## 📝 **FAQs**

### **Q: Can I send IPA to another user like I did with APK?**
**A:** Yes! Use:
- **Ad Hoc distribution** (up to 100 devices, requires UDID registration)
- **TestFlight** (up to 10,000 users, no UDID needed)
- Third-party services like **Diawi** or **TestApp.io**

### **Q: Do testers need Xcode or Mac?**
**A:** No! Testers only need:
- **TestFlight app** (for TestFlight distribution)
- **Safari browser** (for Ad Hoc install links)
- **USB + Apple Configurator** (for wired installation)

### **Q: Can I test without paying $99/year?**
**A:** Yes, for **your own devices only**:
- Use free Apple ID
- Install via Xcode
- App expires every 7 days (must reinstall)

For **external testers**: Need Apple Developer account ($99/year)

### **Q: Will this IPA work on App Store later?**
**A:** Yes! Same codebase:
- Build Ad Hoc or TestFlight version for testing
- When ready, submit to App Store for review
- No code changes needed

### **Q: How long does App Store review take?**
**A:** 
- **TestFlight**: 1-2 days (basic review)
- **App Store**: 1-7 days (full review)

### **Q: Can I skip TestFlight and go straight to App Store?**
**A:** Yes, but **not recommended**. TestFlight is free and helps you:
- Find bugs before public release
- Get user feedback
- Test with real users
- Iterate quickly

---

## ✅ **Next Steps for You**

### **Today: Run Locally**
```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace
# Run on simulator or your iPhone
```

### **This Week: Set Up TestFlight**
1. Sign up for Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Build & upload with EAS:
   ```bash
   npx eas build --platform ios --profile production
   ```

### **Before Public Release: Beta Test**
1. Add 5-10 testers in TestFlight
2. Collect feedback
3. Fix bugs
4. Release updates

### **When Ready: Submit to App Store**
1. Take screenshots (6.7", 6.5", 5.5" displays)
2. Write app description
3. Fill in App Store details
4. Submit for review
5. Wait 1-7 days for approval
6. Release to public! 🎉

---

## 🆘 **Need Help?**

**Xcode Issues:**
- Check you're opening `.xcworkspace` not `.xcodeproj`
- Clean build: `Cmd + Shift + K`
- Reset simulators: `xcrun simctl erase all`

**Signing Issues:**
- Use automatic signing (easiest)
- Make sure Bundle ID matches: `com.unexo.mytodoomobile`
- Check Apple Developer account is active

**Build Issues:**
- Update CocoaPods: `cd ios && pod install`
- Check Xcode version (needs 15.0+)
- Clean derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

---

## 📚 **Useful Links**

- **TestFlight Guide**: https://developer.apple.com/testflight/
- **Ad Hoc Distribution**: https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer Portal**: https://developer.apple.com/account
- **Diawi (IPA Sharing)**: https://www.diawi.com
- **TestApp.io**: https://testapp.io

---

**Ready to build? Start with running locally in Xcode, then move to TestFlight for beta testing!** 🚀
