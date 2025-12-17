import { useGetUserReviews } from '@/src/shared/hooks/useUserProfileApi';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Review {
  _id: string;
  reviewedUser?: string;
  revieweeId?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  reviewerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  reviewer?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  reviewText: string;
  taskId?: string | {
    _id: string;
    title: string;
  };
  task?: {
    _id: string;
    title: string;
    status?: string;
  };
  role?: "poster" | "tasker";
  reviewerRole?: "poster" | "tasker";
  response?: {
    text?: string;
    responseText?: string;
    respondedAt: string;
  };
  attachments?: {
    fileId?: string;
    url: string;
    secureUrl?: string;
    thumbnail?: string;
    resourceType: string;
    format?: string;
    size?: number;
    uploadedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
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
  
  // Get reviewer info - handle both populated and non-populated cases
  const reviewer = review.reviewer || review.reviewerId || review.revieweeId;
  
  // Check if reviewer is a populated object with firstName/lastName or just an ID string
  const isPopulated = reviewer && typeof reviewer === 'object' && 'firstName' in reviewer;
  
  const reviewerName = isPopulated
    ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || 'Anonymous'
    : review.reviewerRole 
      ? `${review.reviewerRole.charAt(0).toUpperCase() + review.reviewerRole.slice(1)} User`
      : 'Anonymous';
  
  // Get avatar initial
  const getAvatarInitial = () => {
    if (isPopulated) {
      if (reviewer.firstName && reviewer.firstName.length > 0) {
        return reviewer.firstName.charAt(0).toUpperCase();
      }
      if (reviewer.lastName && reviewer.lastName.length > 0) {
        return reviewer.lastName.charAt(0).toUpperCase();
      }
    }
    // Fallback to role initial if not populated
    return review.reviewerRole ? review.reviewerRole.charAt(0).toUpperCase() : 'A';
  };
  
  // Get task title
  let taskTitle = 'Task';
  if (review.task) {
    taskTitle = review.task.title;
  } else if (review.taskId && typeof review.taskId === 'object') {
    taskTitle = review.taskId.title;
  }

  return (
    <View style={styles.reviewItem}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getAvatarInitial()}
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
      
      {/* Attachments */}
      {review.attachments && review.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsScroll}>
            {review.attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentItem}>
                {attachment.resourceType === 'image' ? (
                  <Image
                    source={{ uri: attachment.url || attachment.secureUrl }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.attachmentFile}>
                    <Ionicons name="document-outline" size={32} color="#007AFF" />
                    <Text style={styles.attachmentFileName} numberOfLines={1}>
                      {attachment.format || 'file'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Response */}
      {review.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>
            {review.response.responseText || review.response.text || ''}
          </Text>
        </View>
      )}
    </View>
  );
};

interface ReviewsListProps {
  userId: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ userId }) => {
  const [activeRole, setActiveRole] = React.useState<'tasker' | 'poster'>('poster');
  const [currentPage, setCurrentPage] = React.useState(1);
  const limit = 10;

  // Fetch reviews for the specific user (reviews RECEIVED by this user)
  const {
    data: reviewData,
    isLoading,
  } = useGetUserReviews(userId, currentPage, limit, activeRole, !!userId);

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 ReviewsList Debug:", {
      userId,
      activeRole,
      currentPage,
      isLoading,
      reviewCount: reviewData?.reviews?.length || 0,
      hasMore: reviewData?.pagination?.hasMore || false,
    });
  }, [userId, activeRole, currentPage, reviewData, isLoading]);

  const reviews = reviewData?.reviews || [];
  const pagination = reviewData?.pagination;

  const hasMore = pagination ? pagination.currentPage < pagination.totalPages : false;

  // Handle scroll to bottom for loading more
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (hasMore && !isLoading) {
        setCurrentPage(prev => prev + 1);
      }
    }
  };

  // Reset page when switching roles
  const handleRoleChange = (role: 'tasker' | 'poster') => {
    setActiveRole(role);
    setCurrentPage(1);
  };

  // React Query automatically refetches when query key changes (currentPage, activeRole)
  // No need for manual refetch - removing to prevent infinite loop!

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbox-outline" size={48} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No reviews yet</Text>
      <Text style={styles.emptyStateSubtext}>
        {activeRole === 'tasker' 
          ? 'Reviews from tasks you completed as a tasker will appear here'
          : 'Reviews from tasks you posted will appear here'
        }
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading && !hasMore) return null;
    
    return (
      <View style={styles.footer}>
        {isLoading && (
          <>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading reviews...</Text>
          </>
        )}
        {!isLoading && hasMore && (
          <Text style={styles.loadMoreText}>Scroll down to load more</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
      </View>

      {/* Role Toggle Buttons */}
      <View style={styles.roleToggleContainer}>
        <TouchableOpacity
          style={[
            styles.roleToggleButton,
            activeRole === 'tasker' && styles.roleToggleButtonActive
          ]}
          onPress={() => handleRoleChange('tasker')}
        >
          <Ionicons
            name="hammer"
            size={18}
            color={activeRole === 'tasker' ? '#FFF' : '#666'}
          />
          <Text
            style={[
              styles.roleToggleText,
              activeRole === 'tasker' && styles.roleToggleTextActive
            ]}
          >
            As Tasker
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleToggleButton,
            activeRole === 'poster' && styles.roleToggleButtonActive
          ]}
          onPress={() => handleRoleChange('poster')}
        >
          <Ionicons
            name="briefcase"
            size={18}
            color={activeRole === 'poster' ? '#FFF' : '#666'}
          />
          <Text
            style={[
              styles.roleToggleText,
              activeRole === 'poster' && styles.roleToggleTextActive
            ]}
          >
            As Poster
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info - Remove after testing */}
      {__DEV__ && (
        <View style={{ padding: 10, backgroundColor: '#f0f0f0', marginHorizontal: 16, marginVertical: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
            DEBUG: UserId: {userId} | Role: {activeRole} | Page: {currentPage} | Loading: {isLoading.toString()} | Reviews: {reviews.length} | Has More: {hasMore.toString()}
          </Text>
        </View>
      )}

      {/* Reviews List or Empty State */}
      {reviews.length === 0 && !isLoading ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {reviews.map((review: Review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
          {renderFooter()}
        </ScrollView>
      )}
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
  roleToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#F8F9FA',
  },
  roleToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  roleToggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  roleToggleTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  averageRatingContainer: {
    alignItems: 'center',
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  totalReviewsText: {
    fontSize: 14,
    color: '#666',
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  attachmentsScroll: {
    flexDirection: 'row',
  },
  attachmentItem: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  attachmentFile: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentFileName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});