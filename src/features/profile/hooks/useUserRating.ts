import { useEffect, useState } from 'react';
import { type RatingStats, type Review } from '../services/ratingService';

export interface UserRatingData {
  stats: RatingStats;
  reviews: Review[] | undefined;
  pagination: {
    page: number;
    totalPages: number;
    totalReviews: number;
    hasMore: boolean;
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
            totalPages: reviewsResponse.totalPages,
            totalReviews: reviewsResponse.totalReviews,
            hasMore: reviewsResponse.hasMore,
          }
        };

        setRatingData(newRatingData);
        setCurrentPage(page);
      } catch (apiError) {
        console.warn('🔄 Rating API not available, using fallback data:', apiError);
        
        // Fallback data when API is not available
        const fallbackData: UserRatingData = {
          stats: {
            userId: userId,
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
              "5": 0,
              "4": 0,
              "3": 0,
              "2": 0,
              "1": 0,
            },
            asPoster: {
              averageRating: 0,
              totalReviews: 0,
            },
            asTasker: {
              averageRating: 0,
              totalReviews: 0,
            },
          },
          reviews: [],
          pagination: {
            page: 1,
            totalPages: 0,
            totalReviews: 0,
            hasMore: false,
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
    if (!ratingData?.pagination.hasMore || loading) return;
    
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