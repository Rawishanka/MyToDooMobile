#!/bin/bash

# 🎯 Fix White Screen - Add JS Bundle to Xcode
# This script adds main.jsbundle to your Xcode project to fix the white screen issue

set -e

echo "🔧 Adding main.jsbundle to Xcode Project"
echo "========================================"
echo ""

PROJECT_DIR="/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile"
IOS_DIR="$PROJECT_DIR/ios"
BUNDLE_FILE="$IOS_DIR/MyToDoo/main.jsbundle"

cd "$PROJECT_DIR"

# Step 1: Check if bundle exists
echo "1️⃣  Checking if main.jsbundle exists..."
if [ -f "$BUNDLE_FILE" ]; then
    BUNDLE_SIZE=$(ls -lh "$BUNDLE_FILE" | awk '{print $5}')
    echo "✅ main.jsbundle found! Size: $BUNDLE_SIZE"
else
    echo "❌ main.jsbundle not found. Generating..."
    echo ""
    npx expo export:embed --platform ios --entry-file index.js --bundle-output ios/MyToDoo/main.jsbundle --dev false --assets-dest ios/MyToDoo
    
    if [ -f "$BUNDLE_FILE" ]; then
        echo "✅ Bundle generated successfully!"
    else
        echo "❌ Failed to generate bundle"
        exit 1
    fi
fi

echo ""
echo "2️⃣  Installing xcodeproj gem (needed to modify Xcode project)..."
if gem list -i xcodeproj > /dev/null 2>&1; then
    echo "✅ xcodeproj already installed"
else
    echo "📦 Installing xcodeproj..."
    sudo gem install xcodeproj
fi

echo ""
echo "3️⃣  Adding main.jsbundle to Xcode project..."

# Create Ruby script to add bundle
cat > "$IOS_DIR/temp_add_bundle.rb" << 'RUBY_SCRIPT'
require 'xcodeproj'

project_path = 'MyToDoo.xcodeproj'
bundle_filename = 'main.jsbundle'

project = Xcodeproj::Project.open(project_path)
target = project.targets.first
main_group = project.main_group['MyToDoo'] || project.main_group

# Check if bundle already added
existing_file = main_group.files.find { |file| file.path&.include?(bundle_filename) }

if existing_file
  puts "✅ #{bundle_filename} already in project"
  exit 0
end

# Add file reference
file_ref = main_group.new_reference(bundle_filename)
file_ref.last_known_file_type = 'archive.ar'
file_ref.source_tree = '<group>'

# Add to Copy Bundle Resources
resources_phase = target.resources_build_phase
resources_phase.add_file_reference(file_ref)

project.save
puts "✅ Added #{bundle_filename} to Xcode project"
puts "   Target: #{target.name}"
puts "   Build Phase: Copy Bundle Resources"
RUBY_SCRIPT

cd "$IOS_DIR"
ruby temp_add_bundle.rb
rm temp_add_bundle.rb

echo ""
echo "========================================"
echo "✅ WHITE SCREEN FIX COMPLETE!"
echo "========================================"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode: open $IOS_DIR/MyToDoo.xcworkspace"
echo "2. Clean Build Folder: Product → Clean Build Folder (⌘ + Shift + K)"
echo "3. Build and Run: Press ▶️ or (⌘ + R)"
echo ""
echo "The white screen should now be fixed! 🎉"
echo ""
echo "📁 Bundle location: ios/MyToDoo/main.jsbundle"
echo "🎨 App icon updated: mytodoo-adaptive-icon.png"
echo ""
