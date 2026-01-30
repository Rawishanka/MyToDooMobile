# 🔔 FCM Push Notifications Testing Guide - Xcode
## Complete Testing Guide for MyToDoo iOS App

> **Created**: January 26, 2026  
> **App**: MyToDoo  
> **Firebase Project**: mytodoo-e4cdb (LIVE)  
> **Bundle ID**: com.mytodoo.mytodoolive

---

## 📑 Table of Contents

1. [Understanding FCM in Your App](#understanding-fcm-in-your-app)
2. [Prerequisites](#prerequisites)
3. [Testing in Xcode - Step by Step](#testing-in-xcode-step-by-step)
4. [Test Scenario 1: Foreground Notifications](#test-scenario-1-foreground-notifications-app-open)
5. [Test Scenario 2: Background Notifications](#test-scenario-2-background-notifications-app-minimized)
6. [Test Scenario 3: Quit State Notifications](#test-scenario-3-quit-state-notifications-app-closed)
7. [API Calls Verification](#api-calls-verification)
8. [Troubleshooting](#troubleshooting)
9. [Quick Reference](#quick-reference)

---

## 🎯 Understanding FCM in Your App

### How FCM is Configured in MyToDoo

Your app uses **React Native Firebase** for push notifications:

**Firebase Configuration**:
- **Project**: `mytodoo-e4cdb` (LIVE production project)
- **GCM Sender ID**: `685356682007`
- **Bundle ID**: `com.mytodoo.mytodoolive`
- **Config File**: [GoogleService-Info.plist](../GoogleService-Info.plist)

**Key Implementation Files**:
1. **[index.js](../index.js)** - Background handler registration (runs FIRST)
2. **[src/services/notification-service.ts](../src/services/notification-service.ts)** - FCM service logic
3. **[src/config/firebase.ts](../src/config/firebase.ts)** - Firebase initialization
4. **[app/_layout.tsx](../app/_layout.tsx)** - FCM initialization on app start

### Three Notification States

Your app handles notifications in **3 different states**:

| State | Description | Handler | Display |
|-------|-------------|---------|---------|
| **Foreground** | App is open and active | `messaging().onMessage()` | Local notification shown |
| **Background** | App minimized but running | `messaging().onNotificationOpenedApp()` | System notification |
| **Quit/Closed** | App completely closed | `messaging().getInitialNotification()` | System notification |

**Background Handler** ([index.js](../index.js)):
```javascript
// Registered BEFORE app starts - handles notifications when app is closed
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 [Background Handler] Message received');
  // Processes notification even when app is killed
});
```

---

## ✅ Prerequisites

Before testing, ensure you have:

### Required Setup
- [ ] **Physical iOS Device** (iPhone/iPad)
  - ⚠️ Simulators do NOT support push notifications
  - Must be iOS 15.1 or later
- [ ] **Apple Developer Account** with active membership
- [ ] **Xcode** 15.2+ installed on Mac
- [ ] **USB Cable** to connect device to Mac

### App Configuration
- [ ] **Firebase** project is LIVE (mytodoo-e4cdb) ✅
- [ ] **GoogleService-Info.plist** is in project root ✅
- [ ] **Bundle ID** matches Firebase: com.mytodoo.mytodoolive ✅
- [ ] **API endpoint** uses production: https://api.mytodoo.com/api ✅

### Development Certificates
- [ ] **Apple Push Notification Service (APNs) Certificate** uploaded to Firebase
- [ ] **Provisioning Profile** includes Push Notifications capability
- [ ] **Device registered** in Apple Developer Portal

---

## 🚀 Testing in Xcode - Step by Step

### Step 1: Open Project in Xcode

```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
open MyToDoo.xcworkspace
```

**⚠️ IMPORTANT**: Always open `.xcworkspace`, NOT `.xcodeproj`

---

### Step 2: Connect Physical Device

1. **Connect** your iPhone/iPad via USB cable
2. **Unlock** the device
3. **Trust** this computer (if prompted on device)

**In Xcode**:
- Device should appear in toolbar (e.g., "Jane's iPhone")
- If "Unavailable" shown, wait for processing or check cable

---

### Step 3: Configure Signing

1. **Select**: MyToDoo project in Xcode navigator
2. **Select**: MyToDoo target
3. **Go to**: Signing & Capabilities tab
4. **Set**:
   - **Team**: Your Apple Developer team
   - **Signing Certificate**: Apple Development (for testing)
   - **Provisioning Profile**: Automatic or select development profile

**Verify Capabilities**:
- ✅ Push Notifications (should be listed)
- ✅ Background Modes → Remote notifications

**If "Push Notifications" missing**:
1. Click "+" Capability
2. Search "Push Notifications"
3. Add it

---

### Step 4: Clean Build

**Before running, clean everything**:

1. **In Xcode**: Product → Clean Build Folder (Shift + Cmd + K)
2. **Optional - Deep Clean**:
   ```bash
   cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios
   rm -rf ~/Library/Developer/Xcode/DerivedData/MyToDoo-*
   pod install
   ```

---

### Step 5: Build and Run on Device

1. **Select** your physical device from Xcode toolbar
2. **Click** Run button (▶️) or press Cmd + R
3. **Wait** for build to complete (2-5 minutes first time)
4. **On device**: Trust developer if prompted
   - Settings → General → VPN & Device Management
   - Trust your Apple Developer account

**✅ Success**: App launches on your device

---

### Step 6: Enable Notification Permissions

**When app launches**:

1. **Permission Dialog** appears: "MyToDoo Would Like to Send You Notifications"
2. **Click**: "Allow"
3. **Verify**: Permission granted

**In Xcode Console**, you should see:
```
📱 Requesting notification permissions...
✅ Firebase permission status: authorized
🔑 Getting push notification token...
✅ FCM token obtained (Firebase): ey...
📝 Registering push token with backend...
✅ Push token registered with backend
```

---

### Step 7: Monitor Xcode Console

**Open Console** (if not visible):
- View → Debug Area → Show Debug Area (Cmd + Shift + Y)

**Look for these logs** when app starts:

```
🔥 React Native Firebase initialized (Native Build)
✅ React Native Firebase FCM loaded successfully
📱 ========== PUSH NOTIFICATIONS STATUS ==========
✅ Initialized: true
📝 Token Registered: true
🔔 Permission Granted: true
❌ Error: None
==================================================
```

**Copy FCM Token**: Look for line starting with "✅ FCM token obtained"
- Token looks like: `eyJhbGciOiJIUz...` (very long string)
- Save this for testing

---

## 📬 Test Scenario 1: Foreground Notifications (App Open)

### What This Tests
- Notifications received while app is actively being used
- Local notification display on iOS
- Real-time cache invalidation

### Step-by-Step Testing

#### 1. Keep App Open & Active

- App should be on screen
- Device unlocked
- Do NOT minimize or switch apps

#### 2. Send Test Notification

**Method A: Using Firebase Console**

1. **Go to**: https://console.firebase.google.com
2. **Select**: mytodoo-e4cdb project
3. **Click**: Engage → Messaging (left sidebar)
4. **Click**: "Create your first campaign" or "New campaign"
5. **Select**: "Firebase Notification messages"
6. **Fill in**:
   - **Notification title**: "Test Foreground"
   - **Notification text**: "This is a foreground test message"
7. **Click**: "Next"
8. **Target**:
   - **App**: com.mytodoo.mytodoolive (iOS)
   - **User segment**: All users
   - Or **Single device**: Paste your FCM token
9. **Click**: "Next"
10. **Schedule**: Now
11. **Click**: "Review" → "Publish"

**Method B: Using Backend API** (if you have access)

```bash
# Use your backend's test notification endpoint
curl -X POST https://api.mytodoo.com/api/notifications/test-fcm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Foreground",
    "body": "This is a foreground test",
    "type": "NEW_TASK"
  }'
```

#### 3. Verify Notification Received

**Expected Behavior**:

1. **In Xcode Console**:
   ```
   🔔 [Foreground] Notification received:
   {
     title: "Test Foreground",
     body: "This is a foreground test message",
     data: {...}
   }
   ✅ Foreground notification displayed on Android
   🔄 [Real-time Sync] Invalidating caches for notification type: NEW_TASK
   ```

2. **On Device**:
   - Local notification banner appears at top
   - Notification sound plays
   - If on Browse Tasks screen, tasks list refreshes

3. **Notification Storage**:
   - Saved to AsyncStorage automatically
   - Can be viewed in notification history

**✅ Test Passed If**:
- Console shows notification received
- Local notification displayed
- Cache invalidation triggered
- App doesn't crash

---

## 🔄 Test Scenario 2: Background Notifications (App Minimized)

### What This Tests
- Notifications received when app is in background
- Notification tap opens app
- Data refresh when app opens from notification

### Step-by-Step Testing

#### 1. Minimize App

- **Press** Home button (or swipe up on newer iPhones)
- App goes to background but stays running
- Device can be locked or unlocked

#### 2. Send Test Notification

**Use same method as Foreground test**, but change:
- **Title**: "Test Background"
- **Body**: "Tap this to open MyToDoo"
- **Data** (optional): `{ "type": "NEW_OFFER", "taskId": "123" }`

#### 3. Verify Notification Received

**Expected Behavior**:

1. **On Device Lock Screen/Notification Center**:
   - System notification appears
   - Shows app icon, title, and body
   - Notification sound plays

2. **Tap Notification**:
   - App opens/comes to foreground
   - **In Xcode Console**:
     ```
     🔔 [Background] Notification tapped:
     {
       title: "Test Background",
       body: "Tap this to open MyToDoo",
       data: { type: "NEW_OFFER", taskId: "123" }
     }
     🔄 [Real-time Sync] Invalidating caches for notification type: NEW_OFFER
     ✅ Invalidated offers and tasks cache
     ```

3. **App Behavior**:
   - App navigates to appropriate screen (if deep link configured)
   - Relevant data refreshes (offers list, task details)
   - Badge count updates

**✅ Test Passed If**:
- Notification appears in notification center
- Tapping opens app
- Console shows notification tap event
- Cache invalidation triggered
- App doesn't crash

---

## 🛑 Test Scenario 3: Quit State Notifications (App Closed)

### What This Tests
- Notifications received when app is completely closed
- Background handler processes notification
- App launches from notification tap

### Step-by-Step Testing

#### 1. Force Quit App

**On iPhone**:
1. **Swipe up** from bottom (or double-click Home button)
2. **Find** MyToDoo in app switcher
3. **Swipe up** on MyToDoo to force quit
4. **Verify**: App is completely closed (not in app switcher)

**In Xcode**: Red stop button should be available (app not running)

#### 2. Send Test Notification

**Use same method as before**, but change:
- **Title**: "Test Quit State"
- **Body**: "App was closed - tap to launch"
- **Data**: `{ "type": "NEW_MESSAGE", "chatId": "abc" }`

#### 3. Verify Notification Received

**Expected Behavior**:

1. **On Device**:
   - System notification appears even though app is closed
   - Shows on lock screen and notification center
   - Notification sound plays
   - Badge count appears on app icon

2. **Background Handler** (check later in logs):
   ```
   🔔 [Background Handler] Message received:
   {
     title: "Test Quit State",
     body: "App was closed - tap to launch",
     data: { type: "NEW_MESSAGE", chatId: "abc" },
     type: "NEW_MESSAGE"
   }
   ```

3. **Tap Notification**:
   - App launches from scratch
   - **In Xcode Console** (after app launches):
     ```
     ✅ [FCM] Background message handler registered
     🔔 [Quit State] Notification tapped:
     {
       title: "Test Quit State",
       body: "App was closed - tap to launch"
     }
     🔄 [Real-time Sync] Invalidating caches for notification type: NEW_MESSAGE
     ```

4. **App Behavior**:
   - App launches to appropriate screen
   - Chat messages list refreshes
   - Notification marked as read

**✅ Test Passed If**:
- Notification delivered while app closed
- Background handler logged message
- Tapping launches app
- App initializes properly from notification
- Data refreshes correctly

---

## 🔌 API Calls Verification

### Testing API Integration

Your app uses production API: **https://api.mytodoo.com/api**

#### Verify API Configuration

**Check [src/api/config.ts](../src/api/config.ts)**:

```typescript
✅ BASE_URL: "https://api.mytodoo.com/api"
✅ USE_MOCK_ONLY: false (using real API)
✅ DEVELOPMENT_MODE: false
```

**In Xcode Console on app start**:
```
🔧 API Configuration Loaded:
  baseUrl: https://api.mytodoo.com/api
  useMockOnly: false
  timeout: 30000
```

---

### Test API Endpoints

#### 1. Authentication API

**Test Login**:
1. Open app
2. Click "Sign In"
3. Enter credentials:
   - Email: `test@mytodoo.com`
   - Password: `Test123!`
4. Click "Sign In"

**Check Console**:
```
🔐 Attempting login with email: test@mytodoo.com
🌐 POST https://api.mytodoo.com/api/auth/login
✅ Login successful
📝 Token saved to AsyncStorage
```

**Verify**:
- ✅ POST request to `/auth/login`
- ✅ Token received and saved
- ✅ User redirected to dashboard

---

#### 2. Tasks API

**Test Browse Tasks**:
1. Navigate to "Browse" tab
2. Pull to refresh

**Check Console**:
```
🌐 Fetching tasks from API...
🌐 GET https://api.mytodoo.com/api/tasks
✅ Tasks loaded: 25 tasks
🔄 Cache updated
```

**Verify**:
- ✅ GET request to `/tasks`
- ✅ Tasks displayed in UI
- ✅ Images load correctly
- ✅ Pagination works

---

#### 3. Chat API (Firebase + Backend)

**Test Chat Messages**:
1. Go to "Messages" tab
2. Select a conversation
3. Send a message

**Check Console**:
```
💬 Sending message via Firebase...
✅ Message sent to Firestore
🌐 POST https://api.mytodoo.com/api/ChatApp/messages
✅ Message synced to backend
```

**Verify**:
- ✅ Message sent to Firebase Firestore
- ✅ Message appears immediately (real-time)
- ✅ Backend synced
- ✅ Recipient receives push notification

---

#### 4. FCM Token Registration API

**Test Token Registration**:
1. Grant notification permissions
2. Wait for token registration

**Check Console**:
```
🔑 Getting push notification token...
✅ FCM token obtained: eyJhbG...
📝 Registering push token with backend...
🌐 POST https://api.mytodoo.com/api/fcm-tokens
✅ Push token registered with backend: { totalDevices: 1 }
```

**Verify**:
- ✅ FCM token retrieved from Firebase
- ✅ POST request to `/fcm-tokens`
- ✅ Token saved to backend database
- ✅ User can now receive push notifications

---

#### 5. Offers API

**Test Make Offer**:
1. Browse tasks
2. Open task detail
3. Click "Make Offer"
4. Submit offer

**Check Console**:
```
💼 Creating offer...
🌐 POST https://api.mytodoo.com/api/offers
✅ Offer created successfully
📱 Push notification sent to task owner
```

**Verify**:
- ✅ POST request to `/offers`
- ✅ Offer saved to database
- ✅ Task owner receives notification
- ✅ Offer appears in user's "My Offers"

---

#### 6. Payment API (Stripe)

**Test Payment Flow**:
1. Accept an offer
2. Proceed to payment
3. Enter Stripe test card: `4242 4242 4242 4242`
4. Complete payment

**Check Console**:
```
💳 Initializing Stripe payment...
🌐 POST https://api.mytodoo.com/api/payments/create-payment-intent
✅ Payment intent created: pi_xxxxx
💳 Processing payment with Stripe...
✅ Payment successful
🌐 POST https://api.mytodoo.com/api/payments/confirm
✅ Payment confirmed on backend
```

**Verify**:
- ✅ Payment intent created via backend
- ✅ Stripe processes payment
- ✅ Backend confirms payment
- ✅ Task status updated
- ✅ Funds escrowed correctly

---

### API Error Handling

**Test Offline Mode**:
1. Enable Airplane Mode on device
2. Try to browse tasks

**Check Console**:
```
❌ Network Error: Unable to reach server
⚠️ Using cached data
📱 Displaying offline message to user
```

**Verify**:
- ✅ Error caught gracefully
- ✅ Cached data displayed
- ✅ User sees offline indicator
- ✅ App doesn't crash

---

## 🔧 Troubleshooting

### Notifications Not Appearing

**Problem**: No notifications received in any state

**Solutions**:

1. **Check Device Permissions**:
   - Settings → MyToDoo → Notifications
   - Ensure "Allow Notifications" is ON

2. **Verify FCM Token**:
   ```
   In Xcode Console:
   ✅ FCM token obtained: eyJhbG...
   
   If you see:
   ❌ Failed to get push token
   → Check GoogleService-Info.plist is in project
   → Verify Bundle ID matches Firebase project
   ```

3. **Check Firebase Console**:
   - Go to https://console.firebase.google.com
   - Select mytodoo-e4cdb
   - Cloud Messaging → Check "Sent" count increases

4. **Verify APNs Certificate**:
   - Firebase Console → Project Settings → Cloud Messaging
   - iOS app configuration → APNs Certificates
   - Should show valid certificate (not expired)

5. **Check Capabilities**:
   - Xcode → Target → Signing & Capabilities
   - Push Notifications should be listed
   - Background Modes → Remote notifications enabled

---

### Foreground Notifications Not Showing

**Problem**: Notifications work in background but not foreground

**Check**:

1. **Foreground Handler** ([src/services/notification-service.ts](../src/services/notification-service.ts#L408)):
   ```typescript
   messaging().onMessage(async (remoteMessage) => {
     // Should log notification
     console.log('🔔 [Foreground] Notification received');
     // Should display local notification
   });
   ```

2. **Verify expo-notifications** installed:
   ```bash
   npx expo install expo-notifications
   ```

3. **Check Console** for errors:
   ```
   ❌ Error displaying foreground notification: ...
   ```

---

### Background Handler Not Running

**Problem**: Notifications not processed when app is closed

**Solutions**:

1. **Verify Background Handler** in [index.js](../index.js):
   ```javascript
   // MUST be at top level, before anything else
   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
     console.log('🔔 [Background Handler] Message received');
   });
   ```

2. **Check Android Only**:
   - Background handler is Android-only
   - iOS handles background notifications via APNs automatically

3. **Rebuild App**:
   ```bash
   # Clean and rebuild
   cd ios
   rm -rf build
   xcodebuild clean -workspace MyToDoo.xcworkspace -scheme MyToDoo
   # Run again from Xcode
   ```

---

### API Calls Failing

**Problem**: API requests not reaching backend

**Check**:

1. **API URL**:
   ```typescript
   // Should be production, not localhost
   ✅ https://api.mytodoo.com/api
   ❌ http://localhost:3000/api
   ```

2. **Network Connectivity**:
   ```
   In Console:
   ❌ Network Error: Unable to reach server
   
   Solution:
   - Check device internet connection
   - Verify backend server is running
   - Test API in browser: https://api.mytodoo.com/api/health
   ```

3. **Authentication Token**:
   ```
   In Console:
   ❌ 401 Unauthorized
   
   Solution:
   - Re-login to get fresh token
   - Check token stored in AsyncStorage
   - Verify token not expired
   ```

4. **CORS Issues** (if using web):
   ```
   - Only affects web version
   - Native apps don't have CORS restrictions
   ```

---

### Console Logs Not Showing

**Problem**: No logs in Xcode console

**Solutions**:

1. **Enable Console**:
   - View → Debug Area → Show Debug Area (Cmd + Shift + Y)
   - Or click console icon in toolbar

2. **Clear Console**:
   - Click trash icon in console
   - Or click gear icon → Clear Console

3. **Filter Logs**:
   - Use search bar in console
   - Search for: `FCM`, `notification`, `API`
   - Or filter by level: All Messages, Errors Only, etc.

4. **Check Device Logs**:
   - Window → Devices and Simulators
   - Select your device
   - Click "Open Console" button

---

## 📋 Quick Reference

### Essential Console Search Terms

When testing, search console for these terms:

| Search Term | What It Shows |
|-------------|---------------|
| `FCM` | All Firebase Cloud Messaging logs |
| `notification` | Notification-related logs |
| `🔔` | Notification received events |
| `API` | API call logs |
| `✅` | Success messages |
| `❌` | Error messages |
| `🔑` | Token-related logs |
| `[Foreground]` | Foreground notification events |
| `[Background]` | Background notification events |
| `[Quit State]` | Quit state notification events |

---

### Expected Console Flow on App Launch

```
1. Firebase Initialization:
🔥 React Native Firebase initialized (Native Build)
✅ React Native Firebase FCM loaded successfully

2. Permission Request:
📱 Requesting notification permissions...
✅ Firebase permission status: authorized

3. Token Registration:
🔑 Getting push notification token...
✅ FCM token obtained (Firebase): eyJhbG...
📝 Registering push token with backend...
🌐 POST https://api.mytodoo.com/api/fcm-tokens
✅ Push token registered with backend: { totalDevices: 1 }

4. Handler Setup:
🔥 Setting up Firebase FCM handlers...
✅ Firebase notification handlers setup complete

5. Status Report:
📱 ========== PUSH NOTIFICATIONS STATUS ==========
✅ Initialized: true
📝 Token Registered: true
🔔 Permission Granted: true
❌ Error: None
==================================================
```

---

### Quick Test Commands

**Send Test Notification via curl**:
```bash
# Replace with your FCM Server Key from Firebase Console
SERVER_KEY="YOUR_FIREBASE_SERVER_KEY"
FCM_TOKEN="DEVICE_FCM_TOKEN"

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "'$FCM_TOKEN'",
    "notification": {
      "title": "Test Notification",
      "body": "Testing from curl"
    },
    "data": {
      "type": "NEW_TASK",
      "taskId": "123"
    },
    "priority": "high"
  }'
```

**Check API Health**:
```bash
curl https://api.mytodoo.com/api/health
# Should return: {"status": "ok"}
```

---

### Testing Checklist

Before submitting to App Store, verify:

**FCM Notifications**:
- [ ] Foreground notifications display correctly
- [ ] Background notifications appear in notification center
- [ ] Quit state notifications work when app closed
- [ ] Tapping notifications opens app
- [ ] Notification badge updates
- [ ] Sound plays for notifications
- [ ] Data refresh triggered from notifications

**API Calls**:
- [ ] Login API works (POST /auth/login)
- [ ] Tasks API loads data (GET /tasks)
- [ ] Create task works (POST /tasks)
- [ ] Chat sends messages (Firebase + Backend)
- [ ] FCM token registers (POST /fcm-tokens)
- [ ] Offers API works (POST /offers)
- [ ] Payment API processes transactions
- [ ] Error handling works (offline mode)

**General**:
- [ ] No crashes during testing
- [ ] No memory leaks
- [ ] Smooth performance
- [ ] All screens load correctly
- [ ] Images display properly
- [ ] Network errors handled gracefully

---

## 📞 Support

**Issues or Questions?**
- Check Xcode console first (most errors logged there)
- Review [notification-service.ts](../src/services/notification-service.ts) implementation
- Check [Firebase Console](https://console.firebase.google.com) for delivery status
- Verify [GoogleService-Info.plist](../GoogleService-Info.plist) configuration

**Firebase Resources**:
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [APNs Certificate Setup](https://firebase.google.com/docs/cloud-messaging/ios/certs)

**Apple Resources**:
- [Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [Debugging Push Notifications](https://developer.apple.com/documentation/usernotifications/debugging_notifications)

---

## ✅ Summary

**You have successfully verified**:

1. ✅ **FCM is properly configured** with Firebase project mytodoo-e4cdb
2. ✅ **Notifications work in all 3 states**: Foreground, Background, and Quit
3. ✅ **API calls reach production backend**: https://api.mytodoo.com/api
4. ✅ **Real-time sync** triggers on notification receipt
5. ✅ **Background handler** processes notifications when app is closed

**Your app is ready for App Store submission!** 🚀

---

**Document Version**: 1.0  
**Last Updated**: January 26, 2026  
**Created for**: MyToDoo iOS App v1.0.0  
**Firebase Project**: mytodoo-e4cdb (LIVE)

**Happy Testing! 🎉**
