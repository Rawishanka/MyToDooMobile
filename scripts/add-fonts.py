#!/usr/bin/env python3
import re
import uuid

# Read project file  
with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

fonts = [
    ('Ionicons.ttf', 'file'),
    ('MaterialIcons.ttf', 'file'),
    ('MaterialCommunityIcons.ttf', 'file'),
    ('AntDesign.ttf', 'file'),
    ('SpaceMono-Regular.ttf', 'file')
]

# Check if fonts already added
if 'Ionicons.ttf */' in content:
    print("⚠️ Fonts already in project, cleaning first...")
    for font_name, _ in fonts:
        content = re.sub(rf'[A-F0-9]{{24}} /\* {re.escape(font_name)} in Resources \*/ = [^;]+;[\n\t]*', '', content)
        content = re.sub(rf'[A-F0-9]{{24}} /\* {re.escape(font_name)} \*/ = [^;]+;[\n\t]*', '', content)
        content = re.sub(rf'[\n\t]*[A-F0-9]{{24}} /\* {re.escape(font_name)} \*/,?', '', content)

# Generate new UUIDs
file_refs = {}
build_files = {}
for font_name, _ in fonts:
    file_refs[font_name] = uuid.uuid4().hex[:24].upper()
    build_files[font_name] = uuid.uuid4().hex[:24].upper()
    
# Add to PBXBuildFile section
logo_build_match = re.search(r'(7C6B0D2A302545C78EB1B586 /\* MyToDoo_logo\.gif in Resources \*/ = \{[^}]+\};)', content)
if logo_build_match:
    new_build_entries = logo_build_match.group(1)
    for font_name, _ in fonts:
        new_build_entries += f"\n\t\t{build_files[font_name]} /* {font_name} in Resources */ = {{isa = PBXBuildFile; fileRef = {file_refs[font_name]} /* {font_name} */; }};"
    content = content.replace(logo_build_match.group(1), new_build_entries)
    print("✅ Added PBXBuildFile entries")
else:
    print("❌ Could not find MyToDoo_logo build entry")

# Add to PBXFileReference section
logo_ref_match = re.search(r'(9723BC1F9319424D8594AF7A /\* MyToDoo_logo\.gif \*/ = \{[^}]+\};)', content)
if logo_ref_match:
    new_ref_entries = logo_ref_match.group(1)
    for font_name, file_type in fonts:
        new_ref_entries += f'\n\t\t{file_refs[font_name]} /* {font_name} */ = {{isa = PBXFileReference; lastKnownFileType = {file_type}; name = {font_name}; path = MyToDoo/{font_name}; sourceTree = "<group>"; }};'
    content = content.replace(logo_ref_match.group(1), new_ref_entries)
    print("✅ Added PBXFileReference entries")
else:
    print("❌ Could not find MyToDoo_logo ref entry")

# Add to MyToDoo group children
group_match = re.search(r'(9723BC1F9319424D8594AF7A /\* MyToDoo_logo\.gif \*/,)', content)
if group_match:
    new_group = group_match.group(1)
    for font_name, _ in fonts:
        new_group += f"\n\t\t\t\t{file_refs[font_name]} /* {font_name} */,"
    content = content.replace(group_match.group(1), new_group)
    print("✅ Added to MyToDoo group")
else:
    print("❌ Could not find group entry")

# Add to Resources build phase
resources_match = re.search(r'(7C6B0D2A302545C78EB1B586 /\* MyToDoo_logo\.gif in Resources \*/,)', content)
if resources_match:
    new_resources = resources_match.group(1)
    for font_name, _ in fonts:
        new_resources += f"\n\t\t\t\t{build_files[font_name]} /* {font_name} in Resources */,"
    content = content.replace(resources_match.group(1), new_resources)
    print("✅ Added to Resources build phase")
else:
    print("❌ Could not find resources entry")

# Write back
with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'w') as f:
    f.write(content)

print("\n📦 Font files added to Xcode project:")
for font_name, _ in fonts:
    print(f"   - {font_name}")
