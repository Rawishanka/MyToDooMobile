// React Query hooks for user profile management
import type { RequestReviewRequest, Review, UpdateProfileRequest } from '@/src/api/user-profile-api';
import * as UserProfileAPI from '@/src/api/user-profile-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEYS.profile(),
    queryFn: () => UserProfileAPI.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data, // Extract data from response
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
  
  return useMutation({
    mutationFn: (formData: FormData) => 
      UserProfileAPI.uploadUserAvatar(formData),
    onSuccess: (response) => {
      // Invalidate and refetch profile to get new avatar
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.profile() });
      console.log('✅ Avatar uploaded successfully:', response.data);
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
