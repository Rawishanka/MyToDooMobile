#!/bin/bash
# ============================================
# MyToDoo - Build UAT APK + AAB (Local Gradle)
# ============================================
# Usage: ./build-uat-apk.sh
# Builds UAT APK (sideload) AND AAB via Gradle
# API: https://api.mytodoo.com/api
#
# Output:
#   builds/Mytodoo_uat.apk   ← Install directly on device
#   builds/Mytodoo_uat.aab   ← Internal testing upload
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Java & Android SDK Configuration ----
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"

echo "============================================"
echo "🔨 MyToDoo - Building UAT APK + AAB"
echo "============================================"
echo "📡 API URL: https://api.mytodoo.com/api"
echo "🌍 Environment: UAT"
echo "☕ JAVA_HOME: $JAVA_HOME"
echo "📱 ANDROID_HOME: $ANDROID_HOME"
echo "============================================"
echo ""

# Pre-flight: verify Java
if ! "$JAVA_HOME/bin/java" -version &>/dev/null; then
    echo "❌ Java not found at $JAVA_HOME"
    echo "   Install with: brew install openjdk@17"
    exit 1
fi
echo "✅ Java: $("$JAVA_HOME/bin/java" -version 2>&1 | head -1)"

# Pre-flight: verify Android SDK
if [ ! -d "$ANDROID_HOME/platforms" ]; then
    echo "❌ Android SDK not found at $ANDROID_HOME"
    echo "   Install Android Studio or set ANDROID_HOME"
    exit 1
fi
echo "✅ Android SDK: $ANDROID_HOME"
echo ""

# Pre-flight: verify .env.uat
if [ ! -f ".env.uat" ]; then
    echo "❌ ERROR: .env.uat not found!"
    exit 1
fi

# Step 1: Swap to UAT .env
echo "📋 Step 1: Setting UAT environment variables..."
cp .env .env.backup.build 2>/dev/null || true
cp .env.uat .env
echo "   ✅ UAT .env applied"

# Step 2: Clean previous build outputs
echo ""
echo "🧹 Step 2: Cleaning previous build outputs..."
rm -rf android/app/build/outputs 2>/dev/null || true
rm -rf android/app/build/generated 2>/dev/null || true
rm -rf android/app/build/intermediates 2>/dev/null || true
echo "   ✅ Cleaned"

# Step 3: Clear Metro / cache
echo ""
echo "🗑️  Step 3: Clearing caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf "$TMPDIR/haste-map-*" 2>/dev/null || true
echo "   ✅ Caches cleared"

# Step 4: Export env vars
echo ""
echo "🔧 Step 4: Exporting environment variables..."
set -a
source .env.uat
set +a
export ENVIRONMENT=uat
echo "   ✅ EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"

# Step 5: Build APK (assembleRelease)
echo ""
echo "🚀 Step 5: Building UAT APK (assembleRelease)..."
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon 2>&1
cd ..
echo "   ✅ APK build done"

# Step 6: Build AAB (bundleRelease)
echo ""
echo "📦 Step 6: Building UAT AAB (bundleRelease)..."
cd android
./gradlew bundleRelease --no-daemon 2>&1
cd ..
echo "   ✅ AAB build done"

# Step 7: Restore original .env
echo ""
echo "🔄 Step 7: Restoring original .env..."
if [ -f ".env.backup.build" ]; then
    cp .env.backup.build .env
    rm .env.backup.build
    echo "   ✅ Original .env restored"
fi

# Step 8: Copy outputs to builds/
mkdir -p builds

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"

echo ""
echo "============================================"
echo "📋 Build Results"
echo "============================================"

# APK
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    cp "$APK_PATH" "builds/Mytodoo_uat.apk"
    echo "✅ APK: builds/Mytodoo_uat.apk ($APK_SIZE)"
    echo "   → Use for: Direct install on device (adb install -r builds/Mytodoo_uat.apk)"
else
    echo "❌ APK not found! Check Gradle output above."
fi

# AAB
if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    cp "$AAB_PATH" "builds/Mytodoo_uat.aab"
    echo "✅ AAB: builds/Mytodoo_uat.aab ($AAB_SIZE)"
    echo "   → Use for: Internal testing upload"
else
    echo "❌ AAB not found! Check Gradle output above."
fi

echo ""
echo "📡 API: https://api.mytodoo.com/api"
echo "🌍 Environment: UAT"
echo "============================================"
