#!/bin/bash
# Regenerate iOS Bundle and Update Xcode Project
# Use this script whenever you make code changes

set -e

echo "🔨 Regenerating iOS Bundle..."
echo ""

cd "$(dirname "$0")/.."

# Clean old bundle
echo "1️⃣  Cleaning old bundle..."
rm -rf ios-bundle
rm -f ios/MyToDoo/main.jsbundle

# Export new bundle
echo "2️⃣  Exporting Expo bundle..."
npx expo export --platform ios --output-dir ios-bundle

# Copy bundle to Xcode project
echo "3️⃣  Copying bundle to Xcode project..."
cp ios-bundle/_expo/static/js/ios/*.js ios/MyToDoo/main.jsbundle

# Copy assets
echo "4️⃣  Copying assets..."
# Create assets directory if it doesn't exist
mkdir -p ios/MyToDoo/assets
# Copy all assets from bundle to iOS folder
cp -r ios-bundle/assets/* ios/MyToDoo/assets/ 2>/dev/null || true

# Show bundle size
BUNDLE_SIZE=$(ls -lh ios/MyToDoo/main.jsbundle | awk '{print $5}')

# Verify file is accessible
if [ -f "ios/MyToDoo/main.jsbundle" ]; then
    echo ""
    echo "✅ Bundle regenerated successfully!"
    echo "   Size: $BUNDLE_SIZE"
    echo "   Location: ios/MyToDoo/main.jsbundle"
    echo ""
    echo "📱 Next steps:"
    echo "   1. Close Xcode if open"
    echo "   2. Reopen: open ios/MyToDoo.xcworkspace"
    echo "   3. Clean Build: ⌘+Shift+K"
    echo "   4. Build & Run: ⌘+R"
    echo ""
else
    echo "❌ Error: Bundle file not found!"
    exit 1
fi
