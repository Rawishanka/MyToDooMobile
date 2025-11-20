import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo);
  
  // Filter out:
  // 1. The current user's offer (shown separately in MyOfferCard)
  // 2. The offer being displayed in MyOfferCard (if task poster is viewing)
  const otherOffers = offers.filter(
    (offer: any) => 
      offer.taskTakerId?._id !== currentUserId && 
      offer._id !== excludeOfferId
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
      <View style={[styles.emptyState, { paddingBottom: Math.max(insets.bottom, 20) }]}>
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
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
      renderItem={({ item: offer }: { item: any }) => {
        // Handle both nested and flat offer structures
        const offerAmount = offer.offer?.amount || offer.amount || 0;
        const offerCurrency = offer.offer?.currency || offer.currency || 'SGD';
        const taskTitle = offer.taskId?.title || 'Task';
        
        // Debug logging
        console.log('OffersList - Raw offer data:', JSON.stringify(offer, null, 2));
        console.log('OffersList - Extracted amount:', offerAmount);
        
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
                <View style={styles.offerAvatar}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
                <View style={styles.offerUserInfo}>
                  <View style={styles.offerNameRow}>
                    <Text style={styles.offerUserName}>
                      {offer.taskTakerId?.firstName || 'Tasker'}{' '}
                      {offer.taskTakerId?.lastName || ''}
                    </Text>
                    <Ionicons name="star" size={14} color="#007AFF" style={styles.verifiedIcon} />
                  </View>

                  <View style={styles.offerRating}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.offerRatingText}>
                      {offer.taskTakerId?.rating?.toFixed(1) || '4.4'}
                    </Text>
                    <Text style={styles.offerRatingCount}>
                      ({offer.taskTakerId?.completedTasks || 352})
                    </Text>
                  </View>

                  <Text style={styles.offerCompletionRate}>
                    {offer.taskTakerId?.completionRate || '98%'} Completion Rate
                  </Text>

                  {/* Message */}
                  <View style={styles.offerMessageRow}>
                    <Ionicons name="chatbubble-outline" size={12} color="#666" />
                    <Text style={styles.offerMessage}>
                      {offer.offer?.message || offer.message || 'No message provided'}
                    </Text>
                  </View>
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
      }}
    />
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
  offerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  verifiedIcon: {
    marginLeft: 6,
  },
  offerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  offerRatingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  offerCompletionRate: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
  },
  offerMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerMessage: {
    fontSize: 13,
    color: '#333',
    marginLeft: 6,
    flex: 1,
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
  },
  offerDate: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
});
