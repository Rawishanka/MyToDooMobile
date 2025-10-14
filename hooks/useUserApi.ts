// hooks/useUserApi.ts
import { User } from '@/api/types/user';
import * as UserAPI from '@/api/user-api';
import { useAuthStore } from '@/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query Keys for User Profile API
 */
export const USER_QUERY_KEYS = {
  all: ['user'] as const,
  profile: () => [...USER_QUERY_KEYS.all, 'profile'] as const,
};

/**
 * 👤 Get User Profile Hook
 */
export function useGetUserProfile() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: USER_QUERY_KEYS.profile(),
    queryFn: UserAPI.getUserProfile,
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * 📝 Update User Profile Hook
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { setAuthData, user, token, expiresIn } = useAuthStore();
  
  return useMutation({
    mutationFn: (profileData: Partial<User>) => UserAPI.updateUserProfile(profileData),
    onSuccess: (response) => {
      // Update the cached profile data
      queryClient.setQueryData(USER_QUERY_KEYS.profile(), response);
      
      // Update the auth store with new user data
      if (user && token && expiresIn) {
        setAuthData(token, { ...user, ...response.data }, expiresIn);
      }
      
      console.log("✅ Profile updated successfully");
    },
    onError: (error) => {
      console.error("❌ Failed to update profile:", error);
    },
  });
}

/**
 * 🔐 Change Password Hook
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      UserAPI.changeUserPassword(currentPassword, newPassword),
    onSuccess: (response) => {
      console.log("✅ Password changed successfully:", response.message);
    },
    onError: (error) => {
      console.error("❌ Failed to change password:", error);
    },
  });
}

/**
 * 📸 Upload Profile Picture Hook
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { setAuthData, user, token, expiresIn } = useAuthStore();
  
  return useMutation({
    mutationFn: (imageUri: string) => UserAPI.uploadProfilePicture(imageUri),
    onSuccess: (response) => {
      // Update the cached profile data
      queryClient.setQueryData(USER_QUERY_KEYS.profile(), (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData?.data,
          profilePicture: response.data.profilePicture
        }
      }));
      
      // Update the auth store with new profile picture
      if (user && token && expiresIn) {
        setAuthData(token, { ...user, profilePicture: response.data.profilePicture }, expiresIn);
      }
      
      console.log("✅ Profile picture uploaded successfully");
    },
    onError: (error) => {
      console.error("❌ Failed to upload profile picture:", error);
    },
  });
}

/**
 * Export all user hooks for easy importing
 */
export const UserHooks = {
  useGetUserProfile,
  useUpdateUserProfile,
  useChangePassword,
  useUploadProfilePicture,
};

export default UserHooks;