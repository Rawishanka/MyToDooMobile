# 🔧 Google Cloud Console - EXACT Configuration Needed

## ❌ What's Wrong in Your Current Setup

Looking at your screenshot, you're missing the **Authorized JavaScript origins**!

### Current Setup (WRONG):
- ✅ **Authorized redirect URIs**: `https://auth.expo.io/@nowanya/MyToDooMobile`
- ❌ **Authorized JavaScript origins**: Only localhost URLs

---

## ✅ CORRECT Configuration

### Step 1: Open Your OAuth Client ID
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth Client ID: `430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif`

### Step 2: Configure Authorized JavaScript Origins

**Click "+ ADD URI" and add these EXACTLY:**

```
1. https://auth.expo.io
2. http://localhost:8081
3. https://localhost:8081
```

**Your "Authorized JavaScript origins" should have:**
- URIs 1: `https://auth.expo.io`
- URIs 2: `http://localhost:8081`
- URIs 3: `https://localhost:8081`

### Step 3: Configure Authorized Redirect URIs

**Keep what you have, but make sure it's EXACTLY:**

```
1. https://auth.expo.io/@nowanya/MyToDooMobile
2. http://localhost:8081
3. https://localhost:8081
```

**Your "Authorized redirect URIs" should have:**
- URIs 1: `https://auth.expo.io/@nowanya/MyToDooMobile`
- URIs 2: `http://localhost:8081`
- URIs 3: `https://localhost:8081`

### Step 4: Click SAVE

**IMPORTANT:** Wait 5-10 minutes after saving!

---

## 📋 Checklist - Complete This Exactly

### In Google Cloud Console:

**OAuth Consent Screen:**
- [ ] User Type: External
- [ ] App name: MyToDooMobile
- [ ] User support email: Your email
- [ ] Developer contact: Your email
- [ ] Status: Testing (or Published)
- [ ] Test users: Added your Gmail account

**OAuth Client ID (Web Application):**

**Authorized JavaScript origins:**
- [ ] `https://auth.expo.io`
- [ ] `http://localhost:8081`
- [ ] `https://localhost:8081`

**Authorized redirect URIs:**
- [ ] `https://auth.expo.io/@nowanya/MyToDooMobile`
- [ ] `http://localhost:8081`
- [ ] `https://localhost:8081`

**Client ID & Secret:**
- [ ] Client ID: `430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif.apps.googleusercontent.com`
- [ ] Copied to `.env` file as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

---

## 🔍 How to Verify It's Correct

### Step 1: Check Your Console Logs
After reloading the app, you should see:

```
📱 Redirect URI for Google OAuth: https://auth.expo.io/@nowanya/MyToDooMobile
🔐 Google Client ID: Configured
🔐 Google Sign-In Configuration: {
  Client ID: 430846501483-losl6kogpq7q5tl26p2bk9nevjp2tbif.apps.googleusercontent.com
  Redirect URI: https://auth.expo.io/@nowanya/MyToDooMobile
  Owner: nowanya
  Slug: MyToDooMobile
}
```

**NOT:**
```
❌ Redirect URI: exp://192.168.1.168:8081  (WRONG!)
```

### Step 2: Test Google Sign-In
1. Click "Continue with Google"
2. Should see Google account picker
3. Select your account
4. Should redirect back to app successfully

---

## 🚨 Common Mistakes

### 1. Missing JavaScript Origins
**Error:** "Authorization Error: Access blocked"
**Fix:** Add `https://auth.expo.io` to **Authorized JavaScript origins**

### 2. Wrong Redirect URI Format
**Wrong:** `https://auth.expo.io/nowanya/MyToDooMobile` (missing @)
**Correct:** `https://auth.expo.io/@nowanya/MyToDooMobile`

### 3. Not Waiting for Google to Update
**Issue:** Changes not taking effect immediately
**Fix:** Wait 5-10 minutes after clicking SAVE

### 4. Using Wrong Client ID Type
**Wrong:** Android Client ID, iOS Client ID
**Correct:** **Web Application** Client ID (for Expo)

---

## 📸 What Your Google Cloud Console Should Look Like

### Authorized JavaScript Origins Section:
```
┌─────────────────────────────────────────────┐
│ Authorized JavaScript origins               │
│ For use with requests from a browser        │
├─────────────────────────────────────────────┤
│ URIs 1 *                                    │
│ https://auth.expo.io                        │
├─────────────────────────────────────────────┤
│ URIs 2 *                                    │
│ http://localhost:8081                       │
├─────────────────────────────────────────────┤
│ URIs 3 *                                    │
│ https://localhost:8081                      │
├─────────────────────────────────────────────┤
│         [+ Add URI]                         │
└─────────────────────────────────────────────┘
```

### Authorized Redirect URIs Section:
```
┌─────────────────────────────────────────────┐
│ Authorized redirect URIs                    │
│ For use with requests from a web server     │
├─────────────────────────────────────────────┤
│ URIs 1 *                                    │
│ https://auth.expo.io/@nowanya/MyToDooMobile │
├─────────────────────────────────────────────┤
│ URIs 2 *                                    │
│ http://localhost:8081                       │
├─────────────────────────────────────────────┤
│ URIs 3 *                                    │
│ https://localhost:8081                      │
├─────────────────────────────────────────────┤
│         [+ Add URI]                         │
└─────────────────────────────────────────────┘
```

---

## 🎯 After Configuration

### Step 1: Restart Expo Dev Server
```bash
npx expo start --clear
```

### Step 2: Reload Your App
Press "R" in the terminal or shake device and press "Reload"

### Step 3: Check Console Logs
Should see:
```
✅ Redirect URI: https://auth.expo.io/@nowanya/MyToDooMobile
```

### Step 4: Test Google Sign-In
Click "Continue with Google" button

---

## ✨ Expected Behavior

1. Click "Continue with Google"
2. Browser/WebView opens with Google login
3. You see list of your Google accounts
4. Select account → Redirects back to app
5. App receives ID token
6. Backend validates token
7. You're logged in! 🎉

---

## 🆘 Still Not Working?

### Double-Check:
1. **JavaScript origins** includes `https://auth.expo.io`
2. **Redirect URI** is EXACTLY `https://auth.expo.io/@nowanya/MyToDooMobile`
3. Waited 10 minutes after saving
4. Restarted Expo dev server
5. Console logs show correct redirect URI (not `exp://192.168...`)
6. Using the correct Client ID in `.env`
7. Test user added to OAuth consent screen

### If Still Failing:
1. Delete the OAuth Client ID
2. Create a NEW one (Web Application type)
3. Add the URIs again
4. Copy NEW Client ID to `.env`
5. Wait 10 minutes
6. Test again

---

## 📝 Summary

**The key missing piece was:** `https://auth.expo.io` in **Authorized JavaScript origins**

Google needs this to allow the OAuth flow to initiate from the Expo auth proxy domain!

After adding it and waiting 5-10 minutes, Google Sign-In will work perfectly! 🚀
