#!/bin/bash
# Run this AFTER: npx expo prebuild --platform ios && cd ios && pod install
# Fixes RNFB module map conflicts and deployment targets

set -e
cd "$(dirname "$0")/../ios"

echo "🔧 Fixing RNFB module maps..."
for f in Pods/Target\ Support\ Files/RNFB*/*.modulemap; do
  name=$(basename "$f" .modulemap)
  echo "framework module $name {
}" > "$f"
  echo "  Emptied $f"
done

echo "🔧 Patching xcconfigs (CLANG_ENABLE_EXPLICIT_MODULES=NO)..."
python3 -c "
import os
count = 0
for root, dirs, files in os.walk('Pods/Target Support Files'):
    for f in files:
        if f.endswith('.xcconfig'):
            path = os.path.join(root, f)
            with open(path) as fh:
                content = fh.read()
            if 'CLANG_ENABLE_EXPLICIT_MODULES' not in content:
                with open(path, 'a') as fh:
                    fh.write('\nCLANG_ENABLE_EXPLICIT_MODULES = NO\n')
                count += 1
print(f'  Patched {count} xcconfigs')
"

echo "🔧 Fixing deployment targets to 16.4..."
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 15\.1/IPHONEOS_DEPLOYMENT_TARGET = 16.4/g' Pods/Pods.xcodeproj/project.pbxproj
echo "  Done"

echo "🔧 Pre-building FirebaseAuth to generate Swift header..."
xcodebuild build -project Pods/Pods.xcodeproj -target FirebaseAuth -configuration Release -sdk iphoneos CLANG_ENABLE_EXPLICIT_MODULES=NO ARCHS=arm64 ONLY_ACTIVE_ARCH=NO BUILD_DIR="$(pwd)/build_tmp" 2>&1 | tail -1
SWIFT_H="build_tmp/Release-iphoneos/FirebaseAuth/Swift Compatibility Header/FirebaseAuth-Swift.h"
if [ -f "$SWIFT_H" ]; then
  cp "$SWIFT_H" Pods/Headers/Public/FirebaseAuth/FirebaseAuth-Swift.h
  echo "  Copied FirebaseAuth-Swift.h"
else
  # Fallback: find from DerivedData
  SWIFT_H=$(find ~/Library/Developer/Xcode/DerivedData -name "FirebaseAuth-Swift.h" -path "*Debug*" -not -path "*Index*" 2>/dev/null | head -1)
  if [ -n "$SWIFT_H" ]; then
    cp "$SWIFT_H" Pods/Headers/Public/FirebaseAuth/FirebaseAuth-Swift.h
    echo "  Copied FirebaseAuth-Swift.h from DerivedData"
  fi
fi
rm -rf build_tmp

echo "🔧 Fixing weak_framework FirebaseFirestoreInternal linker issue..."
for f in Pods/Target\ Support\ Files/Pods-MyToDoo/Pods-MyToDoo.*.xcconfig; do
  sed -i '' 's/ -weak_framework "FirebaseFirestoreInternal"//g' "$f"
done
echo "  Done"

echo "🔧 Copying GoogleService-Info.plist..."
cp ../GoogleService-Info.plist MyToDoo/ 2>/dev/null && echo "  Done" || echo "  Skipped (not found)"

echo "✅ All iOS fixes applied. Ready to build!"
