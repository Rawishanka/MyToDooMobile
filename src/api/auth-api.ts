import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

/**
 * Password Reset API Functions
 * Following the existing API architecture pattern
 */

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Send password reset email
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "https://api.mytodoo.com/api";
  const api = createApi(baseUrl);
  
  try {
    console.log("📧 Sending password reset email to:", data.email);
    console.log("🔗 API URL:", baseUrl + "/auth/forgot-password");
    
    // Add platform parameter to tell backend this is mobile
    const requestData = {
      ...data,
      platform: 'mobile',
      redirectUrl: 'mytodoomobile://reset-password' // Tell backend to use mobile deep link
    };
    
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', requestData);
    console.log("✅ Forgot password success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Forgot password failed:", error);
    
    // Re-throw with more context for better error handling
    if (error.response) {
      // Server responded with an error
      throw {
        message: error.response.data?.message || 'Failed to send reset email',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
}

/**
 * Reset password with token from email
 * POST /api/auth/reset-password
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "https://api.mytodoo.com/api";
  const api = createApi(baseUrl);
  
  try {
    console.log("🔐 Resetting password for:", data.email);
    console.log("🔗 API URL:", baseUrl + "/auth/reset-password");
    
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    console.log("✅ Reset password success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Reset password failed:", error);
    
    // Re-throw with more context for better error handling
    if (error.response) {
      // Server responded with an error
      const errorMessage = error.response.data?.message || 'Failed to reset password';
      throw {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
}
