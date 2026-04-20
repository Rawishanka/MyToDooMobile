#!/bin/bash
# ============================================
# MyToDoo - Build LIVE APK + AAB (Local Gradle)
# ============================================
# Usage: ./build-live-apk.sh
# Builds LIVE APK (sideload) AND AAB (Play Store) via Gradle
# API: https://au-live-api.mytodoo.com/api
#
# Output:
#   builds/Mytodoo_live.apk   ← Install directly on device
#   builds/Mytodoo_live.aab   ← Upload to Google Play Store
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
echo "🔨 MyToDoo - Building LIVE APK + AAB"
echo "============================================"
echo "📡 API URL: https://au-live-api.mytodoo.com/api"
echo "🌍 Environment: LIVE (Production)"
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

# Pre-flight: verify .env.live
if [ ! -f ".env.live" ]; then
    echo "❌ ERROR: .env.live not found!"
    exit 1
fi

# Step 1: Swap to LIVE .env
echo "📋 Step 1: Setting LIVE environment variables..."
cp .env .env.backup.build 2>/dev/null || true
cp .env.live .env
echo "   ✅ LIVE .env applied"

# Step 2: Clear Metro / JS bundler caches (CRITICAL: ensures fresh JS bundle)
echo ""
echo "🗑️  Step 2: Clearing ALL caches (Metro, Expo, Gradle)..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf "$TMPDIR/metro-*" 2>/dev/null || true
rm -rf "$TMPDIR/haste-map-*" 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
echo "   ✅ JS/Metro caches cleared"

# Step 3: Export env vars
echo ""
echo "🔧 Step 3: Exporting environment variables..."
set -a
source .env.live
set +a
export ENVIRONMENT=live
echo "   ✅ EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"

# Step 4: Full clean (removes ALL build artifacts + cached JS bundles + CMake cache)
echo ""
echo "🧹 Step 4: Full clean of all build artifacts..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/app/.cxx 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
echo "   ✅ Full clean done"

# Step 5: Build BOTH APK + AAB in single Gradle invocation
# This ensures both get the EXACT SAME fresh JS bundle
echo ""
echo "🚀 Step 5: Building LIVE APK + AAB (assembleRelease + bundleRelease)..."
echo "   ⏳ This creates a fresh JS bundle and packages it into both APK and AAB"
cd android
chmod +x gradlew
./gradlew assembleRelease bundleRelease --no-daemon 2>&1
cd ..
echo "   ✅ APK + AAB build done"

# Step 6: Restore original .env
echo ""
echo "🔄 Step 6: Restoring original .env..."
if [ -f ".env.backup.build" ]; then
    cp .env.backup.build .env
    rm .env.backup.build
    echo "   ✅ Original .env restored"
fi

# Step 7: Copy outputs to builds/
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
    cp "$APK_PATH" "builds/Mytodoo_live.apk"
    echo "✅ APK: builds/Mytodoo_live.apk ($APK_SIZE)"
    echo "   → Use for: Direct install on device (adb install -r builds/Mytodoo_live.apk)"
else
    echo "❌ APK not found! Check Gradle output above."
fi

# AAB
if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    cp "$AAB_PATH" "builds/Mytodoo_live.aab"
    echo "✅ AAB: builds/Mytodoo_live.aab ($AAB_SIZE)"
    echo "   → Use for: Google Play Store upload"
else
    echo "❌ AAB not found! Check Gradle output above."
fi

echo ""
echo "📡 API: https://au-live-api.mytodoo.com/api"
echo "🌍 Environment: LIVE (Production)"
echo "============================================"
