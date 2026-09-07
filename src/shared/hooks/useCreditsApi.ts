import * as CreditsAPI from '@/src/api/credits-api';
import type { PreviewFeeSpendRequest } from '@/src/api/credits-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const CREDITS_QUERY_KEYS = {
  all: ['credits'] as const,
  balance: () => [...CREDITS_QUERY_KEYS.all, 'balance'] as const,
  ledger: (limit?: number) => [...CREDITS_QUERY_KEYS.all, 'ledger', limit ?? 50] as const,
  settings: () => [...CREDITS_QUERY_KEYS.all, 'settings'] as const,
};

export function useGetCreditsBalance() {
  const { isAuthenticated, token, user } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: [...CREDITS_QUERY_KEYS.balance(), user?._id],
    queryFn: () => CreditsAPI.getCreditsBalance(),
    enabled: hasMinimumAuth,
    select: (response) => response.data,
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.isAuthError) return false;
      return failureCount < 1;
    },
  });
}

export function useGetCreditsLedger(limit = 50) {
  const { isAuthenticated, token, user } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: [...CREDITS_QUERY_KEYS.ledger(limit), user?._id],
    queryFn: () => CreditsAPI.getCreditsLedger(limit),
    enabled: hasMinimumAuth,
    select: (response) => response.data,
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.isAuthError) return false;
      return failureCount < 1;
    },
  });
}

export function useGetCreditsSettings() {
  const { isAuthenticated, token } = useAuthStore();
  const hasMinimumAuth = isAuthenticated && !!token;

  return useQuery({
    queryKey: CREDITS_QUERY_KEYS.settings(),
    queryFn: () => CreditsAPI.getCreditsSettings(),
    enabled: hasMinimumAuth,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePreviewFeeSpend() {
  return useMutation({
    mutationFn: (payload: PreviewFeeSpendRequest) => CreditsAPI.previewFeeSpend(payload),
  });
}

export function useInvalidateCredits() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEYS.all });
  };
}
