# Admin Approval System - Backend API Requirements

## 📋 Overview

This document outlines the backend API requirements for the admin approval system for profile editing and ID verification access.

---

## 🎯 Purpose

Users need to request permission from admins before they can:
1. **Edit their profile** (name, bio, location, etc.)
2. **Start ID verification** process

This prevents unauthorized profile changes and ensures admin oversight.

---

## 🔐 Required Backend Endpoints

### 1. Request Profile Edit Access

**Purpose:** User requests permission to edit their profile

**Endpoint:** `POST /api/users/request-edit-access`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": "670398eb6d4c8de73c123456",
  "requestType": "profile_edit",
  "requestedAt": "2025-12-11T10:30:00.000Z"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Edit access request sent to admin successfully",
  "data": {
    "requestId": "req_abc123def456",
    "userId": "670398eb6d4c8de73c123456",
    "requestType": "profile_edit",
    "status": "pending",
    "requestedAt": "2025-12-11T10:30:00.000Z",
    "approvedBy": null,
    "approvedAt": null
  }
}
```

**Response - Error (400):**
```json
{
  "success": false,
  "message": "You already have a pending request",
  "data": {
    "existingRequestId": "req_xyz789",
    "status": "pending"
  }
}
```

---

### 2. Request ID Verification Access

**Purpose:** User requests permission to start ID verification

**Endpoint:** `POST /api/users/request-id-verification-access`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": "670398eb6d4c8de73c123456",
  "requestType": "id_verification",
  "requestedAt": "2025-12-11T10:30:00.000Z"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "ID verification access request sent to admin successfully",
  "data": {
    "requestId": "req_verify123",
    "userId": "670398eb6d4c8de73c123456",
    "requestType": "id_verification",
    "status": "pending",
    "requestedAt": "2025-12-11T10:30:00.000Z",
    "approvedBy": null,
    "approvedAt": null
  }
}
```

---

### 3. Get User Access Status

**Purpose:** Check current status of user's access permissions

**Endpoint:** `GET /api/users/access-status`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "profileEditAccess": {
      "status": "locked" | "pending" | "approved",
      "requestId": "req_abc123" | null,
      "requestedAt": "2025-12-11T10:30:00.000Z" | null,
      "approvedBy": "admin_user_id" | null,
      "approvedAt": "2025-12-11T11:00:00.000Z" | null
    },
    "idVerificationAccess": {
      "status": "locked" | "pending" | "approved",
      "requestId": "req_verify123" | null,
      "requestedAt": "2025-12-11T10:30:00.000Z" | null,
      "approvedBy": "admin_user_id" | null,
      "approvedAt": "2025-12-11T11:30:00.000Z" | null
    }
  }
}
```

---

### 4. Admin - Get Pending Requests (Admin Only)

**Purpose:** Admin can view all pending approval requests

**Endpoint:** `GET /api/admin/access-requests`

**Authentication:** Required (Bearer token + Admin role)

**Query Parameters:**
- `status` (optional): `pending` | `approved` | `rejected`
- `type` (optional): `profile_edit` | `id_verification`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "requestId": "req_abc123",
        "userId": "670398eb6d4c8de73c123456",
        "user": {
          "firstName": "Prasanna",
          "lastName": "H.",
          "email": "prasanna@example.com",
          "profilePicture": "https://...",
          "verified": false,
          "completedTasks": 502
        },
        "requestType": "profile_edit",
        "status": "pending",
        "requestedAt": "2025-12-11T10:30:00.000Z",
        "approvedBy": null,
        "approvedAt": null,
        "rejectedBy": null,
        "rejectedAt": null,
        "rejectionReason": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRequests": 87,
      "hasMore": true
    }
  }
}
```

---

### 5. Admin - Approve/Reject Request (Admin Only)

**Purpose:** Admin approves or rejects a user's access request

**Endpoint:** `PUT /api/admin/access-requests/:requestId/respond`

**Authentication:** Required (Bearer token + Admin role)

**Request Body:**
```json
{
  "action": "approve" | "reject",
  "reason": "Reason for rejection" // Optional, required if action is "reject"
}
```

**Response - Approve:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "requestId": "req_abc123",
    "userId": "670398eb6d4c8de73c123456",
    "requestType": "profile_edit",
    "status": "approved",
    "approvedBy": "admin_user_id",
    "approvedAt": "2025-12-11T11:00:00.000Z"
  }
}
```

**Response - Reject:**
```json
{
  "success": true,
  "message": "Request rejected successfully",
  "data": {
    "requestId": "req_abc123",
    "userId": "670398eb6d4c8de73c123456",
    "requestType": "profile_edit",
    "status": "rejected",
    "rejectedBy": "admin_user_id",
    "rejectedAt": "2025-12-11T11:00:00.000Z",
    "rejectionReason": "Incomplete profile information"
  }
}
```

---

## 💾 Database Schema

### AccessRequest Collection/Table

```javascript
{
  _id: ObjectId | String,
  requestId: String (unique), // "req_abc123def456"
  userId: ObjectId | String (reference to Users),
  requestType: String, // "profile_edit" | "id_verification"
  status: String, // "pending" | "approved" | "rejected"
  requestedAt: Date,
  approvedBy: ObjectId | String (reference to Users) | null,
  approvedAt: Date | null,
  rejectedBy: ObjectId | String (reference to Users) | null,
  rejectedAt: Date | null,
  rejectionReason: String | null,
  metadata: Object, // Additional data if needed
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` (for quick user lookups)
- `status` (for admin filtering)
- `requestType` (for filtering by type)
- `requestedAt` (for sorting by date)

---

## 🔔 Notification Requirements

### When User Sends Request:
**Send notification to admins:**
- Title: "New Access Request"
- Message: "Prasanna H. requested {profile_edit | id_verification} access"
- Type: "admin_notification"
- Action: Link to admin dashboard

### When Admin Approves:
**Send notification to user:**
- Title: "Access Approved ✅"
- Message: "Your {profile edit | ID verification} access has been approved"
- Type: "access_approved"
- Action: Navigate to profile edit screen

### When Admin Rejects:
**Send notification to user:**
- Title: "Access Request Declined"
- Message: "Your {profile edit | ID verification} request was declined. Reason: {reason}"
- Type: "access_rejected"

---

## 🔒 Security & Permissions

### User Permissions:
- ✅ Can request profile edit access
- ✅ Can request ID verification access
- ✅ Can view their own access status
- ❌ Cannot approve/reject requests
- ❌ Cannot view other users' requests

### Admin Permissions:
- ✅ Can view all access requests
- ✅ Can approve/reject any request
- ✅ Can filter and search requests
- ✅ Can view request history

### Rate Limiting:
- Max 3 requests per user per day
- Cooldown period: 24 hours between duplicate requests

---

## 📱 Frontend Integration

### Current Implementation (Mobile App):

**File:** `src/features/profile/screens/profile-screen.tsx`

**Line 409-448:** Async function `handleSendRequest()` with TODO for backend integration

**What's already implemented:**
- ✅ User can click "Edit Profile" button
- ✅ Modal appears asking for permission
- ✅ Loading state while sending request
- ✅ Error handling and display
- ✅ Success modal with "Pending Approval" status
- ✅ UI updates to show "Pending admin approval"

**What needs backend:**
```typescript
// Replace the TODO section in handleSendRequest():
const response = await fetch(`${API_CONFIG.BASE_URL}/users/request-edit-access`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId,
    requestType: 'profile_edit',
    requestedAt: new Date().toISOString()
  })
});

const data = await response.json();

if (!data.success) {
  throw new Error(data.message || 'Failed to send request');
}

// Update local status
setEditAccessStatus('pending');
```

---

## 🧪 Testing

### Test Scenarios:

#### 1. First Time Request
- User clicks "Edit Profile"
- Modal appears with "Request Edit Access"
- User clicks "Send Request"
- Backend creates new request with status "pending"
- User sees "Request Sent" success modal
- UI shows "Pending admin approval" under Edit Profile

#### 2. Duplicate Request
- User already has pending request
- Clicks "Edit Profile" again
- Backend returns 400 error "Already have pending request"
- Modal shows error message
- User cannot send another request

#### 3. Admin Approval
- Admin approves request from dashboard
- Backend updates request status to "approved"
- User receives push notification
- Next time user opens app, status is "approved"
- User can now edit profile normally

#### 4. Admin Rejection
- Admin rejects request with reason
- Backend updates status to "rejected"
- User receives notification with reason
- User can request again after 24 hours

---

## 🚀 Deployment Checklist

### Backend Tasks:
- [ ] Create `access_requests` table/collection
- [ ] Implement POST `/api/users/request-edit-access` endpoint
- [ ] Implement POST `/api/users/request-id-verification-access` endpoint
- [ ] Implement GET `/api/users/access-status` endpoint
- [ ] Implement GET `/api/admin/access-requests` endpoint (admin only)
- [ ] Implement PUT `/api/admin/access-requests/:requestId/respond` endpoint (admin only)
- [ ] Add notification system integration
- [ ] Add rate limiting (3 requests/day per user)
- [ ] Add database indexes
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend Tasks:
- [x] Request Edit Access modal UI
- [x] Pending approval modal UI
- [x] Loading states
- [x] Error handling
- [ ] Replace TODO with actual API calls
- [ ] Test with real backend
- [ ] Test notification handling
- [ ] Test admin approval flow

### Admin Dashboard Tasks (if applicable):
- [ ] Create admin access requests page
- [ ] Add filter/search functionality
- [ ] Add approve/reject buttons
- [ ] Add reason input for rejection
- [ ] Show user details for context

---

## 📞 Contact

**Frontend Implementation:** See `profile-screen.tsx` line 409-448  
**Questions/Issues:** Contact backend development team  
**Reference:** Similar flow used for ID verification requests (line 465-490)

---

## ✅ Status

**Mobile App:** ✅ Ready - Awaiting backend API  
**Backend API:** ⚠️ TODO - Needs implementation  
**Admin Dashboard:** ⚠️ TODO - Needs implementation  
**Notifications:** ⚠️ TODO - Needs implementation  

**Priority:** High - Users are currently locked out of profile editing
