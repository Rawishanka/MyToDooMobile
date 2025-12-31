#!/usr/bin/env bash

set -e

echo "==================================="
echo "EAS Build Post-Install Hook"
echo "==================================="
echo "Verifying patches were applied..."

# Check if patches were applied
if grep -q "from '@react-native-firebase/app/lib/common/index.js'" node_modules/@react-native-firebase/messaging/lib/index.js; then
  echo "✅ Firebase patches applied successfully"
else
  echo "❌ Firebase patches NOT applied, applying now..."
  npm run postinstall
fi

# Fix iOS CocoaPods gRPC-Core / BoringSSL issues
if [ "$EAS_BUILD_PLATFORM" == "ios" ]; then
  echo "==================================="
  echo "Fixing iOS CocoaPods gRPC-Core setup"
  echo "==================================="
  
  cd ios
  
  # Clean and install pods
  echo "Running pod install..."
  pod install --repo-update
  
  # Create symbolic links for BoringSSL-GRPC if needed
  if [ -d "Pods/Headers/Private/openssl_grpc" ] && [ -f "Pods/Headers/Private/openssl_grpc/BoringSSL-GRPC.modulemap" ]; then
    echo "✅ BoringSSL-GRPC headers already configured"
  else
    echo "⚠️  Creating BoringSSL-GRPC header directories and modulemap..."
    mkdir -p Pods/Headers/Private/openssl_grpc
    mkdir -p Pods/Headers/Public/openssl_grpc
    
    # Find and copy the actual modulemap
    MODULEMAP_SOURCE="Pods/BoringSSL-GRPC/src/include/openssl/BoringSSL.modulemap"
    if [ -f "$MODULEMAP_SOURCE" ]; then
      cp "$MODULEMAP_SOURCE" "Pods/Headers/Private/openssl_grpc/BoringSSL-GRPC.modulemap"
      cp "$MODULEMAP_SOURCE" "Pods/Headers/Public/openssl_grpc/BoringSSL-GRPC.modulemap"
      echo "✅ Created BoringSSL-GRPC modulemap at expected locations"
    else
      echo "❌ BoringSSL modulemap not found at $MODULEMAP_SOURCE"
      echo "Searching for modulemap..."
      find Pods/BoringSSL-GRPC -name "*.modulemap" 2>/dev/null || echo "No modulemap found"
    fi
  fi
  
  cd ..
  echo "✅ iOS CocoaPods setup complete"
fi

echo "==================================="
