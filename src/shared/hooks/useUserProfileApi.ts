// React Query hooks for user profile management
import type { RequestReviewRequest, Review, UpdateProfileRequest } from '@/src/api/user-profile-api';
import * as UserProfileAPI from '@/src/api/user-profile-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

// ==========================================
// QUERY KEYS
// ==========================================

export const USER_PROFILE_QUERY_KEYS = {
  all: ['userProfile'] as const,
  profile: () => [...USER_PROFILE_QUERY_KEYS.all, 'profile'] as const,
  ratingStats: (userId: string) => [...USER_PROFILE_QUERY_KEYS.all, 'ratingStats', userId] as const,
  canReview: (userId: string) => [...USER_PROFILE_QUERY_KEYS.all, 'canReview', userId] as const,
};

// ==========================================
// QUERY HOOKS
// ==========================================

/**
 * Hook to fetch user profile
 */
export function useGetUserProfile() {
  const { isAuthenticated, token, user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Clear profile cache whenever user changes
  React.useEffect(() => {
    console.log("🔄 Auth user changed - clearing profile cache", { 
      userId: user?._id, 
      userEmail: user?.email 
    });
    queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
  }, [user?._id, queryClient]);
  
  return useQuery({
    queryKey: [...USER_PROFILE_QUERY_KEYS.profile(), user?.email, user?._id, token], // More specific user isolation
    queryFn: () => {
      console.log("🔍 Fetching fresh user profile data for user:", user?.email);
      // Double-check authentication before making API call
      if (!isAuthenticated || !token || !user?._id) {
        throw new Error("Not authenticated - cannot fetch profile");
      }
      return UserProfileAPI.getUserProfile();
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Never cache results
    enabled: isAuthenticated && !!token && !!user?._id, // Only fetch when fully authenticated with user ID
    select: (response) => response.data, // Extract data from response
    retry: (failureCount, error: any) => {
      // Don't retry on 401 authentication errors
      if (error?.response?.status === 401 || error?.isAuthError || error?.message?.includes("Not authenticated")) {
        console.log("❌ Authentication error - not retrying profile fetch");
        return false;
      }
      // Retry network errors only once
      return failureCount < 1;
    },
    refetchOnMount: false, // Don't auto-refetch on mount to prevent auth errors
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
}

/**
 * Hook to fetch rating stats for a user
 */
export function useGetUserRatingStats(userId: string, enabled = true) {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEYS.ratingStats(userId),
    queryFn: () => UserProfileAPI.getUserRatingStats(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to check if user can review another user
 */
export function useCanReviewUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEYS.canReview(userId),
    queryFn: () => UserProfileAPI.canReviewUser(userId),
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ==========================================
// MUTATION HOOKS
// ==========================================

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest) => 
      UserProfileAPI.updateUserProfile(profileData),
    onSuccess: (response) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.profile() });
      console.log('✅ Profile updated successfully:', response.data);
    },
    onError: (error) => {
      console.error('❌ Profile update failed:', error);
    }
  });
}

/**
 * Hook to upload user avatar
 */
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  
  return useMutation({
    mutationFn: (formData: FormData) => 
      UserProfileAPI.uploadUserAvatar(formData),
    onSuccess: (response) => {
      console.log("✅ Avatar uploaded successfully for user:", user?.email);
      console.log("📄 Avatar upload response:", response);
      
      // Try to update cache with new avatar data if available in response
      if (response?.data?.avatar) {
        const profileQueryKey = [...USER_PROFILE_QUERY_KEYS.profile(), user?.email, user?._id, token];
        
        // Optimistically update the cached profile data
        queryClient.setQueryData(profileQueryKey, (oldData: any) => {
          if (oldData) {
            console.log("🔄 Optimistically updating cached avatar");
            return {
              ...oldData,
              avatar: response.data.avatar
            };
          }
          return oldData;
        });
      }
      
      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.profile() });
      
      console.log('✅ Avatar cache updated successfully');
    },
    onError: (error) => {
      console.error('❌ Avatar upload failed:', error);
    }
  });
}

/**
 * Hook to submit a review
 */
export function useSubmitUserReview(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (review: Review) => 
      UserProfileAPI.submitUserReview(userId, review),
    onSuccess: () => {
      // Invalidate rating stats to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: USER_PROFILE_QUERY_KEYS.ratingStats(userId) 
      });
      console.log('✅ Review submitted successfully');
    },
    onError: (error) => {
      console.error('❌ Review submission failed:', error);
    }
  });
}

/**
 * Hook to request a review
 */
export function useRequestReview() {
  return useMutation({
    mutationFn: (requestData: RequestReviewRequest) => 
      UserProfileAPI.requestReview(requestData),
    onSuccess: (response) => {
      console.log('✅ Review request sent:', response);
    },
    onError: (error) => {
      console.error('❌ Review request failed:', error);
    }
  });
}
