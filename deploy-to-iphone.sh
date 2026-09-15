#!/bin/bash
# ============================================
# MyToDoo - Build & Deploy directly to connected iPhone 11
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

DEVICE_ID="00008030-00066CCA0111402E"
ENV_TARGET="${1:-uat}"

if [[ "$ENV_TARGET" == "uat" ]]; then
  ENV_FILE=".env.uat"
  API_URL="https://api.mytodoo.com/api"
  ENV_LABEL="UAT"
  BUNDLE_ID="com.unexo.mytodoomobile"
  DISPLAY_NAME="MyToDoo UAT"
else
  ENV_FILE=".env.live"
  API_URL="https://au-live-api.mytodoo.com/api"
  ENV_LABEL="LIVE"
  BUNDLE_ID="com.mytodoo.mytodoolive"
  DISPLAY_NAME="MyToDoo"
fi

echo "============================================"
echo "📱 MyToDoo - Deploy to Physical iPhone 11 ($ENV_LABEL)"
echo "============================================"
echo "Device ID:    $DEVICE_ID"
echo "Bundle ID:    $BUNDLE_ID"
echo "API URL:      $API_URL"
echo "============================================"

# Check device connection
if ! ios-deploy --detect | grep -q "$DEVICE_ID"; then
  echo "❌ iPhone 11 ($DEVICE_ID) is not connected via USB!"
  exit 1
fi
echo "✅ iPhone 11 detected and connected via USB"

# File backups
IOS_GOOGLE_PLIST="ios/MyToDoo/GoogleService-Info.plist"
IOS_GOOGLE_PLIST_BACKUP="ios/MyToDoo/GoogleService-Info.plist.backup.device"
IOS_ENTITLEMENTS="ios/MyToDoo/MyToDoo.entitlements"
IOS_ENTITLEMENTS_BACKUP="ios/MyToDoo/MyToDoo.entitlements.backup.device"
ENV_BACKUP=".env.backup.device"

cleanup() {
  echo ""
  echo "🔄 Restoring original configuration..."
  if [[ -f "$IOS_GOOGLE_PLIST_BACKUP" ]]; then
    cp "$IOS_GOOGLE_PLIST_BACKUP" "$IOS_GOOGLE_PLIST"
    rm -f "$IOS_GOOGLE_PLIST_BACKUP"
  fi
  if [[ -f "$IOS_ENTITLEMENTS_BACKUP" ]]; then
    cp "$IOS_ENTITLEMENTS_BACKUP" "$IOS_ENTITLEMENTS"
    rm -f "$IOS_ENTITLEMENTS_BACKUP"
  fi
  if [[ -f "$ENV_BACKUP" ]]; then
    cp "$ENV_BACKUP" .env
    rm -f "$ENV_BACKUP"
  fi
  echo "✅ Configuration restored"
}
trap cleanup EXIT

# Backup files
cp "$IOS_GOOGLE_PLIST" "$IOS_GOOGLE_PLIST_BACKUP"
cp "$IOS_ENTITLEMENTS" "$IOS_ENTITLEMENTS_BACKUP"
[ -f .env ] && cp .env "$ENV_BACKUP"

if [[ "$ENV_TARGET" == "uat" ]]; then
  cp GoogleService-Info-UAT.plist "$IOS_GOOGLE_PLIST"
  cp ios/MyToDoo/MyToDoo-UAT.entitlements "$IOS_ENTITLEMENTS"
fi
cp "$ENV_FILE" .env

# Export env vars
set -a
source "$ENV_FILE"
set +a
export EXPO_PUBLIC_API_URL="$API_URL"
export NODE_ENV="production"
export ENVIRONMENT="$ENV_TARGET"

# Step 1: Clear metro cache and export JS bundle
echo ""
echo "🚀 Step 1: Exporting embedded JS bundle..."
mkdir -p ios/assets
npx expo export:embed --platform ios --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios/assets --dev false

# Step 2: Build app for device
echo ""
echo "🏗️ Step 2: Compiling Xcode build for iPhone 11..."
DERIVED_DATA_PATH="builds/DerivedData_Device"
mkdir -p "$DERIVED_DATA_PATH"

xcodebuild build \
  -workspace ios/MyToDoo.xcworkspace \
  -scheme MyToDoo \
  -configuration Release \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID" \
  INFOPLIST_KEY_CFBundleDisplayName="$DISPLAY_NAME" \
  DEVELOPMENT_TEAM=75D9C2GF7W \
  CODE_SIGN_STYLE=Automatic

APP_PATH=$(find "$DERIVED_DATA_PATH/Build/Products/Release-iphoneos" -name "*.app" -maxdepth 1 | head -1)

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "❌ Build failed: .app bundle not found in $DERIVED_DATA_PATH/Build/Products/Release-iphoneos"
  exit 1
fi

echo "✅ Build completed successfully: $APP_PATH"

# Step 3: Install and launch on device
echo ""
echo "📲 Step 3: Installing and launching app on iPhone 11 via USB..."
ios-deploy --id "$DEVICE_ID" --bundle "$APP_PATH" --justlaunch --no-wifi

echo ""
echo "============================================"
echo "🎉 SUCCESS: MyToDoo ($ENV_LABEL) is now running on your iPhone 11!"
echo "============================================"
