// Two-factor authentication API types
export interface SendSmsRequest {
  phone: string;
  email: string;
}

export interface SmsVerificationRequest {
  email: string;
  otp: string;
  tempToken?: string;
  tempUser?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
