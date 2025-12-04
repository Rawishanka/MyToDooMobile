import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GetMoreReviewsSection } from './GetMoreReviewsSection';
import { OverallRatingSection } from './OverallRatingSection';
import { ReviewsList } from './ReviewsList';

// Mock data for demonstration
const mockRatingData = {
  stats: {
    overall_rating: 4.2,
    total_reviews: 12,
    rating_distribution: {
      "5": 7,
      "4": 3,
      "3": 1,
      "2": 1,
      "1": 0,
    },
    completion_rate: 94,
    total_completed_tasks: 47,
  },
  reviews: [
    {
      id: '1',
      reviewer_id: 'user1',
      reviewer_name: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent work! Very professional and completed the task perfectly. Would definitely hire again.',
      task_title: 'House cleaning service',
      created_at: '2024-11-10T10:30:00Z',
      is_verified: true,
    },
    {
      id: '2',
      reviewer_id: 'user2',
      reviewer_name: 'Michael Chen',
      rating: 4,
      comment: 'Great communication and quality work. Finished on time as promised.',
      task_title: 'Furniture assembly',
      created_at: '2024-11-08T14:15:00Z',
      is_verified: true,
    },
    {
      id: '3',
      reviewer_id: 'user3',
      reviewer_name: 'Emma Davis',
      rating: 5,
      comment: 'Amazing attention to detail. The garden looks fantastic!',
      task_title: 'Garden landscaping',
      created_at: '2024-11-05T09:45:00Z',
      is_verified: false,
    },
    {
      id: '4',
      reviewer_id: 'user4',
      reviewer_name: 'James Wilson',
      rating: 4,
      comment: 'Good service, prompt delivery. Very satisfied with the outcome.',
      task_title: 'Appliance repair',
      created_at: '2024-11-02T16:20:00Z',
      is_verified: true,
    },
    {
      id: '5',
      reviewer_id: 'user5',
      reviewer_name: 'Lisa Brown',
      rating: 3,
      comment: 'Decent work, but took longer than expected to complete.',
      task_title: 'Painting job',
      created_at: '2024-10-28T11:10:00Z',
      is_verified: false,
    },
  ],
  pagination: {
    page: 1,
    total_pages: 3,
    total_reviews: 12,
    has_next: true,
  },
};

interface RatingSystemDemoProps {
  userId?: string;
}

export const RatingSystemDemo: React.FC<RatingSystemDemoProps> = ({ 
  userId = 'demo-user-123' 
}) => {
  const handleLoadMore = () => {

    // In real implementation, this would fetch more data
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Rating & Review System Demo</Text>
        
        {/* Overall Rating Section */}
        <OverallRatingSection
          averageRating={mockRatingData.stats.overall_rating}
          totalReviews={mockRatingData.stats.total_reviews}
          ratingDistribution={mockRatingData.stats.rating_distribution}
          completionRate={mockRatingData.stats.completion_rate}
          totalTasks={mockRatingData.stats.total_completed_tasks}
        />
        
        {/* Get More Reviews Section */}
        <GetMoreReviewsSection 
          userId={userId}
        />
        
        {/* Reviews List */}
        <ReviewsList
          reviews={mockRatingData.reviews}
          loading={false}
          onLoadMore={handleLoadMore}
          hasMore={mockRatingData.pagination.has_next}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Demo showing rating system with {mockRatingData.stats.total_reviews} reviews
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});