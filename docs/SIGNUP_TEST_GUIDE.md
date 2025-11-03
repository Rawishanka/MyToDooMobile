# 🎯 **Test Signup and Login Process**

## 📋 **Step-by-Step Testing Guide**

### **1. 🔄 Start Fresh**
Make sure your backend server is running on `http://192.168.1.4:5001`

### **2. 👤 Test Signup Process**

**Use these test credentials:**
- **First Name:** `Test`
- **Last Name:** `User`
- **Email:** `testuser@example.com`
- **Password:** `TestPassword123!`
- **Confirm Password:** `TestPassword123!`

### **3. 📧 OTP Verification**
1. After signup, check email: `testuser@example.com`
2. Find the 6-digit OTP code
3. Enter it in the verification field
4. Tap "Verify & Complete Signup"

### **4. 🔐 Test Login**
1. Go to login screen
2. Use same credentials:
   - **Email:** `testuser@example.com`
   - **Password:** `TestPassword123!`
3. Should login successfully!

## 🚨 **Expected Backend Responses**

### **Signup (POST /auth/signup):**
```json
{
  "message": "Signup successful, OTP sent to email",
  "email": "testuser@example.com"
}
```

### **OTP Verification (POST /auth/verify-otp):**
```json
{
  "message": "Account verified successfully",
  "user": {
    "id": "user_id",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### **Login (POST /auth/login):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id", 
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User"
  },
  "expiresIn": "24h"
}
```

## 🔍 **Troubleshooting**

### **If signup fails:**
- Check network connection
- Verify backend is running
- Check console logs for errors

### **If OTP not received:**
- Check spam folder
- Verify email server configuration
- Try with a real email address

### **If login fails after OTP:**
- Ensure OTP verification was successful
- Check that user account is active
- Verify credentials are exactly the same

## 🎯 **Alternative Test Users**

You can also try these test accounts:

1. **User 1:**
   - Email: `john.doe@example.com`
   - Password: `JohnDoe123!`

2. **User 2:**
   - Email: `jane.smith@example.com` 
   - Password: `SecurePass456@`

---

**This complete flow will test signup → OTP verification → login successfully!** ✅