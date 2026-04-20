# Pre-Login Image Upload Fix

## Problem
When users went through the onboarding flow (get started → create task → upload images → login/signup), the uploaded images were NOT being saved with the task. The task was created successfully, but showed "No photos were found with this task".

## Root Cause
The login and signup screens were using the **wrong API mutation** for posting tasks:

### Before (Broken)
```typescript
// login-screen.tsx & useSignup.ts
import { useCreateTask } from '@/src/shared/hooks/useTaskApi';
const postTaskMutation = useCreateTask(); // ❌ WRONG - doesn't handle images
```

**`useCreateTask()`** calls `TaskAPI.createTask()` which:
- Sends task data as plain JSON
- Images array is just sent as string array
- Backend doesn't receive images properly
- No FormData multipart upload

### After (Fixed)
```typescript
// login-screen.tsx & useSignup.ts
import { usePostTaskDirect } from '@/src/shared/hooks/useTaskApi';
const postTaskMutation = usePostTaskDirect(); // ✅ CORRECT - handles images properly
```

**`usePostTaskDirect()`** calls `TaskAPI.postTaskDirect()` which:
- Converts images to FormData with `'files'` parameter
- Uses multipart/form-data upload
- Falls back to base64 if FormData fails
- Properly handles binary image data

## Files Changed

### 1. login-screen.tsx
**Location:** `src/features/auth/screens/login-screen.tsx`

**Changes:**
- Line 4: Changed import from `useCreateTask` to `usePostTaskDirect`
- Line 48: Changed mutation hook to `usePostTaskDirect()`
- Line 199: Fixed to include `images: myTask.photos || []` (already done)
- Lines 227-240: Added detailed logging to verify images are passed

**Before:**
```typescript
import { useCreateTask } from '@/src/shared/hooks/useTaskApi';
// ...
const postTaskMutation = useCreateTask();
// ...
images: [], // ❌ Empty array - photos lost!
```

**After:**
```typescript
import { usePostTaskDirect } from '@/src/shared/hooks/useTaskApi';
// ...
const postTaskMutation = usePostTaskDirect(); // ✅ Handles images
// ...
images: myTask.photos || [], // ✅ Include photos from store
```

### 2. useSignup.ts
**Location:** `src/features/auth/components/useSignup.ts`

**Changes:**
- Line 6: Changed import from `useCreateTask` to `usePostTaskDirect`
- Line 42: Changed mutation hook to `usePostTaskDirect()`
- Line 187: Fixed to include `images: myTask.photos || []` (already done)
- Lines 217-230: Added detailed logging to verify images

**Same changes as login-screen.tsx**

## How It Works Now

### Flow Comparison

#### Normal Task Creation (Working)
```
User logged in → Create Task Screen → Upload Images → Post Task
                                                           ↓
                                         Uses usePostTaskDirect() ✅
                                                           ↓
                                         Images sent as FormData ✅
                                                           ↓
                                         Backend saves images ✅
```

#### Pre-Login Task Creation (NOW FIXED)
```
Onboarding → Create Task → Upload Images → Login/Signup → Post Task
                                                              ↓
                              BEFORE: useCreateTask() ❌ → Images lost
                              AFTER: usePostTaskDirect() ✅ → Images saved
```

## Technical Details

### Image Storage Flow
1. **Image Upload Screen** (image-upload-screen.tsx)
   - User uploads images via camera/gallery
   - Images copied to persistent storage
   - Stored in `myTask.photos` array

2. **Login/Signup** (login-screen.tsx / useSignup.ts)
   - User logs in or signs up
   - `convertTaskToAPIFormat()` called
   - Images included: `images: myTask.photos || []` ✅

3. **API Call** (task-api.ts)
   - `postTaskDirect()` receives taskData with images
   - Converts to FormData with 'files' parameter
   - Backend processes multipart/form-data
   - Images saved to CDN/storage
   - URLs returned in response

### API Endpoint Differences

| Method | Endpoint | Images | Format | Use Case |
|--------|----------|--------|--------|----------|
| `createTask()` | POST /tasks | ❌ Not supported | JSON | Simple tasks only |
| `postTaskDirect()` | POST /tasks | ✅ Supported | FormData → base64 fallback | Tasks with images |
| `postTaskWithImages()` | POST /tasks | ✅ Supported | Base64 only | Legacy method |

## Testing Checklist

To verify the fix works:

1. ✅ Go through onboarding (first-screen → second-screen → third-screen)
2. ✅ Create a task with details
3. ✅ Upload 1-3 images
4. ✅ Enter budget
5. ✅ Click "Post Task" (redirects to login)
6. ✅ Login or signup
7. ✅ Check "My Tasks" → "Posted" tab
8. ✅ Open the task detail
9. ✅ **Verify:** Images should display (not "No photos were found")

## Console Logs to Check

After login/signup, you should see:
```
🚀 Posting pending task after login...
📝 [SIGNUP] Task data prepared for posting: {
  title: "Testing img add",
  hasImages: true,
  imageCount: 2,
  firstImagePreview: "file:///data/user/0/com.unexo.mytodoomobile/..."
}
📸 [SIGNUP] CRITICAL: Verifying myTask.photos from store: {
  photosExist: true,
  photosCount: 2,
  photosPreview: ["file:///data/user/0/...", "file:///data/user/0/..."]
}
🚀 DIRECT MUTATION - Received task data with images:
🚀 DIRECT MUTATION - images count: 2
📤 postTaskDirect called with:
📤 images count: 2
🔄 Trying FormData approach first...
📸 Adding image 1/2 to FormData as 'files'
📸 Adding image 2/2 to FormData as 'files'
✅ FormData upload successful!
✅ SUCCESS: Backend saved images with FormData approach!
✅ Sent 2 images as 'files' parameter
✅ Backend returned 2 images
```

## Related Files

- `src/api/task-api.ts` - API implementation (postTaskDirect)
- `src/shared/hooks/useTaskApi.ts` - React Query hooks
- `src/features/tasks/screens/create/post-task-screen.tsx` - Normal task creation (reference)
- `src/features/tasks/screens/create/image-upload-screen.tsx` - Image upload UI
- `src/store/create-task-store.ts` - Task state management

## Prevention

To prevent this issue in the future:
1. Always use `usePostTaskDirect()` when posting tasks with images
2. Use `useCreateTask()` ONLY for text-only tasks (rare)
3. Check console logs for "images count: X" to verify images are passed
4. Test both normal flow AND pre-login flow

## Status
✅ **FIXED** - Images now properly saved when posting tasks after onboarding → login flow
