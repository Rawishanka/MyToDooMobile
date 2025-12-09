# Firebase Architecture - MyToDoo Mobile

## 🏗️ Complete System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     FIREBASE CLOUD (mytodoo-40c87)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Firebase Cloud Messaging (FCM)                          │  │
│  │  - Stores device tokens                                  │  │
│  │  - Routes notifications to devices                       │  │
│  │  - Handles message queuing and delivery                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
         ↑ Tokens                             ↓ Push Notifications
         |                                    |
┌────────┴────────┐                  ┌────────┴────────────────────┐
│  BACKEND SERVER │                  │   MOBILE APP (Android)       │
│  ===============│                  │   ======================     │
│                 │                  │                              │
│ Firebase Admin  │                  │  React Native Firebase SDK   │
│ SDK (Server)    │                  │  ========================    │
│                 │                  │                              │
│ ┌─────────────┐ │                  │  ┌────────────────────────┐ │
│ │FCM Endpoints│ │                  │  │ firebase-messaging.ts  │ │
│ └─────────────┘ │                  │  │ =====================  │ │
│  ├─POST /users/│                  │  │ • getFCMToken()        │ │
│  │  fcm-token  │←─────Token────────│  │ • registerFCMToken()   │ │
│  ├─DELETE      │      Registration │  │ • setupHandlers()      │ │
│  │  /fcm-token │                  │  │ • onMessage()          │ │
│  ├─GET /fcm-   │                  │  │ • onTokenRefresh()     │ │
│  │  tokens     │                  │  └────────────────────────┘ │
│  └─DELETE /all │                  │           ↓                  │
│                 │                  │  ┌────────────────────────┐ │
│ ┌─────────────┐ │                  │  │ useInitializeFCM.ts    │ │
│ │Send Notif.  │ │                  │  │ ==================     │ │
│ └─────────────┘ │                  │  │ • Auto-runs on start   │ │
│  • Chat message│──────Notify───────│  │ • Request permissions  │ │
│  • Task update │      via Firebase│  │ • Register token       │ │
│  • Offer       │                  │  │ • Setup listeners      │ │
│  • Review      │                  │  └────────────────────────┘ │
│                 │                  │           ↓                  │
│ Database:       │                  │  ┌────────────────────────┐ │
│ ┌─────────────┐ │                  │  │ app/_layout.tsx        │ │
│ │FCM Tokens   │ │                  │  │ ================       │ │
│ │User: userId │ │                  │  │ const fcm =            │ │
│ │Token: "dXy" │ │                  │  │   useInitializeFCM()   │ │
│ │Device: "and"│ │                  │  └────────────────────────┘ │
│ │DeviceId: x  │ │                  │                              │
│ └─────────────┘ │                  │  System Tray:                │
│                 │                  │  [🔔] "New message!"          │
└─────────────────┘                  └──────────────────────────────┘
```

## 🔄 Notification Flow (Step by Step)

### 1️⃣ App Startup & Token Registration

```
Mobile App Starts
      ↓
useInitializeFCM() hook runs
      ↓
Request notification permissions (iOS) / Auto-granted (Android)
      ↓
messaging().getToken() → Returns FCM token: "dXyz...abc123"
      ↓
POST /users/fcm-token
{
  token: "dXyz...abc123",
  device: "android",
  deviceId: "android-xyz-123"
}
      ↓
Backend saves to database
      ↓
Backend forwards token to Firebase (via Admin SDK)
      ↓
Firebase registers device for receiving notifications
```

### 2️⃣ Sending a Notification

```
User A sends chat message to User B
      ↓
Backend receives message via POST /chats/{chatId}/message
      ↓
Backend saves message to database
      ↓
Backend looks up User B's FCM tokens from database
      ↓
Backend sends notification via Firebase Admin SDK:

admin.messaging().send({
  token: "User B's FCM token",
  notification: {
    title: "New message from User A",
    body: "Hey, are you available tomorrow?"
  },
  data: {
    type: "chat_message",
    chatId: "12345",
    taskId: "67890"
  }
})
      ↓
Firebase Cloud Messaging processes notification
      ↓
Firebase delivers to User B's device
```

### 3️⃣ Receiving a Notification

```
Firebase delivers notification to device
      ↓
┌─────────────────────────────────────────────────────┐
│ App State: FOREGROUND                               │
│ ↓                                                   │
│ messaging().onMessage() handler                     │
│ ↓                                                   │
│ Show in-app notification banner                     │
│ Update chat badge count                             │
│ Refresh messages list                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ App State: BACKGROUND                               │
│ ↓                                                   │
│ System tray notification appears                    │
│ ↓                                                   │
│ User taps notification                              │
│ ↓                                                   │
│ messaging().onNotificationOpenedApp() handler       │
│ ↓                                                   │
│ App opens to chat screen                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ App State: QUIT (closed completely)                 │
│ ↓                                                   │
│ System tray notification appears                    │
│ ↓                                                   │
│ User taps notification                              │
│ ↓                                                   │
│ App launches                                        │
│ ↓                                                   │
│ messaging().getInitialNotification() handler        │
│ ↓                                                   │
│ App opens directly to chat screen                   │
└─────────────────────────────────────────────────────┘
```

## 📦 Package Structure

```
MyToDooMobile/
├── src/
│   ├── config/
│   │   └── firebase.ts ...................... Firebase initialization
│   ├── services/
│   │   └── firebase-messaging.ts ............ FCM token & notification handlers
│   ├── shared/
│   │   └── hooks/
│   │       └── useInitializeFCM.ts .......... React hook for FCM setup
│   └── api/
│       └── fcm-api.ts ....................... Backend FCM endpoints
├── app/
│   └── _layout.tsx .......................... Root component (calls useInitializeFCM)
├── android/
│   ├── build.gradle ......................... Google Services classpath
│   └── app/
│       ├── build.gradle ..................... Google Services plugin
│       └── google-services.json ............. Firebase Android config
└── app.config.ts ............................ Expo config with Firebase plugins
```

## 🔐 Firebase Configuration

```javascript
// src/config/firebase.ts

const firebaseConfig = {
  apiKey: "AIzaSyACCrN_zK5NKUUM7GtZulp4Sy53ewb495M",
  authDomain: "mytodoo-40c87.firebaseapp.com",
  projectId: "mytodoo-40c87",
  storageBucket: "mytodoo-40c87.firebasestorage.app",
  messagingSenderId: "697863453994",
  appId: "1:697863453994:web:648f36d94e17641e853253",
  measurementId: "G-WF88CSQVXY",
};

firebase.initializeApp(firebaseConfig);
export const fcm = messaging();
```

## 🎯 Notification Types & Handlers

```typescript
// Foreground Handler
messaging().onMessage(async (remoteMessage) => {
  console.log('Foreground notification:', remoteMessage);
  // Show in-app banner
  // Update badge count
  // Refresh data
});

// Background Handler (app in background)
messaging().onNotificationOpenedApp((remoteMessage) => {
  console.log('Background notification opened:', remoteMessage);
  // Navigate to chat screen
  router.push(`/task-chat/${remoteMessage.data.chatId}`);
});

// Quit State Handler (app was closed)
messaging().getInitialNotification().then((remoteMessage) => {
  if (remoteMessage) {
    console.log('Quit state notification opened:', remoteMessage);
    // Navigate to chat screen
    router.push(`/task-chat/${remoteMessage.data.chatId}`);
  }
});

// Token Refresh Handler
messaging().onTokenRefresh(async (token) => {
  console.log('Token refreshed:', token);
  // Auto-register new token with backend
  await saveFCMToken({ token, device, deviceId });
});
```

## 🧪 Testing Scenarios

### Scenario 1: Chat Message Notification
```
1. User A opens app → FCM token registered
2. User B sends message to User A
3. Backend sends FCM notification
4. User A's device receives notification
5. User A taps notification → Opens chat screen
```

### Scenario 2: Token Refresh
```
1. Firebase rotates FCM token (automatic)
2. messaging().onTokenRefresh() fires
3. New token sent to backend
4. Backend updates database with new token
5. Future notifications use new token
```

### Scenario 3: Multiple Devices
```
User logs in on 2 devices (Phone + Tablet)
↓
Both devices get FCM tokens
↓
Backend stores both tokens:
[
  { userId: "123", token: "phone_token", device: "android" },
  { userId: "123", token: "tablet_token", device: "android" }
]
↓
Notification sent → Both devices receive it!
```

## 📊 Database Schema (Backend)

```javascript
// FCM Tokens Collection
{
  _id: ObjectId("..."),
  userId: "user_123",
  token: "dXyz...abc123",
  device: "android",          // or "ios"
  deviceId: "android-xyz-123",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

// When sending notification:
1. Find all tokens for userId
2. Send to each token via Firebase Admin SDK
3. Firebase delivers to all user's devices
```

## 🚀 Build & Deploy Process

```
Development:
  Expo Go ❌ Not supported (no native modules)
       ↓
  EAS Build ✅ Required
       ↓
  npx eas build --platform android --profile development
       ↓
  Download APK → Install on device → Test

Production:
  EAS Build ✅
       ↓
  npx eas build --platform android --profile production
       ↓
  Download APK → Distribute to users
       ↓
  Or: Submit to Google Play Store
```

## 🎉 Success Indicators

✅ Console shows FCM initialized  
✅ Token registered with backend  
✅ Backend database has token entry  
✅ Test notification appears on device  
✅ Tapping notification opens correct screen  
✅ Chat messages trigger notifications  
✅ Multiple devices receive notifications  

---

**All systems configured and ready to build!** 🚀
