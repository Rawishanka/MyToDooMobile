# Firebase Cloud Messaging - Mobile vs Web Explained 📱🌐

## 🚨 IMPORTANT: Backend Developer's File is for WEB ONLY!

### What the Backend Developer Created:
```javascript
// firebase-messaging-sw.js - WEB SERVICE WORKER (NOT FOR MOBILE!)
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");
```

**This file is ONLY for:**
- ✅ Web browsers (Chrome, Firefox, Safari)
- ✅ Progressive Web Apps (PWA)
- ✅ Desktop web applications
- ❌ **NOT for React Native mobile apps!**

---

## ✅ Your Mobile App Uses Different Technology

### React Native Firebase (What You're Using):
```typescript
// Mobile App - React Native Firebase
import messaging from '@react-native-firebase/messaging';

// Get FCM token
const token = await messaging().getToken();

// Request permissions
await messaging().requestPermission();

// Listen to notifications
messaging().onMessage(callback);
```

### Key Differences:

| Feature | Web (Service Worker) | Mobile (React Native) |
|---------|---------------------|----------------------|
| **Library** | Firebase JS SDK (web) | `@react-native-firebase/messaging` |
| **Runtime** | Browser service worker | Native iOS/Android |
| **Permissions** | Browser popup | iOS/Android system dialogs |
| **Token Format** | Web FCM token | Mobile FCM token (different!) |
| **Background** | Service worker | Native background handlers |
| **Installation** | CDN scripts | npm package + native config |

---

## 🔍 Current Status of Your Mobile App

### ✅ What's Already Correct:

1. **Firebase Config** (`src/config/firebase.ts`):
   ```typescript
   const firebaseConfig = {
     apiKey: "AIzaSyACCrN_zK5NKUUM7GtZulp4Sy53ewb495M",
     projectId: "mytodoo-40c87",
     messagingSenderId: "697863453994",
     appId: "1:697863453994:web:648f36d94e17641e853253"
   };
   ```
   ✅ Correct Firebase project credentials

2. **React Native Firebase Installed**:
   ```json
   {
     "@react-native-firebase/app": "^23.5.0",
     "@react-native-firebase/messaging": "^23.5.0"
   }
   ```
   ✅ Correct mobile packages

3. **FCM Service** (`src/services/firebase-messaging.ts`):
   - ✅ Request permissions
   - ✅ Get FCM token
   - ✅ Register token with backend
   - ✅ Handle foreground notifications
   - ✅ Handle background notifications
   - ✅ Token refresh handling

4. **FCM API** (`src/api/fcm-api.ts`):
   - ✅ Save token: `POST /users/fcm-token`
   - ✅ Remove token: `DELETE /users/fcm-token`
   - ✅ Get tokens: `GET /users/fcm-tokens`
   - ✅ Remove all: `DELETE /users/fcm-tokens/all`

5. **FCM Hooks** (`src/shared/hooks/`):
   - ✅ `useInitializeFCM()` - Initialization hook
   - ✅ `useFCM()` - Token management hooks

### ❌ What's Missing:

**FCM is NOT initialized in the app!**

The `useInitializeFCM()` hook is NOT being called in `app/_layout.tsx`, so FCM never starts!

---

## 🔧 How to Fix: Initialize FCM in Your App

### Step 1: Add FCM Initialization to `app/_layout.tsx`

```typescript
// app/_layout.tsx
import { useInitializeFCM } from '@/src/shared/hooks/useInitializeFCM';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // 🔥 ADD THIS: Initialize Firebase Cloud Messaging
  const fcmStatus = useInitializeFCM();
  
  useEffect(() => {
    if (fcmStatus.isInitialized) {
      console.log('✅ FCM Initialized:', {
        registered: fcmStatus.isRegistered,
        hasPermission: fcmStatus.hasPermission,
        error: fcmStatus.error
      });
    }
  }, [fcmStatus]);
  
  // ... rest of your code
}
```

### Step 2: That's It!

Once you add the hook, FCM will automatically:
1. ✅ Request notification permissions (iOS)
2. ✅ Get FCM token from Firebase
3. ✅ Register token with your backend
4. ✅ Set up notification handlers
5. ✅ Handle token refresh

---

## 📊 How FCM Token Flow Works (Mobile)

### 1. App Starts:
```
User Opens App
  ↓
useInitializeFCM() hook runs
  ↓
Request Permissions (iOS)
  ↓
Get FCM Token from Firebase
  ↓
Send Token to Backend (POST /users/fcm-token)
  ↓
Backend stores: { userId, token, device: "android", deviceId: "..." }
```

### 2. Backend Sends Notification:
```
Backend wants to notify user
  ↓
Fetch user's FCM tokens from database
  ↓
Send notification to Firebase FCM API
  ↓
Firebase delivers to user's device
  ↓
App receives notification
  ↓
Display in-app (foreground) or system tray (background)
```

### 3. Token Refresh (Automatic):
```
Firebase generates new token
  ↓
messaging().onTokenRefresh() fires
  ↓
App sends new token to backend
  ↓
Backend updates token in database
```

---

## 🔑 Understanding FCM Tokens

### What is an FCM Token?
```
Example Mobile FCM Token:
"dXbK9fZqQR2Y8MxN6P3H7L9F:APA91bF2x7Y3cZ4d1E8fG9h0i2J3k4L5m6N7o8P9q0R1s2T3u4V5w6X7y8Z9a0B1c2D3e4F5g6H7i8J9k0L1m2N3o4P5q6R7s8T9u0V1w2X3y4Z5"

This token:
- ✅ Uniquely identifies THIS device
- ✅ Allows Firebase to deliver notifications
- ✅ Changes when app is reinstalled
- ✅ Expires after ~2 months of inactivity
- ✅ Different for iOS vs Android vs Web
```

### Token Storage (Backend):
```javascript
// MongoDB example
{
  userId: "user-123",
  fcmTokens: [
    {
      token: "dXbK9fZ...",  // The actual FCM token
      device: "android",    // Platform
      deviceId: "android-install-xyz",
      createdAt: "2025-12-07T10:00:00Z",
      lastUsed: "2025-12-07T11:00:00Z"
    },
    {
      token: "eYcL0gA...",  // User's iPhone
      device: "ios",
      deviceId: "ios-install-abc",
      createdAt: "2025-12-06T09:00:00Z",
      lastUsed: "2025-12-07T10:30:00Z"
    }
  ]
}
```

---

## 🧪 How to Test FCM

### Test 1: Check if FCM Token is Generated
```bash
# Run your app and check console logs:

# Expected output:
📱 Requesting notification permissions...
✅ Notification permission status: { enabled: true }
🔑 Getting FCM token from Firebase...
✅ FCM token obtained: dXbK9fZqQR2Y8MxN...
📝 Registering FCM token with backend...
✅ FCM token registered: { totalDevices: 1 }
```

### Test 2: Check if Token is Saved in Backend
```bash
# Call the GET endpoint to see stored tokens
curl -X GET "https://api.mytodoo.com/api/users/fcm-tokens" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "success": true,
  "data": {
    "tokens": [
      {
        "token": "dXbK9fZ...",
        "device": "android",
        "deviceId": "android-install-xyz"
      }
    ],
    "totalDevices": 1
  }
}
```

### Test 3: Send Test Notification (Backend)
```javascript
// Backend code to send test notification
const admin = require('firebase-admin');

// Send to specific user
async function sendNotificationToUser(userId, title, body) {
  // Get user's FCM tokens from database
  const user = await User.findById(userId);
  const tokens = user.fcmTokens.map(t => t.token);
  
  // Send notification via Firebase
  const message = {
    notification: {
      title: title,
      body: body
    },
    tokens: tokens
  };
  
  const response = await admin.messaging().sendMulticast(message);
  console.log('Notification sent:', response);
}

// Test it:
sendNotificationToUser(
  'user-123', 
  'Test Notification', 
  'This is a test from backend!'
);
```

### Test 4: Verify App Receives Notification
```bash
# When notification is sent, check app console:

# Foreground (app open):
📬 Foreground notification received: {
  title: "Test Notification",
  body: "This is a test from backend!"
}

# Background (app closed/minimized):
📬 Background notification received: {
  title: "Test Notification",
  body: "This is a test from backend!"
}
# + System notification appears in tray
```

---

## 🔥 Complete FCM Setup Checklist

### Mobile App (Your Side):
- [x] ✅ Install `@react-native-firebase/messaging`
- [x] ✅ Configure Firebase (`src/config/firebase.ts`)
- [x] ✅ Create FCM service (`src/services/firebase-messaging.ts`)
- [x] ✅ Create FCM API (`src/api/fcm-api.ts`)
- [x] ✅ Create FCM hooks (`src/shared/hooks/useInitializeFCM.ts`)
- [x] ✅ Add `google-services.json` (Android)
- [ ] ⚠️ **Initialize FCM in `app/_layout.tsx`** (MISSING!)

### Backend (Backend Developer's Side):
- [ ] Implement `POST /users/fcm-token` endpoint
- [ ] Implement `DELETE /users/fcm-token` endpoint
- [ ] Implement `GET /users/fcm-tokens` endpoint
- [ ] Implement `DELETE /users/fcm-tokens/all` endpoint
- [ ] Install Firebase Admin SDK
- [ ] Configure Firebase service account
- [ ] Create notification sending function
- [ ] Test sending notifications

---

## 📝 Backend Requirements (What Backend Dev Needs)

### 1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin (Backend):
```javascript
// backend/config/firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mytodoo-40c87'
});

module.exports = admin;
```

### 3. Download Service Account Key:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `mytodoo-40c87`
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save as `serviceAccountKey.json` (keep secret!)

### 4. Implement Notification Sending:
```javascript
// backend/services/notification.service.js
const admin = require('../config/firebase-admin');

async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // Get user's FCM tokens from database
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens for user:', userId);
      return;
    }
    
    const tokens = user.fcmTokens.map(t => t.token);
    
    // Create notification message
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      tokens: tokens
    };
    
    // Send via Firebase
    const response = await admin.messaging().sendMulticast(message);
    console.log('Notifications sent:', response.successCount);
    
    // Handle failed tokens (expired/invalid)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      // Remove invalid tokens from database
      await User.updateOne(
        { _id: userId },
        { $pull: { fcmTokens: { token: { $in: failedTokens } } } }
      );
    }
    
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

module.exports = { sendPushNotification };
```

---

## 🎯 Summary

### The Confusion:
- ❌ Backend dev created **web service worker** (for browsers)
- ✅ You need **React Native Firebase** (for mobile apps)
- ❌ These are **completely different** technologies!

### The Solution:
1. **Ignore the web service worker** - it's not for mobile
2. **Add `useInitializeFCM()` to `app/_layout.tsx`** - this starts FCM
3. **Backend implements 4 FCM endpoints** - for token management
4. **Backend sends notifications via Firebase Admin SDK** - server-side

### Current State:
✅ Mobile app FCM code: **100% CORRECT**  
⚠️ Mobile app FCM init: **NOT CALLED** (add to _layout.tsx)  
❌ Backend FCM endpoints: **NOT IMPLEMENTED**  
❌ Backend notification sending: **NOT IMPLEMENTED**  

**Once you add the initialization hook and backend implements the endpoints, FCM will work perfectly!** 🚀
