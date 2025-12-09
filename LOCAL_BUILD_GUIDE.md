# Alternative: Local Android Build Guide

If EAS builds keep failing, you can build locally. Here's how:

## Prerequisites
1. Install Android Studio
2. Install Java JDK 17 or 21
3. Set up Android SDK

## Step 1: Set Environment Variables
```powershell
# Add to System Environment Variables
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17

# Add to Path
C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools
C:\Users\YourUsername\AppData\Local\Android\Sdk\tools
```

## Step 2: Generate Android Native Code
```powershell
npx expo prebuild --platform android --clean
```

## Step 3: Build APK
```powershell
cd android
.\gradlew assembleRelease
cd ..
```

## Step 4: Find Your APK
Location: `android\app\build\outputs\apk\release\app-release.apk`

## Step 5: Install on Device
```powershell
# Connect device via USB with USB Debugging enabled
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### "Gradle build failed"
```powershell
cd android
.\gradlew clean
.\gradlew assembleRelease --stacktrace
```

### Build takes too long
Use debug build for testing:
```powershell
cd android
.\gradlew assembleDebug
```
APK Location: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Quick Build Script

Create `build-local.ps1`:
```powershell
Write-Host "🏗️ Building MyToDoo Android APK locally..." -ForegroundColor Cyan

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
cd android
.\gradlew clean
cd ..

# Generate native code
Write-Host "⚙️ Generating native Android code..." -ForegroundColor Yellow
npx expo prebuild --platform android

# Build release APK
Write-Host "📦 Building release APK..." -ForegroundColor Yellow
cd android
.\gradlew assembleRelease
cd ..

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host "📱 APK location: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
```

Run with: `.\build-local.ps1`

---

## Current EAS Build Status

Build URL: https://expo.dev/accounts/sulandi/projects/MyToDooMobile/builds/22abeb9e-fe65-4b88-8221-1fd692395e27

Changes made:
- ✅ Disabled New Architecture (`newArchEnabled: false`)
- ✅ SDK versions defined in `android/build.gradle`
- ✅ Firebase configuration complete

If this build succeeds, the issue was New Architecture compatibility.
