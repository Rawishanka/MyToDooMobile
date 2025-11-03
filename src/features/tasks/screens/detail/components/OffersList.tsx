import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface OffersListProps {
  offers: any[];
  isLoading: boolean;
}

export const OffersList: React.FC<OffersListProps> = ({ offers, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadingStateText}>Loading offers...</Text>
      </View>
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="document-outline" size={48} color="#ccc" />
        <Text style={styles.emptyStateText}>No offers yet</Text>
        <Text style={styles.emptyStateSubtext}>Be the first to make an offer!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={offers}
      scrollEnabled={false}
      keyExtractor={(item: any) => item._id}
      renderItem={({ item: offer }: { item: any }) => (
        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <View style={styles.offerUserSection}>
              <View style={styles.offerAvatar}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
              <View style={styles.offerUserInfo}>
                <View style={styles.offerNameRow}>
                  <Text style={styles.offerUserName}>
                    {offer.taskTakerId?.firstName || 'Prasanna'}{' '}
                    {offer.taskTakerId?.lastName || 'Fernando'}
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

                <View style={styles.offerMessageRow}>
                  <Ionicons name="chatbubble-outline" size={12} color="#666" />
                  <Text style={styles.offerMessage}>
                    {offer.offer?.message || offer.message || 'HHHHHHH'}
                  </Text>
                </View>

                <View style={styles.offerDateRow}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.offerDate}>Relocated 17+ times in 2025</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: 6,
  },
  offerMessage: {
    fontSize: 13,
    color: '#333',
    marginLeft: 6,
    flex: 1,
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
