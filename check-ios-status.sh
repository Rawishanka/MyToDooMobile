#!/bin/bash

# 🔍 iOS App Status Checker
# Verifies all fixes are in place

echo "🔍 Checking iOS App Status..."
echo "=============================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile"
cd "$PROJECT_DIR"

# Check 1: JS Bundle
echo "1️⃣  JavaScript Bundle:"
if [ -f "ios/MyToDoo/main.jsbundle" ]; then
    SIZE=$(du -h ios/MyToDoo/main.jsbundle | cut -f1)
    echo -e "${GREEN}✅ main.jsbundle exists ($SIZE)${NC}"
    
    # Check if it's in Xcode project
    if grep -q "main.jsbundle" ios/MyToDoo.xcodeproj/project.pbxproj; then
        echo -e "${GREEN}✅ main.jsbundle is referenced in Xcode project${NC}"
    else
        echo -e "${RED}❌ main.jsbundle NOT referenced in Xcode project${NC}"
    fi
else
    echo -e "${RED}❌ main.jsbundle NOT FOUND${NC}"
    echo -e "${YELLOW}   Run: ./fix-white-screen.sh${NC}"
fi
echo ""

# Check 2: App Icon
echo "2️⃣  App Icon:"
ICON_PATH="ios/MyToDoo/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
if [ -f "$ICON_PATH" ]; then
    SIZE=$(du -h "$ICON_PATH" | cut -f1)
    echo -e "${GREEN}✅ App icon exists ($SIZE)${NC}"
    
    # Check if it's the mytodoo icon (should be around 47K)
    SIZE_BYTES=$(stat -f%z "$ICON_PATH" 2>/dev/null || echo "0")
    if [ "$SIZE_BYTES" -gt 30000 ]; then
        echo -e "${GREEN}✅ Icon size looks correct (MyToDoo icon)${NC}"
    else
        echo -e "${YELLOW}⚠️  Icon might be default Expo icon${NC}"
        echo -e "${YELLOW}   Run: ./fix-app-icon.sh${NC}"
    fi
else
    echo -e "${RED}❌ App icon NOT FOUND${NC}"
    echo -e "${YELLOW}   Run: ./fix-app-icon.sh${NC}"
fi
echo ""

# Check 3: Xcode Workspace
echo "3️⃣  Xcode Workspace:"
if [ -d "ios/MyToDoo.xcworkspace" ]; then
    echo -e "${GREEN}✅ MyToDoo.xcworkspace exists${NC}"
else
    echo -e "${RED}❌ Xcode workspace NOT FOUND${NC}"
    echo -e "${YELLOW}   Run: npx expo prebuild --platform ios${NC}"
fi
echo ""

# Check 4: CocoaPods
echo "4️⃣  CocoaPods:"
if [ -d "ios/Pods" ]; then
    POD_COUNT=$(ls -1 ios/Pods | wc -l | xargs)
    echo -e "${GREEN}✅ Pods installed ($POD_COUNT directories)${NC}"
else
    echo -e "${RED}❌ Pods NOT FOUND${NC}"
    echo -e "${YELLOW}   Run: cd ios && pod install${NC}"
fi
echo ""

# Check 5: Firebase Configuration
echo "5️⃣  Firebase Configuration:"
if [ -f "ios/MyToDoo/GoogleService-Info.plist" ]; then
    if plutil -lint ios/MyToDoo/GoogleService-Info.plist > /dev/null 2>&1; then
        echo -e "${GREEN}✅ GoogleService-Info.plist is valid${NC}"
        
        # Extract project ID
        PROJECT_ID=$(plutil -extract PROJECT_ID raw ios/MyToDoo/GoogleService-Info.plist 2>/dev/null || echo "unknown")
        echo -e "${GREEN}   Project: $PROJECT_ID${NC}"
    else
        echo -e "${RED}❌ GoogleService-Info.plist is invalid${NC}"
    fi
else
    echo -e "${RED}❌ GoogleService-Info.plist NOT FOUND${NC}"
fi
echo ""

# Check 6: Bundle Identifier
echo "6️⃣  Bundle Identifier:"
BUNDLE_ID=$(grep -m 1 "PRODUCT_BUNDLE_IDENTIFIER" ios/MyToDoo.xcodeproj/project.pbxproj | sed 's/.*= \(.*\);/\1/' | xargs)
if [ ! -z "$BUNDLE_ID" ]; then
    echo -e "${GREEN}✅ Bundle ID: $BUNDLE_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Could not determine bundle ID${NC}"
fi
echo ""

# Check 7: Xcode Version
echo "7️⃣  Development Tools:"
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version | head -1)
    echo -e "${GREEN}✅ $XCODE_VERSION${NC}"
else
    echo -e "${RED}❌ Xcode not found${NC}"
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi

if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo -e "${GREEN}✅ CocoaPods $POD_VERSION${NC}"
else
    echo -e "${RED}❌ CocoaPods not found${NC}"
fi
echo ""

# Summary
echo "=============================="
echo "📊 Summary:"
echo "=============================="

ISSUES_FOUND=0

# Count issues
[ ! -f "ios/MyToDoo/main.jsbundle" ] && ((ISSUES_FOUND++))
[ ! -f "$ICON_PATH" ] && ((ISSUES_FOUND++))
[ ! -d "ios/MyToDoo.xcworkspace" ] && ((ISSUES_FOUND++))
[ ! -d "ios/Pods" ] && ((ISSUES_FOUND++))

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "🚀 Your app is ready to run!"
    echo ""
    echo "Next steps:"
    echo "1. Open Xcode: open ios/MyToDoo.xcworkspace"
    echo "2. Select a simulator (iPhone 17 Pro)"
    echo "3. Press ▶️ Run (⌘ + R)"
    echo ""
    echo "Expected behavior:"
    echo "✅ No white screen"
    echo "✅ MyToDoo icon appears"
    echo "✅ Full UI with login screen"
else
    echo -e "${RED}⚠️  Found $ISSUES_FOUND issue(s)${NC}"
    echo ""
    echo "Run these commands to fix:"
    echo "  ./fix-white-screen.sh    # Fix JS bundle"
    echo "  ./fix-app-icon.sh        # Fix app icon"
    echo "  ./troubleshoot-ios.sh    # Full troubleshooting"
fi
echo ""
