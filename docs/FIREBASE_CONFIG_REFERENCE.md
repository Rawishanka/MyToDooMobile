# Firebase Configuration Reference — MyToDoo

**Firebase Project:** `mytodoo-e4cdb`  
**Last Updated:** March 17, 2026

---

## 📋 Project-Level Details

| Key | Value |
|-----|-------|
| Project ID | `mytodoo-e4cdb` |
| Project Number / Sender ID | `685356682007` |
| Auth Domain | `mytodoo-e4cdb.firebaseapp.com` |
| Storage Bucket | `mytodoo-e4cdb.firebasestorage.app` |
| Firebase Console | https://console.firebase.google.com/project/mytodoo-e4cdb |

---

## 🤖 Android — google-services.json

**File Location:** `android/app/google-services.json`

| Key | Value |
|-----|-------|
| Package Name | `com.mytodoo.mytodoolive` |
| App ID (mobilesdk_app_id) | `1:685356682007:android:43492ad2af1792850f8552` |
| API Key | `AIzaSyAT-WR-wfJ1VkDyoYj3wmucrQdHfnVsdtQ` |
| GCM Sender ID | `685356682007` |

### Android OAuth Client IDs
| Client ID | Type |
|-----------|------|
| `685356682007-1c32te3ilcp7uir81cfv4e7s02kqkhgo.apps.googleusercontent.com` | type 1 (Android) |
| `685356682007-7krabf4ruuquunafa4n36k410iui9q50.apps.googleusercontent.com` | type 1 (Android) |
| `685356682007-m2e0iba8eu1usf5s404789is5tjig5ie.apps.googleusercontent.com` | type 1 (Android) |
| `685356682007-rj5r1ie1nrknfdiifl8akq5ata5ib4fi.apps.googleusercontent.com` | type 3 (**Web Client** — Google Sign-In සඳහා) |

---

## 🍎 iOS — GoogleService-Info.plist

**File Location:** `GoogleService-Info.plist`

| Key | Value |
|-----|-------|
| Bundle ID | `com.mytodoo.mytodoolive` |
| App ID (GOOGLE_APP_ID) | `1:685356682007:ios:814388445aa23c5e0f8552` |
| iOS Client ID | `685356682007-brs7387p5gthok4o0nfdcvclvb6eghtj.apps.googleusercontent.com` |
| Reversed Client ID | `com.googleusercontent.apps.685356682007-brs7387p5gthok4o0nfdcvclvb6eghtj` |
| Android Client ID | `685356682007-1c32te3ilcp7uir81cfv4e7s02kqkhgo.apps.googleusercontent.com` |
| API Key | `AIzaSyDs8EAmF9p0hmpmgFVV4dApTC5rU2WSqyw` |
| GCM Sender ID | `685356682007` |
| Project ID | `mytodoo-e4cdb` |

---

## 🌐 Web App Config (Firebase JS SDK)

> **Note:** Web App Firebase Console ගෙ add කළාම `appId` ලැබෙනවා.  
> Firebase Console → Project Settings → Your Apps → Add App → Web

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAT-WR-wfJ1VkDyoYj3wmucrQdHfnVsdtQ",
  authDomain: "mytodoo-e4cdb.firebaseapp.com",
  projectId: "mytodoo-e4cdb",
  storageBucket: "mytodoo-e4cdb.firebasestorage.app",
  messagingSenderId: "685356682007",
  appId: "<< Firebase Console ගෙ Web App register කළාම ලැබෙනවා >>"
};
```

---

## 🔑 Google Sign-In — Web Client ID

Google Sign-In (GoogleSignin.configure) සඳහා use කරන **Web OAuth Client ID**:

```
685356682007-rj5r1ie1nrknfdiifl8akq5ata5ib4fi.apps.googleusercontent.com
```

> **Source:** `android/app/google-services.json` → `oauth_client` → `client_type: 3`

---

## 📱 FCM Push Notifications

### FCM Sender ID (Server Side)
```
685356682007
```

### Backend (Laravel/Node) FCM Send සඳහා
Firebase Console → Project Settings → **Service Accounts** → **Generate new private key**  
→ JSON file download → Backend ගෙ configure කරන්න

### FCM Registration Token Flow (Mobile App)
```
App launch → registerFCMToken() → POST /api/notifications/register-token
Body: { token: "<FCM device token>", platform: "android" | "ios" }
```

---

## 🔗 Mobile App Config Files

| File | Purpose |
|------|---------|
| `android/app/google-services.json` | Android Firebase config |
| `GoogleService-Info.plist` | iOS Firebase config |
| `src/config/firebase.ts` | React Native Firebase initialization |
| `src/services/notification-service.ts` | FCM token registration + handlers |
| `src/services/firebase-chat.ts` | Firestore realtime chat |
| `src/features/auth/screens/login-screen.tsx` | Google Sign-In + FCM retry logic |

---

## ⚙️ React Native Firebase Init (src/config/firebase.ts)

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyAT-WR-wfJ1VkDyoYj3wmucrQdHfnVsdtQ",
  authDomain: "mytodoo-e4cdb.firebaseapp.com",
  projectId: "mytodoo-e4cdb",
  storageBucket: "mytodoo-e4cdb.firebasestorage.app",
  messagingSenderId: "685356682007",
  appId: "1:685356682007:android:43492ad2af1792850f8552",
};
```

---

## 📌 Notes

- **GCM Sender ID = Project Number = messagingSenderId** → ඔක්කොම `685356682007`
- **iOS API Key සහ Android API Key** → different values (platform specific)
- **Web Client ID** (type 3) → Google Sign-In සඳහා only. FCM direct use නෑ.
- **Service Account Key** → Backend FCM notifications send කිරීමට ඕන. Firebase Console ගෙ download කරන්න. Code repository ගෙ commit **නොකරන්න** (gitignore).
- **Apple Migration Pending** → KCK Business Solutions PTY LTD migration complete වෙනකම් iOS TestFlight blocked.
