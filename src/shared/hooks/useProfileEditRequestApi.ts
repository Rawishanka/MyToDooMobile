// React Query hooks for profile edit request management
import type { ProfileEditRequestData } from '@/src/api/profile-edit-request-api';
import * as ProfileEditRequestAPI from '@/src/api/profile-edit-request-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const PROFILE_EDIT_REQUEST_QUERY_KEYS = {
  status: ['profileEditRequest', 'status'],
  history: (limit: number) => ['profileEditRequest', 'history', limit],
};

/**
 * Hook to check profile edit request status
 * Returns whether user has pending request and can edit profile
 */
export function useGetProfileEditStatus() {
  return useQuery({
    queryKey: PROFILE_EDIT_REQUEST_QUERY_KEYS.status,
    queryFn: () => ProfileEditRequestAPI.getProfileEditStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get profile edit request history
 * @param limit - Maximum number of records to return
 */
export function useGetProfileEditHistory(limit: number = 10) {
  return useQuery({
    queryKey: PROFILE_EDIT_REQUEST_QUERY_KEYS.history(limit),
    queryFn: () => ProfileEditRequestAPI.getProfileEditHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to submit a profile edit request
 * Invalidates status query on success
 */
export function useSubmitProfileEditRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestData: ProfileEditRequestData) =>
      ProfileEditRequestAPI.submitProfileEditRequest(requestData),
    onSuccess: () => {
      // Invalidate status query to refetch updated status
      queryClient.invalidateQueries({ 
        queryKey: PROFILE_EDIT_REQUEST_QUERY_KEYS.status 
      });
      // Invalidate history query to show new request
      queryClient.invalidateQueries({ 
        queryKey: ['profileEditRequest', 'history'] 
      });
    },
  });
}
