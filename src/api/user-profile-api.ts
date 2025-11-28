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
  userId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  asPoster: {
    averageRating: number;
    totalReviews: number;
  };
  asTasker: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface RatingStatsResponse {
  success: boolean;
  data: RatingStats;
}

export interface Review {
  _id: string;
  reviewedUser: string;
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  reviewText: string;
  taskId?: string;
  task?: {
    _id: string;
    title: string;
    status: string;
  };
  role: "poster" | "tasker";
  response?: {
    text: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  success: boolean;
  data: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasMore: boolean;
  };
}

export interface SubmitReviewData {
  rating: number;
  reviewText: string;
  taskId?: string;
}

export interface RequestReviewRequest {
  method: "email" | "sms";
  recipient: string; // Email address for email method, phone number for SMS method
  message?: string; // Optional custom message
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
    // 🚨 CRITICAL FIX: Don't return mock data to prevent cache persistence
    console.error("❌ Get user profile failed:", error?.response?.status || error?.code || error?.message);
    
    // For auth errors, throw the error to prevent cache pollution
    if (error?.isAuthError || 
        error?.response?.status === 401 || 
        error?.status === 401) {
      console.log("⚠️ 401 Unauthorized - Authentication may have expired");
      throw error; // Let the UI handle the auth error
    }
    
    // For network errors, also throw to prevent mock data cache persistence
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("⚠️ Network error - no mock data to prevent cache pollution");
      throw error; // Let the UI handle the network error
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
      
      // Extract the actual image URI from FormData for better mock response
      let mockAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."; // Default mock
      
      try {
        // Try to get the actual image URI from FormData for better preview
        const avatarData = formData.get('avatar') as any;
        if (avatarData && avatarData.uri) {
          mockAvatar = avatarData.uri; // Use the actual selected image URI
        }
      } catch (e) {
        console.log("Could not extract image URI from FormData, using default mock");
      }
      
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
          userId: userId,
          averageRating: 4.0,
          totalReviews: 1,
          ratingDistribution: {
            "5": 0,
            "4": 1,
            "3": 0,
            "2": 0,
            "1": 0
          },
          asPoster: {
            averageRating: 4.0,
            totalReviews: 1
          },
          asTasker: {
            averageRating: 0,
            totalReviews: 0
          }
        }
      };
    }
    
    console.error("❌ Get rating stats failed:", error);
    throw error;
  }
}

/**
 * Get user reviews (paginated)
 * GET /api/users/{userId}/reviews
 */
export async function getUserReviews(
  userId: string,
  page: number = 1,
  limit: number = 10,
  role?: "poster" | "tasker",
  populate?: string
): Promise<ReviewsListResponse> {
  try {
    console.log(`📝 Fetching reviews for user ${userId}, page: ${page}`);
    const params: any = { page, limit };
    if (role) params.role = role;
    if (populate) params.populate = populate;
    
    const response = await api.get(`/users/${userId}/reviews`, { params });
    console.log("✅ Reviews fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock reviews");
      return {
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalReviews: 0,
          hasMore: false
        }
      };
    }
    
    console.error("❌ Get reviews failed:", error);
    throw error;
  }
}

/**
 * Submit a review for a user
 * POST /api/users/{userId}/reviews
 */
export async function submitUserReview(userId: string, review: SubmitReviewData): Promise<{ success: boolean; message: string }> {
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
 * Request a review via email or SMS
 * POST /api/users/request-review
 */
export async function requestReview(requestData: RequestReviewRequest): Promise<{ success: boolean; message: string; sentTo: string; method: string }> {
  try {
    console.log("📧 Requesting review with data:", JSON.stringify(requestData, null, 2));
    console.log("📧 Request URL: /users/request-review");
    
    const response = await api.post('/users/request-review', requestData);
    console.log("✅ Review request sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // Enhanced error logging
    console.error("❌ Request review failed with error:", error);
    console.error("❌ Error response:", error?.response?.data);
    console.error("❌ Error status:", error?.response?.status);
    console.error("❌ Error config:", {
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.config?.data,
      headers: error?.config?.headers ? Object.keys(error?.config?.headers) : 'none'
    });
    
    // Get error details
    const errorMessage = error?.response?.data?.message || '';
    const errorStatus = error?.response?.status;
    
    // Check for Twilio/SMS configuration errors (500 or any status)
    if (errorMessage.includes('Twilio') || 
        errorMessage.includes('country mismatch') || 
        errorMessage.includes('not a Twilio phone number')) {
      console.error("🔥 SMS/Twilio configuration error detected");
      console.error("🔥 Backend Twilio issue:", errorMessage);
      
      // Provide helpful error message for SMS issues
      if (requestData.method === 'sms') {
        throw new Error('SMS service is currently unavailable due to backend configuration. Please use Email instead.');
      } else {
        throw new Error('Email service configuration error. Please contact support.');
      }
    }
    
    // Check if it's a 400 error (validation)
    if (errorStatus === 400) {
      const errorData = error?.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationError = errorData.errors[0]?.msg || 'Invalid request format';
        throw new Error(validationError);
      } else {
        throw new Error(errorData?.message || 'Invalid request. Please check your input.');
      }
    }
    
    // Check if it's a 500 server error
    if (errorStatus === 500) {
      console.error("🔥 Server error (500) - Backend issue detected");
      console.error("🔥 This suggests an issue on the server side, not the client");
      
      // For 500 errors, provide helpful message
      if (requestData.method === 'sms') {
        throw new Error('SMS service is currently unavailable. Please use Email instead or try again later.');
      } else {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }
    }
    
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log("ℹ️ Network unavailable - Using mock request review");
      return {
        success: true,
        message: `Review request sent successfully via ${requestData.method} (mock)`,
        sentTo: requestData.recipient,
        method: requestData.method
      };
    }
    
    // Re-throw the error for other cases
    throw error;
  }
}

export const UserProfileAPI = {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getUserRatingStats,
  getUserReviews,
  submitUserReview,
  canReviewUser,
  requestReview
};
