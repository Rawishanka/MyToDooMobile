# iOS TestFlight Deployment Guide - MyToDoo AU

This document explains how we successfully deployed the iOS app to TestFlight.

---

## ✅ COMPLETED STEPS

### Step 1: Fixed Bundle Identifier
**Issue:** Bundle ID mismatch between Xcode project and app configuration.

**What we did:**
- Updated `ios/MyToDoo.xcodeproj/project.pbxproj`:
  - Changed bundle ID from `com.unexo.mytodoomobile` to `com.mytodoo.mytodoolive`
  - Updated both Debug and Release configurations

### Step 2: Updated App Name to "MyToDoo AU"
**What we did:**
- Changed app display name from "MyToDoo" to "MyToDoo AU"
- Files updated:
  - `app.config.ts` - Line 6: `name: 'MyToDoo AU'`
  - `ios/MyToDoo/Info.plist` - Line 12: `<string>MyToDoo AU</string>`

### Step 3: Fixed iPad Launch Screen Error
**Issue:** Upload validation failed - missing launch screen configuration.

**What we did:**
- Updated `ios/MyToDoo/Info.plist`:
  - Replaced empty `UILaunchStoryboardName` with `UILaunchScreen` dictionary
  - Added proper launch screen support for iOS 15.1+

### Step 4: Generated iOS Bundle
**Command executed:**
```bash
npx expo export:embed --platform ios --bundle-output ios/MyToDoo/main.jsbundle --assets-dest ios/MyToDoo --dev false
```

**Result:**
- ✅ Bundled 3696 React Native modules
- ✅ Copied 83 asset files
- ✅ Created `ios/MyToDoo/main.jsbundle`

### Step 5: Built iOS Archive
**Command executed:**
```bash
cd ios
xcodebuild -workspace MyToDoo.xcworkspace -scheme MyToDoo -configuration Release -archivePath ./build/MyToDoo.xcarchive archive CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

**Result:**
- ✅ Archive created: `ios/build/MyToDoo.xcarchive`
- ✅ Bundle ID: `com.mytodoo.mytodoolive`
- ✅ Version: 1.0.0 (Build 2)
- ✅ Architecture: arm64

### Step 6: Created App in App Store Connect
**What we did:**
- Created new app: "MyToDoo Live" (later renamed to "MyToDoo AU")
- Bundle ID: `com.mytodoo.mytodoolive`
- SKU: `com.mytodoo.mytodoolive`
- Platform: iOS
- Primary Language: English (United States)

### Step 7: Uploaded Archive to App Store Connect
**What we did:**
1. Opened archive in Xcode Organizer
2. Clicked "Distribute App"
3. Selected "App Store Connect"
4. Clicked "Upload"
5. ✅ Upload completed successfully (with non-critical Hermes dSYM warning)

**Builds uploaded:**
- Build 1.0.0 (1) - Jan 27, 2026 5:42 AM
- Build 1.0.0 (2) - Jan 27, 2026 10:59 AM ⭐ **LATEST**

### Step 8: Set Up TestFlight Internal Testing
**What we did:**
1. Created internal testing group: "Development Team"
2. Enabled automatic distribution
3. Added testers:
   - `janidupasan2@gmail.com`
   - `info@jendoinnovations.com`
4. ✅ Invitations sent automatically

**Current Status:**
- 📧 Email received: "MyToDoo Live 1.0.0 (2) for iOS is now available to test"
- ✅ Build status: **Ready to Submit**
- ⏳ Expires in 90 days

---

## 📍 CURRENT STATUS (From Screenshots)

### TestFlight Status
- **App Name:** MyToDoo AU
- **Latest Build:** 1.0.0 (2)
- **Status:** ✅ Complete - Ready to test
- **Internal Testers:** 1 invite sent to Development Team group
- **Email Sent:** ✅ "MyToDoo Live 1.0.0 (2) for iOS is now available to test"

### What Happens Next
The TestFlight invitation email has been sent. Testers can now:
1. Install the **TestFlight app** from the App Store (if not already installed)
2. Open the invitation email on their iPhone
3. Tap "View in TestFlight" button
4. Accept the invitation
5. Install "MyToDoo AU" app from TestFlight
6. Start testing!

---

## 🚀 NEXT STEPS - HOW TESTFLIGHT WENT LIVE

### ✅ TestFlight is ALREADY LIVE!
Your app is now available for internal testing. Here's what happened:

#### Automatic Process (Already Done)
1. ✅ Build uploaded to App Store Connect
2. ✅ App Store Connect processed the build (5-10 minutes)
3. ✅ Build appeared in TestFlight section with "Complete" status
4. ✅ Internal testers automatically received invitation emails
5. ✅ TestFlight is now LIVE for internal testing

#### What Testers See
1. Email with subject: "MyToDoo Live 1.0.0 (2) for iOS is now available to test"
2. App icon displayed in email
3. "View in TestFlight" button
4. Requirements: iOS 15.1 or later

---

## 📝 OPTIONAL NEXT STEPS

### Option A: Submit to App Store (Public Release)
If you want to release to the public App Store:

1. **Go to App Store Connect → MyToDoo AU → Distribution**
2. **Fill in required information:**
   - App screenshots (iPhone/iPad)
   - App description
   - Keywords
   - Support URL
   - Privacy Policy URL
   - App category
   - Age rating

3. **Select Build:**
   - Click "+" next to Build
   - Select Build 1.0.0 (2)

4. **Pricing and Availability:**
   - Set price (Free or Paid)
   - Select countries: **Australia only** (as requested)

5. **Submit for Review:**
   - Answer export compliance questions
   - Click "Submit for Review"
   - Wait 24-48 hours for Apple review

### Option B: Add External Testers (TestFlight)
To test with users outside your organization:

1. **Go to TestFlight → External Testing**
2. Click "+" to create external group
3. Add testers (up to 10,000)
4. Submit build for Beta App Review (1-2 days)
5. Once approved, external testers receive invitations

### Option C: Continue Internal Testing
Keep testing with your Development Team:
- Add more internal testers (up to 100)
- Upload new builds with fixes/improvements
- Testers automatically get updates

---

## 🔧 IMPORTANT CONFIGURATION DETAILS

### App Information
- **App Name (App Store):** MyToDoo AU
- **App Display Name (Device):** MyToDoo AU
- **Bundle ID:** com.mytodoo.mytodoolive
- **Version:** 1.0.0
- **Build Number:** 2
- **Developer:** Keerthi Priyankara (Individual Account)

### Technical Details
- **Minimum iOS Version:** 15.1
- **Supported Devices:** iPhone, iPad
- **Architecture:** arm64
- **React Native Version:** 0.81.5
- **Expo SDK:** 54

### API Configuration
- **Backend API:** https://au-live-api.mytodoo.com/api
- **Firebase Project:** mytodoo-e4cdb

---

## ⚠️ NOTES

### Seller Name
- Currently shows: "By Keerthi Priyankara Mahawaththa Kodithuwakkuge"
- **Cannot be changed** with individual Apple Developer account
- To show "By MyToDoo": Need to upgrade to **Apple Developer Organization Account** ($99/year)

### Build Warnings (Non-Critical)
- Hermes dSYM symbols missing (affects crash report detail only)
- App functionality not affected
- Can be fixed later if needed

### TestFlight Expiration
- Each build expires after 90 days
- Upload new build before expiration to continue testing

---

## 📱 HOW TESTERS ACCESS THE APP

### For Development Team Testers:
1. ✅ **Email received** - Check inbox for TestFlight invitation
2. **Install TestFlight** - Download from App Store if needed
3. **Open Email** - Tap "View in TestFlight" button
4. **Accept Invitation** - Tap "Accept" in TestFlight app
5. **Install App** - Tap "Install" button
6. **Start Testing!** - App icon appears on home screen as "MyToDoo AU"

### Testing Instructions for Users:
- Provide feedback through TestFlight app (shake device → Send Feedback)
- Report crashes (automatically collected)
- Test all features thoroughly
- Check that app works on different devices/iOS versions

---

## ✅ DEPLOYMENT CHECKLIST

- [x] Fixed bundle identifier configuration
- [x] Updated app name to "MyToDoo AU"
- [x] Fixed iPad launch screen validation error
- [x] Generated iOS JavaScript bundle
- [x] Built iOS archive (arm64)
- [x] Created app in App Store Connect
- [x] Uploaded archive to App Store Connect
- [x] Set up internal testing group
- [x] Added internal testers
- [x] TestFlight invitations sent
- [x] **TestFlight is LIVE** ✅

---

## 🎯 CONCLUSION

**Your iOS app is now successfully deployed to TestFlight!**

✅ Internal testers can install and test the app  
✅ App is available as "MyToDoo AU"  
✅ No errors or blockers  
✅ Ready for either public release or continued testing  

**Next decision:** Choose Option A (App Store release), Option B (External TestFlight), or Option C (Continue internal testing)
