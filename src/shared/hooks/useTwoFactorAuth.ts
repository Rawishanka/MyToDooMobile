import { sendSmsCode, verifySmsCode } from '@/src/api/two-factor-auth';
import { ApiResponse, SendSmsRequest, SmsVerificationRequest } from '@/src/api/types/two-factor-auth';
import { useMutation } from '@tanstack/react-query';

export function useSendSmsCode() {
  return useMutation<ApiResponse, Error, SendSmsRequest>({
    mutationFn: sendSmsCode,
  });
}

export function useVerifySmsCode() {
  return useMutation<ApiResponse, Error, SmsVerificationRequest>({
    mutationFn: verifySmsCode,
  });
}
