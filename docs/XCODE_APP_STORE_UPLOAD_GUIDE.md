# 🍎 MyToDoo iOS - Complete App Store Upload Guide
## Step-by-Step Guide for Xcode Submission

> **Created**: January 26, 2026  
> **App Name**: MyToDoo  
> **Bundle ID**: com.mytodoo.mytodoolive  
> **Version**: 1.0.0  
> **Firebase Project**: mytodoo-e4cdb (LIVE)  
> **API Endpoint**: https://api.mytodoo.com/api

---

## 📑 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Part 1: Apple Developer Setup](#part-1-apple-developer-setup)
4. [Part 2: Xcode Configuration](#part-2-xcode-configuration)
5. [Part 3: Build & Upload via Xcode](#part-3-build--upload-via-xcode)
6. [Part 4: App Store Connect Setup](#part-4-app-store-connect-setup)
7. [Part 5: Testing Checklist](#part-5-testing-checklist)
8. [Part 6: Submit for Review](#part-6-submit-for-review)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🎯 Quick Overview

**YES! You can upload to App Store directly through Xcode!**

Here's the complete flow:

```
1. Setup Apple Developer Account → 2. Configure Xcode Project 
       ↓                                      ↓
3. Build Archive in Xcode → 4. Validate Archive → 5. Upload to App Store Connect
       ↓                                      ↓
6. Add App Metadata → 7. Submit for Review → 8. App goes LIVE! 🎉
```

**Total Time**: 2-4 hours (excluding Apple's review time of 2-5 days)

---

## ✅ Prerequisites Checklist

Before you start, ensure you have:

### Required Accounts
- [ ] **Apple Developer Account** ($99/year) - [Enroll Here](https://developer.apple.com/programs/)
- [ ] **Account Status**: Active and in good standing

### Required Software
- [ ] **macOS** (Monterey 12.0 or later)
- [ ] **Xcode** 15.2+ (you already have Xcode 17C52 ✅)
- [ ] **Command Line Tools** installed

### Required Information
- [ ] **Privacy Policy URL** - MUST be live and publicly accessible
- [ ] **Support URL** - Contact/help page
- [ ] **Demo Account** - For App Store reviewers to test

### Required Assets
- [ ] **App Icon** (1024x1024px PNG, no transparency)
- [ ] **Screenshots** (minimum 2, size: 1290x2796px for iPhone 6.7")
- [ ] **App Description** (written and ready to paste)

---

## 📱 Part 1: Apple Developer Setup

### Step 1.1: Enroll in Apple Developer Program

1. **Visit**: https://developer.apple.com/programs/
2. **Click**: "Enroll" button
3. **Sign in** with your Apple ID
4. **Choose**:
   - **Individual** (for solo developers)
   - **Organization** (for companies - requires D-U-N-S number)
5. **Pay**: $99 USD annual fee
6. **Wait**: 24-48 hours for approval

**✅ Verification**:
- Go to https://developer.apple.com/account
- Status should show: "Active"

---

### Step 1.2: Create Distribution Certificate

1. **Open Xcode** → **Settings** (Cmd + ,)
2. **Click**: "Accounts" tab
3. **Add Apple ID** (if not already added):
   - Click "+" → "Apple ID"
   - Sign in with your Apple Developer account
4. **Select** your Apple ID from list
5. **Select** your team
6. **Click**: "Manage Certificates..."
7. **Click**: "+" button
8. **Select**: "Apple Distribution"
9. **Click**: "Done"

**✅ Result**: Distribution certificate created and stored in Mac Keychain

**Screenshot Tip**: You should see "Apple Distribution" certificate in the list

---

### Step 1.3: Create App ID (Bundle Identifier)

1. **Go to**: https://developer.apple.com/account/resources/identifiers/list
2. **Click**: "+" button (top left)
3. **Select**: "App IDs" → Continue
4. **Select**: "App" → Continue
5. **Fill in**:
   - **Description**: `MyToDoo`
   - **Bundle ID**: Select "Explicit"
   - **Bundle ID**: `com.mytodoo.mytodoolive`

6. **Select Capabilities**:
   - ✅ **Push Notifications** (for FCM)
   - ✅ **Sign In with Apple** (if using Apple Sign-In)
   - ✅ **Associated Domains** (for deep links)

7. **Click**: "Continue" → "Register"

**✅ Result**: App ID `com.mytodoo.mytodoolive` registered

---

### Step 1.4: Create Provisioning Profile

1. **Go to**: https://developer.apple.com/account/resources/profiles/list
2. **Click**: "+" button
3. **Select**: "App Store" (under Distribution)
4. **Click**: "Continue"
5. **Select**: Your App ID (`com.mytodoo.mytodoolive`)
6. **Click**: "Continue"
7. **Select**: Your Distribution Certificate (created in Step 1.2)
8. **Click**: "Continue"
9. **Name**: `MyToDoo App Store Distribution`
10. **Click**: "Generate"
11. **Click**: "Download"
12. **Double-click** downloaded `.mobileprovision` file to install

**✅ Result**: Provisioning profile installed in Xcode

---

## ⚙️ Part 2: Xcode Configuration

### Step 2.1: Open Project in Xcode

```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
open MyToDoo.xcworkspace
```

**⚠️ IMPORTANT**: Always open `.xcworkspace`, NOT `.xcodeproj`

---

### Step 2.2: Configure Project Settings

1. **In Xcode**, click **"MyToDoo"** project in left sidebar (blue icon)
2. **Select**: "MyToDoo" target (under TARGETS)
3. **Go to**: "General" tab

**Verify these settings**:

| Setting | Value | Status |
|---------|-------|--------|
| **Display Name** | MyToDoo | ✅ Already set |
| **Bundle Identifier** | com.mytodoo.mytodoolive | ✅ Already set |
| **Version** | 1.0.0 | ✅ Already set |
| **Build** | 1 | ⚠️ Increment for each upload |
| **Deployment Target** | 15.1 | ✅ Already set |
| **Devices** | iPhone, iPad | ✅ Already set |

**Build Number Rule**: 
- First submission: `1`
- Second submission: `2`
- Each new upload needs a unique build number!

---

### Step 2.3: Configure Signing & Capabilities

1. **Go to**: "Signing & Capabilities" tab
2. **Verify Settings**:

**For Release (App Store)**:
- **Team**: Select your Apple Developer team
- **Signing Certificate**: "Apple Distribution"
- **Provisioning Profile**: "MyToDoo App Store Distribution"

**Screenshot Checklist**:
- ✅ No error icons (red/yellow)
- ✅ "Apple Distribution" certificate showing
- ✅ Provisioning profile matches bundle ID

**Manual Signing (Recommended)**:
- Uncheck "Automatically manage signing"
- Select provisioning profile manually
- More control, fewer errors

---

### Step 2.4: Set Build Configuration

1. **Click**: "Product" menu → "Scheme" → "Edit Scheme..."
2. **Select**: "Archive" from left sidebar
3. **Build Configuration**: Select "Release"
4. **Close** scheme editor

**✅ Verification**: Archive will now use Release configuration

---

### Step 2.5: Verify App Configuration

**Check your [app.config.ts](../app.config.ts)**:

```typescript
✅ bundleIdentifier: 'com.mytodoo.mytodoolive'
✅ version: '1.0.0'
✅ buildNumber: '1.0.0'
✅ googleServicesFile: './GoogleService-Info.plist' (Firebase)
```

**Check your [GoogleService-Info.plist](../GoogleService-Info.plist)**:

```xml
✅ PROJECT_ID: mytodoo-e4cdb
✅ BUNDLE_ID: com.mytodoo.mytodoolive
✅ GCM_SENDER_ID: 685356682007 (for FCM push notifications)
```

**API Configuration** ([src/api/config.ts](../src/api/config.ts)):

```typescript
✅ BASE_URL: https://api.mytodoo.com/api (production API)
✅ USE_MOCK_ONLY: false (using real API)
```

---

## 🏗️ Part 3: Build & Upload via Xcode

### Step 3.1: Clean Build Environment

**Before archiving, clean everything**:

1. **In Xcode**: 
   - Product → Clean Build Folder (Shift + Cmd + K)
   - Or hold Option key: Product → Clean Build Folder

2. **Via Terminal**:
   ```bash
   cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
   xcodebuild clean -workspace MyToDoo.xcworkspace -scheme MyToDoo
   ```

**✅ Result**: Fresh build environment, no cached issues

---

### Step 3.2: Select Correct Destination

**In Xcode toolbar** (top middle):

1. **Click** the device dropdown (next to Stop button)
2. **Select**: "Any iOS Device (arm64)"
   - **NOT** a simulator (iPhone 15 Pro, etc.)
   - **NOT** "Generic iOS Device" (old)
   - Must be "Any iOS Device (arm64)"

**Why?**: Archives must be built for physical devices (arm64 architecture)

---

### Step 3.3: Create Archive

1. **Click**: Product → Archive
2. **Wait**: 5-15 minutes (depending on your Mac)
3. **Watch**: Build progress in Xcode toolbar

**Build Process**:
```
Compiling React Native code → Building native modules → 
Linking frameworks → Code signing → Creating archive
```

**✅ Success**: Xcode Organizer opens automatically

**❌ If build fails**:
- Check error messages in Xcode
- Common issue: Code signing → verify certificates
- See [Troubleshooting Guide](#troubleshooting-guide) below

---

### Step 3.4: Verify Archive in Organizer

**In Xcode Organizer** (opens automatically):

**Check these details**:
- **App Name**: MyToDoo
- **Version**: 1.0.0 (1)
- **Date**: Today's date
- **Archive Size**: ~80-150 MB (typical for React Native)
- **No warnings/errors**

**Location**: Archives → iOS Apps → MyToDoo

---

### Step 3.5: Validate Archive (IMPORTANT!)

**Before uploading, always validate**:

1. **Select** your archive in Organizer
2. **Click**: "Validate App" button (blue)
3. **Select**: "App Store Connect"
4. **Click**: "Next"
5. **Distribution Options**:
   - ✅ **Upload your app's symbols** (for crash reports)
   - ✅ **Manage Version and Build Number** (auto-increment)
6. **Click**: "Next"
7. **Review** signing certificate & provisioning profile
8. **Click**: "Validate"
9. **Wait**: 1-3 minutes

**Results**:
- ✅ **Success**: "MyToDoo.app passed validation"
- ❌ **Errors**: Fix issues and re-archive
- ⚠️ **Warnings**: Review but can usually proceed

**Common Validation Errors**:
| Error | Solution |
|-------|----------|
| Missing icons | Add all icon sizes to Assets |
| Invalid bundle ID | Verify matches App Store Connect |
| Code signing failed | Re-download provisioning profile |
| Missing privacy strings | Add to Info.plist in Xcode |

---

### Step 3.6: Upload to App Store Connect

**After successful validation**:

1. **Select** your archive (if not selected)
2. **Click**: "Distribute App" button
3. **Select**: "App Store Connect"
4. **Click**: "Next"
5. **Choose**: "Upload"
6. **Click**: "Next"
7. **Distribution Options** (same as validation):
   - ✅ Upload your app's symbols
   - ✅ Manage Version and Build Number
8. **Click**: "Next"
9. **Review** signing details
10. **Click**: "Upload"
11. **Wait**: 5-20 minutes (depends on internet speed)

**Progress Indicators**:
```
Preparing archive → Uploading to App Store → Processing upload → Complete!
```

**✅ Success**: "Upload Successful" message appears

**Email Notification**: You'll receive email confirming upload

---

### Step 3.7: Wait for Processing

**After upload completes**:

1. **Go to**: https://appstoreconnect.apple.com
2. **Click**: My Apps → MyToDoo
3. **Click**: App Store tab
4. **Scroll to**: Build section

**Processing Status**:
- 🔄 **"Processing"** - Apple is processing (15-60 minutes)
- ✅ **Build appears** - Ready to use!
- ❌ **"Invalid Binary"** - Check email for details

**Wait for Email**: "Your app has been processed" (usually 30-60 minutes)

---

## 🌐 Part 4: App Store Connect Setup

### Step 4.1: Create App in App Store Connect

**If app doesn't exist yet**:

1. **Go to**: https://appstoreconnect.apple.com
2. **Click**: "My Apps"
3. **Click**: "+" button → "New App"
4. **Fill in**:

| Field | Value |
|-------|-------|
| **Platforms** | ✅ iOS |
| **Name** | MyToDoo |
| **Primary Language** | English (U.S.) |
| **Bundle ID** | com.mytodoo.mytodoolive |
| **SKU** | mytodoo-ios-001 |
| **User Access** | Full Access |

5. **Click**: "Create"

**✅ Result**: App created in App Store Connect

---

### Step 4.2: Fill in App Information

**Click**: "App Information" (left sidebar)

**Fill these fields**:

| Field | Value | Required |
|-------|-------|----------|
| **Subtitle** | Task & Services Platform | Optional |
| **Primary Category** | Productivity | ✅ Required |
| **Secondary Category** | Business | Optional |
| **Privacy Policy URL** | https://mytodoo.com/privacy | ✅ **CRITICAL** |
| **Support URL** | https://mytodoo.com/support | ✅ Required |

**Age Rating**:
1. Click "Edit" next to Age Rating
2. Answer questions (likely 4+ for task app)
3. Save

---

### Step 4.3: Configure App Privacy

**⚠️ CRITICAL REQUIREMENT - Apple mandates this**

1. **Click**: "App Privacy" (left sidebar)
2. **Click**: "Get Started"
3. **Answer Questions**:

**For MyToDoo, declare these data types**:

**Contact Information**:
- ✅ Email Address (for sign up/sign in)
- ✅ Name (first and last name)

**User Content**:
- ✅ Photos (task images uploaded by users)
- ✅ Other User Content (task descriptions, chat messages)

**Identifiers**:
- ✅ User ID (for authentication)

**Location**:
- ✅ Precise Location (for nearby tasks feature)

**Usage Data**:
- ✅ Product Interaction (app analytics)

**For each data type, specify**:
- **Purpose**: Why you collect it (e.g., "App functionality", "Product personalization")
- **Linked to user**: Yes (most data is linked to user accounts)
- **Used for tracking**: No (we don't sell data or track for ads)

4. **Click**: "Save"
5. **Click**: "Publish"

**✅ Result**: Privacy nutrition labels will show on App Store

---

### Step 4.4: Prepare App Store Listing

**Click**: "1.0 Prepare for Submission" (or "+ Version")

#### **4.4.1 Screenshots** (REQUIRED - Minimum 2)

**Required Size**: iPhone 6.7" Display (1290 x 2796 pixels)

**How to Create Screenshots**:

**Method 1: iOS Simulator (Recommended)**
```bash
# 1. Open Xcode
# 2. Run on iPhone 15 Pro Max simulator
# 3. Navigate to key screens
# 4. Press: Cmd + S to save screenshot
# 5. Screenshots saved to Desktop
```

**Method 2: Real Device**
```bash
# 1. Connect iPhone via USB
# 2. Run app: Product → Run (Cmd + R)
# 3. Take screenshots: Power + Volume Up
# 4. AirDrop to Mac
```

**Recommended Screenshots** (in order):
1. Welcome/Browse Tasks screen
2. Task Detail screen
3. Create Task screen
4. Chat/Messages screen
5. User Profile screen

**Tips**:
- Use real app content (no test data)
- High quality, no blur
- Show key features
- First screenshot is most important (users see in search)

**Upload**:
1. Drag screenshots to App Store Connect
2. Arrange in order
3. Add optional captions

---

#### **4.4.2 App Description** (Required, max 4000 characters)

**Suggested Description**:

```markdown
MYTODOO - YOUR ULTIMATE TASK & SERVICES PLATFORM

Connect with skilled taskers or find tasks to earn money! MyToDoo makes it easy, safe, and efficient.

🎯 FOR CUSTOMERS:
• Post any task in minutes with photos and descriptions
• Browse skilled taskers nearby using location services
• Compare profiles, ratings, and reviews
• Secure payment with escrow protection
• Release payment only when satisfied
• Real-time chat with taskers
• Track task progress and history
• Rate and review completed tasks

💼 FOR TASKERS:
• Find tasks that match your skills
• Set your own rates and availability
• Build your reputation with verified reviews
• Get paid securely and quickly via Stripe
• Flexible schedule - work when you want
• Accept tasks nearby or remotely
• Grow your service business

✨ KEY FEATURES:
• Easy task posting with photo upload
• AI-powered task title suggestions
• Location-based task discovery
• Secure payment processing with Stripe
• Real-time Firebase chat messaging
• Push notifications for updates
• User verification and reviews
• Safe escrow payment system
• Professional tasker profiles
• Complete task history and analytics

🔒 SAFETY & SECURITY:
• Verified user profiles
• Secure Stripe payment processing
• Escrow protection for all transactions
• Comprehensive review and rating system
• Report and support system
• Privacy-focused design with GDPR compliance

📱 SEAMLESS EXPERIENCE:
• Clean, intuitive Material Design interface
• Fast and responsive React Native performance
• Works on iPhone and iPad
• Offline task drafting capability
• Camera and gallery integration
• Google Sign-In for quick access
• Real-time synchronization across devices

Whether you need help with moving, cleaning, repairs, errands, creative services, or professional work - MyToDoo connects you with the right people!

Download MyToDoo today and experience the easiest way to get things done!

---

Need help? Visit https://mytodoo.com/support
Privacy Policy: https://mytodoo.com/privacy
Terms of Service: https://mytodoo.com/terms
```

---

#### **4.4.3 Keywords** (Max 100 characters)

```
tasks,services,hire,freelance,jobs,gigs,errands,handyman,cleaning,moving,help,local,tasker
```

**Tips**:
- Comma-separated, no spaces after commas
- Use all 100 characters
- Include variations (task/tasks)
- Research competitor keywords

---

#### **4.4.4 Promotional Text** (Optional, max 170 characters)

```
Get things done with MyToDoo! Post tasks, find skilled taskers, complete jobs efficiently. Your trusted platform for local tasks and services.
```

*Can be updated anytime without new version*

---

#### **4.4.5 Other Required Fields**

| Field | Value |
|-------|-------|
| **Support URL** | https://mytodoo.com/support |
| **Marketing URL** | https://mytodoo.com (optional) |
| **Version** | 1.0.0 |
| **Copyright** | © 2026 MyToDoo |

---

### Step 4.5: App Review Information (CRITICAL)

**This helps Apple reviewers test your app**

1. **Sign-in Required**: ✅ Yes

2. **Demo Account Credentials**:
   ```
   Email: appreviewer@mytodoo.com
   Password: AppReview2026!
   
   OR Google Account:
   Email: appreview.mytodoo@gmail.com
   Password: ReviewTest2026!
   ```

   **⚠️ IMPORTANT**: 
   - Create these accounts in your backend BEFORE submitting
   - Pre-populate with sample data (tasks, chats, offers)
   - Test login yourself before submission
   - Ensure all features are accessible

3. **Contact Information**:
   ```
   First Name: [Your First Name]
   Last Name: [Your Last Name]
   Phone: +61 XXX XXX XXX (with country code)
   Email: support@mytodoo.com
   ```

4. **Notes for Reviewer**:
   ```
   TESTING INSTRUCTIONS FOR APP REVIEWERS:

   1. LOGIN:
   - Use provided demo account credentials
   - Or sign in with Google using test account
   - Google Sign-In is fully configured and functional

   2. KEY FEATURES TO TEST:

   Browse Tasks:
   - Navigate to "Browse" tab to see available tasks
   - Tasks use real production API (https://api.mytodoo.com/api)
   - Location-based filtering works (default: Sydney, Australia)

   View Task Details:
   - Tap any task card to see full details
   - View tasker profiles, ratings, and reviews
   - See task photos and descriptions

   Create Task:
   - Tap "+" button to create new task
   - Upload photos using camera or gallery
   - AI suggests task titles
   - All features fully functional

   Real-time Chat:
   - Go to "Messages" tab
   - Select conversation to test Firebase chat
   - Send/receive messages in real-time
   - Push notifications enabled

   Make Offer:
   - Browse tasks and make offers
   - Test payment flow with Stripe test card

   Profile Management:
   - View and edit user profile
   - Check ratings and reviews
   - Manage tasks and offers

   3. TECHNICAL DETAILS:

   Push Notifications:
   - FCM configured via Firebase (mytodoo-e4cdb)
   - Notifications work when app is open, background, and closed
   - Permission request shown on first launch

   Location Services:
   - App requests location permission for nearby tasks
   - Permission is optional but enhances experience
   - Default location: Sydney, Australia

   Payment Testing:
   - Stripe integration in live mode (payments work)
   - Test card: 4242 4242 4242 4242 (Exp: any future, CVC: any 3 digits)
   - Payments use production Stripe keys

   API Integration:
   - Production API: https://api.mytodoo.com/api
   - All endpoints fully functional
   - Real-time sync with React Query

   Firebase Services:
   - Google Sign-In requires native build (works in this IPA)
   - Real-time chat powered by Firestore
   - Push notifications via FCM
   - Project: mytodoo-e4cdb (LIVE)

   4. TROUBLESHOOTING:

   If you encounter any issues during review:
   - Contact: support@mytodoo.com
   - Response time: Within 24 hours
   - Alternative demo accounts available upon request

   Thank you for reviewing MyToDoo!
   ```

---

### Step 4.6: Select Build

1. **Scroll to**: "Build" section
2. **Click**: "+ Build" or "Select a build before you submit your app"
3. **Select**: Your uploaded build (1.0.0 build 1)
4. **Click**: "Done"

**If build not showing**:
- Wait for processing email
- Refresh page
- Check for "Invalid Binary" email

---

### Step 4.7: Export Compliance

**Question**: "Does your app use encryption?"

**Answer**: Yes

**Next Question**: "Is encryption limited to..." 

**Answer**: Yes - Our app only uses:
- ✅ HTTPS connections (standard SSL/TLS)
- ✅ Authentication (password hashing)
- ✅ No custom encryption algorithms

**Result**: No export compliance documentation required

---

### Step 4.8: Version Release Settings

**How do you want to release this version?**

Choose one:

1. ✅ **Automatically release this version** (Recommended)
   - App goes live immediately after approval
   - Best for first release

2. **Manually release this version**
   - You control when app goes live
   - Good if coordinating marketing campaign

3. **Automatically release after [DATE]**
   - Schedule release date

**Phased Release** (Optional):
- [ ] Release app to 1% of users first, then gradually increase over 7 days
- Helps catch issues before full rollout

---

## ✅ Part 5: Testing Checklist

### Before Submitting - Test Everything!

**Run these tests on a REAL iOS device**:

#### App Functionality
- [ ] App launches without crashing
- [ ] Login works (email, Google Sign-In)
- [ ] Browse tasks loads correctly
- [ ] Task detail screen displays properly
- [ ] Create task flow works (including photo upload)
- [ ] Chat messages send/receive in real-time
- [ ] Make offer flow works
- [ ] Payment flow works (use Stripe test card)
- [ ] Profile screens load correctly
- [ ] Navigation between screens is smooth

#### API Integration
- [ ] API calls reach production server (https://api.mytodoo.com/api)
- [ ] Authentication tokens save correctly
- [ ] Data loads from backend
- [ ] Images upload successfully
- [ ] Error handling works (try offline mode)
- [ ] Loading states display correctly

#### Push Notifications (See Part 6 for detailed testing)
- [ ] Permission request shows on first launch
- [ ] FCM token registers with backend
- [ ] Notifications arrive when app is open (foreground)
- [ ] Notifications arrive when app is in background
- [ ] Notifications arrive when app is closed
- [ ] Tapping notification opens app
- [ ] Notification badge updates correctly

#### UI/UX
- [ ] No placeholder text or "lorem ipsum"
- [ ] All images load correctly
- [ ] No test data visible
- [ ] UI looks polished and professional
- [ ] Animations work smoothly
- [ ] Safe areas respected (no content under notch)

#### Security
- [ ] HTTPS connections only (no HTTP)
- [ ] Privacy policy URL works and is accessible
- [ ] Support URL works
- [ ] User data encrypted in transit
- [ ] Passwords not visible in plain text

---

## 📤 Part 6: Submit for Review

### Final Pre-Submission Checklist

**Go through this checklist one more time**:

- [ ] All screenshots uploaded (minimum 2)
- [ ] App description written and checked for typos
- [ ] Keywords filled (max 100 chars)
- [ ] Privacy Policy URL live and accessible
- [ ] Support URL working
- [ ] Demo account created and tested
- [ ] Contact information accurate
- [ ] Build selected and processed
- [ ] Export compliance answered
- [ ] Release settings configured
- [ ] No placeholder content anywhere
- [ ] App tested on real device
- [ ] API endpoints using production URLs
- [ ] Firebase configured correctly
- [ ] No console errors or warnings

---

### Submit!

1. **Click**: "Add for Review" (top right in App Store Connect)
2. **Review** all information one final time
3. **Click**: "Submit to App Review"
4. **Confirmation**: Status changes to "Waiting for Review"

**✅ You'll receive email**: "Your app has been submitted for review"

---

## ⏳ What Happens Next?

### Review Timeline

**Typical Timeline**:
```
Waiting for Review: 1-3 days
       ↓
In Review: 1-2 days
       ↓
┌─────────────────────┐
│  Outcome:           │
│  ✅ Approved        │
│  ❌ Rejected        │
└─────────────────────┘
```

**Total Average**: 2-5 days

### Status Meanings

| Status | What It Means | What To Do |
|--------|---------------|------------|
| **Prepare for Submission** | App not submitted yet | Complete all fields |
| **Waiting for Review** | In queue | Wait (1-3 days) |
| **In Review** | Being tested by Apple | Wait, respond to questions if asked |
| **Pending Developer Release** | Approved! Waiting for you | Release manually or wait for auto-release |
| **Ready for Sale** | LIVE on App Store! | 🎉 Celebrate! Monitor downloads |
| **Rejected** | Didn't pass review | Read rejection reason, fix, resubmit |

### What Apple Reviews

1. ✅ **Functionality**: All features work correctly
2. ✅ **Design**: UI is polished and intuitive
3. ✅ **Business**: No policy violations
4. ✅ **Legal**: Privacy policy, terms comply with laws
5. ✅ **Safety**: No inappropriate content
6. ✅ **Performance**: Stable, no crashes
7. ✅ **Accuracy**: Metadata matches app features

### If Approved ✅

**You'll receive email**: "Your app status is Ready for Sale"

**Next Steps**:
1. App automatically goes live (if auto-release selected)
2. Check App Store listing
3. Monitor analytics in App Store Connect
4. Respond to user reviews
5. Plan updates

### If Rejected ❌

**Don't panic! Very common on first submission**

**Steps**:
1. Read rejection reason in email carefully
2. Check Resolution Center in App Store Connect
3. Fix the issues
4. Respond to Apple with explanation
5. Resubmit (usually faster 2nd time)

**Common Rejection Reasons**:
- Missing functionality shown in screenshots
- Demo account doesn't work
- Privacy policy missing or incomplete
- App crashes during review
- Metadata doesn't match app
- Missing required disclosures

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Build Issues

**Error**: "Code signing failed"
**Solution**:
1. Go to https://developer.apple.com/account/resources/profiles/list
2. Download provisioning profile again
3. Double-click to reinstall
4. Clean build folder in Xcode
5. Try archiving again

---

**Error**: "Bundle identifier doesn't match"
**Solution**:
1. Check Xcode: Target → General → Bundle Identifier
2. Must exactly match: `com.mytodoo.mytodoolive`
3. Check App Store Connect app settings
4. No spaces or typos

---

**Error**: "Missing required architecture"
**Solution**:
1. Select "Any iOS Device (arm64)" NOT simulator
2. Clean build folder
3. Archive again

---

#### Upload Issues

**Error**: "Upload failed"
**Solution**:
1. Check internet connection
2. Try uploading again
3. Alternative: Use Transporter app:
   - Export IPA from Xcode Organizer
   - Open Transporter app (Mac App Store)
   - Drag IPA file
   - Click "Deliver"

---

**Error**: "Build processing stuck for hours"
**Solution**:
1. Wait up to 90 minutes
2. Check email for "Invalid Binary" message
3. If stuck >2 hours, contact Apple Support

---

#### Validation Errors

**Error**: "Missing icons"
**Solution**:
1. Check Assets.xcassets → AppIcon
2. Ensure all sizes present:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024
3. No transparency in icons
4. Re-archive

---

**Error**: "Missing privacy usage descriptions"
**Solution**:
1. Open Xcode → Info.plist
2. Add missing keys:
   - NSCameraUsageDescription
   - NSPhotoLibraryUsageDescription
   - NSLocationWhenInUseUsageDescription
3. Already in your [app.config.ts](../app.config.ts) ✅

---

#### App Store Connect Issues

**Problem**: "Build not appearing"
**Solution**:
1. Wait for processing email (30-90 min)
2. Refresh page
3. Check email for "Invalid Binary"
4. If >2 hours, re-upload

---

**Problem**: "Privacy Policy URL rejected"
**Solution**:
1. Ensure URL is publicly accessible (no login required)
2. Must be HTTPS
3. Must load quickly
4. Cannot be PDF download

---

### Need More Help?

**Apple Resources**:
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Contact Apple Support](https://developer.apple.com/contact/)

**Your Resources**:
- Check existing docs in `/docs` folder
- Review Firebase setup: [GoogleService-Info.plist](../GoogleService-Info.plist)
- Review API config: [src/api/config.ts](../src/api/config.ts)
- Review app config: [app.config.ts](../app.config.ts)

---

## 🎯 Quick Reference Commands

### Xcode CLI Commands

```bash
# Open project
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
open MyToDoo.xcworkspace

# Clean build
xcodebuild clean -workspace MyToDoo.xcworkspace -scheme MyToDoo

# Build archive (command line)
xcodebuild archive \
  -workspace MyToDoo.xcworkspace \
  -scheme MyToDoo \
  -configuration Release \
  -archivePath ./build/MyToDoo.xcarchive \
  -destination 'generic/platform=iOS'

# Check certificates
security find-identity -v -p codesigning
```

---

## 📊 Post-Launch Checklist

After your app is approved and live:

- [ ] Verify app appears in App Store
- [ ] Download and test from App Store
- [ ] Monitor crash reports in Xcode Organizer
- [ ] Check Analytics in App Store Connect
- [ ] Respond to user reviews within 24-48 hours
- [ ] Monitor server logs for API errors
- [ ] Track FCM notification delivery rates
- [ ] Plan first update (bug fixes, features)
- [ ] Collect user feedback
- [ ] Update screenshots if UI changes

---

## 🎉 Congratulations!

You've successfully prepared and uploaded MyToDoo to the App Store!

**Remember**:
- Keep your Apple Developer account active ($99/year)
- Regular updates improve user retention
- Monitor reviews and respond professionally
- Track analytics to understand user behavior
- Test thoroughly before each update

**Next Steps**:
1. Wait for review (2-5 days)
2. Prepare marketing materials
3. Plan app launch campaign
4. Monitor first users carefully
5. Iterate based on feedback

---

## 📞 Support

**Questions or Issues?**
- Email: support@mytodoo.com
- Apple Developer Support: https://developer.apple.com/contact/

**Document Version**: 1.0  
**Last Updated**: January 26, 2026  
**Created for**: MyToDoo iOS App v1.0.0

---

**Good luck with your App Store submission! 🚀**
