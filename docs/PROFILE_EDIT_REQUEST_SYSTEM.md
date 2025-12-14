# Profile Edit Request System - Implementation Guide

## 📋 Overview

The profile edit request system implements an admin approval workflow for profile changes. Users must request permission to edit their profile, which is sent to the admin for approval via email.

## 🎯 User Flow

```
User opens Edit Profile screen
    ↓
System checks for pending requests
    ↓
User fills in profile details:
  - First Name
  - Last Name
  - Phone Number
  - Country
  - Country Code
  - State/Region
  - City
  - Bio
    ↓
User clicks "Save Changes"
    ↓
Alert shows: "Request Edit Access"
  - Message: "Your profile is locked. Send a request to admin to enable editing?"
  - Shows admin email: administration@mytodoo.com
    ↓
User clicks "Send Request"
    ↓
Request sent to backend API
    ↓
Email sent to administration@mytodoo.com
    ↓
Admin clicks "Approve Changes" in email
    ↓
Profile automatically updated
    ↓
User receives confirmation email
```

## 🔧 Technical Implementation

### 1. API Service Layer

**File:** `src/api/profile-edit-request-api.ts`

```typescript
// Three main API functions:

1. submitProfileEditRequest(requestData)
   - POST /v1/users/profile-edit/request
   - Submits profile change request to backend

2. getProfileEditStatus()
   - GET /v1/users/profile-edit/status
   - Checks if user has pending request

3. getProfileEditHistory(limit)
   - GET /v1/users/profile-edit/history
   - Gets history of all requests
```

### 2. React Query Hooks

**File:** `src/shared/hooks/useProfileEditRequestApi.ts`

```typescript
// Three hooks for data management:

1. useGetProfileEditStatus()
   - Fetches current request status
   - Cached for 5 minutes
   - Auto-refreshes on focus

2. useGetProfileEditHistory(limit)
   - Fetches request history
   - Paginated with limit parameter

3. useSubmitProfileEditRequest()
   - Mutation hook for submitting requests
   - Auto-invalidates cache on success
```

### 3. Edit Profile Screen

**File:** `src/shared/components/custom_components/editprofilescreen.jsx`

**Key Features:**
- Real-time pending request status check
- Visual banner showing pending approval state
- Loading indicator during status check
- Comprehensive form fields matching API requirements
- Alert dialog with admin email (administration@mytodoo.com)

**Form Fields:**
- First Name
- Last Name
- Phone Number
- Country
- Country Code (2 characters)
- State/Region
- City
- Bio

## 📡 API Endpoints

### 1. Submit Profile Edit Request

```http
POST /v1/users/profile-edit/request
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "firstName": "Prasanna",
  "lastName": "Hewapathirana",
  "phone": "+94771628274",
  "location": {
    "country": "Sri Lanka",
    "countryCode": "LK",
    "region": "Western Province",
    "city": "Meerigama, Western Province"
  },
  "bio": "Hi I'm Janidu"
}

Success Response (200):
{
  "success": true,
  "message": "Profile edit request submitted. An admin will review your request...",
  "requestId": "60d5ec49f1b2c8b3f8e4d6a7"
}

Error Response (400 - Pending Request):
{
  "success": false,
  "message": "You already have a pending profile edit request. Please wait for admin approval."
}
```

### 2. Check Request Status

```http
GET /v1/users/profile-edit/status
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "data": {
    "hasPendingRequest": false,
    "canEdit": true,
    "request": null  // or request object if pending
  }
}
```

### 3. Get Request History

```http
GET /v1/users/profile-edit/history?limit=10
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "data": [
    {
      "requestId": "60d5ec49f1b2c8b3f8e4d6a7",
      "requestedChanges": {...},
      "status": "approved",
      "createdAt": "2025-01-15T10:30:00Z",
      "reviewedAt": "2025-01-15T14:20:00Z",
      "reviewedBy": {
        "firstName": "Super",
        "lastName": "Admin"
      }
    }
  ]
}
```

### 4. Approve Request (Email Link)

```http
GET /v1/users/profile-edit/approve/{token}

This endpoint is called when admin clicks the approval link in the email.
Returns an HTML page showing approval status.
No authentication required (token is in URL).
```

## 🎨 UI Components

### Loading State

```jsx
{isLoadingStatus && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="small" color="#0052A2" />
    <Text style={styles.loadingText}>Checking edit status...</Text>
  </View>
)}
```

### Pending Request Banner

```jsx
{editStatusData?.data?.hasPendingRequest && (
  <View style={styles.pendingBanner}>
    <Ionicons name="time-outline" size={20} color="#f39c12" />
    <View style={styles.pendingBannerText}>
      <Text style={styles.pendingBannerTitle}>Pending Admin Approval</Text>
      <Text style={styles.pendingBannerSubtext}>
        Your profile edit request is waiting for admin review.
      </Text>
    </View>
  </View>
)}
```

### Request Alert Dialog

```jsx
Alert.alert(
  'Request Edit Access',
  'Your profile is locked. Send a request to admin to enable editing?\n\nAdmin will review your request.\n\nEmail: administration@mytodoo.com',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Send Request', onPress: handleSubmitRequest }
  ]
);
```

## 🔐 Admin Email Configuration

**Default Admin Email:** `administration@mytodoo.com`
**Default Admin Password:** `Adm!n@Mytod00`

The admin email is hardcoded in the alert dialog and displayed to users when they request edit access.

## 📧 Email Flow

1. **Request Submission Email**
   - Sent to: `administration@mytodoo.com`
   - Contains: User details, requested changes
   - Includes: "Approve Changes" button/link

2. **Approval Process**
   - Admin clicks approval link in email
   - Backend automatically applies profile changes
   - User profile updated in database

3. **Confirmation Email**
   - Sent to: User's email
   - Confirms: Profile has been updated
   - Details: Changes that were applied

## ⚠️ Important Notes

1. **Token-Based Approval**: The approval link contains a unique token that identifies the request
2. **No Duplicate Requests**: System prevents submitting new requests while one is pending
3. **Auto-Invalidation**: React Query cache automatically refreshes after successful submission
4. **Error Handling**: Comprehensive error messages for network issues and validation errors
5. **Existing OTP System**: Uses the same email service that's currently sending OTP codes

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Edit Profile screen loads without errors
- [ ] Status check shows loading indicator
- [ ] Pending request banner appears when request exists
- [ ] All form fields are editable
- [ ] Save Changes button triggers request alert
- [ ] Alert shows correct admin email (administration@mytodoo.com)
- [ ] Request submission shows success message
- [ ] Error handling works for duplicate requests
- [ ] Navigation back to profile works after submission

### Backend Testing
- [ ] POST /v1/users/profile-edit/request creates request
- [ ] GET /v1/users/profile-edit/status returns correct state
- [ ] Email sent to administration@mytodoo.com
- [ ] Approval link in email works
- [ ] Profile updates after approval
- [ ] Duplicate request prevention works
- [ ] Request history endpoint returns data

### Integration Testing
- [ ] End-to-end flow: Submit → Email → Approve → Update
- [ ] Multiple users can submit requests simultaneously
- [ ] Request expiration works (if implemented)
- [ ] Error states display correctly
- [ ] Cache invalidation works properly

## 🚀 Deployment Notes

1. **Environment Configuration**
   - Ensure email service is configured for production
   - Verify admin email `administration@mytodoo.com` exists
   - Test approval links work in production domain

2. **Database Migrations**
   - Profile edit requests collection/table should exist
   - Proper indexes on userId and status fields

3. **Email Templates**
   - Request notification email template
   - Approval confirmation email template
   - HTML styling for approval page

## 📚 Related Files

```
Frontend:
├── src/api/profile-edit-request-api.ts          # API service layer
├── src/shared/hooks/useProfileEditRequestApi.ts # React Query hooks
└── src/shared/components/custom_components/
    └── editprofilescreen.jsx                    # Edit Profile UI

Backend:
└── /v1/users/profile-edit/*                     # API endpoints (already implemented)
```

## 🔄 Future Enhancements

1. **Admin Dashboard**: Web interface for managing requests
2. **Rejection Flow**: Allow admin to reject with reason
3. **Notification System**: Push notifications for approval status
4. **Auto-Expiry**: Requests expire after 7 days
5. **Audit Log**: Track all profile changes
6. **Batch Approval**: Approve multiple requests at once
7. **Request Comments**: Admin can add notes to requests

## 💡 Usage Example

```typescript
// In any component, import the hooks
import { useGetProfileEditStatus, useSubmitProfileEditRequest } from '@/src/shared/hooks/useProfileEditRequestApi';

// Check status
const { data: statusData, isLoading } = useGetProfileEditStatus();

// Submit request
const submitRequest = useSubmitProfileEditRequest();

const handleSubmit = async () => {
  try {
    const response = await submitRequest.mutateAsync({
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      location: {
        country: 'USA',
        countryCode: 'US',
        region: 'California',
        city: 'Los Angeles'
      },
      bio: 'Software Engineer'
    });
    
    if (response.success) {
      alert('Request submitted successfully!');
    }
  } catch (error) {
    alert('Failed to submit request');
  }
};
```

---

**Created:** December 13, 2025  
**Last Updated:** December 13, 2025  
**Status:** ✅ Implementation Complete
