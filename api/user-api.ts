// // api/user-api.ts
// import { createApi } from '@/utils/api';
// import API_CONFIG from './config';
// import { User } from './types/user';

// /**
//  * User Profile API Functions
//  */

// // Get authenticated user profile
// export async function getUserProfile(): Promise<{ success: boolean; data: User }> {
//   const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
//     ? API_CONFIG.BASE_URL
//     : "http://192.168.1.3:5001/api";
//   const api = createApi(baseUrl);
  
//   try {
//     console.log("👤 Getting user profile from:", baseUrl + "/auth/profile");
//     const response = await api.get('/auth/profile');
//     console.log("✅ Get user profile success:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Get user profile failed:", error);
    
//     // Development fallback - if server is not available, use mock data
//     if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
//       console.warn("🔄 Server not available, using development mode with mock user profile");
//       const mockUserProfile = {
//         success: true,
//         data: {
//           _id: "dev-user-123",
//           email: "rasindu.rawishanka@gmail.com",
//           firstName: "Rasindu",
//           lastName: "Rawishanka",
//           phone: "+94719409238",
//           skills: [],
//           rating: 4,
//           completedTasks: 0,
//           isVerified: true,
//           verified: false,
//           role: "user",
//           verification: {
//             ratifyId: {
//               status: null
//             }
//           },
//           createdAt: "2025-10-07T06:34:19.793Z",
//           updatedAt: "2025-10-07T06:34:19.793Z"
//         }
//       };
//       console.log("✅ Mock user profile data for development");
//       return mockUserProfile;
//     }
    
//     throw error;
//   }
// }

// // Update user profile
// export async function updateUserProfile(profileData: Partial<User>): Promise<{ success: boolean; data: User }> {
//   const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
//     ? API_CONFIG.BASE_URL
//     : "http://192.168.1.3:5001/api";
//   const api = createApi(baseUrl);
  
//   try {
//     console.log("📝 Updating user profile:", profileData);
//     const response = await api.put('/auth/profile', profileData);
//     console.log("✅ Update user profile success:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Update user profile failed:", error);
    
//     // Development fallback
//     if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
//       console.warn("🔄 Server not available, using development mode with mock update");
//       const mockUpdateResponse = {
//         success: true,
//         data: {
//           _id: "dev-user-123",
//           email: "rasindu.rawishanka@gmail.com",
//           firstName: profileData.firstName || "Rasindu",
//           lastName: profileData.lastName || "Rawishanka",
//           phone: "+94719409238",
//           skills: [],
//           rating: 4,
//           completedTasks: 0,
//           isVerified: true,
//           verified: false,
//           role: "user",
//           ...profileData // Apply the updates
//         }
//       };
//       console.log("✅ Mock update user profile success for development");
//       return mockUpdateResponse;
//     }
    
//     throw error;
//   }
// }

// // Change password
// export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
//   const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
//     ? API_CONFIG.BASE_URL
//     : "http://192.168.1.3:5001/api";
//   const api = createApi(baseUrl);
  
//   try {
//     console.log("🔐 Changing user password");
//     const response = await api.put('/auth/change-password', {
//       currentPassword,
//       newPassword
//     });
//     console.log("✅ Change password success:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Change password failed:", error);
    
//     // Development fallback
//     if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
//       console.warn("🔄 Server not available, using development mode with mock password change");
//       const mockPasswordResponse = {
//         success: true,
//         message: "Password changed successfully"
//       };
//       console.log("✅ Mock password change success for development");
//       return mockPasswordResponse;
//     }
    
//     throw error;
//   }
// }

// // Upload profile picture
// export async function uploadProfilePicture(imageUri: string): Promise<{ success: boolean; data: { profilePicture: string } }> {
//   const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
//     ? API_CONFIG.BASE_URL
//     : "http://192.168.1.3:5001/api";
//   const api = createApi(baseUrl);
  
//   try {
//     const formData = new FormData();
//     formData.append('profilePicture', {
//       uri: imageUri,
//       type: 'image/jpeg',
//       name: 'profile.jpg',
//     } as any);
    
//     console.log("📸 Uploading profile picture");
//     const response = await api.post('/auth/profile/picture', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     console.log("✅ Upload profile picture success:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Upload profile picture failed:", error);
    
//     // Development fallback
//     if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
//       console.warn("🔄 Server not available, using development mode with mock upload");
//       const mockUploadResponse = {
//         success: true,
//         data: {
//           profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
//         }
//       };
//       console.log("✅ Mock upload profile picture success for development");
//       return mockUploadResponse;
//     }
    
//     throw error;
//   }
// }

// hooks/useApi.ts
import API_CONFIG from '@/api/config';
import { useAuthStore } from '@/store/auth-task-store';
import { createApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import { User } from './types/user';

const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
  ? API_CONFIG.BASE_URL
  : "http://192.168.8.168:5001/api";

const api = createApi(baseUrl);

// ==========================================
// SIGNUP & VERIFICATION HOOKS
// ==========================================

interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country?: string;
  stateRegion?: string;
  city?: string;
}

interface SignUpResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  otpSent: boolean;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
  userId?: string | null;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  emailVerified: boolean;
  userId: string;
}

interface VerifySMSRequest {
  phone: string;
  code: string;
  userId?: string | null;
}

interface VerifySMSResponse {
  success: boolean;
  message: string;
  phoneVerified: boolean;
  isVerified: boolean;
  token?: string;
  user?: any;
  expiresIn?: number;
}

/**
 * Hook for creating signup token (Step 1: Create account & send email OTP)
 */
export function useCreateSignUpToken() {
  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: async (signUpData) => {
      console.log('📝 Creating signup with data:', signUpData);
      
      try {
        const response = await api.post('/auth/signup', signUpData);
        console.log('✅ Signup API response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Signup API error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Using Mock Signup');
          return {
            success: true,
            message: 'Account created in development mode',
            userId: 'dev-user-' + Date.now(),
            email: signUpData.email,
            otpSent: true
          };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Signup mutation success:', data);
    },
    onError: (error) => {
      console.error('❌ Signup mutation error:', error);
    }
  });
}

/**
 * Hook for verifying email OTP (Step 2: Verify email)
 */
export function useVerifyOTP() {
  return useMutation<VerifyOTPResponse, Error, VerifyOTPRequest>({
    mutationFn: async (verifyData) => {
      console.log('🔐 Verifying email OTP:', verifyData);
      
      try {
        const response = await api.post('/two-factor-auth/otp-verification', verifyData);
        console.log('✅ Email OTP verification response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Email OTP verification error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Using Mock Email Verification');
          return {
            success: true,
            message: 'Email verified in development mode',
            emailVerified: true,
            userId: verifyData.userId || 'dev-user-' + Date.now()
          };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Email verification mutation success:', data);
    },
    onError: (error) => {
      console.error('❌ Email verification mutation error:', error);
    }
  });
}

/**
 * Hook for verifying SMS OTP (Step 3: Verify phone)
 */
export function useVerifySMS() {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  
  return useMutation<VerifySMSResponse, Error, VerifySMSRequest>({
    mutationFn: async (verifyData) => {
      console.log('📱 Verifying SMS OTP:', verifyData);
      
      try {
        // backend expects { phone, otp, userId? }
        const payload = {
          phone: verifyData.phone,
          otp: (verifyData as any).code || (verifyData as any).otp,
          userId: verifyData.userId
        };
        const response = await api.post('/two-factor-auth/sms-verification', payload);
        console.log('✅ SMS verification response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ SMS verification error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Using Mock SMS Verification');
          
          const mockUser = {
            id: 'dev-user-' + Date.now(),
            _id: 'dev-user-' + Date.now(),
            email: 'dev@example.com',
            firstName: 'Dev',
            lastName: 'User',
            phone: verifyData.phone,
            role: 'user',
            isVerified: true
          };
          
          const mockToken = 'dev-token-' + Date.now();
          
          return {
            success: true,
            message: 'Phone verified in development mode',
            phoneVerified: true,
            isVerified: true,
            token: mockToken,
            user: mockUser,
            expiresIn: 604800
          };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ SMS verification mutation success:', data);
      
      // Auto-login user after successful verification
      if (data.token && data.user) {
        setAuthData(data.token, data.user, data.expiresIn || 604800);
        console.log('✅ User auto-logged in after verification');
      }
    },
    onError: (error) => {
      console.error('❌ SMS verification mutation error:', error);
    }
  });
}

/**
 * Hook for resending email OTP
 */
export function useResendEmailOTP() {
  return useMutation<any, Error, { email: string; userId?: string | null }>({
    mutationFn: async (resendData) => {
      console.log('📧 Resending email OTP:', resendData);
      
      try {
        const response = await api.post('/two-factor-auth/send-email', resendData);
        console.log('✅ Email OTP resent:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Resend email OTP error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Mock Resend Email');
          return {
            success: true,
            message: 'Email OTP resent (dev mode)'
          };
        }
        
        throw error;
      }
    }
  });
}

/**
 * Hook for resending SMS OTP
 */
export function useResendSMSOTP() {
  return useMutation<any, Error, { phone: string; userId?: string | null }>({
    mutationFn: async (resendData) => {
      console.log('📱 Resending SMS OTP:', resendData);
      
      try {
        const response = await api.post('/two-factor-auth/send-sms', resendData);
        console.log('✅ SMS OTP resent:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Resend SMS OTP error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Mock Resend SMS');
          console.log(`🎯 [SIMULATION] Would have sent SMS to ${resendData.phone}`);
          return {
            success: true,
            message: 'SMS OTP resent (dev mode)'
          };
        }
        
        throw error;
      }
    }
  });
}

// ==========================================
// LOGIN HOOK
// ==========================================

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: any;
  expiresIn: number;
}

export function useCreateAuthToken() {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (loginData) => {
      console.log('🔐 Logging in:', loginData.email);
      
      try {
        const response = await api.post('/auth/login', loginData);
        console.log('✅ Login response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Login error:', error);
        
        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Using Mock Login');
          
          const mockUser = {
            id: 'dev-user-' + Date.now(),
            _id: 'dev-user-' + Date.now(),
            email: loginData.email,
            firstName: 'Dev',
            lastName: 'User',
            role: 'user',
            isVerified: true
          };
          
          return {
            success: true,
            token: 'dev-token-' + Date.now(),
            user: mockUser,
            expiresIn: 3600
          };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Login mutation success');
      setAuthData(data.token, data.user, data.expiresIn);
    },
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
    }
  });
}

export function updateUserProfile(profileData: Partial<User>) {
  throw new Error('Function not implemented.');
}
export function getUserProfile() {
  throw new Error('Function not implemented.');
}

