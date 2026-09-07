import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as paymentAPI from '../../api/payment-api';

// Hook for creating payment intent
export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      offerId: string;
      amount: number;
      currency?: string;
      useCredits?: boolean;
      creditsAmount?: number;
    }) => paymentAPI.createPaymentIntent(data),
    onSuccess: (data, variables) => {
      console.log('✅ Payment intent created successfully:', data);
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['payment', variables.taskId] });
    },
    onError: (error: any, variables) => {
      console.log('❌ Payment intent creation failed:', {
        message: error.message,
        code: (error as any).code || 'Unknown',
        variables
      });
    }
  });
}

// Hook for verifying payment
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      paymentIntentId: string;
      taskId: string;
      offerId: string;
    }) => paymentAPI.verifyPayment(data),
    onSuccess: (data, variables) => {
      console.log('✅ Payment verification successful:', data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['payment', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
    onError: (error: any, variables) => {
      console.log('❌ Payment verification failed:', {
        message: error.message,
        code: (error as any).code || 'Unknown',
        variables
      });
    }
  });
}

/**
 * 📊 Get Service Fee Configuration Query
 * Fetches current service fee configuration
 */
export function useGetServiceFeeConfig(enabled: boolean = true) {
  return useQuery({
    queryKey: ['service-fee-config'],
    queryFn: () => paymentAPI.getServiceFeeConfig(),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - config doesn't change often
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 403 (non-admin user)
      if (error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    // Suppress errors in UI for 403 responses (expected for non-admin users)
    meta: {
      errorMessage: false,
    },
  });
}

/**
 * ⚙️ Update Service Fee Configuration Mutation
 * Updates service fee configuration (Admin only)
 */
export function useUpdateServiceFeeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configData: {
      BASE_PERCENTAGE?: number;
      MIN_FEE_USD?: number;
      MAX_FEE_USD?: number;
    }) => paymentAPI.updateServiceFeeConfig(configData),
    onSuccess: (data) => {
      console.log('✅ Service fee config updated successfully:', data);
      // Invalidate the config query to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['service-fee-config'] });
    },
    onError: (error: any, variables) => {
      console.log('❌ Service fee config update failed:', {
        message: error.message,
        code: (error as any).code || 'Unknown',
        variables
      });
    }
  });
}

/**
 * 📊 Calculate Service Fee Mutation
 * Calculates service fee for a given amount
 */
export function useCalculateServiceFee() {
  return useMutation({
    mutationFn: (data: {
      amount: number;
      currency?: string;
    }) => paymentAPI.calculateServiceFee(data),
    onSuccess: (data, variables) => {
      console.log('✅ Service fee calculated successfully:', {
        amount: variables.amount,
        currency: variables.currency,
        result: data.calculation
      });
    },
    onError: (error: any, variables) => {
      console.log('❌ Service fee calculation failed:', {
        message: error.message,
        code: (error as any).code || 'Unknown',
        variables
      });
    }
  });
}