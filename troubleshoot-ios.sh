#!/bin/bash

# 🔧 MyToDoo iOS Troubleshooting Script
# Run this if you encounter build issues in Xcode

echo "🔧 MyToDoo iOS Troubleshooter"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile"

cd "$PROJECT_DIR"

echo "📍 Working directory: $PROJECT_DIR"
echo ""

# Function to check and report status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# 1. Check Node installation
echo "1️⃣  Checking Node.js..."
node --version > /dev/null 2>&1
check_status "Node.js is installed: $(node --version)"
echo ""

# 2. Check CocoaPods installation
echo "2️⃣  Checking CocoaPods..."
pod --version > /dev/null 2>&1
check_status "CocoaPods is installed: $(pod --version)"
echo ""

# 3. Check if node_modules exists
echo "3️⃣  Checking node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found. Installing...${NC}"
    npm install
    check_status "npm install completed"
fi
echo ""

# 4. Check iOS workspace
echo "4️⃣  Checking iOS workspace..."
if [ -d "ios/MyToDoo.xcworkspace" ]; then
    echo -e "${GREEN}✅ Xcode workspace exists${NC}"
else
    echo -e "${RED}❌ Xcode workspace not found!${NC}"
    echo "   Run: npx expo prebuild --platform ios"
fi
echo ""

# 5. Check Pods
echo "5️⃣  Checking CocoaPods installation..."
if [ -d "ios/Pods" ]; then
    POD_COUNT=$(ls -1 ios/Pods | wc -l | xargs)
    echo -e "${GREEN}✅ Pods installed: $POD_COUNT directories${NC}"
else
    echo -e "${YELLOW}⚠️  Pods not found. Installing...${NC}"
    cd ios
    pod install
    check_status "pod install completed"
    cd ..
fi
echo ""

# 6. Check GoogleService-Info.plist
echo "6️⃣  Checking Firebase configuration..."
if [ -f "ios/MyToDoo/GoogleService-Info.plist" ]; then
    plutil -lint ios/MyToDoo/GoogleService-Info.plist > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ GoogleService-Info.plist is valid${NC}"
    else
        echo -e "${RED}❌ GoogleService-Info.plist is corrupted${NC}"
        echo "   Download a fresh copy from Firebase Console"
    fi
else
    echo -e "${RED}❌ GoogleService-Info.plist not found${NC}"
    echo "   Download from: https://console.firebase.google.com"
fi
echo ""

# 7. Clean build option
echo "7️⃣  Clean Build Options"
echo "------------------------"
echo ""
read -p "Do you want to clean and rebuild iOS? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning iOS build...${NC}"
    
    cd ios
    
    # Remove build artifacts
    rm -rf build
    rm -rf DerivedData
    echo "   ✓ Removed build folder"
    
    # Remove and reinstall pods
    rm -rf Pods Podfile.lock
    echo "   ✓ Removed Pods"
    
    pod install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✓ Pods reinstalled successfully${NC}"
    else
        echo -e "${RED}   ✗ Pod install failed${NC}"
        echo "   Check the error above"
    fi
    
    cd ..
    
    echo -e "${GREEN}✅ Clean complete!${NC}"
else
    echo "Skipping clean build."
fi
echo ""

# 8. Metro bundler cache option
echo "8️⃣  Metro Bundler Cache"
echo "------------------------"
echo ""
read -p "Do you want to clear Metro bundler cache? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Clearing Metro cache...${NC}"
    
    # Clear Metro bundler cache
    rm -rf $TMPDIR/metro-* 2>/dev/null
    rm -rf $TMPDIR/haste-map-* 2>/dev/null
    rm -rf node_modules/.cache 2>/dev/null
    
    echo -e "${GREEN}✅ Metro cache cleared!${NC}"
else
    echo "Skipping Metro cache clear."
fi
echo ""

# 9. System info
echo "9️⃣  System Information"
echo "----------------------"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "CocoaPods: $(pod --version)"
echo "Xcode: $(xcodebuild -version | head -1)"
echo ""

# 10. Quick diagnostics
echo "🔍 Quick Diagnostics"
echo "--------------------"

# Check if Xcode Command Line Tools are installed
if xcode-select -p > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Xcode Command Line Tools: $(xcode-select -p)${NC}"
else
    echo -e "${RED}❌ Xcode Command Line Tools not found${NC}"
    echo "   Install with: xcode-select --install"
fi

# Check if ruby is available (needed for CocoaPods)
if which ruby > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ruby: $(ruby --version | cut -d' ' -f2)${NC}"
else
    echo -e "${RED}❌ Ruby not found${NC}"
fi

# Check available disk space
DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✅ Available disk space: $DISK_SPACE${NC}"

echo ""
echo "=============================="
echo "🎯 Next Steps"
echo "=============================="
echo ""
echo "1. Open Xcode workspace:"
echo "   open ios/MyToDoo.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Select an iPhone simulator"
echo "   - Enable 'Automatically manage signing'"
echo "   - Press ▶️ Run (⌘ + R)"
echo ""
echo "3. Or run from CLI:"
echo "   npm start              # Start Metro bundler"
echo "   npx expo run:ios       # Build and run"
echo ""
echo "📖 See RUN_IOS_APP.md for detailed instructions"
echo ""
