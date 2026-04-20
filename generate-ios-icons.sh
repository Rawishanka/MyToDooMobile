#!/bin/bash

SOURCE="assets/images/mytodoo-adaptive-icon.png"
DEST_DIR="ios/MyToDoo/Images.xcassets/AppIcon.appiconset"

echo "🎨 Generating iOS app icons from mytodoo-adaptive-icon.png..."

# Create all required iOS icon sizes
sips -z 20 20     "$SOURCE" --out "$DEST_DIR/App-Icon-20x20@1x.png"
sips -z 40 40     "$SOURCE" --out "$DEST_DIR/App-Icon-20x20@2x.png"
sips -z 60 60     "$SOURCE" --out "$DEST_DIR/App-Icon-20x20@3x.png"
sips -z 29 29     "$SOURCE" --out "$DEST_DIR/App-Icon-29x29@1x.png"
sips -z 58 58     "$SOURCE" --out "$DEST_DIR/App-Icon-29x29@2x.png"
sips -z 87 87     "$SOURCE" --out "$DEST_DIR/App-Icon-29x29@3x.png"
sips -z 40 40     "$SOURCE" --out "$DEST_DIR/App-Icon-40x40@1x.png"
sips -z 80 80     "$SOURCE" --out "$DEST_DIR/App-Icon-40x40@2x.png"
sips -z 120 120   "$SOURCE" --out "$DEST_DIR/App-Icon-40x40@3x.png"
sips -z 60 60     "$SOURCE" --out "$DEST_DIR/App-Icon-60x60@2x.png"
sips -z 120 120   "$SOURCE" --out "$DEST_DIR/App-Icon-60x60@3x.png"
sips -z 76 76     "$SOURCE" --out "$DEST_DIR/App-Icon-76x76@1x.png"
sips -z 152 152   "$SOURCE" --out "$DEST_DIR/App-Icon-76x76@2x.png"
sips -z 167 167   "$SOURCE" --out "$DEST_DIR/App-Icon-83.5x83.5@2x.png"
sips -z 1024 1024 "$SOURCE" --out "$DEST_DIR/App-Icon-1024x1024@1x.png"

echo "✅ All icon sizes generated!"
