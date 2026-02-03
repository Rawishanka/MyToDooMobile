#!/bin/bash

echo "📦 Adding Ionicons imports to icon-fixed files..."
echo "================================================"
echo ""

FILES=(
  "src/features/dashboard/components/OnboardingCarousel.tsx"
  "src/features/tasks/screens/create/title-screen.tsx"
  "src/features/tasks/screens/create/time-select-screen.tsx"
  "src/features/tasks/screens/create/image-upload-screen.tsx"
  "src/features/tasks/screens/create/description-screen.tsx"
  "src/features/tasks/screens/create/budget-screen.tsx"
  "src/features/tasks/screens/create/create-task-screen.tsx"
  "src/features/tasks/screens/create/goal-screen.tsx"
  "src/features/tasks/screens/create/location-screen.tsx"
  "src/features/tasks/screens/create/detail-screen.tsx"
  "src/features/tasks/screens/create/components/CategoryDropdown.tsx"
  "src/features/tasks/screens/mytasks/edit-mytasks-screen.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if Ionicons import already exists
    if ! grep -q "import.*Ionicons.*from '@expo/vector-icons'" "$file"; then
      # Find the first import line and add Ionicons import after it
      sed -i '' "1a\\
import { Ionicons } from '@expo/vector-icons';
" "$file"
      echo "   ✅ Added Ionicons import to: $file"
    else
      echo "   ✓ Already has Ionicons: $file"
    fi
  fi
done

echo ""
echo "✅ All Ionicons imports added!"
