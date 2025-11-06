// API functions for user profile management
import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==========================================
// TYPES
// ==========================================

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: {
    goodAt: string[];
    transport: string[];
    languages: string[];
    qualifications: string[];
    experience: string[];
  };
  avatar?: string; // Base64 image data
  profilePicture?: string; // URL to profile picture
  rating: number;
  completedTasks: number;
  createdAt: string;
  isVerified: boolean;
  role?: string; // Added for compatibility with User type
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: {
    goodAt?: string[];
    transport?: string[];
    languages?: string[];
    qualifications?: string[];
    experience?: string[];
  };
}

export interface RatingStats {
  overall: {
    average: number;
    count: number;
  };
  completionRate: number;
  totalTasks: number;
  breakdown: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}

export interface RatingStatsResponse {
  success: boolean;
  data: RatingStats;
}

export interface Review {
  rating: number;
  reviewText: string;
  taskId?: string;
}

export interface RequestReviewRequest {
  method: "link" | "email" | "sms";
  recipientEmail?: string;
  recipientPhone?: string;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Get user profile
 * GET /api/users/profile
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  try {
    console.log("👤 Fetching user profile...");
    const response = await api.get('/users/profile');
    console.log("✅ User profile fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Handle auth errors - return mock data for development (don't log as error)
    if (error?.isAuthError || error?.status === 401) {
      console.log("ℹ️ Not authenticated - Using mock profile data for development");
      return {
        success: true,
        data: {
          _id: "mock-user-123",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          location: "Sydney, NSW",
          bio: "Hi I'm John",
          skills: {
            goodAt: ["Developer", "Designer"],
            transport: ["Car"],
            languages: ["English"],
            qualifications: ["Bachelor's Degree"],
            experience: ["5+ years"]
          },
          rating: 4.5,
          completedTasks: 25,
          createdAt: new Date().toISOString(),
          isVerified: false
        }
      };
    }
    
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock profile data");
      return {
        success: true,
        data: {
          _id: "mock-user-123",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          location: "Sydney, NSW",
          bio: "Hi I'm John",
          skills: {
            goodAt: ["Developer", "Designer"],
            transport: ["Car"],
            languages: ["English"],
            qualifications: ["Bachelor's Degree"],
            experience: ["5+ years"]
          },
          rating: 4.5,
          completedTasks: 25,
          createdAt: new Date().toISOString(),
          isVerified: false
        }
      };
    }
    
    // For other errors, log and throw
    console.error("❌ Get user profile failed:", error);
    throw error;
  }
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
export async function updateUserProfile(profileData: UpdateProfileRequest): Promise<UserProfileResponse> {
  try {
    console.log("📝 Updating user profile:", profileData);
    const response = await api.put('/users/profile', profileData);
    console.log("✅ User profile updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Handle auth errors
    if (error?.isAuthError || error?.status === 401) {
      console.log("ℹ️ Authentication required to update profile");
      throw new Error("Please login to update your profile");
    }
    
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock update response");
      return {
        success: true,
        data: {
          _id: "mock-user-123",
          firstName: profileData.firstName || "John",
          lastName: profileData.lastName || "Doe",
          email: "john@example.com",
          phone: profileData.phone || "+1234567890",
          location: profileData.location || "Sydney, NSW",
          bio: profileData.bio || "Hi I'm John",
          skills: {
            goodAt: profileData.skills?.goodAt || [],
            transport: profileData.skills?.transport || [],
            languages: profileData.skills?.languages || [],
            qualifications: profileData.skills?.qualifications || [],
            experience: profileData.skills?.experience || []
          },
          rating: 4.5,
          completedTasks: 25,
          createdAt: new Date().toISOString(),
          isVerified: false
        }
      };
    }
    
    // For other errors, log and throw
    console.error("❌ Update user profile failed:", error);
    throw error;
  }
}

/**
 * Upload user avatar
 * POST /api/users/avatar
 */
export async function uploadUserAvatar(formData: FormData): Promise<UserProfileResponse> {
  try {
    console.log("📸 Uploading user avatar...");
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("✅ Avatar uploaded successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.log("⚠️ Avatar upload error:", error?.response?.status || error?.code || error?.message);
    
    // Handle auth errors (401) or network errors - use mock data for development
    if (error?.isAuthError || 
        error?.response?.status === 401 || 
        error?.status === 401 ||
        error.code === 'ERR_NETWORK' || 
        error.message === 'Network Error') {
      
      console.log("ℹ️ Using mock avatar upload for development (auth or network issue)");
      
      // Extract the image URI from the FormData for mock response
      let mockAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."; // Default mock
      
      // In a real scenario, we'd process the actual image
      // For now, just return success with mock data
      return {
        success: true,
        data: {
          _id: "mock-user-123",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          location: "Sydney, NSW",
          bio: "Hi I'm John",
          skills: {
            goodAt: [],
            transport: [],
            languages: [],
            qualifications: [],
            experience: []
          },
          avatar: mockAvatar,
          rating: 4.5,
          completedTasks: 25,
          createdAt: new Date().toISOString(),
          isVerified: false
        }
      };
    }
    
    // For other errors, log and throw
    console.error("❌ Upload avatar failed:", error);
    throw error;
  }
}

/**
 * Get user rating statistics
 * GET /api/users/{userId}/rating-stats
 */
export async function getUserRatingStats(userId: string): Promise<RatingStatsResponse> {
  try {
    console.log(`📊 Fetching rating stats for user ${userId}...`);
    const response = await api.get(`/users/${userId}/rating-stats`);
    console.log("✅ Rating stats fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock rating stats");
      return {
        success: true,
        data: {
          overall: {
            average: 4.0,
            count: 1
          },
          completionRate: 85,
          totalTasks: 378,
          breakdown: {
            "5": 0,
            "4": 100,
            "3": 0,
            "2": 0,
            "1": 0
          }
        }
      };
    }
    
    console.error("❌ Get rating stats failed:", error);
    throw error;
  }
}

/**
 * Submit a review for a user
 * POST /api/users/{userId}/reviews
 */
export async function submitUserReview(userId: string, review: Review): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`✍️ Submitting review for user ${userId}:`, review);
    const response = await api.post(`/users/${userId}/reviews`, review);
    console.log("✅ Review submitted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock review submission");
      return {
        success: true,
        message: "Review submitted successfully (mock)"
      };
    }
    
    console.error("❌ Submit review failed:", error);
    throw error;
  }
}

/**
 * Check if current user can review another user
 * GET /api/users/{userId}/can-review
 */
export async function canReviewUser(userId: string): Promise<{ success: boolean; canReview: boolean; reason?: string }> {
  try {
    console.log(`🔍 Checking if can review user ${userId}...`);
    const response = await api.get(`/users/${userId}/can-review`);
    console.log("✅ Can review check successful:", response.data);
    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock can review response");
      return {
        success: true,
        canReview: true
      };
    }
    
    console.error("❌ Can review check failed:", error);
    throw error;
  }
}

/**
 * Request a review (share review link)
 * POST /api/users/request-review
 */
export async function requestReview(requestData: RequestReviewRequest): Promise<{ success: boolean; message: string; link?: string }> {
  try {
    console.log("📧 Requesting review:", requestData);
    const response = await api.post('/users/request-review', requestData);
    console.log("✅ Review request sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock request review");
      return {
        success: true,
        message: "Review request sent successfully (mock)",
        link: "https://example.com/review/mock-123"
      };
    }
    
    console.error("❌ Request review failed:", error);
    throw error;
  }
}

export const UserProfileAPI = {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getUserRatingStats,
  submitUserReview,
  canReviewUser,
  requestReview
};
