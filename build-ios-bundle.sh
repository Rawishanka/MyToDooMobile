#!/bin/bash
# ============================================
# MyToDoo - Build iOS JS Bundle (LIVE + UAT)
# ============================================
# Usage:
#   ./build-ios-bundle.sh          → LIVE bundle (default)
#   ./build-ios-bundle.sh uat      → UAT bundle
#   ./build-ios-bundle.sh live     → LIVE bundle
#
# After running this script:
#   1. Open Xcode → ios/MyToDoo.xcworkspace
#   2. Select your device / simulator
#   3. Product → Run (or Archive for release)
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Determine environment from argument (default: live)
ENV_TARGET="${1:-live}"

if [[ "$ENV_TARGET" == "uat" ]]; then
  ENV_FILE=".env.uat"
  API_URL="https://api.mytodoo.com/api"
  ENV_LABEL="UAT"
else
  ENV_FILE=".env.live"
  API_URL="https://au-live-api.mytodoo.com/api"
  ENV_LABEL="LIVE"
fi

echo "============================================"
echo "🍎 MyToDoo - iOS JS Bundle ($ENV_LABEL)"
echo "============================================"
echo "📡 API URL: $API_URL"
echo "🌍 Environment: $ENV_LABEL"
echo "============================================"
echo ""

# Pre-flight: check env file
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ ERROR: $ENV_FILE not found!"
  exit 1
fi

# Step 1: Swap .env
echo "📋 Step 1: Setting $ENV_LABEL environment..."
cp .env .env.backup.ios.build 2>/dev/null || true
cp "$ENV_FILE" .env
echo "   ✅ $ENV_LABEL .env applied"

# Step 2: Export API URL for bundler
echo ""
echo "🔧 Step 2: Exporting environment variables..."
export EXPO_PUBLIC_API_URL="$API_URL"
export NODE_ENV="production"
echo "   ✅ EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"

# Step 3: Clear Metro cache
echo ""
echo "🗑️  Step 3: Clearing Metro cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf "$TMPDIR/metro-*" 2>/dev/null || true
rm -rf "$TMPDIR/haste-*" 2>/dev/null || true
echo "   ✅ Metro cache cleared"

# Step 4: Ensure ios/assets directory exists
echo ""
echo "📁 Step 4: Preparing output directories..."
mkdir -p ios/assets
echo "   ✅ ios/assets ready"

# Step 5: Bundle JS for iOS
echo ""
echo "🚀 Step 5: Bundling JS for iOS..."
echo "   (This may take 1-2 minutes)"
echo ""

npx expo export:embed \
  --platform ios \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets \
  --dev false \
  --reset-cache

echo ""
echo "✅ Bundle complete!"

# Step 6: Restore .env
echo ""
echo "🔄 Step 6: Restoring original .env..."
cp .env.backup.ios.build .env 2>/dev/null && rm .env.backup.ios.build 2>/dev/null || true
echo "   ✅ Original .env restored"

# Step 7: Update .xcode.env.local with API URL
echo ""
echo "🔧 Step 7: Updating .xcode.env.local..."
cat > ios/.xcode.env.local << EOF
export NODE_BINARY=/opt/homebrew/bin/node

# Expo Router Configuration (required for bundling)
export EXPO_ROUTER_APP_ROOT="./app"
export EXPO_ROUTER_IMPORT_MODE="lazy"

# API Environment: $ENV_LABEL
export EXPO_PUBLIC_API_URL="$API_URL"
export NODE_ENV="production"
EOF
echo "   ✅ .xcode.env.local updated with $ENV_LABEL API"

# Done
BUNDLE_SIZE=$(du -sh ios/main.jsbundle 2>/dev/null | cut -f1 || echo "unknown")
echo ""
echo "============================================"
echo "✅ iOS Bundle Build Complete ($ENV_LABEL)"
echo "============================================"
echo "📦 Bundle: ios/main.jsbundle ($BUNDLE_SIZE)"
echo "📡 API:    $API_URL"
echo "🌍 Env:    $ENV_LABEL"
echo ""
echo "📋 Next Steps:"
echo "   1. Open Xcode:"
echo "      open ios/MyToDoo.xcworkspace"
echo ""
echo "   2. In Xcode:"
echo "      - Select your device or simulator"
echo "      - Product → Run  (Debug/test)"
echo "      - Product → Archive  (for App Store / TestFlight)"
echo ""
echo "   💡 Debug builds auto-connect to Metro (no bundle needed)"
echo "   💡 Release/Archive builds use ios/main.jsbundle"
echo "============================================"
