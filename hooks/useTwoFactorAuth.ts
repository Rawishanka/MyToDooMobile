import { useMutation } from '@tanstack/react-query';
import { sendSmsCode, verifySmsCode } from '../api/two-factor-auth';
import { ApiResponse, SendSmsRequest, SmsVerificationRequest } from '../api/types/two-factor-auth';

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
