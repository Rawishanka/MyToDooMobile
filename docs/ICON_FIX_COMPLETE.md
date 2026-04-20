# Android App Icon Fix - Complete Guide

## Problem
The APK was showing the old default icon instead of the MyToDoo adaptive icon configured in `app.config.ts`.

## Root Cause
The Android native files in `android/app/src/main/res/mipmap-*` folders contained **cached old icon files** (`ic_launcher.webp`, `ic_launcher_foreground.webp`, etc.) that were not updated when the adaptive icon was changed in `app.config.ts`.

When Android builds the APK, it uses these cached native files instead of regenerating them from `app.config.ts`.

## Files Involved

### Configuration Files
1. **app.config.ts** (Line 18-21):
   ```typescript
   adaptiveIcon: {
     foregroundImage: './assets/images/mytodoo-adaptive-icon.png',
     backgroundColor: '#004aad',
   }
   ```

2. **AndroidManifest.xml** (Line 21):
   ```xml
   android:icon="@mipmap/ic_launcher" 
   android:roundIcon="@mipmap/ic_launcher_round"
   ```

3. **Cached Native Icon Files** (THE PROBLEM):
   - `android/app/src/main/res/mipmap-hdpi/ic_launcher*.webp`
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher*.webp`
   - `android/app/src/main/res/mipmap-xhdpi/ic_launcher*.webp`
   - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher*.webp`
   - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher*.webp`
   - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

4. **colors.xml** (Line 4):
   ```xml
   <color name="iconBackground">#004aad</color>
   ```

## Solution Applied

### Step 1: Delete Old Cached Icons ✅
```powershell
Get-ChildItem "android/app/src/main/res/" -Recurse -Filter "ic_launcher*" | Remove-Item -Force
```

This removes ALL old icon files so EAS can regenerate them fresh.

### Step 2: Updated eas.json ✅
Added explicit gradle command to ensure clean build:
```json
"preview": {
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleRelease"
  },
  "channel": "preview"
}
```

### Step 3: Build Script Created ✅
Created `build-apk-clean.ps1` which:
1. Deletes old icon files automatically
2. Runs EAS build with `--clear-cache` flag
3. Forces icon regeneration from `app.config.ts`

## How EAS Build Process Works

```
User runs: npx eas build --platform android --profile preview --clear-cache
           ↓
EAS runs: npx expo prebuild (automatically)
           ↓
Prebuild reads: app.config.ts
           ↓
Generates native files: 
  - android/app/src/main/res/mipmap-*/ic_launcher.webp (from mytodoo-adaptive-icon.png)
  - android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml (adaptive icon config)
  - android/app/src/main/res/values/colors.xml (background color #004aad)
           ↓
Gradle builds APK: Uses freshly generated icons
           ↓
Result: APK with correct adaptive icon ✅
```

## Next Build Instructions

### Option 1: Use the Build Script (Recommended)
```powershell
.\build-apk-clean.ps1
```

### Option 2: Manual Build
```powershell
# 1. Clean old icons
Get-ChildItem "android/app/src/main/res/" -Recurse -Filter "ic_launcher*" | Remove-Item -Force

# 2. Build with EAS
npx eas build --platform android --profile preview --clear-cache
```

## Verification Steps

After installing the new APK:

1. **Check Home Screen Icon**
   - Should show MyToDoo logo with #004aad blue background
   - Should be circular/rounded (adaptive icon)

2. **Check App Drawer**
   - Should show same adaptive icon
   - Should match the design in `mytodoo-adaptive-icon.png`

3. **Check Settings → Apps → MyToDoo**
   - App icon should match

## Important Notes

⚠️ **Icon Requirements:**
- Adaptive icon foreground: Should be 1024x1024 PNG
- Must have transparent background
- Center content within safe zone (middle 66% of image)
- Background color: #004aad (defined in app.config.ts)

⚠️ **Common Mistakes:**
1. ❌ Modifying icon files directly in `android/app/src/main/res/` - These get overwritten by prebuild
2. ❌ Building without cleaning cache - Old icons persist
3. ❌ Not deleting old `ic_launcher*` files before build

✅ **Correct Approach:**
- Always modify `app.config.ts` → `adaptiveIcon.foregroundImage`
- Always delete old native icon files before building
- Always use `--clear-cache` flag when building

## Files Modified

1. ✅ `eas.json` - Added gradle command and channel
2. ✅ `build-apk-clean.ps1` - Created new build script
3. ✅ Deleted all `android/app/src/main/res/mipmap-*/ic_launcher*` files
4. ✅ `app.config.ts` - Already correctly configured (no changes needed)

## Expected Result

When you install the next APK built with these changes, the home screen should show:
- **Icon**: MyToDoo logo (orange "T" with person icon on top)
- **Background**: Blue circle (#004aad)
- **Shape**: Adaptive (circular on most devices)
- **Name**: MyToDoo

The icon will match `assets/images/mytodoo-adaptive-icon.png` with the blue background color from `app.config.ts`.
