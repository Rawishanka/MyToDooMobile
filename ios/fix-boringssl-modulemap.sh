#!/bin/bash

# This script ensures BoringSSL-GRPC modulemap is in the correct location
# It runs as part of the Xcode build process

set -e

PODS_ROOT="${PODS_ROOT:-${SRCROOT}/Pods}"
MODULEMAP_SOURCE="${PODS_ROOT}/BoringSSL-GRPC/src/include/openssl/BoringSSL.modulemap"
PRIVATE_HEADERS="${PODS_ROOT}/Headers/Private/openssl_grpc"
PUBLIC_HEADERS="${PODS_ROOT}/Headers/Public/openssl_grpc"

echo "🔧 [Build Phase] Ensuring BoringSSL-GRPC modulemap exists..."

# Create directories if they don't exist
mkdir -p "${PRIVATE_HEADERS}"
mkdir -p "${PUBLIC_HEADERS}"

# Copy modulemap if source exists
if [ -f "${MODULEMAP_SOURCE}" ]; then
    cp -f "${MODULEMAP_SOURCE}" "${PRIVATE_HEADERS}/BoringSSL-GRPC.modulemap"
    cp -f "${MODULEMAP_SOURCE}" "${PUBLIC_HEADERS}/BoringSSL-GRPC.modulemap"
    echo "✅ BoringSSL-GRPC modulemap copied to ${PRIVATE_HEADERS}"
else
    echo "⚠️  Source modulemap not found at ${MODULEMAP_SOURCE}"
    echo "   Searching for alternative locations..."
    
    # Try to find it in alternative locations
    FOUND_MODULEMAP=$(find "${PODS_ROOT}/BoringSSL-GRPC" -name "*.modulemap" -type f 2>/dev/null | head -1)
    
    if [ -n "${FOUND_MODULEMAP}" ]; then
        echo "✅ Found modulemap at: ${FOUND_MODULEMAP}"
        cp -f "${FOUND_MODULEMAP}" "${PRIVATE_HEADERS}/BoringSSL-GRPC.modulemap"
        cp -f "${FOUND_MODULEMAP}" "${PUBLIC_HEADERS}/BoringSSL-GRPC.modulemap"
        echo "✅ Copied to expected locations"
    else
        echo "❌ No modulemap found in BoringSSL-GRPC pod!"
        exit 1
    fi
fi

echo "✅ BoringSSL-GRPC modulemap fix complete"
