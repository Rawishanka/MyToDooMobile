import * as ReferralAPI from '@/src/api/referral-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const REFERRAL_QUERY_KEYS = {
  all: ['referrals'] as const,
  me: () => [...REFERRAL_QUERY_KEYS.all, 'me'] as const,
};

export function useGetMyReferral() {
  const { isAuthenticated, token, user } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: [...REFERRAL_QUERY_KEYS.me(), user?._id],
    queryFn: () => ReferralAPI.getMyReferral(),
    enabled: hasMinimumAuth,
    select: (response) => response.data,
    staleTime: 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.isAuthError) return false;
      return failureCount < 1;
    },
  });
}

export function useAttachReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => ReferralAPI.attachReferral(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERRAL_QUERY_KEYS.me() });
    },
  });
}
