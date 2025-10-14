// api/user-api.ts
import { createApi } from '@/utils/api';
import API_CONFIG from './config';
import { User } from './types/user';

/**
 * User Profile API Functions
 */

// Get authenticated user profile
export async function getUserProfile(): Promise<{ success: boolean; data: User }> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.3:5001/api";
  const api = createApi(baseUrl);
  
  try {
    console.log("👤 Getting user profile from:", baseUrl + "/auth/profile");
    const response = await api.get('/auth/profile');
    console.log("✅ Get user profile success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get user profile failed:", error);
    
    // Development fallback - if server is not available, use mock data
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock user profile");
      const mockUserProfile = {
        success: true,
        data: {
          _id: "dev-user-123",
          email: "rasindu.rawishanka@gmail.com",
          firstName: "Rasindu",
          lastName: "Rawishanka",
          phone: "+94719409238",
          skills: [],
          rating: 4,
          completedTasks: 0,
          isVerified: true,
          verified: false,
          role: "user",
          verification: {
            ratifyId: {
              status: null
            }
          },
          createdAt: "2025-10-07T06:34:19.793Z",
          updatedAt: "2025-10-07T06:34:19.793Z"
        }
      };
      console.log("✅ Mock user profile data for development");
      return mockUserProfile;
    }
    
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(profileData: Partial<User>): Promise<{ success: boolean; data: User }> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.3:5001/api";
  const api = createApi(baseUrl);
  
  try {
    console.log("📝 Updating user profile:", profileData);
    const response = await api.put('/auth/profile', profileData);
    console.log("✅ Update user profile success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Update user profile failed:", error);
    
    // Development fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock update");
      const mockUpdateResponse = {
        success: true,
        data: {
          _id: "dev-user-123",
          email: "rasindu.rawishanka@gmail.com",
          firstName: profileData.firstName || "Rasindu",
          lastName: profileData.lastName || "Rawishanka",
          phone: "+94719409238",
          skills: [],
          rating: 4,
          completedTasks: 0,
          isVerified: true,
          verified: false,
          role: "user",
          ...profileData // Apply the updates
        }
      };
      console.log("✅ Mock update user profile success for development");
      return mockUpdateResponse;
    }
    
    throw error;
  }
}

// Change password
export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.3:5001/api";
  const api = createApi(baseUrl);
  
  try {
    console.log("🔐 Changing user password");
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    console.log("✅ Change password success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Change password failed:", error);
    
    // Development fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock password change");
      const mockPasswordResponse = {
        success: true,
        message: "Password changed successfully"
      };
      console.log("✅ Mock password change success for development");
      return mockPasswordResponse;
    }
    
    throw error;
  }
}

// Upload profile picture
export async function uploadProfilePicture(imageUri: string): Promise<{ success: boolean; data: { profilePicture: string } }> {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.3:5001/api";
  const api = createApi(baseUrl);
  
  try {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    
    console.log("📸 Uploading profile picture");
    const response = await api.post('/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("✅ Upload profile picture success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Upload profile picture failed:", error);
    
    // Development fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock upload");
      const mockUploadResponse = {
        success: true,
        data: {
          profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
        }
      };
      console.log("✅ Mock upload profile picture success for development");
      return mockUploadResponse;
    }
    
    throw error;
  }
}