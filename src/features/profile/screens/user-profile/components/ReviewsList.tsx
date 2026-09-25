import { normalizeCDNUrl } from '@/src/api/cdn-api';
import { useGetUserReviews } from '@/src/shared/hooks/useUserProfileApi';
import { formatUserName } from '@/src/utils/formatUserName';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

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
    categories?: string[];
  };
  task?: {
    _id: string;
    title: string;
    status?: string;
    categories?: string[];
  };
  category?: string | null;
  categories?: string[];
  locked?: boolean;
  message?: string;
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
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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
        color={index < rating ? "#F59E0B" : "rgba(255,255,255,0.3)"}
      />
    ));
  };
  
  // Get reviewer info - handle both populated and non-populated cases
  const reviewer = review.reviewer || review.reviewerId || review.revieweeId;
  
  // Check if reviewer is a populated object with firstName/lastName or just an ID string
  const isPopulated = reviewer && typeof reviewer === 'object' && 'firstName' in reviewer;
  
  const reviewerName = isPopulated
    ? formatUserName(reviewer.firstName, reviewer.lastName)
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

  const categoryLabel =
    review.category ||
    review.categories?.[0] ||
    (review.task?.categories && review.task.categories[0]) ||
    (typeof review.taskId === 'object' && review.taskId?.categories?.[0]) ||
    null;

  if (review.locked) {
    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getAvatarInitial()}</Text>
            </View>
            <View style={styles.reviewerDetails}>
              <View style={styles.nameContainer}>
                <Text style={styles.reviewerName}>{reviewerName}</Text>
                {categoryLabel ? (
                  <Text style={styles.categoryBadge}>{categoryLabel}</Text>
                ) : null}
              </View>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color="#FBBF24" />
        </View>
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedBannerText}>
            {review.message || 'Submit your review to see theirs'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.reviewItem, isDarkMode && { borderBottomColor: '#334155' }]}>
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
              <Text style={[styles.reviewerName, isDarkMode && { color: '#F8FAFC' }]}>{reviewerName}</Text>
              {categoryLabel ? (
                <Text style={[styles.categoryBadge, isDarkMode && { color: '#93C5FD', backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>{categoryLabel}</Text>
              ) : null}
            </View>
            <Text style={[styles.reviewDate, isDarkMode && { color: '#94A3B8' }]}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.starsContainer}>
          {renderStars(review.rating)}
        </View>
      </View>

      {/* Task Reference */}
      {review.task && (
        <View style={styles.taskReference}>
          <Ionicons name="briefcase-outline" size={14} color={isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.7)'} />
          <Text style={[styles.taskTitle, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>{taskTitle}</Text>
        </View>
      )}

      {/* Review Comment */}
      {review.reviewText && review.reviewText.trim() && (
        <Text style={[styles.reviewComment, isDarkMode && { color: '#E2E8F0' }]}>{review.reviewText}</Text>
      )}
      
      {/* Attachments */}
      {review.attachments && review.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={[styles.attachmentsLabel, isDarkMode && { color: '#F8FAFC' }]}>Attachments:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsScroll}>
            {review.attachments.map((attachment, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.attachmentItem}
                onPress={() => {
                  if (attachment.resourceType === 'image') {
                    setSelectedImage(normalizeCDNUrl(attachment.secureUrl || attachment.url));
                  }
                }}
                activeOpacity={attachment.resourceType === 'image' ? 0.7 : 1}
              >
                {attachment.resourceType === 'image' ? (
                  <Image
                    source={{ uri: normalizeCDNUrl(attachment.secureUrl || attachment.url) }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.attachmentFile}>
                    <Ionicons name="document-outline" size={32} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
                    <Text style={styles.attachmentFileName} numberOfLines={1}>
                      {attachment.format || 'file'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={40} color="#FFF" />
              </TouchableOpacity>
              
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Response */}
      {review.response && (
        <View style={[styles.responseContainer, isDarkMode && { backgroundColor: '#0F172A', borderLeftColor: '#38BDF8' }]}>
          <Text style={[styles.responseLabel, isDarkMode && { color: '#38BDF8' }]}>Response:</Text>
          <Text style={[styles.responseText, isDarkMode && { color: '#CBD5E1' }]}>
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
  const { isDarkMode } = useTheme();
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
      <View style={[styles.emptyCircle, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <Ionicons name="chatbox-outline" size={34} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
      </View>
      <Text style={[styles.emptyStateTitle, isDarkMode && { color: '#F8FAFC' }]}>No reviews yet</Text>
      <Text style={[styles.emptyStateSubtext, isDarkMode && { color: '#94A3B8' }]}>
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
            <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
            <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading reviews...</Text>
          </>
        )}
        {!isLoading && hasMore && (
          <Text style={[styles.loadMoreText, isDarkMode && { color: '#38BDF8' }]}>Scroll down to load more</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={[styles.headerContainer, isDarkMode && { borderBottomColor: '#334155' }]}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Reviews</Text>
      </View>

      {/* 2026 Modern Segmented Pill Control */}
      <View style={[
        styles.roleToggleContainer,
        isDarkMode && { backgroundColor: '#0B1120', borderColor: '#334155' }
      ]}>
        <TouchableOpacity
          style={[
            styles.roleToggleButton,
            activeRole === 'tasker'
              ? (isDarkMode
                  ? { backgroundColor: '#2563EB', shadowColor: '#2563EB', shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 }
                  : styles.roleToggleButtonActive)
              : { backgroundColor: 'transparent', borderWidth: 0 }
          ]}
          onPress={() => handleRoleChange('tasker')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="hammer"
            size={18}
            color={activeRole === 'tasker' ? (isDarkMode ? '#FFF' : '#003399') : (isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)')}
          />
          <Text
            style={[
              styles.roleToggleText,
              isDarkMode && { color: '#94A3B8' },
              activeRole === 'tasker' && { color: isDarkMode ? '#FFFFFF' : '#003399', fontWeight: '700' }
            ]}
          >
            As Tasker
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleToggleButton,
            activeRole === 'poster'
              ? (isDarkMode
                  ? { backgroundColor: '#2563EB', shadowColor: '#2563EB', shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 }
                  : styles.roleToggleButtonActive)
              : { backgroundColor: 'transparent', borderWidth: 0 }
          ]}
          onPress={() => handleRoleChange('poster')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="briefcase"
            size={18}
            color={activeRole === 'poster' ? (isDarkMode ? '#FFF' : '#003399') : (isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)')}
          />
          <Text
            style={[
              styles.roleToggleText,
              isDarkMode && { color: '#94A3B8' },
              activeRole === 'poster' && { color: isDarkMode ? '#FFFFFF' : '#003399', fontWeight: '700' }
            ]}
          >
            As Poster
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info - Remove after testing */}
      {__DEV__ && (
        <View style={{ padding: 10, backgroundColor: '#f0f0f0', marginHorizontal: 16, marginVertical: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: RFValue(10), fontFamily: 'monospace' }}>
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.14)',
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
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
    borderBottomColor: 'rgba(255,255,255,0.14)',
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
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: RFValue(18),
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
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  categoryBadge: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 120,
  },
  lockedBanner: {
    backgroundColor: 'rgba(251,191,36,0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  lockedBannerText: {
    fontSize: RFValue(13),
    color: '#FBBF24',
    fontWeight: '500',
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  reviewDate: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
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
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  reviewComment: {
    fontSize: RFValue(16),
    color: '#FFFFFF',
    lineHeight: 22,
  },
  responseContainer: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
  },
  responseLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  responseText: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
  loadMoreText: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  roleToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: 'transparent',
    gap: 8,
  },
  roleToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#00114D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  roleToggleText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
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
    fontSize: RFValue(32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  totalReviewsText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentsLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  attachmentFileName: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});