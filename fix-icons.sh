#!/bin/bash

echo "🎨 Replacing lucide-react-native icons with @expo/vector-icons"
echo "=============================================================="
echo ""

# List of files to fix
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

# Backup files
echo "1️⃣  Creating backups..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$file.lucide-backup"
  fi
done
echo "✅ Backups created"
echo ""

# Replace imports and icon usage
echo "2️⃣  Replacing lucide imports with Ionicons..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Remove lucide import
    sed -i '' "/import.*from 'lucide-react-native'/d" "$file"
    
    # Replace icon usage
    sed -i '' 's/<ChevronLeft /<Ionicons name="chevron-back" /g' "$file"
    sed -i '' 's/<ChevronRight /<Ionicons name="chevron-forward" /g' "$file"
    sed -i '' 's/<ChevronDown /<Ionicons name="chevron-down" /g' "$file"
    sed -i '' 's/<Bell /<Ionicons name="notifications-outline" /g' "$file"
    
    echo "   ✅ Fixed: $file"
  fi
done
echo ""

echo "3️⃣  Verifying fixes..."
echo "   Checking for remaining lucide imports..."
REMAINING=$(grep -r "lucide-react-native" src/ 2>/dev/null | grep -v ".backup" | wc -l | tr -d ' ')
if [ "$REMAINING" -eq "0" ]; then
  echo "   ✅ No lucide imports remaining!"
else
  echo "   ⚠️  Found $REMAINING files still using lucide"
fi
echo ""

echo "=============================================================="
echo "✅ Icon replacement complete!"
echo "=============================================================="
echo ""
echo "📝 Note: Backup files created with .lucide-backup extension"
echo "🔄 Next: Regenerate iOS bundle to include icon fixes"
