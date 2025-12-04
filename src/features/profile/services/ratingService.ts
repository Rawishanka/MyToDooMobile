import API_CONFIG, { createApi } from '@/src/api/config';

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

export interface ReviewsResponse {
  reviews: Review[];
  page: number;
  totalPages: number;
  totalReviews: number;
  hasMore: boolean;
}

export interface SubmitReviewRequest {
  rating: number;
  reviewText: string;
  taskId?: string;
}

export class RatingService {
  private static api = createApi(API_CONFIG.BASE_URL);

  /**
   * Get rating statistics for a user
   */
  static async getUserRatingStats(userId: string): Promise<RatingStats> {
    try {

      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/rating-stats`);

      // Unwrap the response structure {success: true, data: {...}}
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {

      // Return empty stats for fallback
      throw new Error('Unable to load rating statistics');
    }
  }

  /**
   * Get reviews for a user with pagination
   */
  static async getUserReviews(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    role?: "poster" | "tasker",
    populate?: string
  ): Promise<ReviewsResponse> {
    try {

      const params: any = { page, limit };
      if (role) params.role = role;
      if (populate) params.populate = populate;
      
      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/reviews`, {
        params
      });

      // Unwrap the response structure {success: true, data: [...], pagination: {...}}
      if (response.data && response.data.success) {
        return {
          reviews: response.data.data || [],
          page: response.data.pagination?.currentPage || page,
          totalPages: response.data.pagination?.totalPages || 0,
          totalReviews: response.data.pagination?.totalReviews || 0,
          hasMore: response.data.pagination?.hasMore || false
        };
      }
      
      // Fallback if response structure is different
      return {
        reviews: [],
        page,
        totalPages: 0,
        totalReviews: 0,
        hasMore: false
      };
    } catch (error: any) {

      // Return empty reviews for fallback
      throw new Error('Unable to load reviews');
    }
  }

  /**
   * Submit a review for a completed task
   */
  static async submitReview(userId: string, reviewData: SubmitReviewRequest): Promise<{ success: boolean; message: string }> {
    try {

      const response = await this.api.post(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/reviews`, reviewData);

      return response.data;
    } catch (error: any) {

      throw new Error('Unable to submit review');
    }
  }

  /**
   * Get reviews given by the current user
   */
  static async getMyReviews(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {

      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/reviews/my-reviews`, {
        params: { page, limit }
      });

      return response.data;
    } catch (error: any) {

      throw new Error('Unable to load your reviews');
    }
  }

  /**
   * Update an existing review
   */
  static async updateReview(
    reviewId: string, 
    updateData: { rating: number; comment?: string }
  ): Promise<Review> {
    try {

      const response = await this.api.put(`${API_CONFIG.ENDPOINTS.USERS}/reviews/${reviewId}`, updateData);

      return response.data;
    } catch (error: any) {

      throw new Error('Unable to update review');
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    try {

      await this.api.delete(`${API_CONFIG.ENDPOINTS.USERS}/reviews/${reviewId}`);

    } catch (error: any) {

      throw new Error('Unable to delete review');
    }
  }
}