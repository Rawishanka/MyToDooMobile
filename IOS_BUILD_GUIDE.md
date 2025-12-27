# 🍎 MyToDoo Mobile - iOS Build Guide

## 📱 IMPORTANT: You DON'T Need Swift!

**Your React Native app ALREADY supports iOS!** You don't need to:
- ❌ Create a separate Swift project
- ❌ Rewrite everything from scratch  
- ❌ Create a new repository
- ❌ Learn Swift (unless you want to add native modules)

**React Native is cross-platform** - the SAME codebase works for both Android AND iOS!

---

## ✅ What We've Done

### 1. **iOS Configuration Added** (`app.config.ts`)
- ✅ Bundle identifier: `com.unexo.mytodoomobile`
- ✅ iOS permissions (Camera, Location, Photos, Microphone, etc.)
- ✅ Background modes (Location, Remote notifications)
- ✅ Deep linking support (Universal Links)
- ✅ Google Sign-In configuration
- ✅ Network security settings
- ✅ iPad support enabled

### 2. **Build Configuration Updated** (`eas.json`)
- ✅ iOS preview build (Simulator)
- ✅ iOS production build (App Store)
- ✅ Same API URL as Android
- ✅ Auto-increment versioning

### 3. **Keyboard Issues Fixed**
- ✅ `help-support.tsx` - Added KeyboardAvoidingView
- ✅ `faq.tsx` - Added KeyboardAvoidingView
- ✅ `public-questions.tsx` - Added KeyboardAvoidingView
- ✅ All screens now handle keyboard properly on iOS and Android

---

## 🚀 Building for iOS - Step by Step

### **Prerequisites**

1. **MacBook with macOS** (Required for iOS development)
2. **Xcode** installed (from Mac App Store - it's free)
3. **Apple Developer Account** ($99/year for App Store)
4. **Expo/EAS CLI** installed globally

```bash
# Install Node.js (if not installed)
brew install node

# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI globally
npm install -g eas-cli
```

---

## 📋 Pre-Build Setup

### **Step 1: Install Dependencies**

```bash
# Navigate to project directory
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"

# Install all dependencies
npm install

# Install iOS pods (if running locally)
cd ios
pod install
cd ..
```

### **Step 2: Firebase iOS Configuration**

You need to download `GoogleService-Info.plist` from Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mytodoo-40c87`
3. Go to Project Settings → Your Apps
4. Add iOS app (if not already added):
   - iOS bundle ID: `com.unexo.mytodoomobile`
   - App nickname: `MyToDoo iOS`
5. Download `GoogleService-Info.plist`
6. Place it in your project root directory

### **Step 3: Google Sign-In iOS Setup**

You need to get iOS Client ID for Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID for iOS:
   - Application type: iOS
   - Bundle ID: `com.unexo.mytodoomobile`
5. Copy the iOS Client ID

6. Update your `.env` file:

```env
# Add these lines to your .env file
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID_HERE
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.YOUR_IOS_CLIENT_ID
```

### **Step 4: Apple Developer Account Setup**

1. Sign up at [Apple Developer Program](https://developer.apple.com/programs/)
2. Pay $99/year subscription
3. Create App ID:
   - Go to Certificates, Identifiers & Profiles
   - Identifiers → App IDs → Register an App ID
   - Bundle ID: `com.unexo.mytodoomobile`
   - Enable capabilities:
     - Push Notifications
     - Associated Domains
     - Background Modes
     - Sign in with Apple (optional)

4. Create Provisioning Profiles:
   - Development Profile (for testing)
   - Distribution Profile (for App Store)

---

## 🏗️ Building Methods

### **Method 1: Local Development (Mac Only)**

**Run on iOS Simulator:**

```bash
# Start iOS Simulator build
npx expo run:ios

# Or specify simulator
npx expo run:ios --simulator="iPhone 15 Pro"
```

**Run on Physical iPhone (USB connected):**

```bash
# Make sure iPhone is connected via USB
# Trust the computer on your iPhone

# Run on device
npx expo run:ios --device
```

### **Method 2: EAS Build (Cloud Build - Recommended)**

**First Time Setup:**

```bash
# Navigate to project
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"

# Login to Expo
eas login

# Configure EAS (already done)
# eas build:configure
```

**Build for iOS Simulator (Testing):**

```bash
# Build for iOS Simulator
eas build --platform ios --profile preview

# After build completes, download and install on simulator
# Download the .tar.gz file
# Extract and drag .app file to simulator
```

**Build for Physical Device (Internal Testing):**

```bash
# Build for ad-hoc distribution
eas build --platform ios --profile preview --non-interactive

# Or build for TestFlight (requires Apple Developer account)
eas build --platform ios --profile production
```

**Build for App Store:**

```bash
# Production build for App Store submission
eas build --platform ios --profile production --non-interactive

# After build, submit to App Store
eas submit --platform ios
```

---

## 📱 Testing on Your iPhone (via USB)

### **Option A: Using Expo Go (Quick Testing)**

1. Install Expo Go from App Store on your iPhone
2. Connect to same WiFi as your Mac
3. Run on Mac:

```bash
npx expo start

# Scan QR code with iPhone camera
# Open in Expo Go
```

⚠️ **Limitation:** Some native modules (Firebase, Google Sign-In) won't work in Expo Go.

### **Option B: Development Build (Full Features)**

1. Build development client:

```bash
eas build --platform ios --profile development
```

2. Install on iPhone:
   - Download IPA from EAS
   - Use Apple Configurator or Xcode to install
   - Or use EAS internal distribution link

3. Run development server:

```bash
npx expo start --dev-client
```

---

## 🔧 Troubleshooting

### **"No provisioning profile found"**

```bash
# Let EAS handle certificates automatically
eas build --platform ios --profile production --auto-submit
```

Or manually create in Apple Developer Portal.

### **"Bundle identifier mismatch"**

Make sure `bundleIdentifier` in `app.config.ts` matches Apple Developer Portal.

### **"Firebase not working on iOS"**

Make sure `GoogleService-Info.plist` is in project root and properly configured in Firebase Console.

### **"Google Sign-In fails on iOS"**

1. Verify iOS Client ID in `.env`
2. Check URL Scheme in `app.config.ts`
3. Make sure iOS app is configured in Google Cloud Console

### **"Keyboard overlaps text fields"**

This is already fixed in all screens! Each screen now has:
- `KeyboardAvoidingView` with platform-specific behavior
- Touch to dismiss keyboard functionality
- Proper keyboard offsets

---

## 📦 App Store Submission Checklist

### **Before Submission:**

- [ ] App Icon (1024x1024 px)
- [ ] Screenshots (all required iPhone sizes)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] App description
- [ ] Keywords for App Store search
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Age rating questionnaire
- [ ] Export compliance information

### **App Store Connect:**

1. Create app in [App Store Connect](https://appstoreconnect.apple.com/)
2. Fill in all app information
3. Upload build using:

```bash
eas submit --platform ios
```

4. Submit for review
5. Wait for Apple review (usually 1-3 days)

---

## 🎯 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run on iOS Simulator (Local)
npx expo run:ios

# Run on iPhone via USB (Local)
npx expo run:ios --device

# Build for iOS Simulator (Cloud)
eas build --platform ios --profile preview

# Build for TestFlight/App Store (Cloud)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

---

## 🔐 Environment Variables Needed

Add these to your `.env` file for iOS:

```env
# iOS-specific
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.YOUR_IOS_CLIENT_ID

# Shared (already have these)
EXPO_PUBLIC_API_URL=https://api.mytodoo.com/api
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📊 iOS vs Android - What's Different?

### **Same Codebase:**
- ✅ All screens
- ✅ All components
- ✅ All business logic
- ✅ All API calls
- ✅ All state management
- ✅ All navigation

### **Platform-Specific:**
- 📱 Different permission prompts
- 📱 Different keyboard behavior (handled automatically)
- 📱 Different navigation gestures (iOS swipe vs Android back)
- 📱 Different status bar styling
- 📱 Different push notification setup (APNs vs FCM)

**But you don't need to worry about these!** React Native and Expo handle them automatically.

---

## 🚀 Next Steps

1. **Get MacBook ready** - Install Xcode
2. **Apple Developer Account** - Sign up and pay $99
3. **Firebase iOS Setup** - Download `GoogleService-Info.plist`
4. **Google Sign-In iOS** - Get iOS Client ID
5. **Local Testing** - Run `npx expo run:ios` to test on simulator
6. **Cloud Build** - Use `eas build` when ready
7. **TestFlight** - Test with internal users
8. **App Store** - Submit for review

---

## ❓ FAQs

### **Q: Do I need a Mac to build for iOS?**
A: No! You can use **EAS Build** (cloud build) from Windows/Linux. But for local development and testing on Simulator, you need a Mac.

### **Q: Can I test on my iPhone without Mac?**
A: Yes! Use **EAS Build** to create a build, then install via TestFlight or direct download link.

### **Q: How much does it cost?**
- Apple Developer Program: $99/year (required)
- EAS Build: Free tier available, or $29/month for more builds

### **Q: Will my Android and iOS apps share the same backend?**
A: Yes! Both use `https://api.mytodoo.com/api` - same APIs, same database, same everything.

### **Q: Do I need to maintain two codebases?**
A: NO! One codebase, two platforms. That's the beauty of React Native!

### **Q: What if I want native iOS features?**
A: You can add native modules later, but 99% of features work cross-platform out of the box.

---

## 📞 Support

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Apple Developer Docs**: https://developer.apple.com/

---

**Built with ❤️ using React Native - One codebase, Two platforms!**

*Last updated: December 27, 2025*
