#!/usr/bin/env python3
import re

# Read the corrupted file
with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

# Remove malformed entries (lines with lastKnownFileType but no UUID at start)
lines = content.split('\n')
fixed_lines = []

for i, line in enumerate(lines):
    # Skip lines that start with whitespace and "lastKnownFileType" (malformed entries)
    if re.match(r'^\s+lastKnownFileType = file; name = \w+\.ttf', line):
        print(f"Removing malformed line {i+1}: {line[:80]}")
        continue
    fixed_lines.append(line)

# Join back
content = '\n'.join(fixed_lines)

# Write back
with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'w') as f:
    f.write(content)

print("✅ Fixed project file")
