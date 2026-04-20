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
