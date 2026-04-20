# User Profile API Endpoints

These are the API endpoints that need to be implemented on the backend to support the user profile functionality:

## 📋 Required Endpoints

### 1. Get User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Authentication**: Required (Bearer token)
- **Description**: Get the authenticated user's profile information
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "_id": "670398eb6d4c8de73c123456",
    "email": "rasindu.rawishanka@gmail.com",
    "firstName": "Rasindu",
    "lastName": "Rawishanka",
    "phone": "+94719409238",
    "skills": [],
    "rating": 4,
    "completedTasks": 0,
    "isVerified": true,
    "verified": false,
    "role": "user",
    "location": "Colombo, Sri Lanka",
    "bio": "Experienced task helper",
    "profilePicture": "https://example.com/profile.jpg",
    "verification": {
      "ratifyId": {
        "status": null
      }
    },
    "createdAt": "2025-10-07T06:34:19.793Z",
    "updatedAt": "2025-10-07T06:34:19.793Z"
  }
}
```

### 2. Update User Profile
- **Endpoint**: `PUT /api/auth/profile`
- **Authentication**: Required (Bearer token)
- **Description**: Update the authenticated user's profile information
- **Request Example**:
```json
{
  "firstName": "Updated First",
  "lastName": "Updated Last",
  "phone": "+94719409999",
  "location": "Kandy, Sri Lanka",
  "bio": "Updated bio information"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "_id": "670398eb6d4c8de73c123456",
    "email": "rasindu.rawishanka@gmail.com",
    "firstName": "Updated First",
    "lastName": "Updated Last",
    "phone": "+94719409999",
    "location": "Kandy, Sri Lanka",
    "bio": "Updated bio information",
    "...": "other fields remain the same"
  }
}
```

### 3. Change Password
- **Endpoint**: `PUT /api/auth/change-password`
- **Authentication**: Required (Bearer token)
- **Description**: Change the authenticated user's password
- **Request Example**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```
- **Response Example**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 4. Upload Profile Picture
- **Endpoint**: `POST /api/auth/profile/picture`
- **Authentication**: Required (Bearer token)
- **Description**: Upload a new profile picture
- **Request**: Multipart form data with `profilePicture` file field
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://yourdomain.com/uploads/profiles/123456789_profile.jpg"
  }
}
```

## 🔧 Implementation Notes

### Database Schema
The User model should include these fields:
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  firstName: String (required),
  lastName: String (required),
  phone: String,
  password: String (hashed),
  skills: [String],
  rating: Number (default: 0),
  completedTasks: Number (default: 0),
  isVerified: Boolean (default: false),
  verified: Boolean (default: false),
  role: String (enum: ['user', 'admin']),
  location: String,
  bio: String,
  profilePicture: String,
  verification: {
    ratifyId: {
      status: String
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Security Considerations
1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access/modify their own profile
3. **Password Validation**: Verify current password before allowing change
4. **File Upload**: Validate file type and size for profile pictures
5. **Input Validation**: Sanitize and validate all input fields

### Error Handling
- **401 Unauthorized**: Invalid or missing token
- **400 Bad Request**: Invalid input data
- **404 Not Found**: User not found
- **409 Conflict**: Email already exists (if email update is allowed)
- **500 Internal Server Error**: Server errors

## 📱 Frontend Integration

The frontend automatically handles:
- ✅ Token authentication via interceptors
- ✅ Loading states and error handling
- ✅ Automatic data refresh after updates
- ✅ Mock data fallback for development
- ✅ Real-time UI updates with React Query cache

## 🧪 Testing

Test with these sample requests:
```bash
# Get profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/auth/profile

# Update profile
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User"}' \
     http://localhost:5001/api/auth/profile
```