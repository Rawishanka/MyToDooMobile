#!/bin/bash
# Post-pod-install script to apply patches
# This ensures patches are applied after every pod install

echo "🔧 Applying node_modules patches after pod install..."
cd "$(dirname "$0")/.."
npx patch-package
echo "✅ Patches applied successfully!"
