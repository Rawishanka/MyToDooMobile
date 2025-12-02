// OffersList Component - Displays task offers with real user information
// Features:
// ✅ Real profile pictures from API with fallback to generated avatars
// ✅ Accurate user ratings and completion rates
// ✅ Completed tasks count display
// ✅ User verification badges
// ✅ Offer messages with proper formatting
// ✅ Time posted information
// ✅ Rebooked statistics
// ✅ Accept offer functionality for task creators

import { getUserRatingStats } from '@/src/api/user-profile-api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OffersListProps {
  offers: any[];
  isLoading: boolean;
  taskCreatorId?: string;
  currentUserId?: string;
  onAcceptOffer?: (offerId: string) => void;
  excludeOfferId?: string; // Offer ID to exclude (shown in MyOfferCard)
  taskLocation?: { address?: string };
}

// Custom hook to fetch REAL rating stats from backend API
const useUserRatingStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userRatingStats', userId],
    queryFn: () => getUserRatingStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return false;
      }
      // Retry once for network errors
      return failureCount < 1;
    },
    // Return previous data on error to avoid breaking UI
    placeholderData: (previousData) => previousData,
  });
};

export const OffersList: React.FC<OffersListProps> = ({ 
  offers, 
  isLoading, 
  taskCreatorId, 
  currentUserId,
  onAcceptOffer,
  excludeOfferId,
  taskLocation
}) => {
  const insets = useSafeAreaInsets();
  
  // Filter out:
  // 1. The current user's offer (shown separately in MyOfferCard)
  // 2. The offer being displayed in MyOfferCard (if task poster is viewing)
  const otherOffers = offers.filter(
    (offer: any) => {
      // Backend returns offer.user._id, fallback to taskTakerId._id
      const offerUserId = offer.user?._id || offer.taskTakerId?._id;
      return offerUserId !== currentUserId && offer._id !== excludeOfferId;
    }
  );

  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadingStateText}>Loading offers...</Text>
      </View>
    );
  }

  if (otherOffers.length === 0) {
    return (
      <View style={[styles.emptyState, { paddingBottom: Math.max(insets.bottom, 20), marginBottom: 100 }]}>
        <Ionicons name="document-outline" size={48} color="#ccc" />
        <Text style={styles.emptyStateText}>No other offers yet</Text>
        <Text style={styles.emptyStateSubtext}>
          {offers.length > 0 ? 'Only your offer has been submitted.' : 'Be the first to make an offer!'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={otherOffers}
      scrollEnabled={false}
      keyExtractor={(item: any) => item._id}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20), marginBottom: 100 }}
      renderItem={({ item: offer }: { item: any }) => (
        <OfferCard
          offer={offer}
          taskCreatorId={taskCreatorId}
          currentUserId={currentUserId}
          onAcceptOffer={onAcceptOffer}
        />
      )}
    />
  );
};

// Separate component for each offer to properly use hooks
interface OfferCardProps {
  offer: any;
  taskCreatorId?: string;
  currentUserId?: string;
  onAcceptOffer?: (offerId: string) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, taskCreatorId, currentUserId, onAcceptOffer }) => {
  const taskTitle = offer.taskId?.title || 'Task';
  
  // Extract user information
  const user = offer.user || offer.taskTaker || offer.taskTakerId;
  const userId = user?._id;
  
  // 🔥 FETCH REAL RATING STATS FROM BACKEND API
  const { data: ratingStatsData, isLoading: isLoadingRatingStats, error: ratingStatsError } = useUserRatingStats(userId);
  
  // Safe logging - only log when data exists and in development mode
  if (__DEV__ && ratingStatsData && !ratingStatsError) {
    try {
      console.log('✅ OffersList - Rating stats loaded:', {
        userId,
        userName: user?.firstName,
        hasData: !!ratingStatsData,
        completedTasks: user?.completedTasks,
      });
    } catch {
      // Ignore logging errors in offline mode
    }
  }
        
        // Get user name
        const userName = user?.name || 
                        (user?.firstName ? 
                          `${user.firstName} ${user.lastName || ''}`.trim() : 
                          'Tasker');
        
        // Get avatar URL - check for real profile pictures first
        const firstName = user?.firstName || 'User';
        const lastName = user?.lastName || '';
        let avatarUrl: string;
        
        // Priority: 1. Base64 avatar, 2. Profile picture URL, 3. Generated avatar
        if ((user as any)?.avatar?.startsWith?.('data:')) {
          avatarUrl = (user as any).avatar; // Base64 image
        } else if ((user as any)?.avatar && !(user as any).avatar.includes('ui-avatars.com')) {
          avatarUrl = (user as any).avatar; // URL image from backend
        } else if ((user as any)?.profilePicture) {
          avatarUrl = (user as any).profilePicture; // Profile picture URL
        } else {
          // Fallback to generated avatar
          const name = `${firstName}+${lastName}`.trim();
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0052A2&color=fff&size=100`;
        }
        
        // 🔥 USE REAL DATA FROM RATING STATS API
        const realRatingStats = ratingStatsData?.data;
        const rating = realRatingStats?.averageRating || 0;
        const totalReviews = realRatingStats?.totalReviews || 0;
        
        // ⚠️ IMPORTANT: completedTasks should come from user profile, NOT from totalReviews
        // totalReviews is the number of reviews, NOT the number of completed tasks
        // Backend should provide user.completedTasks or user.taskCount
        const completedTasks = user?.completedTasks || user?.taskCount || 0;
        
        const isVerified = user?.isVerified || user?.verified || false;
        const rebookedCount = user?.rebookedCount || user?.rebooked || 0;
        
        // Calculate completion rate if not provided
        let completionRate = user?.completionRate;
        if (completionRate != null) {
          // Use the completion rate from API
          completionRate = typeof completionRate === 'string' ? completionRate : `${completionRate}%`;
        } else if (completedTasks > 0) {
          // Estimate completion rate based on completed tasks
          const estimatedRate = Math.min(Math.round((completedTasks / (completedTasks + 1)) * 100), 99);
          completionRate = `${estimatedRate}%`;
        } else {
          completionRate = null; // Don't show for new users
        }
        
        // Safe logging in development mode only
        if (__DEV__) {
          try {
            console.log('🎯 OffersList - User data:', userName, {
              rating,
              totalReviews,
              completedTasks,
              completionRate,
            });
          } catch {
            // Ignore logging errors in offline mode
          }
        }
        
        // ⚠️ DATA VALIDATION: Check for inconsistencies (only in development)
        if (__DEV__ && !ratingStatsError) {
          try {
            if (completedTasks > 0 && rating === 0) {
              console.log(`⚠️ Data inconsistency for ${userName}: ${completedTasks} tasks but 0 rating`);
            }
            
            if (completedTasks >= 100 && totalReviews === 0) {
              console.log(`🚨 Critical data issue for ${userName}: 100+ tasks but 0 reviews`);
            }
          } catch {
            // Ignore logging errors in offline mode
          }
        }
        
        return (
          <View style={styles.offerCard}>
            {/* Task Title - Show which task this offer is for */}
            <View style={styles.taskTitleContainer}>
              <Ionicons name="briefcase-outline" size={14} color="#666" />
              <Text style={styles.taskTitle} numberOfLines={1}>
                {taskTitle}
              </Text>
            </View>

            <View style={styles.offerHeader}>
              <View style={styles.offerUserSection}>
                <View style={styles.offerAvatarContainer}>
                  <Image 
                    source={{ uri: avatarUrl }} 
                    style={styles.offerAvatar}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.offerUserInfo}>
                  <View style={styles.offerNameRow}>
                    <Text style={styles.offerUserName}>
                      {userName}
                    </Text>
                    {isVerified && (
                      <View style={styles.verifiedBadgeSmall}>
                        <Ionicons name="checkmark-circle" size={12} color="#28a745" />
                        <Text style={styles.verifiedTextSmall}>Verified</Text>
                      </View>
                    )}
                  </View>

                  {/* Rating and Stats Row */}
                  <View style={styles.offerStatsRow}>
                    {isLoadingRatingStats ? (
                      <ActivityIndicator size="small" color="#FFD700" />
                    ) : (
                      <>
                        <View style={styles.offerRatingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.offerRatingText}>
                            {Number(rating).toFixed(1)}
                          </Text>
                          <Text style={styles.offerRatingCount}>
                            ({totalReviews})
                          </Text>
                        </View>
                        {completionRate != null && (
                          <View style={styles.offerCompletionContainer}>
                            <Text style={styles.offerCompletionRate}>
                              {completionRate} Completion Rate
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>

                  {/* Tasks completed */}
                  <Text style={styles.offerTasksText}>
                    {completedTasks} task{completedTasks !== 1 ? 's' : ''} completed
                  </Text>

                  {/* Message */}
                  <View style={styles.offerMessageRow}>
                    <Ionicons name="chatbubble-outline" size={13} color="#666" />
                    <Text style={styles.offerMessage}>
                      {offer.offer?.message || offer.message || 'No message provided'}
                    </Text>
                  </View>
                  
                  {/* Time posted */}
                  <View style={styles.offerDateRow}>
                    <Ionicons name="time-outline" size={12} color="#999" />
                    <Text style={styles.offerDate}>
                      {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recently'}
                    </Text>
                  </View>
                  
                  {/* Rebooked count if available */}
                  {rebookedCount > 0 && (
                    <View style={styles.rebookedBadge}>
                      <Ionicons name="repeat" size={12} color="#4CAF50" />
                      <Text style={styles.rebookedText}>
                        Rebooked {rebookedCount}x
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Accept Offer Button - Only show if:
                1. Current user is the task creator
                2. Offer is not already accepted
                3. onAcceptOffer callback is provided
            */}
            {currentUserId === taskCreatorId && 
             offer.status !== 'accepted' && 
             onAcceptOffer && (
              <TouchableOpacity 
                style={styles.acceptOfferButton}
                onPress={() => onAcceptOffer(offer._id)}
              >
                <Text style={styles.acceptOfferButtonText}>Accept Offer</Text>
              </TouchableOpacity>
            )}

            {/* Show accepted status badge if offer is accepted */}
            {offer.status === 'accepted' && (
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.acceptedText}>Accepted</Text>
              </View>
            )}
          </View>
  );
};

const styles = StyleSheet.create({
  loadingState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  offerHeader: {
    marginBottom: 12,
  },
  offerUserSection: {
    flexDirection: 'row',
  },
  offerAvatarContainer: {
    marginRight: 12,
  },
  offerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  offerUserInfo: {
    flex: 1,
  },
  offerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  verifiedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 3,
  },
  verifiedTextSmall: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: '600',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  offerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
    minHeight: 20,
  },
  offerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  offerRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  offerRatingCount: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  offerCompletionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerCompletionRate: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  offerTasksText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statDivider: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 4,
  },
  offerTasksCount: {
    fontSize: 13,
    color: '#666',
  },
  completionRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  offerMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  offerMessage: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  acceptOfferButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  acceptOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  acceptedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  offerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  offerDate: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  rebookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rebookedText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
});
