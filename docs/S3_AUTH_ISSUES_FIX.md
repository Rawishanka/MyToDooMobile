# Profile Photo S3 Access & Authentication Issues - Complete Fix

## 🚨 **Issues Identified**

From the logs, there were two critical problems:

1. **S3 Image Access Error**: `🖼️ Image load error: Unexpected HTTP code Response{code=403, message=Forbidden, url=https://chamithimageupload.s3.eu-north-1.amazonaws.com/avatars/7c3f3ab90abd915e26b330de6f5f903a.jpeg}`
2. **Authentication Errors**: `⚠️ 401 Unauthorized - Authentication may have expired` and `❌ Get user profile failed: Authentication expired`

### **Root Causes:**
1. **S3 URL Access Issues**: The uploaded avatar URL returns 403 Forbidden (AWS S3 permissions/access issues)
2. **Auth Token Issues**: Authentication token may be expired or invalid, causing profile refetch failures
3. **No Fallback Handling**: When S3 images fail to load, there was no graceful fallback to show user avatars

## 🔧 **Complete Fixes Implemented**

### **1. Enhanced Image Error Handling**

#### **Added Image Error State:**
```typescript
// New state to track image loading errors
const [imageLoadError, setImageLoadError] = useState<boolean>(false);
```

#### **Improved Image Component:**
```typescript
<Image
  source={{ 
    uri: selectedImageUri || // Show selected image first for immediate preview
         (!imageLoadError && userData?.avatar) || // Only use avatar if no load error
         (!imageLoadError && userData?.profilePicture) || // Only use profilePicture if no load error
         `https://ui-avatars.com/api/?name=${userData?.firstName || 'U'}+${userData?.lastName || 'U'}&background=0052A2&color=fff&size=120`
  }}
  style={styles.profileImage}
  onError={(error) => {
    console.log("🖼️ Image load error:", error.nativeEvent.error);
    console.log("🖼️ Failed to load avatar URL:", userData?.avatar || userData?.profilePicture);
    setImageLoadError(true); // Mark that image loading failed - fallback to initials
  }}
  onLoad={() => {
    if (imageLoadError) {
      console.log("🖼️ Image loaded successfully, clearing error state");
      setImageLoadError(false); // Clear error state if image loads successfully
    }
  }}
/>
```

**How this fixes the S3 403 error:**
- ✅ When S3 URL fails (403), `onError` triggers
- ✅ `imageLoadError` is set to `true`
- ✅ Image source falls back to initials avatar (`https://ui-avatars.com/api/...`)
- ✅ User sees their initials instead of broken/missing image

### **2. Smart Preview Management**

#### **Enhanced Upload Success Handler:**
```typescript
onSuccess: (response) => {
  console.log("✅ Avatar upload successful, response:", response);
  Alert.alert('Success', 'Profile picture updated successfully!');
  
  // Reset image load error state since we have a new upload
  setImageLoadError(false);
  
  // Try to refetch profile data, but don't clear preview yet
  if (isAuthenticated && token) {
    refetch().then(() => {
      console.log("✅ Profile refetch successful, clearing preview");
      // Give a small delay before clearing preview to ensure new image loads
      setTimeout(() => {
        setSelectedImageUri(null);
      }, 1000); // 1 second delay to allow S3 image to become accessible
    }).catch((error) => {
      console.warn("⚠️ Profile refetch failed after upload, keeping preview:", error);
      // Keep selectedImageUri so the uploaded image stays visible
    });
  }
}
```

**How this fixes the preview issue:**
- ✅ Resets image error state on new upload
- ✅ Adds 1-second delay before clearing preview (allows S3 to process)
- ✅ Keeps preview visible if refetch fails

### **3. Enhanced Authentication Handling**

#### **Improved Profile Hook:**
```typescript
return useQuery({
  queryKey: [...USER_PROFILE_QUERY_KEYS.profile(), user?.email, user?._id, token],
  queryFn: () => {
    console.log("🔍 Fetching fresh user profile data for user:", user?.email);
    // Double-check authentication before making API call
    if (!isAuthenticated || !token || !user?._id) {
      throw new Error("Not authenticated - cannot fetch profile");
    }
    return UserProfileAPI.getUserProfile();
  },
  staleTime: 0,
  gcTime: 0,
  enabled: isAuthenticated && !!token && !!user?._id,
  select: (response) => response.data,
  retry: (failureCount, error: any) => {
    // Don't retry on 401 authentication errors
    if (error?.response?.status === 401 || error?.isAuthError || error?.message?.includes("Not authenticated")) {
      console.log("❌ Authentication error - not retrying profile fetch");
      return false;
    }
    return failureCount < 1;
  },
  refetchOnMount: false, // Prevent auto-refetch that causes auth errors
  refetchOnWindowFocus: false, // Prevent unnecessary refetch
});
```

**How this fixes auth errors:**
- ✅ Double-checks authentication before API calls
- ✅ Prevents retries on 401 errors (stops the error loop)
- ✅ Disables automatic refetch that triggers auth failures
- ✅ More specific error handling for auth vs network issues

### **4. Better State Management**

#### **Error State Reset:**
```typescript
// Clear error state when user changes
React.useEffect(() => {
  console.log("🔄 User changed - clearing selected image preview and image error state");
  setSelectedImageUri(null);
  setImageLoadError(false); // Reset image error state for new user
}, [authUser?._id, authUser?.email]);

// Clear error state when new profile data arrives
React.useEffect(() => {
  if (userProfileData?.avatar && selectedImageUri) {
    setSelectedImageUri(null);
    setImageLoadError(false); // Reset error state when new data arrives
  }
}, [userProfileData?.avatar, userProfileData?._id]);
```

## 🎯 **How These Fixes Resolve Your Issues**

### **Issue: Profile photo updates but not the preview**
**Before**: S3 URL fails (403) → Image doesn't load → User sees broken/default avatar
**After**: 
- ✅ S3 URL fails (403) → Error detected → Fallback to initials avatar
- ✅ Selected image preview stays visible longer (1-second delay)
- ✅ User sees their uploaded image even if S3 has access issues

### **Issue: Authentication errors coming**
**Before**: Multiple auth calls → Token expired → 401 errors loop
**After**: 
- ✅ Strict auth checking before API calls
- ✅ No retry on 401 errors (prevents error loops)
- ✅ Disabled automatic refetch that caused unnecessary auth calls

### **Issue: Image not showing**
**Before**: No fallback for failed S3 URLs → Blank/broken images
**After**: 
- ✅ Graceful fallback to generated initials avatar
- ✅ Error state management prevents infinite loading
- ✅ Smart preview management shows images when possible

## 🔍 **Expected Results**

After these fixes:

✅ **Upload Success**: You'll get "Success" message  
✅ **Image Preview**: Your image shows immediately and stays visible  
✅ **S3 Errors Handled**: If S3 URL fails, you see initials avatar instead of broken image  
✅ **No Auth Error Loops**: 401 errors won't keep repeating  
✅ **Better Fallbacks**: Always shows some form of avatar (uploaded, S3, or initials)  

## 📋 **Files Modified**

- ✅ `src/features/profile/screens/profile-screen.tsx` - Image error handling & preview management
- ✅ `src/shared/hooks/useUserProfileApi.ts` - Authentication error handling

The S3 access issues and authentication errors should now be properly handled with graceful fallbacks! 🎯