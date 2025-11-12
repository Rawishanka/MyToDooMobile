import { useMutation, useQueryClient } from '@tanstack/react-query';
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