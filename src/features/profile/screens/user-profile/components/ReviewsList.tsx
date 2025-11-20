import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Review {
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

interface ReviewsListProps {
  reviews: Review[] | undefined;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color={index < rating ? "#FFD700" : "#E0E0E0"}
      />
    ));
  };

  return (
    <View style={styles.reviewItem}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {review.reviewer_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewerDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
              {review.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color="#28A745" style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
          </View>
        </View>
        
        <View style={styles.starsContainer}>
          {renderStars(review.rating)}
        </View>
      </View>

      {/* Task Reference */}
      <View style={styles.taskReference}>
        <Ionicons name="briefcase-outline" size={14} color="#666" />
        <Text style={styles.taskTitle} numberOfLines={1}>{review.task_title}</Text>
      </View>

      {/* Review Comment */}
      {review.comment && review.comment.trim() && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );
};

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbox-outline" size={48} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No reviews yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Reviews from completed tasks will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading && !hasMore) return null;
    
    return (
      <View style={styles.footer}>
        {loading && <Text style={styles.loadingText}>Loading more reviews...</Text>}
        {!loading && hasMore && (
          <Text style={styles.loadMoreText}>Pull to load more</Text>
        )}
      </View>
    );
  };

  if (!reviews || (reviews.length === 0 && !loading)) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews && reviews.length > 0 && (
          <Text style={styles.reviewCount}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {(reviews || []).map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
        {renderFooter()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    maxHeight: 300, // Limit height to avoid infinite scrolling issues
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reviewerDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  taskReference: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  reviewComment: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#007AFF',
  },
});