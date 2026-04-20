#!/bin/bash

echo "🔧 Fixing Xcode Build Error"
echo "============================"
echo ""

echo "1️⃣  Cleaning Xcode build folder..."
rm -rf ios/build
echo "✅ Build folder cleaned"

echo ""
echo "2️⃣  Cleaning DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "✅ DerivedData cleaned"

echo ""
echo "3️⃣  Cleaning Pods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
echo "✅ Pods cleaned"

echo ""
echo "4️⃣  Reinstalling Pods..."
pod install --repo-update
echo "✅ Pods reinstalled"

echo ""
echo "5️⃣  Cleaning workspace..."
cd ..
rm -rf node_modules/.cache
echo "✅ Cache cleaned"

echo ""
echo "============================"
echo "✅ Build errors fixed!"
echo "============================"
echo ""
echo "🚀 Next steps:"
echo "1. Open Xcode: open ios/MyToDoo.xcworkspace"
echo "2. Product → Clean Build Folder (⌘ + Shift + K)"
echo "3. Close and reopen Xcode"
echo "4. Product → Build (⌘ + B)"
echo ""
