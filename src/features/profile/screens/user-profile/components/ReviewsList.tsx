import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Review {
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
  
  const reviewerName = `${review.reviewer.firstName} ${review.reviewer.lastName}`;
  const taskTitle = review.task?.title || 'Task';

  return (
    <View style={styles.reviewItem}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {review.reviewer.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewerDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.reviewerName}>{reviewerName}</Text>
            </View>
            <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.starsContainer}>
          {renderStars(review.rating)}
        </View>
      </View>

      {/* Task Reference */}
      {review.task && (
        <View style={styles.taskReference}>
          <Ionicons name="briefcase-outline" size={14} color="#666" />
          <Text style={styles.taskTitle} numberOfLines={1}>{taskTitle}</Text>
        </View>
      )}

      {/* Review Comment */}
      {review.reviewText && review.reviewText.trim() && (
        <Text style={styles.reviewComment}>{review.reviewText}</Text>
      )}
      
      {/* Response */}
      {review.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{review.response.text}</Text>
        </View>
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
  // Ensure reviews is always an array
  const reviewsArray = Array.isArray(reviews) ? reviews : [];

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

  if (reviewsArray.length === 0 && !loading) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviewsArray.length > 0 && (
          <Text style={styles.reviewCount}>
            {reviewsArray.length} review{reviewsArray.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {reviewsArray.map((review) => (
          <ReviewItem key={review._id} review={review} />
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
  responseContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
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