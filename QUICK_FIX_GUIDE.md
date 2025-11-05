# 🔧 Quick Fix for APK Issues

## ✅ **Fixed Issues:**

### 1. **Network Connection Error in APK** ✅
**Problem:** Android APKs block HTTP connections by default
**Solution:** Added network security configuration to allow HTTP to your backend server

**Files Changed:**
- Created: `android/app/src/main/res/xml/network_security_config.xml`
- Updated: `android/app/src/main/AndroidManifest.xml`

### 2. **Google Sign-In Redirect URI Changed** ⚠️
**Problem:** Owner changed from `nowanya` to `janidu1234`
**New Redirect URI:** `https://auth.expo.io/@janidu1234/MyToDooMobile`

---

## 🎯 **ACTION REQUIRED: Update Google Cloud Console**

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/apis/credentials

### Step 2: Click on Your OAuth Client ID
`430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif`

### Step 3: Update Authorized Redirect URIs

**REMOVE the old URI:**
- ❌ `https://auth.expo.io/@nowanya/MyToDooMobile`

**ADD the new URI:**
- ✅ `https://auth.expo.io/@janidu1234/MyToDooMobile`

**Keep these existing ones:**
- ✅ `http://localhost:8081`
- ✅ `https://localhost:8081`

### Step 4: Keep Authorized JavaScript Origins (Don't Change)
- ✅ `https://auth.expo.io`
- ✅ `http://localhost:8081`
- ✅ `https://localhost:8081`

### Step 5: Click SAVE

### Step 6: Wait 10 Minutes
Google needs time to propagate changes.

---

## 🏗️ **Rebuild the APK**

After fixing Google Cloud Console, rebuild your APK:

```bash
npx eas build --platform android --profile production
```

Or for faster preview build:

```bash
npx eas build --platform android --profile preview
```

---

## ✅ **What's Fixed in the New APK:**

1. ✅ **HTTP Backend Connection** - Will connect to `http://134.199.172.167:5001/api`
2. ✅ **Google Sign-In** - Will work once you update Google Cloud Console
3. ✅ **Responsive UI** - Bottom tabs and headers won't cut off
4. ✅ **Blue Splash Screen** - Native blue splash screen with logo

---

## 🧪 **Testing Checklist:**

### After Rebuilding APK:

1. **Test Email/Password Login**
   - Should connect to backend successfully
   - Should save token and navigate to welcome screen

2. **Test Google Sign-In**
   - Should open Google account picker
   - Should redirect back to app
   - Should navigate to welcome screen

3. **Test Backend Connection**
   - Try browsing tasks
   - Try posting a task
   - Verify data loads from backend

---

## 🔍 **If Still Getting Errors:**

### Connection Error:
- Check if backend server is running: http://134.199.172.167:5001/api
- Try accessing in browser to verify it's reachable
- Check if firewall is blocking the port

### Google Sign-In Error:
- Verify you updated Google Cloud Console with new redirect URI
- Wait full 10 minutes after saving changes
- Clear app data and try again

### 400 Bad Request on Login:
- Verify email and password are correct
- Check backend logs for the exact error
- Ensure backend expects `username` field (not `email`)

---

## 📱 **Current Configuration:**

**Backend URL:** `http://134.199.172.167:5001/api`
**Google Client ID:** `430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif`
**Redirect URI:** `https://auth.expo.io/@janidu1234/MyToDooMobile`
**App Owner:** `janidu1234`
**Package:** `com.nowanya.mytodoomobile`

---

## ⚡ **Quick Commands:**

### Build APK:
```bash
npx eas build --platform android --profile production
```

### Check Build Status:
```bash
npx eas build:list
```

### Download Latest APK:
```bash
npx eas build:list
# Copy the download link from the output
```

---

## 🎯 **Next Steps:**

1. **Update Google Cloud Console** with new redirect URI ⚠️ CRITICAL
2. **Wait 10 minutes** for Google to update
3. **Rebuild APK** using EAS Build
4. **Test the new APK** on your device
5. **Report any remaining issues**

---

## ✅ **Summary:**

**Problem 1:** APK couldn't connect to HTTP backend → **FIXED** ✅
**Problem 2:** Google Sign-In redirect URI mismatch → **YOU NEED TO UPDATE GOOGLE CLOUD** ⚠️
**Problem 3:** Invalid credentials (400) → **Check backend server and credentials**

After updating Google Cloud Console and rebuilding, everything should work! 🚀
