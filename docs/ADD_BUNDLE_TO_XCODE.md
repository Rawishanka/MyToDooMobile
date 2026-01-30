# How to Add main.jsbundle to Xcode Project

## ✅ Bundle Created Successfully!

Location: `/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios/MyToDoo/main.jsbundle`
Size: 6.5 MB (3700 modules bundled)

---

## 📝 Steps to Add Bundle to Xcode

### 1. Open Xcode Project
```bash
open /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/ios/MyToDoo.xcworkspace
```

### 2. Add main.jsbundle to Project

**In Xcode:**

1. **Locate the MyToDoo folder** in the left sidebar (Project Navigator)
2. **Right-click** on the `MyToDoo` folder (the one with AppDelegate.swift)
3. Select **"Add Files to 'MyToDoo'..."**
4. Navigate to: `ios/MyToDoo/main.jsbundle`
5. **IMPORTANT:** Check these options:
   - ✅ **"Copy items if needed"** (MUST be checked)
   - ✅ **"Create groups"** (should be selected)
   - ✅ Under "Add to targets", ensure **MyToDoo** is checked
6. Click **"Add"**

### 3. Verify Bundle is Added

In Xcode Project Navigator, you should see:
```
MyToDoo/
├── AppDelegate.swift
├── main.jsbundle          ← Should appear here
├── Info.plist
├── Images.xcassets/
└── ...
```

### 4. Verify Build Phases

1. Click on **MyToDoo project** (blue icon at top)
2. Select **MyToDoo target**
3. Go to **"Build Phases"** tab
4. Expand **"Copy Bundle Resources"**
5. Verify `main.jsbundle` is in the list

If not there, click **"+"** and add `main.jsbundle`

### 5. Build and Run

1. Select your simulator: **iPad Air 13-inch (M3)**
2. Press **⌘+R** (or click the Play button)
3. App should launch with full UI - no Metro needed!

---

## 🔄 When to Regenerate Bundle

Regenerate the bundle whenever you make code changes:

```bash
cd /Users/janidu/Documents/mytodoo_mobile/MyToDooMobile
npx expo export --platform ios --output-dir ios-bundle
cp ios-bundle/_expo/static/js/ios/*.js ios/MyToDoo/main.jsbundle
```

Then rebuild in Xcode (⌘+Shift+K to clean, then ⌘+R to build)

---

## ✨ What Changed

### AppDelegate.swift
Updated to always use the bundled file:

```swift
override func bundleURL() -> URL? {
  // Use local bundle for standalone builds
  return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
}
```

**Before:** App tried to connect to Metro on localhost:8081
**After:** App loads JavaScript from embedded main.jsbundle

---

## 🎯 Current Status

- ✅ JavaScript bundle generated (6.5 MB)
- ✅ Bundle copied to ios/MyToDoo/main.jsbundle
- ✅ AppDelegate updated to use bundle
- ✅ Assets copied to project
- ⏳ **PENDING:** Add main.jsbundle to Xcode project (manual step above)

---

## 🚨 Important Notes

1. **No Metro Required:** App runs standalone, no need for `npx expo start`
2. **No Fast Refresh:** You need to rebuild after every code change
3. **Larger App Size:** Bundle is embedded in the .app file
4. **Production Ready:** This is how the App Store version works

---

## 🔧 Troubleshooting

### Bundle Not Found Error
If you see "Could not load JavaScript", verify:
1. main.jsbundle is in Build Phases → Copy Bundle Resources
2. Bundle name is exactly "main.jsbundle" (not main.js or index.jsbundle)

### Blank Screen After Build
1. Clean build folder: ⌘+Shift+K
2. Rebuild: ⌘+R
3. Check Xcode console for errors

### Old Code Running
Bundle is cached. To fix:
1. Delete the app from simulator
2. Clean build: ⌘+Shift+K
3. Regenerate bundle (command above)
4. Rebuild: ⌘+R

---

## 📱 For Development vs Production

**Development (with Metro):**
- Fast Refresh enabled
- Instant code updates
- Easier debugging
- Run: `npx expo start` then press `i`

**Production (with bundle):**
- No Metro needed
- Standalone app
- Smaller download size on App Store
- Run: Build directly from Xcode

**Current Setup:** Production mode with embedded bundle ✅
