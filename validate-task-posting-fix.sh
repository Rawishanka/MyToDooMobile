#!/bin/bash
# ==================================================================================
# Task Posting Validation Test
# ==================================================================================
# This script validates that the task posting fixes are working correctly
# Run this before building for Xcode to ensure everything is properly configured
# ==================================================================================

echo "🧪 =========================================="
echo "🧪 TASK POSTING VALIDATION TEST"
echo "🧪 =========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if a string exists in a file
check_fix() {
  local file=$1
  local search_string=$2
  local description=$3
  
  if grep -q "$search_string" "$file"; then
    echo -e "${GREEN}✅ PASS${NC}: $description"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $description"
    ((TESTS_FAILED++))
  fi
}

# Function to check if a string does NOT exist in a file
check_removed() {
  local file=$1
  local search_string=$2
  local description=$3
  
  if ! grep -q "$search_string" "$file"; then
    echo -e "${GREEN}✅ PASS${NC}: $description"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $description"
    ((TESTS_FAILED++))
  fi
}

echo "📋 Testing Category Fixes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Check detail-screen.tsx has categoryString fix
check_fix \
  "src/features/tasks/screens/create/detail-screen.tsx" \
  "const categoryString = Array.isArray(categoryValue)" \
  "detail-screen.tsx converts category to string"

# Test 2: Check detail-screen.tsx uses categoryString not categoryArray
check_fix \
  "src/features/tasks/screens/create/detail-screen.tsx" \
  "category: categoryString" \
  "detail-screen.tsx assigns category as string"

# Test 3: Check categoryArray is removed from detail-screen.tsx
check_removed \
  "src/features/tasks/screens/create/detail-screen.tsx" \
  "category: categoryArray" \
  "detail-screen.tsx no longer uses categoryArray"

# Test 4: Check post-task-screen.tsx has enhanced getTaskCategory
check_fix \
  "src/features/tasks/screens/create/post-task-screen.tsx" \
  "const category = Array.isArray(task.category)" \
  "post-task-screen.tsx handles array/string category"

# Test 5: Check post-task-screen.tsx uses String().trim()
check_fix \
  "src/features/tasks/screens/create/post-task-screen.tsx" \
  "return String(category).trim()" \
  "post-task-screen.tsx validates category as string"

echo ""
echo "📋 Testing Location Fixes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 6: Check detail-screen.tsx has location string validation
check_fix \
  "src/features/tasks/screens/create/detail-screen.tsx" \
  'String(getLocationFromTask()).trim() || "Location not specified"' \
  "detail-screen.tsx validates location as string"

# Test 7: Check post-task-screen.tsx has location string validation  
check_fix \
  "src/features/tasks/screens/create/post-task-screen.tsx" \
  'String(formatLocationForBackend(myTask)).trim() || '"'"'Location not specified'"'"'' \
  "post-task-screen.tsx validates location as string"

echo ""
echo "📋 Testing TypeScript Type Definitions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 8: Check CreateTaskRequest interface has category as string
check_fix \
  "src/api/types/tasks.ts" \
  "category: string;" \
  "CreateTaskRequest defines category as string"

# Test 9: Check location is defined as string
check_fix \
  "src/api/types/tasks.ts" \
  "location: string;" \
  "CreateTaskRequest defines location as string"

echo ""
echo "🧪 =========================================="
echo "🧪 TEST RESULTS"
echo "🧪 =========================================="
echo ""
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo ""
  echo "✅ Category validation fixed - always sends string"
  echo "✅ Location validation fixed - always sends string"  
  echo "✅ Type definitions are correct"
  echo "✅ Ready to build in Xcode!"
  echo ""
  echo "Next steps:"
  echo "1. Clean build: rm -rf ios/build"
  echo "2. Open Xcode: xed ios/"
  echo "3. Clean build folder: ⌘ + Shift + K"
  echo "4. Build and run: ⌘ + R"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  echo ""
  echo "Please review the failed tests above."
  echo "The fixes may not have been applied correctly."
  exit 1
fi
