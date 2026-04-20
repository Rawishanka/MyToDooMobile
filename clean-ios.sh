#!/bin/bash

echo "🚀 MyToDoo iOS Deep Clean Script"
echo "=================================="
echo ""

# 1. Kill any running processes
echo "🧹 Step 1: Closing Xcode and killing Metro..."
killall Xcode 2>/dev/null
killall node 2>/dev/null
killall watchman 2>/dev/null
echo "✅ Processes killed"
echo ""

# 2. Clear Watchman (if installed)
echo "📦 Step 2: Cleaning Watchman cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null
    echo "✅ Watchman cache cleared"
else
    echo "⚠️  Watchman not installed (skipping)"
fi
echo ""

# 3. Clean Node modules (optional - uncomment if needed)
echo "📦 Step 3: Cleaning Node modules..."
read -p "Do you want to remove node_modules? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf node_modules
    echo "✅ Node modules removed"
else
    echo "⏭️  Skipping node_modules removal"
fi
echo ""

# 4. The "Nuclear" iOS Clean
echo "🗑️  Step 4: Removing iOS build artifacts..."
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/CocoaPods
echo "✅ iOS artifacts removed"
echo ""

# 5. Reinstall Dependencies
if [ ! -d "node_modules" ]; then
    echo "📥 Step 5: Installing Node modules..."
    npm install
    echo "✅ Node modules installed"
    echo ""
else
    echo "⏭️  Step 5: Skipping npm install (node_modules exists)"
    echo ""
fi

# 6. Pod Installation
echo "⚙️  Step 6: Installing Pods with repo update..."
cd ios
pod deintegrate 2>/dev/null
pod install --repo-update
cd ..
echo "✅ Pods installed"
echo ""

# 7. Final instructions
echo "✅ Clean complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open ios/MyToDoo.xcworkspace in Xcode"
echo "2. In Xcode menu: Product > Clean Build Folder (⌘⇧K)"
echo "3. Build your project (⌘B)"
echo ""
echo "🎯 To open workspace automatically:"
echo "   open ios/MyToDoo.xcworkspace"
echo ""
