/**
 * Firebase Cloud Messaging Hooks
 * 
 * React Query hooks for managing FCM tokens
 */

import {
    getFCMTokens,
    removeAllFCMTokens,
    removeFCMToken,
    RemoveFCMTokenRequest,
    saveFCMToken,
    SaveFCMTokenRequest,
} from '@/src/api/fcm-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ==================== QUERY KEYS ====================

export const FCM_KEYS = {
  all: ['fcm'] as const,
  tokens: () => [...FCM_KEYS.all, 'tokens'] as const,
};

// ==================== HOOKS ====================

/**
 * Hook to get all FCM tokens for user
 */
export const useGetFCMTokens = () => {
  const isAuthenticated = useAuthStore((state) => !!state.user);

  return useQuery({
    queryKey: FCM_KEYS.tokens(),
    queryFn: getFCMTokens,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to save FCM token
 */
export const useSaveFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveFCMTokenRequest) => saveFCMToken(data),
    onSuccess: () => {
      // Invalidate tokens query to refetch
      queryClient.invalidateQueries({ queryKey: FCM_KEYS.tokens() });
    },
    onError: (error: any) => {
      console.error('❌ Save FCM token mutation error:', error);
    },
  });
};

/**
 * Hook to remove specific FCM token
 */
export const useRemoveFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveFCMTokenRequest) => removeFCMToken(data),
    onSuccess: () => {
      // Invalidate tokens query to refetch
      queryClient.invalidateQueries({ queryKey: FCM_KEYS.tokens() });
    },
    onError: (error: any) => {
      console.error('❌ Remove FCM token mutation error:', error);
    },
  });
};

/**
 * Hook to remove all FCM tokens
 */
export const useRemoveAllFCMTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAllFCMTokens,
    onSuccess: () => {
      // Invalidate tokens query to refetch
      queryClient.invalidateQueries({ queryKey: FCM_KEYS.tokens() });
    },
    onError: (error: any) => {
      console.error('❌ Remove all FCM tokens mutation error:', error);
    },
  });
};
