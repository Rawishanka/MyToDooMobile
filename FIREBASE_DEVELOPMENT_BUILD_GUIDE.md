# Firebase Development Build Guide

## ✅ IMPORTANT: React Native Firebase Requires Development Build

**React Native Firebase DOES NOT work with Expo Go!** You must build a development or production APK/IPA.

## 🔥 Current Configuration Status

### ✅ Completed Setup
1. **Firebase Config** (`src/config/firebase.ts`)
   - Project: `mytodoo-40c87`
   - API Key: `AIzaSyACCrN_zK5NKUUM7GtZulp4Sy53ewb495M`
   - Messaging Sender ID: `697863453994`
   - App ID: `1:697863453994:web:648f36d94e17641e853253`

2. **Android Google Services** (`android/app/google-services.json`)
   - Package: `com.nowanya.mytodoomobile`
   - Configured with mytodoo-40c87 credentials

3. **App Configuration** (`app.config.ts`)
   - Added `@react-native-firebase/app` plugin
   - Added `@react-native-firebase/messaging` plugin
   - Google Services file path configured

4. **Gradle Configuration**
   - `android/build.gradle`: Google Services classpath added
   - `android/app/build.gradle`: Google Services plugin applied

5. **FCM Service** (`src/services/firebase-messaging.ts`)
   - Token registration with backend
   - Notification handlers (foreground/background/quit state)
   - Permission handling for iOS/Android
   - Token refresh handling

6. **FCM Initialization Hook** (`src/shared/hooks/useInitializeFCM.ts`)
   - Auto-initializes FCM on app start
   - Called from `app/_layout.tsx`

## 📱 Why Development Build is Required

Expo Go is a generic app that runs your JavaScript code. React Native Firebase requires **native modules** that must be compiled into your app binary:

- ❌ **Expo Go**: Cannot use native Firebase SDKs
- ✅ **Development Build**: Includes Firebase native modules
- ✅ **Production Build**: Includes Firebase native modules

## 🚀 Build Your Development APK (Android)

### Step 1: Install EAS CLI (if not installed)
```bash
npm install -g eas-cli
```

### Step 2: Login to EAS
```bash
eas login
```

### Step 3: Build Development APK
```bash
npx eas build --platform android --profile development
```

This will:
- Upload your code to EAS servers
- Install all native dependencies (including React Native Firebase)
- Compile Android native modules
- Generate a development APK with Firebase integrated
- Provide download link when complete (~10-15 minutes)

### Step 4: Install APK on Physical Device
1. Download the APK from the EAS build link
2. Transfer to your Android device
3. Enable "Install from unknown sources" in Android settings
4. Install the APK
5. Open the app

### Step 5: Verify FCM Working
After opening the app, check the console logs:
```
📱 ========== PUSH NOTIFICATIONS STATUS ==========
✅ Initialized: true
📝 Token Registered: true
🔔 Permission Granted: true
❌ Error: None
=================================================
```

## 🧪 Testing Notifications

### Backend Notification Test (Your Screenshots)
Your backend is already configured correctly and sending notifications through Firebase:

1. **Backend sends FCM notification**
   ```json
   {
     "title": "🎯 Test Notification",
     "body": "This is a test push notification! If you see this, FCM is working perfectly! 🎉",
     "data": {...}
   }
   ```

2. **Firebase processes notification**
   - Uses mytodoo-40c87 project credentials
   - Sends to registered device tokens

3. **Mobile app receives notification**
   - Foreground: `onMessage` handler in `firebase-messaging.ts`
   - Background: `onNotificationOpenedApp` handler
   - Quit state: `getInitialNotification` handler

### Test Flow
1. Build and install development APK
2. Open app and grant notification permissions
3. App registers FCM token with backend
4. Use your backend Swagger test endpoint
5. Send test notification
6. Verify notification appears on device

## 📊 FCM Token Flow

```
1. App starts → useInitializeFCM() hook runs
                ↓
2. Request notification permissions (iOS) / Auto-granted (Android)
                ↓
3. Get FCM token from Firebase SDK
   messaging().getToken()
                ↓
4. Register token with backend
   POST /users/fcm-token
   { token, device, deviceId }
                ↓
5. Backend stores token in database
                ↓
6. Backend can now send notifications to this device
   Using Firebase Admin SDK server-side
```

## 🔄 When Token Refreshes
Firebase tokens can refresh periodically. The app handles this automatically:

```typescript
// src/services/firebase-messaging.ts
messaging().onTokenRefresh(async (token) => {
  console.log('🔄 FCM token refreshed');
  
  // Auto-register new token with backend
  await saveFCMToken({ token, device, deviceId });
});
```

## 📝 Backend Requirements (Already Implemented)

Based on your screenshots, your backend has:
- ✅ Firebase Admin SDK configured
- ✅ FCM token storage endpoints
- ✅ Notification sending through Firebase
- ✅ Test notification endpoint working

## 🎯 Next Steps

### 1. Build Development APK
```bash
npx eas build --platform android --profile development
```

### 2. Install and Test
- Install APK on physical Android device
- Open app and check console logs
- Verify FCM token registration succeeds

### 3. Test Notifications
- Use your backend Swagger test endpoint
- Send test notification
- Verify it appears on device

### 4. Build for Production (when ready)
```bash
npx eas build --platform android --profile production
```

## ⚠️ Common Issues

### Issue: "Native module RNFBAppModule not found"
**Cause**: Running with Expo Go instead of development build  
**Solution**: Build development APK with EAS (see above)

### Issue: "Notification permissions denied"
**Cause**: User denied notification permissions  
**Solution**: Go to Android Settings → Apps → MyToDoo → Permissions → Enable Notifications

### Issue: "FCM token not registering with backend"
**Cause**: Backend FCM endpoints not responding  
**Solution**: Check backend console logs and verify endpoints are running

### Issue: "Notifications not received"
**Cause**: Backend using wrong Firebase project credentials  
**Solution**: Verify backend uses mytodoo-40c87 credentials (your screenshots show this is correct)

## 📚 File Reference

### Configuration Files
- `src/config/firebase.ts` - Firebase initialization
- `android/app/google-services.json` - Android Firebase config
- `app.config.ts` - Expo config with Firebase plugins
- `eas.json` - EAS build profiles

### Service Files
- `src/services/firebase-messaging.ts` - FCM service implementation
- `src/shared/hooks/useInitializeFCM.ts` - FCM initialization hook
- `app/_layout.tsx` - App root with FCM initialization

### API Files
- `src/api/fcm-api.ts` - Backend FCM token endpoints

## 🎉 Success Criteria

Your implementation is successful when:
1. ✅ Development build installs without errors
2. ✅ App starts and shows FCM initialized logs
3. ✅ FCM token registered with backend (check backend logs)
4. ✅ Test notification sent from backend appears on device
5. ✅ Tapping notification opens app and navigates correctly

## 🔗 Resources

- [React Native Firebase Docs](https://rnfirebase.io/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

---

**Remember**: Expo Go ❌ | Development Build ✅ | Production Build ✅
