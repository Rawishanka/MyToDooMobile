# 🔴 Backend Fix Required — Notification System

**To:** Backend Team  
**From:** Mobile Team  
**Date:** March 14, 2026  
**Priority:** HIGH  
**API Base URL:** `https://au-live-api.mytodoo.com/api`

---

## 📌 Summary

The mobile app (iOS & Android) sends push notifications via **Firebase Cloud Messaging (FCM)**. The backend correctly sends FCM pushes to devices — users **receive** the notifications on their phones. However, the notifications are **not being stored in the database**, so when the user opens the **Notification History screen** in the app, it shows empty.

> **No new endpoints needed. No endpoint changes needed.**  
> Only the existing FCM send logic needs to also save to the database.

---

## 🔍 Root Cause (Clearly Explained)

### What works ✅
- Backend sends FCM push → user's phone receives the push notification banner ✅
- `GET /notifications` endpoint exists and works ✅
- `PATCH /notifications/{id}/read` works ✅
- `PATCH /notifications/read-all` works ✅
- `DELETE /notifications/{id}` works ✅
- `DELETE /notifications/all` works ✅

### What is broken ❌
- **When backend sends an FCM push, it does NOT save a record to the `notifications` collection in MongoDB.**
- So `GET /notifications` always returns `data: []` and `unreadCount: 0`.
- The Notification History screen in the app calls `GET /notifications` → gets empty array → shows nothing.
- The bell icon badge calls `GET /notifications` → `unreadCount: 0` → badge never appears.

### Current Flow (Broken)
```
Backend trigger (e.g. new offer received)
        ↓
Firebase Admin SDK sends FCM push to device
        ↓
User's phone shows push banner ✅
        ↓
GET /notifications → [] empty ❌ (nothing saved to DB)
```

### Expected Flow (After Fix)
```
Backend trigger (e.g. new offer received)
        ↓
Firebase Admin SDK sends FCM push to device  ← keep this
        ↓
User's phone shows push banner ✅
        ↓
ALSO save notification record to MongoDB 'notifications' collection ← ADD THIS
        ↓
GET /notifications → returns saved records ✅
Bell badge count → shows correct unread count ✅
```

---

## ✅ What Backend Needs to Do

### The Fix — Save to DB when sending FCM push

Wherever the backend currently calls Firebase Admin SDK to send a push notification, **also insert a document into the `notifications` collection**.

### MongoDB Document Schema (already exists — just save to it)

```json
{
  "recipient": "<userId>",
  "title": "New offer on your task",
  "message": "John submitted an offer of $50 for your task.",
  "type": "push",
  "isRead": false,
  "readAt": null,
  "deliveryStatus": "sent",
  "resourceType": "offer",
  "resourceId": "<offerId>",
  "data": {
    "type": "OFFER_MADE",
    "taskId": "<taskId>",
    "offerId": "<offerId>"
  },
  "isActive": true,
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

> This is the **exact same schema** already returned by `GET /notifications`. The collection and model already exist — just need to insert records.

---

## 📋 All Notification Types — What to Save

Below are all FCM notification types the mobile app handles. For each one, save a record to the `notifications` collection.

| Trigger Event | `type` field | `resourceType` | `title` Example |
|---|---|---|---|
| New offer on poster's task | `OFFER_MADE` | `offer` | "New offer on your task" |
| Offer accepted (tasker notified) | `OFFER_ACCEPTED` | `offer` | "Your offer was accepted" |
| Offer rejected (tasker notified) | `OFFER_REJECTED` | `offer` | "Your offer was not accepted" |
| New chat message | `NEW_MESSAGE` | `chat` | "New message from John" |
| Task completed | `TASK_COMPLETED` | `task` | "Your task has been completed" |
| Task status changed | `TASK_STATUS_CHANGED` | `task` | "Task status updated" |
| Payment received | `PAYMENT_RECEIVED` | `payment` | "Payment received" |
| Payment sent | `PAYMENT_SENT` | `payment` | "Payment sent successfully" |
| New task created (browse) | `NEW_TASK` | `task` | "New task available near you" |
| Login notification | `login` | `auth` | "Login Successful" |

> The `data` field in the notification document should contain the same `data` payload sent in the FCM message (e.g. `taskId`, `offerId`, `chatId`) so the app can deep-link to the correct screen.

---

## 🗂️ `data` Payload Examples per Notification Type

These are what the mobile app expects in `remoteMessage.data` for cache invalidation and deep linking:

```json
// OFFER_MADE
{ "type": "OFFER_MADE", "taskId": "abc123", "offerId": "def456" }

// OFFER_ACCEPTED / OFFER_REJECTED
{ "type": "OFFER_ACCEPTED", "taskId": "abc123", "offerId": "def456" }

// NEW_MESSAGE
{ "type": "NEW_MESSAGE", "chatId": "xyz789", "taskId": "abc123" }

// TASK_COMPLETED
{ "type": "TASK_COMPLETED", "taskId": "abc123" }

// PAYMENT_RECEIVED / PAYMENT_SENT
{ "type": "PAYMENT_RECEIVED", "taskId": "abc123", "amount": "50.00" }
```

---

## 🔗 FCM Token Registration (Already Working — No Changes)

The mobile app registers FCM tokens via:
- `POST /users/fcm-token` — saves token on login
- `DELETE /users/fcm-token` — removes token on logout

These are working correctly. The backend uses these tokens to send FCM pushes. **No changes needed here.**

---

## 🧪 How to Test After Fix

1. Log into the app (iOS or Android native build)
2. From another account, make an offer on a task or send a message
3. Check the receiving user's app:
   - ✅ Push notification banner should appear (already works)
   - ✅ **Bell icon badge should now show a count** (will work after fix)
   - ✅ **Notification History screen should show the notification** (will work after fix)
4. Call `GET /notifications` via Postman/Swagger with the user's JWT token → should return the notification record

---

## ❓ FAQ

**Q: Do we need to change any endpoint URLs or response formats?**  
A: No. All existing endpoint contracts are correct. Just save to DB when sending FCM.

**Q: What if sending FCM fails? Should we still save to DB?**  
A: Yes, recommended. Save to DB regardless of FCM delivery status. Set `deliveryStatus: "failed"` if FCM fails. The user can still see it in notification history.

**Q: Do we need to send FCM AND save to DB? Or just DB?**  
A: Both. Keep sending FCM for real-time push banners, AND save to DB for notification history.

**Q: What about old notifications? Should we backfill?**  
A: Not required. Going forward from the fix is sufficient.

---

## 📞 Contact

Any questions about the mobile-side implementation, contact the mobile team.  
All mobile API calls are already correctly implemented against the existing endpoint contracts.
