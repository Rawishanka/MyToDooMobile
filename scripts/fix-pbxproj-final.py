#!/usr/bin/env python3
"""
Fix corrupted project.pbxproj by removing incomplete fileRef entries
"""
import re

pbxproj_path = '/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios/MyToDoo.xcodeproj/project.pbxproj'

with open(pbxproj_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove lines with just "fileRef = ; };" (incomplete entries)
content = re.sub(r'^\s+fileRef = ; \};\n', '', content, flags=re.MULTILINE)

# Write back
with open(pbxproj_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed corrupted fileRef entries in project.pbxproj")
