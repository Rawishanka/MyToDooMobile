# 🚀 Quick Start: Build & Test Firebase

## ⚡ TL;DR - 3 Commands to Success

```bash
# 1. Build development APK (10-15 minutes)
npx eas build --platform android --profile development

# 2. Download APK from the link EAS provides

# 3. Install on Android device and open app
```

## 📱 What You'll See (Success)

```
Console logs when app opens:
📱 ========== PUSH NOTIFICATIONS STATUS ==========
✅ Initialized: true
📝 Token Registered: true
🔔 Permission Granted: true
❌ Error: None
==================================================
```

## 🧪 Test Notification

Use your backend Swagger test endpoint (from screenshots):
```
POST /notifications/test
{
  "title": "Test",
  "body": "FCM is working!",
  "data": {}
}
```

Notification should appear on device immediately!

## ❌ Common Error (Solved)

**Error**: "Native module RNFBAppModule not found"  
**Cause**: Using Expo Go instead of development build  
**Solution**: Build with EAS (command above)

## ✅ Why This Works

- React Native Firebase = Native modules
- Native modules = Must be compiled into app binary
- Expo Go = Generic app, can't have custom native modules
- EAS Build = Custom app binary with Firebase included

## 📚 Full Documentation

- `FIREBASE_RESTORATION_SUMMARY.md` - Complete explanation
- `FIREBASE_DEVELOPMENT_BUILD_GUIDE.md` - Step-by-step guide
- `build-firebase-dev.ps1` - Automated build script

## 🎯 Your Setup Status

✅ Firebase config: mytodoo-40c87  
✅ Google Services: android/app/google-services.json  
✅ FCM Service: src/services/firebase-messaging.ts  
✅ Auto-initialization: app/_layout.tsx  
✅ Backend: Working perfectly (screenshots confirmed)  
🔄 Next: Build development APK!

---

**Build now**: `npx eas build --platform android --profile development`
