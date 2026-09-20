#!/bin/bash
# ============================================
# MyToDoo - Build iOS Archive + Export IPA
# ============================================
# Usage:
#   ./build-ios-archive.sh          → LIVE archive (default)
#   ./build-ios-archive.sh live     → LIVE archive
#   ./build-ios-archive.sh uat      → UAT archive
#
# What this script does:
#   1. Sets the correct environment (.env.live / .env.uat)
#   2. Builds the JS bundle (main.jsbundle) for iOS
#   3. Runs xcodebuild archive → builds/MyToDoo_{version}_{build}.xcarchive
#   4. Exports IPA             → builds/ipa_live_{version}_{build}/ or builds/ipa_uat_{version}_{build}/
#   5. Restores original .env
#
# Prerequisites:
#   - Xcode installed (xcodebuild in PATH)
#   - Valid Apple Developer signing (Team ID: 75D9C2GF7W)
#   - CocoaPods installed: cd ios && pod install
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Environment ----
ENV_TARGET="${1:-live}"

if [[ "$ENV_TARGET" == "uat" ]]; then
  ENV_FILE=".env.uat"
  API_URL="https://api.mytodoo.com/api"
  ENV_LABEL="UAT"
  UAT_BUNDLE_ID="com.unexo.mytodoomobile"
else
  ENV_FILE=".env.live"
  API_URL="https://au-live-api.mytodoo.com/api"
  ENV_LABEL="LIVE"
  UAT_BUNDLE_ID=""
fi

IOS_GOOGLE_PLIST="ios/MyToDoo/GoogleService-Info.plist"
IOS_GOOGLE_PLIST_BACKUP="ios/MyToDoo/GoogleService-Info.plist.backup.live"
IOS_ENTITLEMENTS="ios/MyToDoo/MyToDoo.entitlements"
IOS_ENTITLEMENTS_BACKUP="ios/MyToDoo/MyToDoo.entitlements.backup.live"
IOS_UAT_ENTITLEMENTS="ios/MyToDoo/MyToDoo-UAT.entitlements"

restore_ios_firebase_plist() {
  if [[ -f "$IOS_GOOGLE_PLIST_BACKUP" ]]; then
    cp "$IOS_GOOGLE_PLIST_BACKUP" "$IOS_GOOGLE_PLIST"
    rm -f "$IOS_GOOGLE_PLIST_BACKUP"
    echo "   ✅ Restored Live GoogleService-Info.plist"
  fi
}

restore_ios_entitlements() {
  if [[ -f "$IOS_ENTITLEMENTS_BACKUP" ]]; then
    cp "$IOS_ENTITLEMENTS_BACKUP" "$IOS_ENTITLEMENTS"
    rm -f "$IOS_ENTITLEMENTS_BACKUP"
    echo "   ✅ Restored Live MyToDoo.entitlements"
  fi
}

restore_ios_uat_native_files() {
  restore_ios_firebase_plist
  restore_ios_entitlements
}

# ---- Read version / build from app.config.ts ----
APP_VERSION=$(grep "version:" app.config.ts | head -1 | awk -F"'" '{print $2}')
BUILD_NUMBER=$(grep "buildNumber:" app.config.ts | head -1 | awk -F'"' '{print $2}')

# Fallback: read from Xcode project if app.config.ts parse fails
if [ -z "$APP_VERSION" ]; then
  APP_VERSION=$(grep "MARKETING_VERSION" ios/MyToDoo.xcodeproj/project.pbxproj | head -1 | awk -F'= ' '{print $2}' | tr -d ';' | xargs)
fi
if [ -z "$BUILD_NUMBER" ]; then
  BUILD_NUMBER=$(grep "CURRENT_PROJECT_VERSION" ios/MyToDoo.xcodeproj/project.pbxproj | head -1 | awk -F'= ' '{print $2}' | tr -d ';' | xargs)
fi

if [[ "$ENV_TARGET" == "uat" ]]; then
  ARCHIVE_NAME="MyToDoo_UAT_${APP_VERSION}_${BUILD_NUMBER}"
else
  ARCHIVE_NAME="MyToDoo_${APP_VERSION}_${BUILD_NUMBER}"
fi
ARCHIVE_PATH="builds/${ARCHIVE_NAME}.xcarchive"
if [[ "$ENV_TARGET" == "uat" ]]; then
  IPA_DIR="builds/ipa_uat_${APP_VERSION}_${BUILD_NUMBER}"
else
  IPA_DIR="builds/ipa_live_${APP_VERSION}_${BUILD_NUMBER}"
fi
EXPORT_OPTIONS="${IPA_DIR}/ExportOptions.plist"

echo "============================================"
echo "🍎 MyToDoo - iOS Archive Build ($ENV_LABEL)"
echo "============================================"
echo "📱 Version:     $APP_VERSION"
echo "🔢 Build:       $BUILD_NUMBER"
echo "📡 API URL:     $API_URL"
echo "🌍 Environment: $ENV_LABEL"
echo "📦 Archive:     $ARCHIVE_PATH"
echo "📤 IPA Output:  $IPA_DIR/MyToDoo.ipa"
echo "============================================"
echo ""

# ---- Pre-flight checks ----
if ! command -v xcodebuild &>/dev/null; then
  echo "❌ xcodebuild not found. Install Xcode from the App Store."
  exit 1
fi
echo "✅ xcodebuild: $(xcodebuild -version | head -1)"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ ERROR: $ENV_FILE not found!"
  exit 1
fi
echo "✅ Env file: $ENV_FILE"

if [ ! -f "ios/MyToDoo.xcworkspace/contents.xcworkspacedata" ]; then
  echo "❌ ios/MyToDoo.xcworkspace not found. Run: cd ios && pod install"
  exit 1
fi
echo "✅ Xcode workspace found"
echo ""

# ---- Step 1: Set environment ----
echo "📋 Step 1: Setting $ENV_LABEL environment..."
cp .env .env.backup.ios.archive 2>/dev/null || true
cp "$ENV_FILE" .env
echo "   ✅ $ENV_LABEL .env applied"

if [[ "$ENV_TARGET" == "uat" ]]; then
  echo ""
  echo "🔥 Step 1b: UAT iOS Firebase + bundle (push notifications)..."
  if [[ ! -f "GoogleService-Info-UAT.plist" ]]; then
    echo "   ❌ GoogleService-Info-UAT.plist not found!"
    exit 1
  fi
  cp "$IOS_GOOGLE_PLIST" "$IOS_GOOGLE_PLIST_BACKUP"
  cp GoogleService-Info-UAT.plist "$IOS_GOOGLE_PLIST"
  cp "$IOS_ENTITLEMENTS" "$IOS_ENTITLEMENTS_BACKUP"
  cp "$IOS_UAT_ENTITLEMENTS" "$IOS_ENTITLEMENTS"
  trap restore_ios_uat_native_files EXIT
  echo "   ✅ GoogleService-Info-UAT.plist → ios/MyToDoo/GoogleService-Info.plist"
  echo "   ✅ MyToDoo-UAT.entitlements (UAT profile — Apple Pay on Live app only)"
  echo "   ✅ Bundle ID for archive: $UAT_BUNDLE_ID"
fi

# ---- Step 2: Export environment variables ----
echo ""
echo "🔧 Step 2: Exporting environment variables..."
set -a
source "$ENV_FILE"
set +a
export EXPO_PUBLIC_API_URL="$API_URL"
export EXPO_PUBLIC_WEBVIEW_BASE_URL="$EXPO_PUBLIC_WEBVIEW_BASE_URL"
export NODE_ENV="production"
if [[ "$ENV_TARGET" == "uat" ]]; then
  export ENVIRONMENT=uat
fi
echo "   ✅ EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"
echo "   ✅ EXPO_PUBLIC_WEBVIEW_BASE_URL=$EXPO_PUBLIC_WEBVIEW_BASE_URL"
if [[ "$ENV_TARGET" == "uat" ]]; then
  echo "   ✅ ENVIRONMENT=uat"
fi

# ---- Step 3: Clear Metro cache ----
echo ""
echo "🗑️  Step 3: Clearing Metro/Expo caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf "$TMPDIR/metro-*" 2>/dev/null || true
rm -rf "$TMPDIR/haste-map-*" 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
echo "   ✅ Caches cleared"

# ---- Step 4: Build JS bundle ----
echo ""
echo "🚀 Step 4: Building JS bundle for iOS ($ENV_LABEL)..."
mkdir -p ios/assets

npx expo export:embed --platform ios --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios/assets --dev false

BUNDLE_SIZE=$(du -sh ios/main.jsbundle 2>/dev/null | cut -f1 || echo "unknown")
echo "   ✅ JS bundle built ($BUNDLE_SIZE)"

# ---- Step 5: Update .xcode.env.local ----
echo ""
echo "🔧 Step 5: Updating .xcode.env.local..."
cat > ios/.xcode.env.local << EOF
export NODE_BINARY=$(command -v node)

# Expo Router Configuration (required for bundling)
export EXPO_ROUTER_APP_ROOT="./app"
export EXPO_ROUTER_IMPORT_MODE="lazy"

# API Environment: $ENV_LABEL
export EXPO_PUBLIC_API_URL="$API_URL"
export EXPO_PUBLIC_WEBVIEW_BASE_URL="$EXPO_PUBLIC_WEBVIEW_BASE_URL"
export NODE_ENV="production"
export ENVIRONMENT="${ENVIRONMENT:-$([ "$ENV_TARGET" = "uat" ] && echo uat || echo live)}"
EOF
echo "   ✅ .xcode.env.local updated"

# ---- Step 6: xcodebuild Archive ----
echo ""
echo "🔍 Step 5b: Verifying Apple Pay entitlement..."
if [[ "$ENV_TARGET" == "uat" ]]; then
  echo "   ℹ️ UAT build — Apple Pay not required (UAT provisioning profile)"
else
  if ! grep -q "com.apple.developer.in-app-payments" "$IOS_ENTITLEMENTS"; then
    echo "   ❌ Apple Pay entitlement missing from $IOS_ENTITLEMENTS"
    echo "   ❌ Add merchant.com.mytodoo.mytodoolive before building Live."
    exit 1
  fi
  echo "   ✅ Apple Pay entitlement present (Live)"
fi

echo ""
echo "🏗️  Step 6: Building Xcode Archive..."
echo "   (This may take 5-15 minutes)"
echo ""

mkdir -p builds

XCODEBUILD_ARGS=(
  -workspace ios/MyToDoo.xcworkspace
  -scheme MyToDoo
  -configuration Release
  -archivePath "$ARCHIVE_PATH"
  -destination "generic/platform=iOS"
  MARKETING_VERSION="$APP_VERSION"
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER"
  CODE_SIGN_STYLE=Automatic
  DEVELOPMENT_TEAM=75D9C2GF7W
)

if [[ "$ENV_TARGET" == "uat" ]]; then
  XCODEBUILD_ARGS+=(
    PRODUCT_BUNDLE_IDENTIFIER="$UAT_BUNDLE_ID"
    INFOPLIST_KEY_CFBundleDisplayName="MyToDoo UAT"
  )
fi

xcodebuild archive "${XCODEBUILD_ARGS[@]}"

# Verify archive was created
if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "❌ Archive failed! Check Xcode output above."
  # Restore .env before exit
  [ -f ".env.backup.ios.archive" ] && cp .env.backup.ios.archive .env && rm .env.backup.ios.archive
  exit 1
fi
echo ""
echo "   ✅ Archive created: $ARCHIVE_PATH"

# Copy to Xcode Organizer default location
XCODE_ARCHIVES_DIR="$HOME/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)"
mkdir -p "$XCODE_ARCHIVES_DIR"
cp -R "$ARCHIVE_PATH" "$XCODE_ARCHIVES_DIR/" 2>/dev/null || true
echo "   ✅ Copied to Xcode Organizer: $XCODE_ARCHIVES_DIR/$(basename "$ARCHIVE_PATH")"
open "$ARCHIVE_PATH" 2>/dev/null || true

# ---- Step 7: Create ExportOptions.plist ----
echo ""
echo "📋 Step 7: Creating ExportOptions.plist..."
mkdir -p "$IPA_DIR"
cat > "$EXPORT_OPTIONS" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>destination</key>
        <string>export</string>
        <key>generateAppStoreInformation</key>
        <false/>
        <key>manageAppVersionAndBuildNumber</key>
        <false/>
        <key>method</key>
        <string>app-store-connect</string>
        <key>signingStyle</key>
        <string>automatic</string>
        <key>stripSwiftSymbols</key>
        <true/>
        <key>teamID</key>
        <string>75D9C2GF7W</string>
        <key>testFlightInternalTestingOnly</key>
        <false/>
        <key>uploadSymbols</key>
        <true/>
</dict>
</plist>
EOF
echo "   ✅ ExportOptions.plist created"

# ---- Step 8: Export IPA ----
echo ""
echo "📤 Step 8: Exporting IPA..."

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$IPA_DIR" \
  -exportOptionsPlist "$EXPORT_OPTIONS"

# ---- Step 8b: Verify exported IPA (Live must have Apple Pay) ----
verify_exported_ipa() {
  local ipa_path="$IPA_DIR/MyToDoo.ipa"
  if [ ! -f "$ipa_path" ]; then
    echo "   ⚠️  IPA verification skipped — file not found"
    return
  fi

  local tmp_dir
  tmp_dir=$(mktemp -d)
  unzip -q "$ipa_path" -d "$tmp_dir"
  local app_path
  app_path=$(find "$tmp_dir/Payload" -name "*.app" -maxdepth 1 | head -1)

  if [ -z "$app_path" ]; then
    echo "   ❌ IPA verification failed — .app not found inside IPA"
    rm -rf "$tmp_dir"
    exit 1
  fi

  local bundle_id build_num display_name
  bundle_id=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app_path/Info.plist")
  build_num=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$app_path/Info.plist")
  display_name=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleDisplayName' "$app_path/Info.plist" 2>/dev/null || echo "MyToDoo")

  echo ""
  echo "🔍 Step 8b: Verifying exported IPA..."
  echo "   Bundle ID:    $bundle_id"
  echo "   Build:        $build_num"
  echo "   Display name: $display_name"

  if [[ "$ENV_TARGET" == "live" ]]; then
    if [[ "$bundle_id" != "com.mytodoo.mytodoolive" ]]; then
      echo "   ❌ Wrong bundle ID for Live export (expected com.mytodoo.mytodoolive)"
      rm -rf "$tmp_dir"
      exit 1
    fi
    if ! codesign -d --entitlements :- "$app_path" 2>/dev/null | grep -q "merchant.com.mytodoo.mytodoolive"; then
      echo "   ❌ Apple Pay entitlement missing from exported Live IPA"
      rm -rf "$tmp_dir"
      exit 1
    fi
    echo "   ✅ Live IPA verified — Apple Pay entitlement present"
  else
    if [[ "$bundle_id" != "$UAT_BUNDLE_ID" ]]; then
      echo "   ❌ Wrong bundle ID for UAT export (expected $UAT_BUNDLE_ID)"
      rm -rf "$tmp_dir"
      exit 1
    fi
    echo "   ✅ UAT IPA verified (Apple Pay not required for UAT)"
  fi

  rm -rf "$tmp_dir"
}

verify_exported_ipa

# ---- Step 9: Restore .env ----
echo ""
echo "🔄 Step 9: Restoring original .env..."
if [ -f ".env.backup.ios.archive" ]; then
  cp .env.backup.ios.archive .env
  rm .env.backup.ios.archive
  echo "   ✅ Original .env restored"
fi

if [[ "$ENV_TARGET" == "uat" ]]; then
  restore_ios_uat_native_files
  trap - EXIT
fi

# ---- Summary ----
echo ""
echo "============================================"
echo "📋 iOS Build Results"
echo "============================================"

if [ -d "$ARCHIVE_PATH" ]; then
  ARCHIVE_SIZE=$(du -sh "$ARCHIVE_PATH" 2>/dev/null | cut -f1 || echo "unknown")
  echo "✅ Archive: $ARCHIVE_PATH ($ARCHIVE_SIZE)"
  echo "   → Open in Xcode Organizer or upload to App Store Connect"
else
  echo "❌ Archive: NOT FOUND"
fi

if [ -f "$IPA_DIR/MyToDoo.ipa" ]; then
  IPA_SIZE=$(du -sh "$IPA_DIR/MyToDoo.ipa" 2>/dev/null | cut -f1 || echo "unknown")
  echo "✅ IPA: $IPA_DIR/MyToDoo.ipa ($IPA_SIZE)"
  echo "   → Install via TestFlight / Ad Hoc / App Store Connect"
else
  echo "⚠️  IPA: Not exported (signing credentials may be required)"
  echo "   → Open $ARCHIVE_PATH in Xcode Organizer → Distribute App"
fi

echo ""
echo "📱 Version:     $APP_VERSION"
echo "🔢 Build:       $BUILD_NUMBER"
echo "📡 API:         $API_URL"
echo "🌍 Environment: $ENV_LABEL"
echo "============================================"
