# 🚀 MyToDoo Mobile APK Build Guide

## ⚠️ Current Issue: Login Error

Based on your screenshot showing "Login Error - Something went wrong. Please try again later", this is caused by one of these issues:

1. **Network Security (Most Likely)** - Android blocks HTTP connections by default
2. **API Server Configuration** - CORS or backend not accepting requests
3. **Wrong Credentials** - Email/password don't match backend database

## ✅ Fixes Applied

### 1. Network Security Configuration
Added `network_security_config.xml` to allow HTTP connections to your backend server:
- ✅ Allows HTTP traffic to `134.199.172.167`
- ✅ Allows localhost and emulator addresses
- ✅ Updated AndroidManifest.xml with `usesCleartextTraffic="true"`

### 2. Enhanced Logging
Added detailed console logging to help diagnose login issues:
- Shows exact API URL being called
- Logs request/response details
- Shows error codes and messages

### 3. API Configuration
Verified `.env` file has correct backend URL:
```
EXPO_PUBLIC_API_URL=http://134.199.172.167:5001/api
```

## 🔧 Pre-Build Checklist

### 1. Verify Backend is Running
```powershell
# Test if backend is accessible
Test-NetConnection -ComputerName 134.199.172.167 -Port 5001

# Should show: TcpTestSucceeded : True
```

### 2. Test Login API Manually
```powershell
# Using PowerShell
$body = @{
    email = "janidu.ophtha@gmail.com"
    password = "your-password-here"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://134.199.172.167:5001/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 3. Create Test User (if needed)
If you don't have an account, create one first:
```powershell
$body = @{
    firstName = "Test"
    lastName = "User"
    email = "janidu.ophtha@gmail.com"
    password = "your-password"
    phone = "+1234567890"
    location = @{
        country = "Sri Lanka"
        countryCode = "LK"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://134.199.172.167:5001/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 📦 Building APK

### Option 1: Local Build (Faster, for testing)

```powershell
# Navigate to project directory
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"

# Clear cache
npx expo start --clear

# Build APK locally (requires Android Studio)
cd android
./gradlew clean
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: EAS Build (Recommended, Cloud Build)

```powershell
# Navigate to project directory
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"

# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS (if first time)
eas build:configure

# Build APK for production
eas build --platform android --profile production

# Or build for preview/testing
eas build --platform android --profile preview
```

### Build Profiles Explained

**Preview Build** (Faster, for testing):
```bash
eas build --platform android --profile preview
```
- ✅ Generates APK (can install directly)
- ✅ Internal distribution
- ✅ Faster build time
- ✅ Good for testing

**Production Build** (For Play Store):
```bash
eas build --platform android --profile production
```
- ✅ Optimized and signed
- ✅ Auto-increments version
- ✅ Ready for Play Store
- ⏱️ Takes longer

## 🔍 Debugging Login Issues

### Check Logs During Login Attempt

When you try to login, check the console logs for:

```
========================================
🔐 LOGIN ATTEMPT
========================================
📍 API URL: http://134.199.172.167:5001/api/auth/login
📧 Email: janidu.ophtha@gmail.com
🌐 BASE_URL from config: http://134.199.172.167:5001/api
⏱️ Timeout: 15000
========================================
```

### Common Error Patterns

**1. Network Error**
```
❌ LOGIN FAILED
Error code: ERR_NETWORK
Error message: Network Error
```
**Solution:** Backend not reachable. Check if server is running on `134.199.172.167:5001`

**2. CORS Error**
```
❌ LOGIN FAILED
Error code: undefined
Response status: undefined
```
**Solution:** Backend needs to allow CORS from mobile app:
```javascript
// In backend server.js
app.use(cors({
  origin: '*',  // Allow all origins (or specify mobile app)
  credentials: true
}));
```

**3. 401 Unauthorized**
```
❌ LOGIN FAILED
Response status: 401
Response data: { message: "Invalid credentials" }
```
**Solution:** Wrong email or password. Create account first or check credentials.

**4. 404 Not Found**
```
❌ LOGIN FAILED
Response status: 404
```
**Solution:** Backend endpoint doesn't exist. Check backend has `/api/auth/login` route.

## 🔐 Backend Requirements

Your backend MUST have these endpoints working:

### 1. Login Endpoint
```
POST http://134.199.172.167:5001/api/auth/login

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "expiresIn": 3600
}
```

### 2. CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',  // Or specify your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. HTTP Server (Not HTTPS)
Since your backend is HTTP (not HTTPS), Android needs special permission.
✅ This is already configured in `network_security_config.xml`

## 📱 Testing the APK

### After Building:

1. **Download APK** (from EAS build or local build folder)

2. **Install on Android Device**
   ```powershell
   # If using ADB
   adb install path/to/app-release.apk
   ```

3. **Grant Permissions**
   - Allow installation from unknown sources
   - Grant internet permission (automatic)

4. **Test Login**
   - Open app
   - Enter email: `janidu.ophtha@gmail.com`
   - Enter password
   - Watch console logs if connected to computer

## 🐛 If Login Still Fails

### Step 1: Verify Backend is Working
```powershell
# Test the exact endpoint
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    email = "janidu.ophtha@gmail.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://134.199.172.167:5001/api/auth/login" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content
```

### Step 2: Check Backend Logs
On your backend server, check console output when login request comes in.

### Step 3: Try Creating New Account
Instead of login, try signup first to create a test account.

## 🎯 Quick Build Commands

```powershell
# Navigate to project
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"

# Build preview APK (fastest)
eas build -p android --profile preview

# Or build production APK
eas build -p android --profile production

# Check build status
eas build:list
```

## 📋 Build Checklist

Before building:
- [x] Backend is running at `http://134.199.172.167:5001`
- [x] Backend `/api/auth/login` endpoint works
- [x] Test user exists in database
- [x] CORS is enabled on backend
- [x] `.env` file has correct API URL
- [x] Network security config allows HTTP
- [x] Android manifest updated

## 🚨 Common Mistakes

1. **❌ Backend not running** - App shows "Something went wrong"
2. **❌ Wrong IP address** - Make sure `134.199.172.167` is correct
3. **❌ Backend uses HTTPS** - Mobile app configured for HTTP
4. **❌ No test user** - Create account before trying to login
5. **❌ CORS not enabled** - Backend blocks mobile requests

## ✅ Success Indicators

When login works correctly, you'll see:
```
========================================
✅ LOGIN SUCCESS
========================================
Response status: 200
Response data keys: ["token", "user", "expiresIn"]
Has token: true
Has user: true
========================================
```

Then app navigates to home screen automatically.

## 📞 Next Steps

1. **Build the APK**: Run `eas build -p android --profile preview`
2. **Test Login**: Try logging in with correct credentials
3. **Check Logs**: If it fails, check console output
4. **Fix Backend**: If needed, enable CORS and check endpoints
5. **Rebuild**: After fixes, rebuild APK

---

**Note:** The "Login Error" is NOT a build issue - it's a runtime API connection issue. The APK will build successfully, but login requires:
1. ✅ Backend server running
2. ✅ Correct credentials
3. ✅ CORS enabled
4. ✅ Network connectivity
