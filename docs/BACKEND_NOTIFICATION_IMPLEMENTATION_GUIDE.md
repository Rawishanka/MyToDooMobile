# Backend Notification Endpoints - Implementation Guide

## ⚠️ Current Status
The mobile app is configured to use notification APIs, but the backend endpoints return **404 errors** because they haven't been implemented yet.

## 🔧 Required Backend Implementation

### Base URL
All endpoints should be available at: `http://localhost:5001/api/notifications`

### Required Endpoints (Priority Order)

#### 1. GET /api/notifications (HIGH PRIORITY)
**Purpose:** Get all notifications for the authenticated user

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "recipient": "507f1f77bcf86cd799439012",
      "type": "OFFER_MADE",
      "title": "New Offer Received",
      "message": "John made an offer on your task",
      "isRead": false,
      "priority": "NORMAL",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "task": {
        "_id": "task123",
        "title": "Fix my awning"
      },
      "sender": {
        "_id": "user456",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 95
  },
  "unreadCount": 12
}
```

#### 2. GET /api/notifications/unread-count (HIGH PRIORITY)
**Purpose:** Get count of unread notifications (used for badge)

**Response:**
```json
{
  "success": true,
  "unreadCount": 12,
  "meta": {
    "userId": "507f1f77bcf86cd799439012",
    "userEmail": "user@example.com",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. PATCH /api/notifications/:notificationId/read (MEDIUM PRIORITY)
**Purpose:** Mark a notification as read

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isRead": true
  }
}
```

#### 4. DELETE /api/notifications/:notificationId (MEDIUM PRIORITY)
**Purpose:** Delete a notification

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### 5. POST /api/notifications/mark-all-read (LOW PRIORITY)
**Purpose:** Mark all notifications as read for the user

**Response:**
```json
{
  "success": true,
  "message": "Marked 12 notifications as read"
}
```

## 📋 Notification Types
The system supports these notification types:

- `OFFER_MADE` - When someone makes an offer on a task
- `OFFER_ACCEPTED` - When an offer is accepted
- `TASK_COMPLETED` - When a task is marked as completed
- `PAYMENT_RECEIVED` - When payment is processed
- `MESSAGE_RECEIVED` - When a new message arrives
- `SYSTEM_UPDATE` - System announcements

## 🔐 Authentication
All endpoints require authentication:
```
Authorization: Bearer <jwt_token>
```

The mobile app automatically includes this header with every request.

## 🗄️ Database Schema Suggestion

```javascript
const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['OFFER_MADE', 'OFFER_ACCEPTED', 'TASK_COMPLETED', 'PAYMENT_RECEIVED', 'MESSAGE_RECEIVED', 'SYSTEM_UPDATE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['HIGH', 'NORMAL', 'LOW'],
    default: 'NORMAL'
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  offer: {
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
```

## 🎯 When to Create Notifications

### 1. Offer Made (OFFER_MADE)
**Trigger:** When a user makes an offer on a task
**Recipient:** Task creator
**Example:**
```javascript
await Notification.create({
  recipient: task.createdBy,
  type: 'OFFER_MADE',
  title: 'New Offer Received',
  message: `${offer.user.name} made an offer of $${offer.amount} on your task "${task.title}"`,
  task: task._id,
  offer: offer._id,
  sender: offer.user._id,
  priority: 'NORMAL'
});
```

### 2. Offer Accepted (OFFER_ACCEPTED)
**Trigger:** When a task creator accepts an offer
**Recipient:** Person who made the offer
**Example:**
```javascript
await Notification.create({
  recipient: offer.user._id,
  type: 'OFFER_ACCEPTED',
  title: 'Offer Accepted!',
  message: `Your offer of $${offer.amount} on "${task.title}" has been accepted`,
  task: task._id,
  offer: offer._id,
  sender: task.createdBy,
  priority: 'HIGH'
});
```

### 3. Task Completed (TASK_COMPLETED)
**Trigger:** When a task is marked as completed
**Recipients:** Both task creator and assigned user
**Example:**
```javascript
await Notification.create({
  recipient: task.createdBy,
  type: 'TASK_COMPLETED',
  title: 'Task Completed',
  message: `"${task.title}" has been marked as completed`,
  task: task._id,
  sender: task.assignedTo,
  priority: 'NORMAL'
});
```

### 4. Payment Received (PAYMENT_RECEIVED)
**Trigger:** When payment is processed
**Recipient:** Service provider
**Example:**
```javascript
await Notification.create({
  recipient: task.assignedTo,
  type: 'PAYMENT_RECEIVED',
  title: 'Payment Received',
  message: `You received $${payment.amount} for "${task.title}"`,
  task: task._id,
  sender: task.createdBy,
  priority: 'HIGH'
});
```

## 🧪 Testing

Once implemented, test with:

```bash
# Get notifications
curl -X GET http://localhost:5001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get unread count
curl -X GET http://localhost:5001/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X PATCH http://localhost:5001/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete notification
curl -X DELETE http://localhost:5001/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Mobile App Behavior

**Current Status:** 
- ✅ Mobile app is ready and configured
- ✅ Graceful error handling (shows "not implemented" message)
- ✅ Auto-retry disabled for 404 errors
- ✅ Will work automatically once backend is deployed

**What happens now:**
- App shows "Notification system not implemented yet" message
- Users can still use all other app features
- Badge doesn't appear on bell icon
- No errors or crashes

**What happens after backend implementation:**
- Notifications will load automatically
- Unread count badge will appear
- Users can mark as read, delete, etc.
- Real-time updates every minute

## 📞 Questions?

Contact the mobile development team if you need:
- Different response format
- Additional fields in notifications
- Different notification types
- Push notification integration

## ✅ Implementation Checklist

- [ ] Create Notification model/schema
- [ ] Implement GET /api/notifications
- [ ] Implement GET /api/notifications/unread-count
- [ ] Implement PATCH /api/notifications/:id/read
- [ ] Implement DELETE /api/notifications/:id
- [ ] Implement POST /api/notifications/mark-all-read
- [ ] Add notification creation on offer made
- [ ] Add notification creation on offer accepted
- [ ] Add notification creation on task completed
- [ ] Add notification creation on payment received
- [ ] Test all endpoints with Postman/curl
- [ ] Test with mobile app
- [ ] Deploy to production

---

**Note:** The mobile app is production-ready and waiting for backend implementation. No mobile app changes are needed once the backend is ready.
