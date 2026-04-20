# Firebase Google Authentication Implementation

## ✅ Implementation Complete!

Firebase Google Sign-In/Sign-Up has been implemented using the following flow:

### Flow Overview:
1. User clicks "Continue with Google" 
2. App uses Firebase Auth SDK to open Google Sign-In
3. User authenticates with Google account
4. Firebase returns ID Token
5. App sends Firebase ID Token to backend: `POST /users/firebase-auth`
6. Backend validates token and returns JWT + user data
7. App stores JWT and navigates user to home screen

### Backend Endpoint:
```
POST /users/firebase-auth
Body: { firebaseToken: "..." }
Response: { token: "JWT...", user: {...} }
```

## 📦 Installation Required

Run these commands to install the required packages:

```bash
npm install
```

Or manually install:
```bash
npm install @react-native-firebase/auth@^23.5.0
npm install @react-native-google-signin/google-signin@^15.0.1
```

## 🔧 Configuration Required

### 1. Get Web Client ID from Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `mytodoo-40c87`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Go to **Project Settings** → **General**
6. Find **Web Client ID** under "Web API Key"
7. Copy the Web Client ID (format: `xxxxx-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com`)

### 2. Update Web Client ID in Code

Open `src/features/auth/screens/login-screen.tsx` and update line ~560:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // Replace this
});
```

Do the same in `src/features/auth/components/useSignup.ts` if using signup.

### 3. Rebuild APK

Since this uses native modules, you **must build an APK**:

```bash
npm run android
```

Or for EAS build:
```bash
eas build --platform android --profile preview
```

## 📝 Files Modified

1. **`package.json`** - Added Firebase Auth and Google Sign-In packages
2. **`src/config/firebase.ts`** - Added Firebase Auth initialization
3. **`src/api/mytasks.ts`** - Updated `handleGoogleSignIn` to use `/users/firebase-auth`
4. **`src/features/auth/screens/login-screen.tsx`** - Replaced expo-auth-session with Firebase Auth
5. **`src/services/firebase-auth-service.ts`** - NEW: Firebase Auth service (optional helper)

## ⚠️ Important Notes

- **Native Build Only**: Google Sign-In will NOT work in Expo Go - you need an APK
- **Old Endpoint Removed**: Changed from `/auth/google` to `/users/firebase-auth`
- **Web Client ID Required**: You MUST configure the Web Client ID from Firebase Console
- **Firebase Config**: Already configured in `src/config/firebase.ts` with your credentials

## 🧪 Testing

1. Build APK: `npm run android` or use EAS build
2. Install APK on device
3. Open app and click "Continue with Google"
4. Sign in with Google account
5. Verify successful login and navigation to home

## 🐛 Troubleshooting

### Error: "Firebase Auth not available"
- You're running in Expo Go. Build an APK instead.

### Error: "DEVELOPER_ERROR"
- Web Client ID is incorrect or not configured
- Check Firebase Console for correct Web Client ID

### Error: "Play Services not available"
- Device doesn't have Google Play Services
- Test on a device with Google Play Services installed

## 📞 Backend Integration

The backend endpoint `/users/firebase-auth` should:
1. Receive `firebaseToken` in request body
2. Verify token with Firebase Admin SDK
3. Create/find user in database
4. Return JWT token and user object

Expected response format:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "avatar": "...",
    "role": "user",
    "isVerified": false
  }
}
```
