import * as ContactChangeAPI from '@/src/api/contact-change-api';
import { USER_PROFILE_QUERY_KEYS } from '@/src/shared/hooks/useUserProfileApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useRequestPhoneOtp() {
  return useMutation({
    mutationFn: (phone: string) => ContactChangeAPI.requestPhoneOtp(phone),
  });
}

export function useVerifyPhoneOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      ContactChangeAPI.verifyPhoneOtp(phone, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.profile() });
    },
  });
}

export function useRequestEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => ContactChangeAPI.requestEmailOtp(email),
  });
}

export function useVerifyEmailOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      ContactChangeAPI.verifyEmailOtp(email, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.profile() });
    },
  });
}
