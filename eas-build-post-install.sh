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

echo "==================================="
