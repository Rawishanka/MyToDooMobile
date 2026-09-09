import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

export interface ContactChangeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function requestPhoneOtp(phone: string): Promise<ContactChangeResponse> {
  try {
    const response = await api.post('/users/profile/phone/request-otp', { phone });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Request phone OTP failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function verifyPhoneOtp(phone: string, otp: string): Promise<ContactChangeResponse> {
  try {
    const response = await api.post('/users/profile/phone/verify', { phone, otp });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Verify phone OTP failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function requestEmailOtp(email: string): Promise<ContactChangeResponse> {
  try {
    const response = await api.post('/users/profile/email/request-otp', { email });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Request email OTP failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export async function verifyEmailOtp(email: string, otp: string): Promise<ContactChangeResponse> {
  try {
    const response = await api.post('/users/profile/email/verify', { email, otp });
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn('⚠️ Verify email OTP failed:', error?.response?.status || error?.message);
    }
    throw error;
  }
}

export const ContactChangeAPI = {
  requestPhoneOtp,
  verifyPhoneOtp,
  requestEmailOtp,
  verifyEmailOtp,
};
