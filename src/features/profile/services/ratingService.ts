import API_CONFIG, { createApi } from '@/src/api/config';

export interface RatingStats {
  overall_rating: number | null | undefined;
  total_reviews: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  completion_rate: number | null | undefined;
  total_completed_tasks: number | null | undefined;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  task_title: string;
  created_at: string;
  is_verified?: boolean;
}

export interface ReviewsResponse {
  reviews: Review[];
  page: number;
  total_pages: number;
  total_reviews: number;
  has_next: boolean;
}

export interface SubmitReviewRequest {
  task_id: string;
  tasker_id: string;
  rating: number;
  comment?: string;
}

export class RatingService {
  private static api = createApi(API_CONFIG.BASE_URL);

  /**
   * Get rating statistics for a user
   */
  static async getUserRatingStats(userId: string): Promise<RatingStats> {
    try {
      console.log(`📊 Fetching rating stats for user: ${userId}`);
      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/rating-stats`);
      console.log('✅ Rating stats fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch rating stats from API:', error?.message);
      
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
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      console.log(`📝 Fetching reviews for user: ${userId}, page: ${page}`);
      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/reviews`, {
        params: { page, limit }
      });
      console.log('✅ Reviews fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch reviews from API:', error?.message);
      
      // Return empty reviews for fallback
      throw new Error('Unable to load reviews');
    }
  }

  /**
   * Submit a review for a completed task
   */
  static async submitReview(reviewData: SubmitReviewRequest): Promise<Review> {
    try {
      console.log('📝 Submitting review:', reviewData);
      const response = await this.api.post(`${API_CONFIG.ENDPOINTS.USERS}/reviews`, reviewData);
      console.log('✅ Review submitted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to submit review:', error?.message);
      throw new Error('Unable to submit review');
    }
  }

  /**
   * Get reviews given by the current user
   */
  static async getMyReviews(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      console.log('📋 Fetching my reviews, page:', page);
      const response = await this.api.get(`${API_CONFIG.ENDPOINTS.USERS}/reviews/my-reviews`, {
        params: { page, limit }
      });
      console.log('✅ My reviews fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch my reviews:', error?.message);
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
      console.log(`📝 Updating review ${reviewId}:`, updateData);
      const response = await this.api.put(`${API_CONFIG.ENDPOINTS.USERS}/reviews/${reviewId}`, updateData);
      console.log('✅ Review updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update review:', error?.message);
      throw new Error('Unable to update review');
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting review: ${reviewId}`);
      await this.api.delete(`${API_CONFIG.ENDPOINTS.USERS}/reviews/${reviewId}`);
      console.log('✅ Review deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete review:', error?.message);
      throw new Error('Unable to delete review');
    }
  }
}