#!/usr/bin/env python3
import re
import uuid

# Font files to add
fonts = [
    'Ionicons.ttf',
    'MaterialIcons.ttf', 
    'MaterialCommunityIcons.ttf',
    'AntDesign.ttf',
    'SpaceMono-Regular.ttf'
]

# Read project file
with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

# Generate UUIDs for each font
file_refs = {}
build_files = {}
for font in fonts:
    file_refs[font] = uuid.uuid4().hex[:24].upper()
    build_files[font] = uuid.uuid4().hex[:24].upper()

# Find sections
build_file_match = re.search(r'(/\* Begin PBXBuildFile section \*/.*?/\* End PBXBuildFile section \*/)', content, re.DOTALL)
file_ref_match = re.search(r'(/\* Begin PBXFileReference section \*/.*?/\* End PBXFileReference section \*/)', content, re.DOTALL)
resources_match = re.search(r'(name = Resources;.*?files = \()(.*?)(\);)', content, re.DOTALL)
group_match = re.search(r'(9723BC1F9319424D8594AF7A /\* MyToDoo_logo\.gif \*/,)', content)

if build_file_match and file_ref_match and resources_match and group_match:
    # Add PBXBuildFile entries
    build_entries = []
    for font in fonts:
        entry = f"\t\t{build_files[font]} /* {font} in Resources */ = {{isa = PBXBuildFile; fileRef = {file_refs[font]} /* {font} */; }};"
        build_entries.append(entry)
    
    new_build = build_file_match.group(1).replace(
        '/* End PBXBuildFile section */',
        '\n'.join(build_entries) + '\n/* End PBXBuildFile section */'
    )
    content = content.replace(build_file_match.group(1), new_build)
    
    # Add PBXFileReference entries  
    ref_entries = []
    for font in fonts:
        entry = f"\t\t{file_refs[font]} /* {font} */ = {{isa = PBXFileReference; lastKnownFileType = file; name = {font}; path = MyToDoo/{font}; sourceTree = \"<group>\"; }};"
        ref_entries.append(entry)
    
    new_ref = file_ref_match.group(1).replace(
        '/* End PBXFileReference section */',
        '\n'.join(ref_entries) + '\n/* End PBXFileReference section */'
    )
    content = content.replace(file_ref_match.group(1), new_ref)
    
    # Add to MyToDoo group
    group_entries = []
    for font in fonts:
        group_entries.append(f"\t\t\t\t{file_refs[font]} /* {font} */,")
    
    new_group = group_match.group(1) + '\n' + '\n'.join(group_entries)
    content = content.replace(group_match.group(1), new_group)
    
    # Add to Resources build phase
    resource_entries = []
    for font in fonts:
        resource_entries.append(f"\t\t\t\t{build_files[font]} /* {font} in Resources */,")
    
    old_resources = resources_match.group(1) + resources_match.group(2) + resources_match.group(3)
    new_resources = resources_match.group(1) + resources_match.group(2) + '\n'.join(resource_entries) + '\n' + resources_match.group(3)
    content = content.replace(old_resources, new_resources)
    
    # Write back
    with open('ios/MyToDoo.xcodeproj/project.pbxproj', 'w') as f:
        f.write(content)
    
    print("✅ Added fonts to Xcode project!")
    for font in fonts:
        print(f"   - {font}")
else:
    print("❌ Could not find required sections")
