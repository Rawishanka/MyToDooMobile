#!/bin/bash

# 🎨 Fix iOS App Icon
# This script replaces the default Expo icon with MyToDoo icon

set -e  # Exit on error

PROJECT_DIR="/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile"
cd "$PROJECT_DIR"

echo "🎨 Fixing iOS App Icon..."
echo ""

# Source icon
SOURCE_ICON="assets/images/mytodoo-icon.png"
ICON_DIR="ios/MyToDoo/Images.xcassets/AppIcon.appiconset"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: $SOURCE_ICON not found!"
    exit 1
fi

echo "✅ Found source icon: $SOURCE_ICON"

# Check if ImageMagick is installed (for resizing)
if command -v sips &> /dev/null; then
    echo "✅ Using sips for image conversion (built-in macOS tool)"
    
    # Create icon directory if it doesn't exist
    mkdir -p "$ICON_DIR"
    
    # Generate 1024x1024 icon for App Store
    echo "📱 Generating App-Icon-1024x1024@1x.png..."
    sips -z 1024 1024 "$SOURCE_ICON" --out "$ICON_DIR/App-Icon-1024x1024@1x.png" > /dev/null 2>&1
    
    echo "✅ Icon generated successfully!"
    
elif command -v convert &> /dev/null; then
    echo "✅ Using ImageMagick for image conversion"
    
    # Create icon directory if it doesn't exist
    mkdir -p "$ICON_DIR"
    
    # Generate 1024x1024 icon for App Store
    echo "📱 Generating App-Icon-1024x1024@1x.png..."
    convert "$SOURCE_ICON" -resize 1024x1024 "$ICON_DIR/App-Icon-1024x1024@1x.png"
    
    echo "✅ Icon generated successfully!"
    
else
    echo "⚠️  No image conversion tool found (sips or ImageMagick)"
    echo "📋 Copying original icon..."
    
    # Just copy the original icon
    mkdir -p "$ICON_DIR"
    cp "$SOURCE_ICON" "$ICON_DIR/App-Icon-1024x1024@1x.png"
    
    echo "✅ Icon copied (you may need to resize it to 1024x1024 manually)"
fi

# Update Contents.json to use the new icon
cat > "$ICON_DIR/Contents.json" << 'EOF'
{
  "images": [
    {
      "filename": "App-Icon-1024x1024@1x.png",
      "idiom": "universal",
      "platform": "ios",
      "size": "1024x1024"
    }
  ],
  "info": {
    "version": 1,
    "author": "expo"
  }
}
EOF

echo "✅ Updated Contents.json"
echo ""
echo "🎉 App icon fixed!"
echo ""
echo "📝 Next steps:"
echo "1. Open Xcode: open ios/MyToDoo.xcworkspace"
echo "2. Go to MyToDoo target → General → App Icons and Launch Screen"
echo "3. Verify the icon appears correctly"
echo "4. Build and run: ⌘ + R"
echo ""
