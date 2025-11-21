import { useEffect, useState } from 'react';
import { type RatingStats, type Review } from '../services/ratingService';

export interface UserRatingData {
  stats: RatingStats;
  reviews: Review[] | undefined;
  pagination: {
    page: number;
    total_pages: number;
    total_reviews: number;
    has_next: boolean;
  };
}

interface UseUserRatingResult {
  ratingData: UserRatingData | null;
  loading: boolean;
  error: string | null;
  loadMoreReviews: () => void;
  refreshRatings: () => void;
}

export const useUserRating = (userId: string): UseUserRatingResult => {
  const [ratingData, setRatingData] = useState<UserRatingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRatings = async (page: number = 1, append: boolean = false) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Import the RatingService
      const { RatingService } = await import('../services/ratingService');
      
      try {
        // Fetch rating stats and reviews in parallel from API
        const [stats, reviewsResponse] = await Promise.all([
          RatingService.getUserRatingStats(userId),
          RatingService.getUserReviews(userId, page, 10)
        ]);

        const newRatingData: UserRatingData = {
          stats,
          reviews: append && ratingData && ratingData.reviews
            ? [...ratingData.reviews, ...reviewsResponse.reviews]
            : reviewsResponse.reviews,
          pagination: {
            page: reviewsResponse.page,
            total_pages: reviewsResponse.total_pages,
            total_reviews: reviewsResponse.total_reviews,
            has_next: reviewsResponse.has_next,
          }
        };

        setRatingData(newRatingData);
        setCurrentPage(page);
      } catch (apiError) {
        console.warn('🔄 Rating API not available, using fallback data:', apiError);
        
        // Fallback data when API is not available
        const fallbackData: UserRatingData = {
          stats: {
            overall_rating: 0,
            total_reviews: 0,
            rating_distribution: {
              "5": 0,
              "4": 0,
              "3": 0,
              "2": 0,
              "1": 0,
            },
            completion_rate: 0,
            total_completed_tasks: 0,
          },
          reviews: [],
          pagination: {
            page: 1,
            total_pages: 0,
            total_reviews: 0,
            has_next: false,
          }
        };

        setRatingData(fallbackData);
        setCurrentPage(page);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ratings';
      setError(errorMessage);
      console.error('Error fetching user ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!ratingData?.pagination.has_next || loading) return;
    
    const nextPage = currentPage + 1;
    await fetchRatings(nextPage, true);
  };

  const refreshRatings = async () => {
    await fetchRatings(1, false);
  };

  useEffect(() => {
    if (userId) {
      fetchRatings(1, false);
    }
  }, [userId]);

  return {
    ratingData,
    loading,
    error,
    loadMoreReviews,
    refreshRatings,
  };
};