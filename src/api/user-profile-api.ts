// API functions for user profile management
import { createApi } from '@/src/shared/utils/api';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
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

    const response = await api.get('/users/profile');

    return response.data;
  } catch (error: any) {
    // 🚨 CRITICAL FIX: Don't return mock data to prevent cache persistence
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {

    }
    
    // For auth errors, throw the error to prevent cache pollution
    if (error?.isAuthError || 
        error?.response?.status === 401 || 
        error?.status === 401) {
      if (__DEV__) {

      }
      throw error; // Let the UI handle the auth error
    }
    
    // For network errors, also throw to prevent mock data cache persistence
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (__DEV__) {

      }
      throw error; // Let the UI handle the network error
    }
    
    // For other errors, log and throw
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
export async function updateUserProfile(profileData: UpdateProfileRequest): Promise<UserProfileResponse> {
  try {

    const response = await api.put('/users/profile', profileData);

    return response.data;
  } catch (error: any) {
    // Handle auth errors
    if (error?.isAuthError || error?.status === 401) {

      throw new Error("Please login to update your profile");
    }
    
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

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
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Upload user avatar
 * POST /api/users/avatar
 */
export async function uploadUserAvatar(formData: FormData): Promise<UserProfileResponse> {
  try {

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {

    // Handle auth errors (401) or network errors - use mock data for development
    if (error?.isAuthError || 
        error?.response?.status === 401 || 
        error?.status === 401 ||
        error.code === 'ERR_NETWORK' || 
        error.message === 'Network Error') {
      
      
      // Extract the actual image URI from FormData for better mock response
      let mockAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."; // Default mock
      
      try {
        // Try to get the actual image URI from FormData for better preview
        const avatarData = formData.get('avatar') as any;
        if (avatarData && avatarData.uri) {
          mockAvatar = avatarData.uri; // Use the actual selected image URI
        }
      } catch (e) {

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
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Get user rating statistics
 * GET /api/users/{userId}/rating-stats
 */
export async function getUserRatingStats(userId: string): Promise<RatingStatsResponse> {
  try {

    const response = await api.get(`/users/${userId}/rating-stats`);

    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

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
    
    if (!isNetworkError(error) && __DEV__) {

    }
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

    const params: any = { page, limit };
    if (role) params.role = role;
    if (populate) params.populate = populate;
    
    const response = await api.get(`/users/${userId}/reviews`, { params });

    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

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
    
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Submit a review for a user
 * POST /api/users/{userId}/reviews
 */
export async function submitUserReview(userId: string, review: SubmitReviewData): Promise<{ success: boolean; message: string }> {
  try {

    const response = await api.post(`/users/${userId}/reviews`, review);

    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

      return {
        success: true,
        message: "Review submitted successfully (mock)"
      };
    }
    
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Check if current user can review another user
 * GET /api/users/{userId}/can-review
 */
export async function canReviewUser(userId: string): Promise<{ success: boolean; canReview: boolean; reason?: string }> {
  try {

    const response = await api.get(`/users/${userId}/can-review`);

    return response.data;
  } catch (error: any) {
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

      return {
        success: true,
        canReview: true
      };
    }
    
    if (!isNetworkError(error) && __DEV__) {

    }
    throw error;
  }
}

/**
 * Request a review via email or SMS
 * POST /api/users/request-review
 */
export async function requestReview(requestData: RequestReviewRequest): Promise<{ success: boolean; message: string; sentTo: string; method: string }> {
  try {

    const response = await api.post('/users/request-review', requestData);

    return response.data;
  } catch (error: any) {
    // Enhanced error logging - only for non-network errors in development
    if (!isNetworkError(error) && __DEV__) {



    }
    
    // Get error details
    const errorMessage = error?.response?.data?.message || '';
    const errorStatus = error?.response?.status;
    
    // Check for Twilio/SMS configuration errors (500 or any status)
    if (errorMessage.includes('Twilio') || 
        errorMessage.includes('country mismatch') || 
        errorMessage.includes('not a Twilio phone number')) {


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

      // For 500 errors, provide helpful message
      if (requestData.method === 'sms') {
        throw new Error('SMS service is currently unavailable. Please use Email instead or try again later.');
      } else {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }
    }
    
    // Network error fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {

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
