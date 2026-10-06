#!/bin/bash
# Post-install script: fix codegen compatibility for RN 0.85 + babel-preset-expo
# This ensures the babel codegen plugin uses the correct version matching react-native

CODEGEN_NESTED="node_modules/babel-preset-expo/node_modules/@react-native/codegen"
CODEGEN_ROOT="node_modules/@react-native/codegen"

if [ -d "$CODEGEN_ROOT" ] && [ -d "node_modules/babel-preset-expo/node_modules/@react-native" ]; then
  rm -rf "$CODEGEN_NESTED"
  ln -s "../../../@react-native/codegen" "$CODEGEN_NESTED"
  echo "✅ Linked codegen $(node -e "console.log(require('$CODEGEN_ROOT/package.json').version)") for babel-preset-expo"
fi

# Android release builds look for hermesc under react-native/sdks/hermesc, but RN 0.85 ships the
# compiler in the hermes-compiler package. Point the old location at it (also keeps it executable).
HERMESC_PKG="node_modules/hermes-compiler/hermesc"
HERMESC_SDK="node_modules/react-native/sdks/hermesc"
if [ -d "$HERMESC_PKG" ] && [ ! -e "$HERMESC_SDK" ]; then
  mkdir -p "node_modules/react-native/sdks"
  ln -s "../../hermes-compiler/hermesc" "$HERMESC_SDK"
  chmod +x "$HERMESC_PKG"/*/hermesc 2>/dev/null || true
  echo "✅ Linked hermesc for Android release builds"
fi
