# 🔐 Complete Google Sign-In & Sign-Up Guide for MyToDoo Mobile

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Flow Diagram](#authentication-flow-diagram)
3. [Prerequisites & Requirements](#prerequisites--requirements)
4. [Firebase Configuration](#firebase-configuration)
5. [Key Files & Their Roles](#key-files--their-roles)
6. [Step-by-Step User Flow](#step-by-step-user-flow)
7. [API Integration](#api-integration)
8. [Code Deep Dive](#code-deep-dive)
9. [Navigation After Login](#navigation-after-login)
10. [Troubleshooting](#troubleshooting)
11. [Testing Guide](#testing-guide)

---

## Overview

MyToDoo uses **Firebase Authentication with Google Sign-In** for a seamless authentication experience. The flow uses native Firebase SDKs, which means:

- ✅ **Works in APK builds** (production/testing)
- ❌ **Does NOT work in Expo Go** (development limitation)
- ✅ **Email/Password login** works in both environments

### High-Level Flow

```
User clicks "Continue with Google"
       ↓
Firebase SDK opens Google Sign-In
       ↓
User authenticates with Google
       ↓
Firebase returns ID Token
       ↓
App sends ID Token to backend
       ↓
Backend validates & returns JWT + User
       ↓
App stores JWT & navigates to Home/Welcome
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE SIGN-IN FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   User       │    │  MyToDoo App    │    │  Google/Firebase │
│              │    │                 │    │                  │
└──────┬───────┘    └────────┬────────┘    └────────┬─────────┘
       │                     │                      │
       │  1. Tap "Continue   │                      │
       │     with Google"    │                      │
       │ ──────────────────► │                      │
       │                     │                      │
       │                     │  2. Configure &      │
       │                     │     Call GoogleSignin│
       │                     │ ────────────────────►│
       │                     │                      │
       │  3. Google Sign-In  │                      │
       │     UI appears      │◄─────────────────────│
       │◄────────────────────│                      │
       │                     │                      │
       │  4. User enters     │                      │
       │     Google account  │                      │
       │ ──────────────────────────────────────────►│
       │                     │                      │
       │                     │  5. Returns Google   │
       │                     │     ID Token         │
       │                     │◄─────────────────────│
       │                     │                      │
       │                     │  6. Sign into        │
       │                     │     Firebase Auth    │
       │                     │ ────────────────────►│
       │                     │                      │
       │                     │  7. Returns Firebase │
       │                     │     ID Token         │
       │                     │◄─────────────────────│
       │                     │                      │
       │                     │                      │
       │                     ▼                      │
       │          ┌─────────────────────┐          │
       │          │   MyToDoo Backend   │          │
       │          │  POST /users/       │          │
       │          │   firebase-auth     │          │
       │          └──────────┬──────────┘          │
       │                     │                      │
       │                     │  8. Validate Token   │
       │                     │  9. Create/Find User │
       │                     │  10. Return JWT      │
       │                     │                      │
       │                     ▼                      │
       │          ┌─────────────────────┐          │
       │          │  Store JWT + User   │          │
       │          │  Navigate to Home   │          │
       │          └─────────────────────┘          │
       │                     │                      │
       │  11. Welcome Screen │                      │
       │◄────────────────────│                      │
       │                     │                      │
```

---

## Prerequisites & Requirements

### Required Packages

```json
{
  "@react-native-firebase/app": "^21.14.0",
  "@react-native-firebase/auth": "^23.5.0",
  "@react-native-google-signin/google-signin": "^15.0.1"
}
```

### Requirements for Google Sign-In to Work

| Requirement | Why Needed |
|-------------|------------|
| **APK Build** | Firebase native modules don't work in Expo Go |
| **google-services.json** | Contains Firebase project config & OAuth clients |
| **Web Client ID** | Required for Google Sign-In SDK configuration |
| **Google Play Services** | Device must have Google Play Services installed |
| **Firebase Authentication enabled** | Google provider must be enabled in Firebase Console |

---

## Firebase Configuration

### Firebase Project Details

| Setting | Value |
|---------|-------|
| **Project ID** | `mytodoo-40c87` |
| **Project Number** | `697863453994` |
| **Package Name** | `com.unexo.mytodoomobile` |
| **Storage Bucket** | `mytodoo-40c87.firebasestorage.app` |

### google-services.json Location

```
MyToDooMobile/
└── android/
    └── app/
        └── google-services.json  ← Firebase config file
```

### How to Update Firebase Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `mytodoo-40c87`
3. **Navigate to Project Settings** (gear icon ⚙️)
4. **Find Your Android App** (`com.unexo.mytodoomobile`)
5. **Download** `google-services.json`
6. **Replace** the file at `android/app/google-services.json`

### Enable Google Sign-In Provider

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Google**
3. Toggle **Enable**
4. Add your **support email**
5. Click **Save**

### Get Web Client ID

The Web Client ID is found in `google-services.json`:

```json
{
  "oauth_client": [
    {
      "client_id": "xxxx.apps.googleusercontent.com",
      "client_type": 3  ← Web Client (type 3)
    }
  ]
}
```

Look for `client_type: 3` - that's your **Web Client ID**.

**Current Web Client ID** (from environment):
```
430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif.apps.googleusercontent.com
```

---

## Key Files & Their Roles

### 1. Firebase Auth Service
📄 **File**: `src/services/firebase-auth-service.ts`

**Purpose**: Core service that handles Google Sign-In with Firebase

```typescript
// Key functions:
export const signInWithGoogle = async (): Promise<string>
export const signOutFromFirebase = async (): Promise<void>
```

**What it does**:
- Configures Google Sign-In SDK with Web Client ID
- Opens Google Sign-In UI
- Gets Google ID Token
- Signs into Firebase with Google credential
- Returns Firebase ID Token for backend

---

### 2. Login Screen
📄 **File**: `src/features/auth/screens/login-screen.tsx`

**Purpose**: UI and logic for user login

**Key Functions**:
- `handleGoogleSignIn()` - Initiates Google Sign-In flow
- `handleGoogleSignInSuccess()` - Processes successful authentication
- `handleLogin()` - Email/password login

---

### 3. Signup Hook
📄 **File**: `src/features/auth/components/useSignup.ts`

**Purpose**: Handles user signup including Google Sign-Up

**Key Functions**:
- `handleGoogleSignIn()` - Google Sign-Up flow (same backend endpoint)

---

### 4. API Functions
📄 **File**: `src/api/mytasks.ts`

**Purpose**: API calls including Google authentication

**Key Function**:
```typescript
async function handleGoogleSignIn(firebaseIdToken: string) {
  // Calls: POST /users/firebase-auth
  // Body: { firebaseToken: "..." }
  // Returns: { token, user }
}
```

---

### 5. Firebase Config
📄 **File**: `src/config/firebase.ts`

**Purpose**: Firebase initialization and configuration

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyACCrN_zK5NKUUM7GtZulp4Sy53ewb495M",
  authDomain: "mytodoo-40c87.firebaseapp.com",
  projectId: "mytodoo-40c87",
  storageBucket: "mytodoo-40c87.firebasestorage.app",
  messagingSenderId: "697863453994",
  appId: "1:697863453994:web:648f36d94e17641e853253",
};
```

---

### 6. Auth Store
📄 **File**: `src/shared/stores/auth-store.ts`

**Purpose**: Zustand store for authentication state

**Stores**:
- `token` - JWT token
- `user` - User object
- `isAuthenticated` - Auth status

---

## Step-by-Step User Flow

### Login Flow

```
1. USER OPENS APP
   ↓
2. SEES LOGIN SCREEN
   - Email/Password fields
   - "Continue with Google" button
   ↓
3. TAPS "Continue with Google"
   ↓
4. APP CHECKS ENVIRONMENT
   - If Expo Go → Shows alert "Native Build Required"
   - If APK → Proceeds to step 5
   ↓
5. GOOGLE SIGN-IN SDK CONFIGURED
   - Web Client ID set
   - Scopes: ['email', 'profile']
   ↓
6. GOOGLE SIGN-IN UI APPEARS
   - Native Google account picker
   - User selects account
   ↓
7. GOOGLE RETURNS ID TOKEN
   ↓
8. APP SIGNS INTO FIREBASE
   - Creates Firebase credential
   - Signs in with credential
   ↓
9. FIREBASE RETURNS ID TOKEN
   ↓
10. APP CALLS BACKEND
    POST /users/firebase-auth
    Body: { firebaseToken: "..." }
    ↓
11. BACKEND VALIDATES & RESPONDS
    Response: { token: "JWT...", user: {...} }
    ↓
12. APP STORES AUTH DATA
    - JWT stored in AsyncStorage
    - User stored in auth store
    ↓
13. NAVIGATION
    - Clears cached data
    - Navigates to /(tabs) (Welcome Screen)
```

### Signup Flow (Same Backend Endpoint)

The signup flow is identical - the backend creates a new user if the email doesn't exist, or returns the existing user if it does.

---

## API Integration

### Backend Endpoint

```
POST /users/firebase-auth
```

### Request

```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Response (Success)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65abc123def456789",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Backend Responsibilities

1. **Receive** Firebase ID Token
2. **Verify** token using Firebase Admin SDK
3. **Extract** user info (email, name, photo)
4. **Find or Create** user in database
5. **Generate** JWT token
6. **Return** JWT + user object

---

## Code Deep Dive

### 1. Starting Google Sign-In (`login-screen.tsx`)

```typescript
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    
    // Check if Firebase Auth is available (only in APK, not Expo Go)
    if (!isFirebaseAvailable) {
      Alert.alert(
        '📱 Native Build Required',
        'Google Sign-In requires native Firebase modules...'
      );
      return;
    }
    
    // Import Firebase Auth service dynamically
    const { signInWithGoogle } = await import('@/src/services/firebase-auth-service');
    
    // Get Firebase ID Token
    const firebaseIdToken = await signInWithGoogle();
    
    // Send to backend
    await handleGoogleSignInSuccess(firebaseIdToken);
    
  } catch (error) {
    // Handle errors...
  } finally {
    setGoogleLoading(false);
  }
};
```

### 2. Firebase Auth Service (`firebase-auth-service.ts`)

```typescript
export const signInWithGoogle = async (): Promise<string> => {
  // 1. Import Google Sign-In SDK
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  
  // 2. Configure with Web Client ID
  await GoogleSignin.configure({
    webClientId: '430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  });
  
  // 3. Check Play Services
  await GoogleSignin.hasPlayServices();
  
  // 4. Sign in with Google
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.idToken;
  
  // 5. Sign into Firebase
  const authInstance = auth();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await authInstance.signInWithCredential(googleCredential);
  
  // 6. Get Firebase ID Token
  const firebaseIdToken = await userCredential.user.getIdToken();
  
  return firebaseIdToken;
};
```

### 3. Backend API Call (`mytasks.ts`)

```typescript
async function handleGoogleSignIn(firebaseIdToken: string) {
  const api = createApi(API_CONFIG.BASE_URL);
  
  const response = await api.post('/users/firebase-auth', {
    firebaseToken: firebaseIdToken
  });
  
  const { token, user } = response.data;
  
  // Store auth data
  await setAuthData(token, user);
  setStoredToken(token);
  
  return { token, user };
}
```

### 4. After Successful Login (`login-screen.tsx`)

```typescript
const handleGoogleSignInSuccess = useCallback(async (idToken: string) => {
  // 1. Clear all caches
  clearCachesOnLogin();
  await queryClient.clear();
  
  // 2. Call backend API
  const result = await googleSignIn({ credential: idToken });
  
  // 3. Invalidate queries for fresh data
  await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  await queryClient.invalidateQueries({ queryKey: ['chats'] });
  
  // 4. Check for pending actions (e.g., task creation before login)
  const pendingActionType = checkPendingAction();
  if (pendingActionType) {
    await executePendingAction();
  } else {
    // 5. Navigate to home
    router.replace('/(tabs)');
  }
}, [...]);
```

---

## Navigation After Login

After successful Google Sign-In, the app:

1. **Clears cached data** - Ensures no stale data from previous sessions
2. **Stores JWT token** - In AsyncStorage for persistence
3. **Stores user data** - In Zustand auth store
4. **Checks pending actions** - If user was creating a task before login
5. **Navigates to `/(tabs)`** - Which shows the Welcome Screen by default

### App Structure

```
app/
├── _layout.tsx          ← Root layout with AuthProvider
├── index.tsx            ← Initial route (redirects based on auth)
├── (auth)/
│   ├── login.tsx        ← Login screen
│   └── signup.tsx       ← Signup screen
├── (tabs)/
│   ├── _layout.tsx      ← Tab navigator
│   ├── index.tsx        ← Welcome Screen (default tab)
│   ├── browse.tsx       ← Browse tasks
│   ├── my-tasks.tsx     ← My tasks
│   └── account.tsx      ← Account/Profile
└── (welcome-screen)/    ← Welcome screen components
```

---

## Troubleshooting

### Error: "Firebase Auth not available"

**Cause**: Running in Expo Go instead of APK build

**Solution**: Build and install APK:
```bash
cd C:\Dev\MTD
cd android
.\gradlew assembleRelease
# Install: android\app\build\outputs\apk\release\app-release.apk
```

---

### Error: "DEVELOPER_ERROR"

**Cause**: Web Client ID mismatch or OAuth not configured

**Solutions**:
1. Download fresh `google-services.json` from Firebase Console
2. Ensure Google Sign-In is enabled in Firebase Authentication
3. Check SHA-1 fingerprint matches in Firebase Console

```powershell
# Get SHA-1 fingerprint
cd android
.\gradlew signingReport
```

---

### Error: "Play Services not available"

**Cause**: Device doesn't have Google Play Services

**Solution**: Test on a device/emulator with Google Play Services installed

---

### Error: Network/Connection Issues

**Cause**: Backend unreachable or token validation failed

**Solutions**:
1. Check internet connection
2. Verify backend is running
3. Check API URL configuration in `.env`

---

### Error: "Sign-In was cancelled"

**Cause**: User cancelled the Google Sign-In dialog

**Solution**: This is expected behavior - just let user try again

---

## Testing Guide

### Prerequisites for Testing

1. ✅ APK built and installed
2. ✅ Device has Google Play Services
3. ✅ Firebase Google Sign-In enabled
4. ✅ Backend running and accessible

### Test Steps

1. **Open MyToDoo app**
2. **Tap "Continue with Google"**
3. **Google account picker appears**
4. **Select your Google account**
5. **Wait for authentication**
6. **Verify navigation to Welcome Screen**
7. **Check user profile has correct data**

### Verifying in Console Logs

Enable USB debugging and run:
```powershell
adb logcat | Select-String "GoogleSignIn|Firebase|Auth"
```

Expected logs:
```
🔐 Starting Firebase Google Sign-In...
✅ Google Sign-In configured with Web Client ID: 430846501483...
🔐 Starting Google Sign-In flow...
✅ Got Google user info: user@gmail.com
✅ Got Google ID Token from Google
✅ Created Firebase credential
✅ Signed in to Firebase: user@gmail.com
✅ Got Firebase ID Token to send to backend
📤 Sending Firebase ID Token to backend
✅ Firebase Auth Success Response: {...}
✅ Backend authentication successful
```

---

## Summary

| Component | File | Purpose |
|-----------|------|---------|
| **Firebase Service** | `src/services/firebase-auth-service.ts` | Core Google Sign-In logic |
| **Login Screen** | `src/features/auth/screens/login-screen.tsx` | UI and flow orchestration |
| **API Layer** | `src/api/mytasks.ts` | Backend communication |
| **Firebase Config** | `src/config/firebase.ts` | Firebase initialization |
| **Auth Store** | `src/shared/stores/auth-store.ts` | State management |
| **google-services.json** | `android/app/google-services.json` | Firebase project config |

### Key Points to Remember

1. **Google Sign-In only works in APK builds**, not Expo Go
2. **Web Client ID** must match your Firebase project
3. Backend endpoint is `POST /users/firebase-auth`
4. After login, user is navigated to `/(tabs)` (Welcome Screen)
5. SHA-1 fingerprints must be registered in Firebase Console

---

*Document created: January 19, 2026*
*For project: MyToDoo Mobile (com.unexo.mytodoomobile)*
