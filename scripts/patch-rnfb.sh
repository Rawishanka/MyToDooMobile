#!/bin/bash
# Comprehensive patch for @react-native-firebase with RN 0.85 + use_frameworks! :static
# Fixes:
# 1. Cross-module import errors (RCTBridgeModule redeclaration across module boundaries)
# 2. implicit-int errors from Xcode 26 strict C99 enforcement

set -e

RNFB_DIR="node_modules/@react-native-firebase"

echo "=== Patching @react-native-firebase for RN 0.85 + use_frameworks! :static ==="

# ============================================================
# STEP 1: Fix ALL RNFB header files that import <React/RCTBridgeModule.h>
# The issue: with use_frameworks! :static, each pod is a separate Clang module.
# When RNFBApp already imports RCTBridgeModule via React module, other RNFB pods
# can't re-import it from the React module directly — causes "declaration must be 
# imported from module X before required" errors.
#
# Fix: For non-app RNFB pods, replace direct React imports with @import of the 
# parent module that already provides them. For the app pod itself, imports are fine.
# ============================================================

echo "--- Step 1: Fixing cross-module imports in RNFB headers ---"

# For firestore, auth, storage, messaging headers that import React protocols:
# Replace #import <React/RCTBridgeModule.h> with a forward protocol declaration
# and add the actual import via a non-modular include

# Fix firestore headers - these import both RNFBApp AND React, causing conflict
for header in \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreModule.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreDocumentModule.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreCollectionModule.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreTransactionModule.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreQuery.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreCommon.h" \
  "$RNFB_DIR/firestore/ios/RNFBFirestore/RNFBFirestoreSerialize.h"; do
  if [ -f "$header" ]; then
    # Check if already patched
    if ! grep -q "RNFB_PATCHED_FOR_RN085" "$header"; then
      echo "  Patching: $header"
      # Add @import React before any RNFBApp import to establish module ownership
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$header"
      # Replace #import <React/RCTBridgeModule.h> with @import that works with modules
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched for use_frameworks static|g' "$header"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched for use_frameworks static|g' "$header"
    fi
  fi
done

# Fix auth header
for header in "$RNFB_DIR/auth/ios/RNFBAuth/RNFBAuthModule.h"; do
  if [ -f "$header" ]; then
    if ! grep -q "RNFB_PATCHED_FOR_RN085" "$header"; then
      echo "  Patching: $header"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$header"
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched for use_frameworks static|g' "$header"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched for use_frameworks static|g' "$header"
    fi
  fi
done

# Fix storage header
for header in "$RNFB_DIR/storage/ios/RNFBStorage/RNFBStorageModule.h"; do
  if [ -f "$header" ]; then
    if ! grep -q "RNFB_PATCHED_FOR_RN085" "$header"; then
      echo "  Patching: $header"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$header"
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched for use_frameworks static|g' "$header"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched for use_frameworks static|g' "$header"
    fi
  fi
done

# Fix messaging headers
for header in \
  "$RNFB_DIR/messaging/ios/RNFBMessaging/RNFBMessagingModule.h" \
  "$RNFB_DIR/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.h" \
  "$RNFB_DIR/messaging/ios/RNFBMessaging/RNFBMessagingSerializer.h"; do
  if [ -f "$header" ]; then
    if ! grep -q "RNFB_PATCHED_FOR_RN085" "$header"; then
      echo "  Patching: $header"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$header"
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched for use_frameworks static|g' "$header"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched for use_frameworks static|g' "$header"
    fi
  fi
done

# ============================================================
# STEP 2: Fix .m files that import React headers directly
# These also need @import React to avoid module boundary issues
# ============================================================

echo "--- Step 2: Fixing cross-module imports in RNFB .m files ---"

for mfile in $(find "$RNFB_DIR" -path "*/ios/*" -name "*.m" ! -path "*/app/ios/*"); do
  if [ -f "$mfile" ]; then
    if grep -q '#import <React/RCT' "$mfile" && ! grep -q "RNFB_PATCHED_FOR_RN085" "$mfile"; then
      echo "  Patching: $mfile"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$mfile"
      # Replace all React framework imports with @import React
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTUtils.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTConvert.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched|g' "$mfile"
    fi
  fi
done

# ============================================================
# STEP 3: Fix RNFBApp .m files too (they may have issues with RCT macros)
# ============================================================

echo "--- Step 3: Fixing RNFBApp module files ---"

for mfile in $(find "$RNFB_DIR/app/ios" -name "*.m"); do
  if [ -f "$mfile" ]; then
    if grep -q '#import <React/RCT' "$mfile" && ! grep -q "RNFB_PATCHED_FOR_RN085" "$mfile"; then
      echo "  Patching: $mfile"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$mfile"
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTUtils.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTConvert.h>|@import React; // patched|g' "$mfile"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched|g' "$mfile"
    fi
  fi
done

# Also fix the RNFBApp headers that import React
for header in $(find "$RNFB_DIR/app/ios" -name "*.h"); do
  if [ -f "$header" ]; then
    if grep -q '#import <React/RCT' "$header" && ! grep -q "RNFB_PATCHED_FOR_RN085" "$header"; then
      echo "  Patching: $header"
      sed -i '' '1s/^/\/\/ RNFB_PATCHED_FOR_RN085\n/' "$header"
      sed -i '' 's|#import <React/RCTBridgeModule.h>|@import React; // patched|g' "$header"
      sed -i '' 's|#import <React/RCTEventEmitter.h>|@import React; // patched|g' "$header"
      sed -i '' 's|#import <React/RCTConvert.h>|@import React; // patched|g' "$header"
    fi
  fi
done

# ============================================================
# STEP 4: RNFBMessaging calls FIRAuth by type, but with Firebase iOS 11+ (FirebaseAuth is Swift)
# this target only sees `@class FIRAuth;`, so the archive fails with
# "receiver 'FIRAuth' for class message is a forward declaration".
# Call it through the Objective-C runtime instead (same behaviour when FirebaseAuth is linked).
# ============================================================

echo "--- Step 4: RNFBMessaging FIRAuth runtime call ---"

python3 - "$RNFB_DIR/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m" <<'PYEOF'
import sys
path = sys.argv[1]
s = open(path, encoding="utf8").read()
marker = "RNFB_FIRAUTH_RUNTIME_CALL"
old = "    if ([[FIRAuth authWithApp:app] canHandleNotification:userInfo]) {"
if marker in s or old not in s:
    print("  already patched (or nothing to patch)")
    sys.exit(0)
new = """    // RNFB_FIRAUTH_RUNTIME_CALL: FIRAuth is a Swift class (forward-declared only here), so call
    // it through the runtime instead of by type
    Class authClass = NSClassFromString(@"FIRAuth");
    id auth = [authClass respondsToSelector:@selector(authWithApp:)]
                  ? [authClass performSelector:@selector(authWithApp:) withObject:app]
                  : nil;
    SEL canHandleSelector = NSSelectorFromString(@"canHandleNotification:");
    if (auth != nil && [auth respondsToSelector:canHandleSelector] &&
        ((BOOL(*)(id, SEL, id))objc_msgSend)(auth, canHandleSelector, userInfo)) {"""
s = s.replace(old, new, 1)
if "#import <objc/message.h>" not in s:
    s = s.replace("#import <objc/runtime.h>\n", "#import <objc/message.h>\n#import <objc/runtime.h>\n", 1)
open(path, "w", encoding="utf8").write(s)
print("  patched")
PYEOF

# ============================================================
# STEP 5: RNFBAuthModule.h defines AuthErrorCode_toJSErrorCode with FIRAuthErrorCode* constants,
# which with Firebase iOS 11+ only exist in the Swift-generated header. The Podfile already adds
# its folder to RNFBAuth's header search path; the header just has to import it.
# ============================================================

echo "--- Step 5: RNFBAuthModule.h imports FirebaseAuth-Swift.h ---"
AUTH_HEADER="$RNFB_DIR/auth/ios/RNFBAuth/RNFBAuthModule.h"
if [ -f "$AUTH_HEADER" ] && ! grep -q 'FirebaseAuth-Swift.h' "$AUTH_HEADER"; then
  sed -i '' 's|^@import React; // patched for use_frameworks static$|&\
#import "FirebaseAuth-Swift.h" // FIRAuthErrorCode* live in the Swift-generated header|' "$AUTH_HEADER"
  echo "  patched $AUTH_HEADER"
else
  echo "  already patched (or nothing to patch)"
fi

echo ""
echo "=== Patch complete! ==="
echo "All RNFB files patched for RN 0.85 + use_frameworks! :static + Xcode 26"
