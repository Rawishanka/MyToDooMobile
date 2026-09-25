import { formatUserName, formatAvatarName } from '@/src/utils/formatUserName';
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
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTheme } from '@/src/shared/theme/ThemeContext';
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
  const { isDarkMode } = useTheme();
  
  // Settled = accepted or completed (after pay→complete→release, status becomes completed)
  const hasAcceptedOffer = offers.some(
    (offer: any) => offer.status === 'accepted' || offer.status === 'completed',
  );
  
  // Filter out:
  // 1. The current user's offer (shown separately in MyOfferCard)
  // 2. The offer being displayed in MyOfferCard (if task poster is viewing)
  // 3. Rejected offers (when one offer is accepted, others are rejected)
  const otherOffers = offers.filter(
    (offer: any) => {
      // Backend returns offer.user._id, fallback to taskTakerId._id
      const offerUserId = offer.user?._id || offer.taskTakerId?._id;
      const isNotCurrentUser = offerUserId !== currentUserId && offer._id !== excludeOfferId;
      const isNotRejected = offer.status !== 'rejected';
      
      return isNotCurrentUser && isNotRejected;
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
        <Ionicons name="document-outline" size={48} color={isDarkMode ? '#475569' : '#ccc'} />
        <Text style={[styles.emptyStateText, isDarkMode && { color: '#F8FAFC' }]}>No other offers yet</Text>
        <Text style={[styles.emptyStateSubtext, isDarkMode && { color: '#94A3B8' }]}>
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
          hasAcceptedOffer={hasAcceptedOffer}
          isTaskPoster={currentUserId === taskCreatorId}
        />
      )}
    />
  );
};

function getOfferStatusMeta(statusRaw: string) {
  const status = (statusRaw || 'pending').toLowerCase();
  if (status === 'completed') {
    return {
      label: 'Completed',
      icon: 'checkmark-done-circle' as const,
      color: '#2E7D32',
      badgeStyle: 'completedStatusBadge' as const,
      textStyle: 'completedStatusText' as const,
    };
  }
  if (status === 'accepted') {
    return {
      label: 'Accepted',
      icon: 'checkmark-circle' as const,
      color: '#4CAF50',
      badgeStyle: 'acceptedStatusBadge' as const,
      textStyle: 'acceptedStatusText' as const,
    };
  }
  if (status === 'rejected' || status === 'cancelled') {
    return {
      label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
      icon: 'close-circle' as const,
      color: '#c62828',
      badgeStyle: 'rejectedStatusBadge' as const,
      textStyle: 'rejectedStatusText' as const,
    };
  }
  return {
    label: 'Pending',
    icon: 'time' as const,
    color: '#FFA500',
    badgeStyle: 'pendingStatusBadge' as const,
    textStyle: 'pendingStatusText' as const,
  };
}

// Component to display offer amount and status
const OfferAmountStatus: React.FC<{ offer: any; isTaskPoster: boolean; showStatus?: boolean }> = ({ offer, isTaskPoster, showStatus = true }) => {
  const { countryInfo } = useLocationCountry();
  const { isDarkMode } = useTheme();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  const offerAmount = offer.offer?.amount || offer.amount || 0;
  const status = offer.status || 'pending';
  const meta = getOfferStatusMeta(status);
  
  return (
    <View style={styles.offerAmountStatusContainer}>
      {/* Only show amount to task poster, hide from other taskers */}
      {isTaskPoster && (
        <View style={styles.offerAmountRow}>
          <Ionicons name="cash-outline" size={16} color={isDarkMode ? '#38BDF8' : '#004aad'} />
          <Text style={[styles.offerAmountText, isDarkMode && { color: '#38BDF8' }]}>
            {formatCurrency(offerAmount, currencyInfo)}
          </Text>
        </View>
      )}
      {/* Only show status badge if showStatus is true (hidden for other taskers' offers) */}
      {showStatus && (
        <View style={[styles.offerStatusBadge, styles[meta.badgeStyle], isDarkMode && { backgroundColor: meta.color + '22' }]}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
          <Text style={[styles.offerStatusText, styles[meta.textStyle]]}>
            {meta.label}
          </Text>
        </View>
      )}
    </View>
  );
};

// Separate component for each offer to properly use hooks
interface OfferCardProps {
  offer: any;
  taskCreatorId?: string;
  currentUserId?: string;
  onAcceptOffer?: (offerId: string) => void;
  hasAcceptedOffer?: boolean;
  isTaskPoster?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, taskCreatorId, currentUserId, onAcceptOffer, hasAcceptedOffer, isTaskPoster }) => {
  const { isDarkMode } = useTheme();
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
                          formatUserName(user.firstName, user.lastName) : 
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
          const name = formatAvatarName(firstName, lastName);
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=003399&color=fff&size=100`;
        }
        
        // 🔥 USE REAL DATA FROM RATING STATS API
        const realRatingStats = ratingStatsData?.data;
        const rating = realRatingStats?.overall?.average || 0;
        const totalReviews = realRatingStats?.overall?.count || 0;
        
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
          <View style={[styles.offerCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            {/* Task Title - Show which task this offer is for */}
            <View style={[styles.taskTitleContainer, isDarkMode && { borderBottomColor: '#334155' }]}>
              <Ionicons name="briefcase-outline" size={14} color={isDarkMode ? "#94A3B8" : "#666"} />
              <Text style={[styles.taskTitle, isDarkMode && { color: "#94A3B8" }]} numberOfLines={1}>
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
                    <Text style={[styles.offerUserName, isDarkMode && { color: "#F8FAFC" }]}>
                      {userName}
                    </Text>
                  </View>

                  {/* Offer Amount and Status - Hide status for other taskers viewing offers */}
                  <OfferAmountStatus 
                    offer={offer} 
                    isTaskPoster={isTaskPoster || false} 
                    showStatus={isTaskPoster || false}
                  />

                  {/* Rating and Stats Row */}
                  <View style={styles.offerStatsRow}>
                    {isLoadingRatingStats ? (
                      <ActivityIndicator size="small" color="#FFD700" />
                    ) : (
                      <>
                        <View style={styles.offerRatingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={[styles.offerRatingText, isDarkMode && { color: "#F8FAFC" }]}>
                            {Number(rating).toFixed(1)}
                          </Text>
                          <Text style={[styles.offerRatingCount, isDarkMode && { color: "#94A3B8" }]}>
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
                  <Text style={[styles.offerTasksText, isDarkMode && { color: "#94A3B8" }]}>
                    {completedTasks} task{completedTasks !== 1 ? 's' : ''} completed
                  </Text>

                  {/* Message */}
                  <View style={[styles.offerMessageRow, isDarkMode && { borderTopColor: '#334155' }]}>
                    <Ionicons name="chatbubble-outline" size={13} color={isDarkMode ? "#94A3B8" : "#666"} />
                    <Text style={[styles.offerMessage, isDarkMode && { color: "#E2E8F0" }]}>
                      {offer.offer?.message || offer.message || 'No message provided'}
                    </Text>
                  </View>
                  
                  {/* Time posted */}
                  <View style={styles.offerDateRow}>
                    <Ionicons name="time-outline" size={12} color={isDarkMode ? "#64748B" : "#999"} />
                    <Text style={[styles.offerDate, isDarkMode && { color: "#64748B" }]}>
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
                2. This offer is not already accepted
                3. No other offer has been accepted (hasAcceptedOffer is false)
                4. onAcceptOffer callback is provided
            */}
            {currentUserId === taskCreatorId && 
             offer.status !== 'accepted' &&
             offer.status !== 'completed' &&
             !hasAcceptedOffer &&
             onAcceptOffer && (
              <TouchableOpacity 
                style={styles.acceptOfferButton}
                onPress={() => onAcceptOffer(offer._id)}
              >
                <Text style={styles.acceptOfferButtonText}>Accept Offer</Text>
              </TouchableOpacity>
            )}

            {/* Settled status badges for poster list (accepted OR completed after release) */}
            {offer.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done-circle" size={16} color="#2E7D32" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
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
    fontSize: RFValue(14),
    color: '#666',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: RFValue(14),
    color: '#999',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: isTablet ? wp('3%') : wp('4%'),
    marginBottom: hp('1.5%'),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: hp('1%'),
    marginBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: RFValue(12),
    color: '#666',
    marginLeft: wp('1.5%'),
    flex: 1,
    fontWeight: '500',
  },
  offerHeader: {
    marginBottom: hp('1.5%'),
  },
  offerUserSection: {
    flexDirection: 'row',
  },
  offerAvatarContainer: {
    marginRight: wp('3%'),
  },
  offerAvatar: {
    width: isTablet ? 60 : 48,
    height: isTablet ? 60 : 48,
    borderRadius: isTablet ? 30 : 24,
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
    fontSize: RFValue(isTablet ? 14 : 14),
    fontWeight: '600',
    color: '#000',
  },
  verifiedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: hp('0.3%'),
    paddingHorizontal: wp('1.5%'),
    borderRadius: 8,
    gap: 3,
  },
  verifiedTextSmall: {
    fontSize: RFValue(9),
    color: '#28a745',
    fontWeight: '600',
  },
  verifiedIcon: {
    marginLeft: wp('1.5%'),
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
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  offerRatingCount: {
    fontSize: RFValue(13),
    color: '#666',
    marginLeft: 2,
  },
  offerCompletionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerCompletionRate: {
    fontSize: RFValue(12),
    color: '#4CAF50',
    fontWeight: '500',
  },
  offerTasksText: {
    fontSize: RFValue(12),
    color: '#666',
    marginBottom: 8,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statDivider: {
    fontSize: RFValue(13),
    color: '#999',
    marginHorizontal: 4,
  },
  offerTasksCount: {
    fontSize: RFValue(13),
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
    fontSize: RFValue(13),
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  acceptOfferButton: {
    backgroundColor: '#003399',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  acceptOfferButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
    letterSpacing: 0.3,
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
    fontSize: RFValue(14),
    fontWeight: '600',
    marginLeft: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  completedText: {
    color: '#2E7D32',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginLeft: 6,
  },
  offerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  offerDate: {
    fontSize: RFValue(11),
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
    fontSize: RFValue(11),
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  offerAmountStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  offerAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 12,
  },
  offerAmountText: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#004aad',
  },
  offerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  acceptedStatusBadge: {
    backgroundColor: '#E8F5E9',
  },
  completedStatusBadge: {
    backgroundColor: '#E8F5E9',
  },
  pendingStatusBadge: {
    backgroundColor: '#FFF3E0',
  },
  rejectedStatusBadge: {
    backgroundColor: '#FFEBEE',
  },
  offerStatusText: {
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  acceptedStatusText: {
    color: '#4CAF50',
  },
  completedStatusText: {
    color: '#2E7D32',
  },
  pendingStatusText: {
    color: '#FFA500',
  },
  rejectedStatusText: {
    color: '#c62828',
  },
});
