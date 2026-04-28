# 🔔 MyToDoo Push Notification System — Complete Guide
**Last Updated:** April 28, 2026  
**Status:** ✅ Live & Working (iOS + Android)

---

## 📊 Current Status — Confirmed Live Test Results

| Platform | Token Status | FCM Delivery | Last Tested |
|---|---|---|---|
| 🍎 iOS (Chandika) | ✅ Valid | ✅ `messageId` received | April 28, 2026 |
| 🍎 iOS (Kanchana) | ✅ Valid | ✅ `messageId` received | April 28, 2026 |
| 🤖 Android | ✅ Valid tokens | ✅ Working | April 27, 2026 |

**Firebase Project:** `mytodoo-e4cdb`  
**Android Bundle:** `com.mytodoo.mytodoolive`  
**iOS Bundle:** `com.mytodoo.mytodoolive`

---

## 🏗️ Architecture — How It Works Now

```
User Action (new offer / message / answer / payment)
         ↓
Backend Service (Node.js)
         ↓
fcmService.sendToUser(userId, payload)          ← /services/notifications/fcm.service.js
         ↓
Firebase Admin SDK → Firebase Cloud Messaging
         ↓
    ┌────────────────┬────────────────┐
    ↓                                ↓
🍎 iOS (via APNs)         🤖 Android (via FCM)
    ↓                                ↓
React Native Firebase         React Native Firebase
@react-native-firebase/messaging
         ↓
   App receives notification
   (Foreground / Background / Killed)
         ↓
notification-service.ts → saves to AsyncStorage
         ↓
Bell badge count updates instantly (notification-events.ts)
```

---

## 📍 All Places Backend Sends FCM (Current)

| Trigger | File | Function | Recipient |
|---|---|---|---|
| New Offer on Task | `servicesN/tasks/tasks.services.js:470` | Offer made | Task poster |
| Offer Accepted/Rejected | `servicesN/tasks/tasks.services.js:930,940` | Status change | Tasker |
| Payment Received | `servicesN/payments/payment.services.js:796` | Payment sent | Tasker |
| New Chat Message | `servicesN/chat/taskChat.service.js:227` | Message sent | Chat recipient |
| Review Received | `servicesN/reviews/review.services.js:61` | Review posted | Reviewed user |
| Question Answered ✅ NEW | `controllers/tasks/task.controller.js:2143` | Answer posted | Question asker |
| Offer on Task (alt) | `controllers/tasks/task.controller.js:1387` | Offer received | Task creator |
| Admin Deletion Approve/Reject | `controllers/admin/adminDeletionRequest.controller.js` | Decision | User |

---

## 🐛 Bugs Fixed (April 2026)

### Fix 1 — Answer Question: "Nothing happens" (App)
**File:** `src/features/tasks/screens/detail/components/AnswerQuestionModal.tsx`  
**Problem:** `moderateContent()` was called but never imported → `ReferenceError` thrown **outside** the try-catch → silent crash, no alert, no API call.  
**Fix:** Added `import { moderateContent } from '@/src/shared/utils/contentModeration'`

### Fix 2 — Answer Question: No notification to asker (Backend)
**File:** `controllers/tasks/task.controller.js` → `answerQuestion()`  
**Problem:** When poster answers a question, no FCM was sent to the question asker.  
**Fix:** Added `fcmService.sendToUser(question.userId, { type: 'QUESTION_ANSWERED', ... })` after `question.save()`

### Fix 3 — Notification badge not clearing instantly (App)
**File:** `src/services/notification-events.ts` (new), `src/shared/hooks/useNotifications.ts`  
**Problem:** `useMergedUnreadCount` polled every 30s — badge stayed visible for up to 30s after delete.  
**Fix:** Event bus added — badge resets immediately on delete/mark-read.

---

## ⚠️ iOS Critical — Backend Must Fix

### Problem: Missing `apns-push-type` and `apns-priority` headers

The current `fcm.service.js` iOS payload is minimal:
```javascript
// CURRENT (incomplete)
apns: {
  payload: {
    aps: {
      sound: "default",
      badge: payload.badge || 1,
    },
  },
},
```

**iOS 13+** requires `apns-push-type: 'alert'` and `apns-priority: '10'` for reliable foreground delivery. Without these, Apple may **delay or drop** notifications.

### Required Fix for `fcm.service.js` → `sendToToken()`

```javascript
// REQUIRED FIX — replace current apns block with this:
apns: {
  headers: {
    'apns-push-type': 'alert',      // CRITICAL for iOS 13+
    'apns-priority': '10',          // 10 = immediate, 5 = power-save
    'apns-expiration': '0',         // 0 = no expiry retry
  },
  payload: {
    aps: {
      alert: {
        title: payload.title,
        body: payload.body,
      },
      sound: 'default',
      badge: payload.badge || 1,
      'content-available': 1,       // Wake app in background
      'mutable-content': 1,         // Allow notification service extension
    },
  },
},
```

### Also Fix Android Channel

```javascript
// REQUIRED FIX — replace current android block with this:
android: {
  priority: 'high',                 // Always high for user-facing notifications
  ttl: 4 * 60 * 60 * 1000,         // 4 hours TTL
  notification: {
    channelId: 'high_priority_channel',  // Must match app channel
    sound: 'default',
    defaultVibrateTimings: true,
    visibility: 'public',
    priority: 'high',
  },
},
```

### Complete Fixed `sendToToken()` for Backend Developer

```javascript
async sendToToken(token, payload) {
  try {
    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: Object.fromEntries(
        Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])
      ),
      // ✅ Android — high priority + correct channel
      android: {
        priority: 'high',
        ttl: 4 * 60 * 60 * 1000,
        notification: {
          channelId: 'high_priority_channel',
          sound: 'default',
          defaultVibrateTimings: true,
          visibility: 'public',
          priority: 'high',
        },
      },
      // ✅ iOS — required headers for reliable delivery
      apns: {
        headers: {
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'apns-expiration': '0',
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: payload.badge || 1,
            'content-available': 1,
            'mutable-content': 1,
          },
        },
      },
      // ✅ Web push (optional)
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/icon.png',
        },
        fcmOptions: {
          link: payload.data?.link || '/',
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info('FCM notification sent successfully', {
      service: 'fcm.service',
      token: token.substring(0, 20) + '...',
      messageId: response,
    });
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Error sending FCM notification', {
      service: 'fcm.service',
      error: error.message,
      errorCode: error.code,
    });
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      return { success: false, invalidToken: true, error: error.message };
    }
    return { success: false, error: error.message };
  }
}
```

---

## 🔔 Notification Types — Current Data Payloads

All FCM notifications use `data.type` field. App (`notification-service.ts`) handles these:

| `data.type` | Trigger | Cache Invalidated |
|---|---|---|
| `OFFER_MADE` | New offer on task | `tasks`, `offers` |
| `OFFER_ACCEPTED` | Offer accepted | `tasks`, `offers` |
| `OFFER_REJECTED` | Offer rejected | `tasks`, `offers` |
| `NEW_MESSAGE` | Chat message | `chats`, `messages` |
| `CHAT_MESSAGE` | Chat message (alt) | `chats`, `messages` |
| `TASK_COMPLETED` | Task completed | `tasks`, `payments` |
| `TASK_STATUS_CHANGED` | Task status update | `tasks` |
| `PAYMENT_RECEIVED` | Payment to tasker | `payments`, `tasks` |
| `PAYMENT_SENT` | Payment sent | `payments`, `tasks` |
| `QUESTION_ANSWERED` ✅ NEW | Answer posted | `notifications` |
| `REVIEW_RECEIVED` | New review | `reviews` |
| `login` | Login event | `auth` |

---

## 🌐 FCM vs MQTT vs WebSocket — Recommendation for MyToDoo

### Current: Firebase Cloud Messaging (FCM)

| Pros ✅ | Cons ❌ |
|---|---|
| Free up to 1M notifications/month | Not real-time (small delay possible) |
| Works when app is killed/background | No guaranteed delivery order |
| Handles iOS APNs complexity automatically | Depends on Google infrastructure |
| No server maintenance needed | Payload limited to 4KB |
| Scales to millions automatically | Can't do 2-way realtime (e.g. live typing) |

### Alternative: MQTT (e.g. EMQX, HiveMQ)

| Pros ✅ | Cons ❌ |
|---|---|
| True real-time (<10ms latency) | Cannot wake a killed app |
| Low bandwidth (IoT-grade protocol) | Need separate push for background/killed |
| Works great for chat typing indicators | Requires MQTT broker server setup |
| Good for high-frequency updates | More complex infrastructure |

### Alternative: WebSocket (Socket.io)

| Pros ✅ | Cons ❌ |
|---|---|
| Real-time bidirectional | Cannot wake killed app |
| Good for live chat, typing, presence | Need sticky sessions / Redis for scale |
| Easy to implement in Node.js | Connection overhead |

---

## 🏆 MyToDoo Recommendation — Hybrid Approach

For a marketplace app like MyToDoo (similar to Airtasker, TaskRabbit):

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FCM (Firebase)          ← Keep for ALL push notifications      │
│  • New offers                                                    │
│  • Payments                                                      │
│  • Reviews                                                       │
│  • Background/killed app delivery                                │
│                                                                  │
│  Socket.io (existing)    ← Add for in-app real-time only        │
│  • Live chat messages (when app is open)                        │
│  • Typing indicators                                             │
│  • Online/offline presence                                       │
│  • Real-time task status updates in UI                          │
│                                                                  │
│  NOT MQTT — overkill for this use case                          │
│  (MQTT suits IoT/telemetry, not marketplace notifications)       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why NOT MQTT for MyToDoo:**
- MQTT cannot wake a killed iOS/Android app (still needs APNs/FCM anyway)
- Extra broker infrastructure to manage
- FCM already handles the same use cases reliably
- WhatsApp/Uber/Airtasker all use FCM + WebSocket, not MQTT

**What WhatsApp/Uber actually use:**
- FCM for background push (device wake-up)
- WebSocket/Socket.io for real-time in-app delivery
- This is exactly what MyToDoo should do

---

## 🔌 Website Integration (Web Push)

To send push notifications to the MyToDoo **website**:

### Step 1 — Get Web Push VAPID keys from Firebase Console
```
Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
→ Generate key pair → Copy VAPID key
```

### Step 2 — Frontend (React/Next.js)
```javascript
// In your website frontend
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const app = initializeApp({
  apiKey: "...",
  projectId: "mytodoo-e4cdb",
  messagingSenderId: "685356682007",
  appId: "...",
});

const messaging = getMessaging(app);

// Register service worker first (required)
// public/firebase-messaging-sw.js must exist

export async function requestWebPushToken() {
  const token = await getToken(messaging, {
    vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE'
  });
  
  // Send token to backend
  await fetch('/api/notifications/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ token, device: 'web' })
  });
  
  return token;
}

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log('Web foreground message:', payload);
  // Show in-app notification UI
});
```

### Step 3 — Service Worker (`public/firebase-messaging-sw.js`)
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  projectId: "mytodoo-e4cdb",
  messagingSenderId: "685356682007",
  appId: "..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    data: payload.data
  });
});
```

### Step 4 — Backend already supports web tokens ✅
```
POST /api/notifications/register-token
Body: { token: "web_fcm_token", device: "web" }
```
Backend already saves `device: 'web'` tokens — confirmed in logs.

---

## 🔄 Socket.io Integration (Future — In-App Real-Time)

If real-time chat typing / presence is needed:

### Backend (add to existing Node.js server)
```javascript
// server.js
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/socket.io'
});

io.use((socket, next) => {
  // Authenticate with JWT token
  const token = socket.handshake.auth.token;
  const user = verifyJWT(token);
  socket.userId = user._id.toString();
  next();
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`); // Personal room
  
  socket.on('join_chat', (chatId) => socket.join(`chat:${chatId}`));
  socket.on('typing', ({ chatId }) => socket.to(`chat:${chatId}`).emit('user_typing', { userId: socket.userId }));
  socket.on('disconnect', () => console.log('User disconnected:', socket.userId));
});

// In taskChat.service.js — emit via socket AND send FCM
const sendChatMessage = async (chatId, senderId, content) => {
  const message = await saveMessage(...);
  
  // Real-time: Socket (if recipient is online)
  io.to(`chat:${chatId}`).emit('new_message', message);
  
  // Push: FCM (if recipient is offline/background)
  await fcmService.sendToUser(recipientId, { type: 'NEW_MESSAGE', ... });
};
```

### Mobile App (React Native)
```javascript
import io from 'socket.io-client';
const socket = io('https://api.mytodoo.com', { auth: { token: userToken } });
socket.on('new_message', (msg) => updateChatUI(msg));
socket.on('user_typing', ({ userId }) => showTypingIndicator(userId));
```

---

## 📋 Backend Developer Checklist

### Immediate (Fix fcm.service.js)
- [ ] Add `apns.headers['apns-push-type']` = `'alert'`
- [ ] Add `apns.headers['apns-priority']` = `'10'`
- [ ] Add `apns.payload.aps['content-available']` = `1`
- [ ] Change `android.notification.channelId` from `'default'` to `'high_priority_channel'`
- [ ] Add `android.ttl` = `4 * 60 * 60 * 1000`
- [ ] Ensure all `data` payload values are **strings** (Firebase requirement)

### Already Working ✅
- [x] Firebase Admin initialized correctly (`mytodoo-e4cdb`)
- [x] FCM tokens saved per device (iOS/Android/Web)
- [x] `_persistNotification()` saves to MongoDB
- [x] Invalid token cleanup on send failure
- [x] FCM sent for: offers, messages, payments, reviews, answers
- [x] Backend PM2 process: `mytodoo-au-backend-live` (id: 7)

### Future (Optional)
- [ ] Add Socket.io for in-app real-time chat
- [ ] Add web push token registration UI to website
- [ ] Add notification preferences endpoint (`PUT /notifications/preferences`)
- [ ] Add notification read/unread webhooks for multi-device sync

---

## 🧪 Testing FCM (Backend Developer)

### Test single device
```bash
# SSH to server
node -e "
const fcm = require('./services/notifications/fcm.service');
fcm.sendToToken('PASTE_FCM_TOKEN_HERE', {
  title: 'Test',
  body: 'Hello from server',
  data: { type: 'TEST' },
  priority: 'high'
}).then(r => console.log(r));
"
```

### Test by userId
```bash
node -e "
const fcm = require('./services/notifications/fcm.service');
fcm.sendToUser('USER_MONGODB_ID_HERE', {
  title: 'Test to user',
  body: 'All their devices will receive this',
  data: { type: 'TEST' },
  priority: 'high'
}).then(r => console.log(r));
"
```

### Via API endpoint
```
POST /api/notifications/quick-test
Authorization: Bearer <admin_token>
{
  "title": "Test",
  "body": "Test body"
}
```

---

## 📁 Key Files Reference

| File | Purpose |
|---|---|
| `services/notifications/fcm.service.js` | ⭐ Core FCM sender (iOS + Android + Web) |
| `servicesN/notifications/notification.service.js` | DB persistence (MongoDB) |
| `servicesN/notifications/fcm-token.service.js` | Token CRUD |
| `config/firebase-admin.js` | Firebase Admin SDK init |
| `serviceAccountKey.json` | Firebase service account credentials |
| `src/services/notification-service.ts` | App — FCM receive + handle |
| `src/shared/hooks/useInitializeFCM.ts` | App — FCM initialization |
| `src/services/notification-storage.ts` | App — AsyncStorage cache |
| `src/services/notification-events.ts` | App — Instant badge update event bus |
| `src/shared/hooks/useNotifications.ts` | App — Badge count hook |
