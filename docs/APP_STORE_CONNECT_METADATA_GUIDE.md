# 📱 App Store Connect Metadata Guide
## How to Fill Out Your iOS App Submission Forms

> **For**: MyToDoo iOS App Version 1.0  
> **Updated**: February 8, 2026  
> **Purpose**: Step-by-step guide to fill the App Store Connect fields shown in your screenshots

---

## 🎯 Quick Answer to Your Questions

### **Q1: TestFlight vs Production - How Do Updates Work?**

**TestFlight (Internal/External Testing):**
- Apps uploaded to TestFlight are for TESTING ONLY
- NOT visible to public App Store users
- You can update TestFlight builds anytime
- Each new build automatically appears to testers
- TestFlight updates DO NOT affect the live App Store version
- Testers must have TestFlight app installed

**Production (Live on App Store):**
- This is the PUBLIC version users download
- Visible to everyone searching the App Store
- Each update MUST go through App Review (2-5 days)
- Users get updates through regular App Store updates
- Production updates replace the live version

**Simple Answer:**
- ✅ TestFlight updates = Instant for testers, no review needed (except first build)
- ✅ Production updates = Need Apple review, 2-5 days, public release
- ⚠️ They are SEPARATE - updating TestFlight does NOT update production!

### **Q2: How to Get the Latest Production App?**

**If you want to update your LIVE app on the App Store:**

1. **Create new build** with your changes
2. **Increment build number** (1.0.0 build 2, build 3, etc.)
3. **Archive and upload** to App Store Connect
4. **Select new build** in App Store → Version Info
5. **Submit for review** again
6. **Wait for approval** (1-3 days for updates, faster than first submission)
7. **App goes live** after approval

**When to create updates:**
- 🐛 **Bug Fix Update (1.0.1)**: Fix crashes or critical bugs - submit ASAP
- ✨ **Feature Update (1.1.0)**: Add new features - every 4-6 weeks
- 🎉 **Major Update (2.0.0)**: Big redesign or changes - when ready

---

## 📝 Screenshot 1: App Information Fields

### **Location in App Store Connect:**
`My Apps → MyToDoo → App Store → iOS App Version 1.0`

### **Fields to Fill:**

#### 1️⃣ **Promotional Text** (Optional, 170 characters max)
**What it is:** Text that appears at top of App Store description, can be updated ANYTIME without new version

**For MyToDoo, use:**
```
Get things done with MyToDoo! Post tasks, find skilled taskers nearby, and complete jobs securely. Your trusted task marketplace.
```

**Character count:** 147/170 ✅

**Why useful:** You can change this for promotions, holidays, or announcements WITHOUT submitting app update!

---

#### 2️⃣ **Description** (Required, 4000 characters max)
**What it is:** Main description users see on App Store

**For MyToDoo, use:**
```
MYTODOO - CONNECT. COMPLETE. GET PAID.

MyToDoo is Australia's trusted platform connecting people who need tasks done with skilled taskers ready to help. Whether it's home repairs, deliveries, cleaning, or professional services - MyToDoo makes it simple, safe, and efficient.

🎯 FOR TASK POSTERS:
• Post any task in minutes with photos and detailed descriptions
• AI-powered task title suggestions for better visibility
• Browse verified taskers with ratings and reviews
• Secure escrow payment protection with Stripe
• Real-time chat to discuss task details
• Release payment only when you're satisfied
• Track task progress with notifications
• Rate and review completed work

💼 FOR TASKERS:
• Discover tasks matching your skills nearby
• Make offers with competitive rates
• Build your reputation through verified reviews
• Get paid securely and quickly
• Flexible schedule - work when you want
• Grow your service business with analytics
• Accept tasks in your local area
• Professional tasker profile with portfolio

✨ KEY FEATURES:
• Smart task posting with photo uploads
• AI-powered task title optimization
• Location-based task discovery with maps
• Secure Stripe payment processing
• Real-time messaging system
• Instant push notifications
• User verification system
• Safe escrow protection
• Comprehensive review and rating system
• Detailed task and earnings history
• Google Sign-In for quick access
• Apple Sign-In supported

🔒 SAFETY & SECURITY:
• Verified user profiles with ID checks
• Secure payment processing via Stripe
• Escrow system protects both parties
• Comprehensive review system
• Report and support tools
• Privacy-focused design
• SSL encrypted communications

📱 SEAMLESS EXPERIENCE:
• Beautiful, intuitive interface
• Fast and responsive performance
• Works on iPhone and iPad
• Offline mode for task drafting
• Camera and gallery integration
• Precise location services for nearby tasks
• Background notifications
• Dark mode support

🌏 BUILT FOR AUSTRALIA:
• Support for AUD currency
• Local tasker discovery
• Australian payment methods
• Community-focused platform
• Local customer support

Whether you need help with moving, furniture assembly, cleaning, gardening, handyman work, tech support, tutoring, event assistance, or any service - MyToDoo connects you with trusted local taskers!

Download MyToDoo today and experience the easiest way to get things done!

---
🌐 Website: https://mytodoo.com
📧 Support: support@mytodoo.com
📱 Follow us on social media for updates and tips!

Terms of Service: https://mytodoo.com/terms
Privacy Policy: https://mytodoo.com/privacy
```

**Character count:** ~2,450/4,000 ✅

---

#### 3️⃣ **Keywords** (Required, 100 characters max)
**What it is:** Search terms users might use to find your app. Separated by commas, NO spaces after commas.

**For MyToDoo, use:**
```
tasks,services,hire,jobs,gigs,errands,handyman,cleaning,moving,help,freelance,local
```

**Character count:** 88/100 ✅

**Tips:**
- No app name (Apple auto-includes it)
- No spaces after commas
- Use singular AND plural if room (task,tasks)
- Research competitor apps for ideas
- Focus on what users would search for

**How to enter:** Copy the text above, paste into Keywords field

---

#### 4️⃣ **Support URL** (Required)
**What it is:** URL where users can get help with your app. MUST be a working website.

**For MyToDoo:**
```
https://mytodoo.com/support
```

**⚠️ CRITICAL:** This URL must be live and accessible BEFORE submission!

**What to include on support page:**
- FAQs
- Contact form or email
- How to use the app
- Troubleshooting guide
- Known issues

**If you don't have this yet:**
1. Create a simple support page on your website
2. OR use your main website for now: `https://mytodoo.com`
3. OR use email format: `mailto:support@mytodoo.com` (less professional)

---

#### 5️⃣ **Marketing URL** (Optional)
**What it is:** Your main website or marketing page

**For MyToDoo:**
```
https://mytodoo.com
```

**Can skip if:** You don't have a website yet (it's optional)

---

#### 6️⃣ **Copyright** (Required)
**What it is:** Copyright notice for your app

**For MyToDoo:**
```
© 2026 MyToDoo
```

**Or if you have a company:**
```
© 2026 MyToDoo Pty Ltd
```

**Format:** Always use `©` symbol, year, and company/app name

---

#### 7️⃣ **Version** (Auto-filled)
**Shows:** 1.0

**This comes from** your `app.config.ts` file where you have `version: '1.0.0'`

**No need to edit here** - it's read-only

---

#### 8️⃣ **Routing App Coverage File** (Optional)
**What it is:** Only for navigation/routing apps showing coverage areas

**For MyToDoo:** Leave empty (not applicable)

**When to use:** Only if you're building a GPS/navigation app like Google Maps

---

## 📝 Screenshot 2: App Clip Information (SKIP THIS!)

### **What is an App Clip?**
App Clips are mini-versions of your app (max 10MB) that load instantly without full download. Users scan QR codes or NFC tags to access specific features.

### **For MyToDoo: DO NOT CONFIGURE APP CLIPS**

**Why?** 
- App Clips are advanced feature requiring separate build
- Requires additional development work
- Not needed for initial launch
- Can add later in future updates

**What to do:**
- ✅ Leave all App Clip fields empty
- ✅ Don't upload Header Image
- ✅ Don't fill Subtitle or Action fields
- ✅ Ignore the warning "To provide metadata for your app clip..."

**This section is OPTIONAL and not required for app approval!**

---

## 📝 Screenshot 3: Build Section

### **Location in App Store Connect:**
`My Apps → MyToDoo → App Store → iOS App Version 1.0 → Build`

### **What you see:**

#### 1️⃣ **Build Section**
**Status before upload:** "Upload your builds using one of several tools. See Upload Tools"

**What to do:**
1. **First, upload your IPA** using Xcode (see main guide)
2. **Wait for processing** (15-60 minutes)
3. **Come back to this page**
4. **Click "+ Add Build"** (button will appear after processing)
5. **Select your build** from the list (will show: 1.0.0 (1) )
6. **Click "Done"**

**After selecting build:**
- Build number shows: `1.0.0 (1)` or similar
- You can change build by clicking again
- Each submission can only have ONE build selected

---

#### 2️⃣ **Game Center** (Checkbox)
**What it is:** Apple's gaming social network for leaderboards, achievements, multiplayer

**For MyToDoo:** 
- ❌ **UNCHECK THIS BOX** (leave unchecked)
- MyToDoo is NOT a game
- Game Center not applicable

**When to use:** Only for games with competitive features

---

#### 3️⃣ **App Review Information**
**What it is:** Information to help Apple reviewers test your app

This is shown more clearly in Screenshot 4, so see next section ⬇️

---

## 📝 Screenshot 4: App Review Information (CRITICAL!)

### **Location in App Store Connect:**
`My Apps → MyToDoo → App Store → iOS App Version 1.0 → App Review Information`

### **Why this matters:**
Apple reviewers will use these credentials to test your app. If they can't log in, your app will be REJECTED!

---

### **Sign-In Information Section:**

#### 1️⃣ **Sign-in required** (Checkbox)
**Check this box:** ✅ **YES** - Your app requires login

**Why:** Users must sign in to use MyToDoo features

---

#### 2️⃣ **Username** (Text field)
**What to provide:** A working test account email

**For MyToDoo, create this test account:**
```
appreviewer@mytodoo.com
```

**⚠️ CRITICAL STEPS:**

1. **Create this account in your backend/Firebase:**
   - Go to your Firebase Console
   - Create user with email: `appreviewer@mytodoo.com`
   - Set strong password (see below)

2. **Set up the account:**
   - Complete user profile
   - Add sample data:
     - Post 2-3 sample tasks
     - Create some chat messages
     - Add profile photo
     - Complete all onboarding steps
   - Verify all features work with this account

3. **Test the account:**
   - Log out of your personal account
   - Log in with reviewer account
   - Test all features: browse, post, chat, profile
   - Make sure NOTHING is broken!

---

#### 3️⃣ **Password** (Text field)
**What to provide:** The password for the test account

**For MyToDoo:**
```
AppReview2026!
```

**⚠️ Make sure:**
- Password meets your app's requirements
- You can successfully log in with it
- You write it down exactly as entered (case-sensitive!)

---

#### 4️⃣ **Notes** (Large text area) - VERY IMPORTANT!
**What to provide:** Detailed instructions for Apple reviewers

**For MyToDoo, copy this:**

```
TESTING INSTRUCTIONS FOR APPLE REVIEW TEAM

Thank you for reviewing MyToDoo! Below are detailed instructions to test all features.

═══════════════════════════════════════════
1️⃣ LOGIN & AUTHENTICATION
═══════════════════════════════════════════

You can log in using either method:

Option A - Email/Password (Recommended):
• Email: appreviewer@mytodoo.com
• Password: AppReview2026!

Option B - Google Sign-In:
• Use the Google button on login screen
• This account has the same access as the email account

═══════════════════════════════════════════
2️⃣ KEY FEATURES TO TEST
═══════════════════════════════════════════

📋 Browse Tasks:
• Tap "Browse" tab at bottom
• View list of available tasks
• Use search bar to filter tasks
• Tap any task card to view details
• Tasks are loaded from live production API

✍️ Create a Task:
• Tap "+" button (bottom center)
• Fill in task title (or use AI suggestions)
• Add description
• Set budget and location
• Upload photos (camera or gallery)
• Tap "Post Task" to create

💬 Real-Time Chat:
• Tap "Messages" tab at bottom
• View conversations list
• Tap any conversation to open chat
• Send test messages
• Chat uses Firebase real-time database

👤 User Profile:
• Tap "Profile" tab at bottom
• View and edit profile information
• Upload profile photo
• View task history
• Check earnings/spending (mock data)

📍 Location Features:
• App will request location permission
• Permission is OPTIONAL but enhances experience
• If prompted, choose "Allow While Using App"
• Default location: Sydney, Australia
• Tasks show distance from current location

═══════════════════════════════════════════
3️⃣ PAYMENT TESTING
═══════════════════════════════════════════

• Payment processing uses Stripe
• Test mode is enabled for App Review
• Use Stripe test card: 4242 4242 4242 4242
• Any future date for expiry (e.g., 12/28)
• Any 3-digit CVC (e.g., 123)
• Production payments will be activated after approval

═══════════════════════════════════════════
4️⃣ TECHNICAL INFORMATION
═══════════════════════════════════════════

API Endpoint:
• Production: https://au-live-api.mytodoo.com/api
• All features are fully functional
• Real-time data from production database

Firebase Integration:
• Project: mytodoo-e4cdb (LIVE)
• Google Sign-In configured and working
• Push notifications configured
• Real-time chat database active

Supported Devices:
• iPhone iOS 15.1+
• iPad iOS 15.1+
• Optimized for all screen sizes

═══════════════════════════════════════════
5️⃣ PERMISSIONS REQUIRED
═══════════════════════════════════════════

The app will request these permissions:
• 📷 Camera - For taking task photos
• 🖼️ Photo Library - For uploading images
• 📍 Location - For nearby task discovery (optional)
• 🔔 Notifications - For task updates and messages

All permissions include proper usage descriptions explaining why they're needed.

═══════════════════════════════════════════
6️⃣ SAMPLE DATA
═══════════════════════════════════════════

The reviewer account has been pre-populated with:
• 3 sample tasks posted
• 2 active conversations in Messages
• Completed profile with photo
• Sample transaction history
• Test reviews and ratings

═══════════════════════════════════════════
7️⃣ KNOWN BEHAVIORS (NOT BUGS)
═══════════════════════════════════════════

• First launch requires internet connection
• Location features are optional - app works without
• Some tasks may show "Sydney" as default location
• Chat messages sync in real-time (may see test data)
• Payment flows use Stripe test mode during review

═══════════════════════════════════════════
📞 CONTACT FOR ISSUES
═══════════════════════════════════════════

If you encounter ANY issues during review:
• Email: support@mytodoo.com
• We respond within 2-4 hours during business hours
• Australian Eastern Standard Time (AEST)

We're happy to provide additional information or assistance!

═══════════════════════════════════════════

Thank you for reviewing MyToDoo! We've worked hard to create a polished, functional app that complies with all App Store guidelines.

- The MyToDoo Team
```

**Character limit:** 4000 characters  
**This text:** ~3,200 characters ✅

**Why this matters:**
- Helps reviewers test efficiently
- Reduces rejection risk
- Shows professionalism
- Explains any unusual behaviors

---

### **Contact Information Section:**

#### 5️⃣ **First Name**
```
[Your First Name]
```
Example: `Janidu`

---

#### 6️⃣ **Last Name**
```
[Your Last Name]
```
Example: `Silva`

---

#### 7️⃣ **Phone Number**
**Format:** Include country code

```
+61 XXX XXX XXX
```

**⚠️ IMPORTANT:** 
- Use YOUR actual phone number
- Apple may call if they need clarification
- Must be reachable during review period
- Include country code for Australia: `+61`

---

#### 8️⃣ **Email**
**Format:** Professional email address

```
support@mytodoo.com
```

**Or your personal email:**
```
[your.email]@gmail.com
```

**⚠️ IMPORTANT:**
- Check this email DAILY during review
- Apple may email questions
- Respond within 24 hours or risk rejection

---

### **Attachment Section:**

#### 9️⃣ **Attachment** (Optional)
**What it is:** Upload additional files to help reviewers (demo video, special instructions, etc.)

**For MyToDoo:**
- ✅ **Optional** - Skip for now
- Can add demo video showing app features
- Can add document with special test scenarios

**If you want to add:**
1. Create short demo video (2-3 minutes)
2. Show login, browse, create task, chat
3. Export as MP4
4. Click "Choose File"
5. Upload video

---

## 📝 Additional Required Sections (Not in Screenshots)

### **App Screenshots** (REQUIRED!)

**You MUST provide screenshots for:**

#### iPhone 6.7" Display (iPhone 15 Pro Max)
- **Size:** 1290 x 2796 pixels
- **Count:** Minimum 2, maximum 10
- **Required:** YES

**What to capture:**
1. Welcome/Login screen
2. Browse Tasks screen
3. Task Detail screen
4. Create Task screen
5. Chat/Messages screen
6. Profile screen

**How to create:**

**Method 1: iOS Simulator**
```bash
# Open Xcode
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
open ios/MyToDoo.xcworkspace

# In Xcode:
# 1. Select iPhone 15 Pro Max simulator
# 2. Press Cmd+R to run app
# 3. Navigate to each screen
# 4. Press Cmd+S to save screenshot
# 5. Screenshots saved to Desktop
```

**Method 2: Real Device**
1. Run app on iPhone
2. Navigate to screen
3. Press Power + Volume Up
4. Screenshot saved to Photos
5. AirDrop to Mac

**Screenshot Guidelines:**
- ✅ Show actual app content (no mockups)
- ✅ Remove test/debug data
- ✅ Use realistic sample data
- ✅ High quality (no blur)
- ✅ Correct orientation (portrait)
- ❌ No status bar if possible (simulator)
- ❌ No placeholder text like "Lorem ipsum"
- ❌ No profanity or inappropriate content

**Tip:** First screenshot is MOST important - users see it in search results!

---

### **App Privacy** (REQUIRED!)

**Location:** App Store Connect → App Privacy

**You MUST answer questions about:**

1. **Do you collect data?** YES

2. **What data types?**
   - ✅ Contact Info (Name, Email)
   - ✅ User Content (Photos, Messages)
   - ✅ Identifiers (User ID)
   - ✅ Location (Precise Location)
   - ✅ Usage Data (Product Interaction)

3. **For each data type, specify:**
   - **Purpose:** "App Functionality" / "Analytics" / etc.
   - **Linked to user:** YES (can identify the user)
   - **Used for tracking:** NO (not for ads)

**Example for Email Address:**
- Data Type: Email Address
- Purpose: App Functionality (for account creation)
- Linked to User: Yes
- Used for Tracking: No

**Complete all privacy questions before submission!**

---

### **Age Rating** (REQUIRED!)

**Location:** App Store Connect → App Information → Age Rating

**Answer Apple's questionnaire:**

For MyToDoo, likely answers:
- Cartoon/Fantasy Violence: None
- Realistic Violence: None
- Sexual Content: None
- Profanity or Crude Humor: None
- Alcohol/Tobacco/Drugs: None
- Mature/Suggestive Themes: None
- Horror/Fear Themes: None
- Gambling: None
- Unrestricted Web Access: No
- User Generated Content: Yes (task descriptions, chat)

**Result:** Likely **4+** or **12+** rating

**Choose 12+ if:**
- Users can communicate with each other (chat)
- Users can share content publicly

---

## 🔄 How Updates Work: TestFlight vs Production

### **TestFlight (Internal/External Testing)**

**Purpose:** Test builds before public release

**How it works:**
1. Upload build to App Store Connect
2. Build processes (15-60 minutes)
3. First TestFlight build needs Apple review (24-48 hours)
4. After first approval, new builds appear instantly
5. Invite testers via email
6. Testers download via TestFlight app
7. Testers get updates automatically

**TestFlight Update Process:**
```
You upload build → Processing (1 hour) → Testers can download
                     ↓
              (First build only: 24h review)
```

**Key Points:**
- ✅ Updates are FAST (instant after first)
- ✅ Only testers with links can access
- ✅ Can have up to 10,000 external testers
- ✅ Can test for 90 days per build
- ❌ NOT visible on public App Store
- ❌ Requires TestFlight app

---

### **Production (Public App Store)**

**Purpose:** Public release to all users

**How it works:**
1. Select TestFlight build in App Store page
2. Fill all metadata (descriptions, screenshots)
3. Submit for App Review
4. Apple reviews (2-5 days first time, 1-3 days for updates)
5. If approved, app goes live
6. Users download from App Store
7. Updates follow same review process

**Production Update Process:**
```
Upload build → Select in App Store → Submit for Review → Review (2-5 days) → Goes Live
```

**Key Points:**
- ✅ Visible to ALL App Store users worldwide
- ✅ Searchable in App Store
- ✅ Users get updates via App Store
- ❌ MUST go through review each time
- ❌ Review takes 2-5 days
- ❌ Can be rejected if issues found

---

### **Comparison Table:**

| Feature | TestFlight | Production |
|---------|-----------|------------|
| **Visibility** | Only invited testers | Public worldwide |
| **Review Time** | First: 24-48h, Then: Instant | Every time: 2-5 days |
| **Access Method** | TestFlight app + invite | App Store (public) |
| **Max Testers** | 10,000 external | Unlimited (all users) |
| **Update Speed** | Instant (after first) | 2-5 days review |
| **Rejection Risk** | Low (after first) | Medium |
| **Expiry** | 90 days per build | No expiry |
| **Suitable For** | Beta testing, QA | Public release |

---

### **Your Question: "When TestFlight apps are updated, will production update too?"**

**Answer:** **NO! They are completely separate!**

**Example Scenario:**
```
Day 1: You upload build 1.0.0 (1)
Day 2: Build appears in TestFlight ✅
Day 3: You submit build to App Review for PRODUCTION
Day 5: App Review approves → Live on App Store ✅

Day 10: You fix a bug, upload build 1.0.0 (2)
Day 10: Build appears in TestFlight instantly ✅
        But PRODUCTION still shows old build (1)! ⚠️
        
To update production:
Day 10: Select build (2) in App Store Connect
Day 10: Submit for review again
Day 13: Review approves → Production updated ✅
```

**Key Takeaway:**
- TestFlight = Fast updates for testing
- Production = Slow updates (needs review) for public
- They don't auto-sync - you must submit production separately!

---

## ✅ Pre-Submission Checklist

Before clicking "Submit for Review", verify:

### **Metadata Complete:**
- [ ] Promotional text written (170 chars)
- [ ] Description written (up to 4000 chars)
- [ ] Keywords entered (100 chars)
- [ ] Support URL is live and working
- [ ] Copyright year and name correct
- [ ] App icon uploaded (1024x1024 PNG)

### **Screenshots Ready:**
- [ ] iPhone 6.7" screenshots (min 2, max 10)
- [ ] All screenshots show real app content
- [ ] No test/placeholder data visible
- [ ] High quality, no blur

### **Build Selected:**
- [ ] Build uploaded and processed
- [ ] Build selected in App Store version
- [ ] Build number unique and correct

### **App Review Info:**
- [ ] Test account created: appreviewer@mytodoo.com
- [ ] Test account password set: AppReview2026!
- [ ] Test account has sample data
- [ ] Test account login verified working
- [ ] Detailed notes provided for reviewers
- [ ] Contact info (name, email, phone) entered

### **App Privacy:**
- [ ] All privacy questions answered
- [ ] Data collection types specified
- [ ] Purposes clearly stated

### **App Information:**
- [ ] Age rating completed
- [ ] Category selected (Productivity)
- [ ] Privacy Policy URL added and working
- [ ] Terms of Service URL added and working

### **Technical:**
- [ ] App builds without errors
- [ ] No crashes on launch
- [ ] All features working
- [ ] API endpoint is production
- [ ] Firebase is LIVE project
- [ ] Push notifications configured
- [ ] All permissions have usage descriptions

---

## 🚀 Ready to Submit!

### **Final Steps:**

1. **Review Everything:**
   - Read through all metadata
   - Check screenshots look good
   - Verify URLs work
   - Test demo account

2. **Click "Save":**
   - Top right of App Store Connect page
   - Saves your metadata

3. **Click "Add for Review":**
   - App status changes to "Waiting for Review"
   - You'll receive email confirmation

4. **Wait for Review:**
   - Typical: 2-5 days
   - Check email daily
   - Monitor App Store Connect

5. **Respond Quickly:**
   - If Apple emails questions, respond within 24 hours
   - Be professional and helpful

---

## 📞 Support Contacts

**If You Need Help:**

**Apple Developer Support:**
- Website: https://developer.apple.com/support/
- Phone: Available in your developer account
- Email: Through support portal

**App Store Connect Help:**
- In-app help: Click "?" icon in App Store Connect
- Documentation: https://help.apple.com/app-store-connect/

**Community:**
- Apple Developer Forums: https://developer.apple.com/forums/
- Stack Overflow: Tag with `app-store-connect`

---

## ❓ Common Questions

### **Q: How long does review take?**
**A:** 2-5 days for first submission, 1-3 days for updates. Can be faster or slower.

### **Q: Can I change metadata during review?**
**A:** NO! Changes during review can cause rejection. Wait until approved or rejected.

### **Q: What if I get rejected?**
**A:** Read the rejection reason, fix the issue, increment build number, resubmit. See main guide for details.

### **Q: Can I test my app before it goes live?**
**A:** YES! Use TestFlight for beta testing before public release.

### **Q: How do I update my live app?**
**A:** Create new build, increment version (1.0.1), upload, submit for review again.

### **Q: Do I need a website?**
**A:** Technically no, but highly recommended. At minimum need Privacy Policy URL.

### **Q: Can I change app name after submission?**
**A:** Yes, you can change the display name in future updates, but bundle ID cannot change.

### **Q: What happens if users find a bug after launch?**
**A:** Fix the bug, upload new build, submit as expedited review if critical.

---

## 🎉 You're Ready!

You now have all the information to fill out your App Store Connect submission forms correctly!

### **Remember:**
1. Take your time filling out forms
2. Double-check all information
3. Test your demo account thoroughly
4. Be detailed in reviewer notes
5. Respond quickly to any Apple communication

### **Good luck with your submission! 🚀**

---

**Questions?** Re-read this guide or check the main [APP_STORE_SUBMISSION_GUIDE.md](./APP_STORE_SUBMISSION_GUIDE.md)
