import {
    getRatifyIdStatus,
    RatifyIdRequest,
    startRatifyIdVerification,
    updateUserVerificationStatus
} from '@/src/api/ratify-id-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to start ID verification with Ratify ID
 */
export function useStartIdVerification() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, RatifyIdRequest>({
    mutationFn: startRatifyIdVerification,
    onSuccess: (data) => {
      
      // Invalidate user profile to refresh verification status
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      
      // Store verification ID for future status checks
      if (data?.data?.verificationId) {
        queryClient.setQueryData(['verification-id'], data.data.verificationId);
      }
    },
    onError: (error) => {
    }
  });
}

/**
 * Hook to check verification status
 */
export function useVerificationStatus(verificationId?: string, enabled: boolean = true) {
  return useQuery<any, Error>({
    queryKey: ['verification-status', verificationId],
    queryFn: () => getRatifyIdStatus(verificationId!),
    enabled: enabled && !!verificationId,
    refetchInterval: 30000, // Check status every 30 seconds
    retry: 3,
  });
}

/**
 * Hook to update user verification status (internal use)
 */
export function useUpdateVerificationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, {
    userId: string;
    verificationId: string; 
    status: 'verified' | 'rejected';
  }>({
    mutationFn: ({ userId, verificationId, status }) => 
      updateUserVerificationStatus(userId, verificationId, status),
    onSuccess: (data) => {
      
      // Invalidate and refetch user profile to show updated verification status
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      
      // Update the cache to immediately reflect the change
      queryClient.setQueryData(['user-profile'], (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              isVerified: data?.data?.isVerified || false
            }
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
    }
  });
}

/**
 * Hook to simulate complete verification flow (for demo purposes)
 * This will be replaced with actual Ratify ID integration
 */
export function useSimulateVerification() {
  const updateVerificationStatus = useUpdateVerificationStatus();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      // Simulate the verification process
      
      // Wait 2 seconds to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock verification ID
      const mockVerificationId = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Update the verification status to verified
      return updateVerificationStatus.mutateAsync({
        userId,
        verificationId: mockVerificationId,
        status: 'verified'
      });
    },
    onError: (error) => {
    }
  });
}