// Stripe Connect API Hooks

import StripeConnectAPI, {
    StripeAccountCreateResponse,
    StripeAccountStatus,
    StripePayoutHistoryResponse,
} from '@/src/api/stripe-connect-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const STRIPE_CONNECT_QUERY_KEYS = {
  status: ['stripe-connect', 'status'] as const,
  payouts: (limit?: number) => ['stripe-connect', 'payouts', limit] as const,
};

/**
 * Get Stripe Connect account status
 */
export function useGetStripeAccountStatus(enabled: boolean = true) {
  return useQuery<StripeAccountStatus, any>({
    queryKey: STRIPE_CONNECT_QUERY_KEYS.status,
    queryFn: () => StripeConnectAPI.getAccountStatus(),
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on 404 (no account exists)
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create Stripe Connect account
 */
export function useCreateStripeAccount() {
  const queryClient = useQueryClient();

  return useMutation<StripeAccountCreateResponse, Error>({
    mutationFn: () => StripeConnectAPI.createAccount(),
    onSuccess: () => {
      // Invalidate status query to refetch
      queryClient.invalidateQueries({ queryKey: STRIPE_CONNECT_QUERY_KEYS.status });
    },
  });
}

/**
 * Get Stripe onboarding link
 */
export function useGetStripeAccountLink() {
  return useMutation<string, Error, { returnUrl: string; refreshUrl: string }>({
    mutationFn: ({ returnUrl, refreshUrl }) => 
      StripeConnectAPI.getAccountLink(returnUrl, refreshUrl),
  });
}

/**
 * Get payout history
 */
export function useGetPayoutHistory(limit: number = 10, enabled: boolean = true) {
  return useQuery<StripePayoutHistoryResponse, any>({
    queryKey: STRIPE_CONNECT_QUERY_KEYS.payouts(limit),
    queryFn: () => StripeConnectAPI.getPayoutHistory(limit),
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Delete Stripe Connect account
 */
export function useDeleteStripeAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => StripeConnectAPI.deleteAccount(),
    onSuccess: () => {
      // Clear all Stripe Connect queries
      queryClient.invalidateQueries({ queryKey: ['stripe-connect'] });
    },
  });
}
