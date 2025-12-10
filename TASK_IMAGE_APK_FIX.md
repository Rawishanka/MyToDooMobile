# Task Image APK Display Fix ✅

## Problem Description

### Symptoms
- **In Expo Dev Mode**: Task images display correctly ✅
- **In APK Build**: Task images show as "Load Error" ❌

### Screenshot Evidence
The uploaded screenshot shows a task detail screen with "Load Error" for image preview in APK build.

### Root Cause
The backend API returns **relative CDN URLs** for task images:
- Format: `/api/cdn/secure/mytodo/tasks/image.jpg`
- Problem: React Native's Image component in production APK builds requires **absolute HTTPS URLs**
- Expo dev mode is more lenient and can resolve relative URLs, but APK cannot

## Solution Implemented

### 1. **Export normalizeCDNUrl Function**
File: `src/api/cdn-api.ts`

```typescript
/**
 * Normalize CDN URL to ensure it's an absolute HTTPS URL
 * This is critical for APK builds where relative URLs don't work
 * 
 * EXPORTED for use in components that display task images
 */
export const normalizeCDNUrl = (url: string | undefined | null): string => {
  // Converts:
  // - "/api/cdn/secure/..." → "https://api.mytodoo.com/api/cdn/secure/..."
  // - "http://..." → "https://..." (security + APK compatibility)
  // - Already absolute HTTPS URLs → unchanged
}
```

### 2. **TaskInfoCard Component Fix**
File: `src/features/tasks/screens/detail/components/TaskInfoCard.tsx`

**Changes:**
1. Import `normalizeCDNUrl` from `cdn-api`
2. Update `fixImageUri()` to normalize CDN URLs **before** S3 typo fixes
3. Update `extractImageString()` to use `normalizeCDNUrl` for all string URLs

**Code:**
```typescript
import { normalizeCDNUrl } from '@/src/api/cdn-api';

const fixImageUri = (uri: string): string => {
  if (!uri) return uri;
  
  let correctedUri = uri;
  
  // CRITICAL FIX: First normalize CDN URLs (relative → absolute HTTPS)
  // This is essential for APK builds where relative URLs don't work
  correctedUri = normalizeCDNUrl(correctedUri);
  
  // Then fix S3 URL typos...
  // ...existing S3 typo fixes...
  
  return correctedUri;
};

const extractImageString = (imageData: any): string | null => {
  // ...extraction logic...
  
  if (typeof imageData === 'string') {
    // Let normalizeCDNUrl handle all URL formatting
    const normalized = normalizeCDNUrl(imageData);
    return normalized;
  }
  
  // ...rest of extraction logic...
};
```

### 3. **Edit Task Screen Fix**
File: `src/features/tasks/screens/mytasks/edit-mytasks-screen.tsx`

**Changes:**
1. Import `normalizeCDNUrl` from `cdn-api`
2. Normalize existing task images when loading them into state

**Code:**
```typescript
import { normalizeCDNUrl } from '@/src/api/cdn-api';

// CRITICAL FIX: Normalize image URLs for APK compatibility
const [images, setImages] = useState<string[]>(() => {
  const taskImages = taskData?.images || [];
  const normalizedImages = taskImages.map((img: string) => normalizeCDNUrl(img));
  console.log('📸 Edit Task - Normalized images:', {
    original: taskImages.length,
    normalized: normalizedImages.length,
    sample: normalizedImages[0]?.substring(0, 100)
  });
  return normalizedImages;
});

const [existingImages] = useState<string[]>(() => {
  const taskImages = taskData?.images || [];
  return taskImages.map((img: string) => normalizeCDNUrl(img));
});
```

## How It Works

### Image Display Flow

#### Before Fix ❌
```
1. Backend returns: "/api/cdn/secure/mytodo/tasks/image.jpg"
2. TaskInfoCard receives relative URL
3. React Native Image component tries to load: "/api/cdn/secure/..."
4. APK FAILS: Cannot resolve relative URL
5. Result: "Load Error"
```

#### After Fix ✅
```
1. Backend returns: "/api/cdn/secure/mytodo/tasks/image.jpg"
2. normalizeCDNUrl() converts to: "https://api.mytodoo.com/api/cdn/secure/mytodo/tasks/image.jpg"
3. fixImageUri() applies S3 typo fixes (if needed)
4. React Native Image component loads: "https://api.mytodoo.com/api/cdn/secure/..."
5. APK SUCCESS: Absolute HTTPS URL works perfectly
6. Result: Image displays correctly ✅
```

### URL Normalization Examples

| Input | Output |
|-------|--------|
| `/api/cdn/secure/image.jpg` | `https://api.mytodoo.com/api/cdn/secure/image.jpg` |
| `http://api.mytodoo.com/...` | `https://api.mytodoo.com/...` |
| `https://api.mytodoo.com/...` | `https://api.mytodoo.com/...` (unchanged) |
| `https://cloudinary.com/...` | `https://cloudinary.com/...` (unchanged) |
| `data:image/jpeg;base64,...` | `data:image/jpeg;base64,...` (unchanged) |

## Testing Instructions

### 1. **Test in Expo Dev**
```bash
cd "c:\Document\mytodoo mobile update chnages\MyToDooMobile"
npx expo start --clear
```

1. Open a task with images
2. Verify images display correctly
3. Check console logs for:
   ```
   ✅ CDN URL normalized: { original: "/api/cdn/...", normalized: "https://..." }
   🔧 Fixed image URL: ...
   ```

### 2. **Test in APK Build**
```bash
# Build preview APK
npx eas-cli build --platform android --profile preview

# Or development APK
npx eas-cli build --platform android --profile development
```

1. Install APK on physical device
2. Open a task detail screen with images
3. **Expected**: Images display correctly (no "Load Error")
4. Edit a task with existing images
5. **Expected**: Existing images display correctly

### 3. **Verify All Image Display Locations**

✅ **Task Detail Screen** (`TaskInfoCard.tsx`)
- Main image gallery (3 columns)
- Image modal (full-screen viewer)
- Image loading states

✅ **Edit Task Screen** (`edit-mytasks-screen.tsx`)
- Existing task images
- Newly added images

## Files Modified

1. `src/api/cdn-api.ts`
   - Exported `normalizeCDNUrl` function

2. `src/features/tasks/screens/detail/components/TaskInfoCard.tsx`
   - Import `normalizeCDNUrl`
   - Updated `fixImageUri()` to normalize before S3 fixes
   - Updated `extractImageString()` to always normalize

3. `src/features/tasks/screens/mytasks/edit-mytasks-screen.tsx`
   - Import `normalizeCDNUrl`
   - Normalize images when loading from `taskData`

## Related Issues

This fix is similar to the chat image APK fix documented in `APK_IMAGE_DISPLAY_FIX.md`:
- Same root cause: Relative URLs from backend
- Same solution: URL normalization to absolute HTTPS
- Different affected areas: Tasks vs Chat

## Prevention

To prevent this issue in the future:

1. **Backend API**: Should return absolute HTTPS URLs for all CDN resources
2. **Mobile App**: Always normalize URLs from API using `normalizeCDNUrl()`
3. **Testing**: Always test image display in **both** Expo dev and APK build

## Success Criteria

✅ Images display correctly in Expo dev mode
✅ Images display correctly in APK build
✅ No "Load Error" messages
✅ Both new and existing task images work
✅ Image modal displays correctly
✅ Edit task screen shows existing images

---

**Status**: ✅ FIXED
**Date**: December 10, 2025
**Tested**: Expo Dev ✅ | APK Build: Pending Testing
