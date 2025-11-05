import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MyOfferCardProps {
  offer: any;
  isTaskPoster?: boolean;
  onAcceptOffer?: (offerId: string) => void;
}

export const MyOfferCard: React.FC<MyOfferCardProps> = ({ offer, isTaskPoster, onAcceptOffer }) => {
  // Handle both nested and flat offer structures
  const offerAmount = offer.offer?.amount || offer.amount || 0;
  const offerCurrency = offer.offer?.currency || offer.currency || 'SGD';
  const offerMessage = offer.offer?.message || offer.message || '';
  const status = offer.status || 'pending';
  
  // Debug logging to see what we're actually getting
  console.log('MyOfferCard - Raw offer data:', JSON.stringify(offer, null, 2));
  console.log('MyOfferCard - Extracted amount:', offerAmount);
  console.log('MyOfferCard - Extracted currency:', offerCurrency);
  
  // Determine if this is the task poster viewing someone else's offer
  const isViewingOthersOffer = isTaskPoster;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={20} color="#004aad" />
        <Text style={styles.headerText}>
          {isViewingOthersOffer ? 'Offer' : 'Your Offer'}
        </Text>
        {status === 'accepted' && (
          <View style={styles.acceptedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.acceptedText}>Accepted</Text>
          </View>
        )}
        {status === 'pending' && (
          <View style={styles.pendingBadge}>
            <Ionicons name="time" size={16} color="#FFA500" />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Offer Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            {isViewingOthersOffer ? 'Offer Amount:' : 'Your Offer Amount:'}
          </Text>
          <Text style={styles.amount}>
            ${offerAmount} {offerCurrency}
          </Text>
        </View>

        {/* Message */}
        {offerMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>
              {isViewingOthersOffer ? 'Message:' : 'Your Message:'}
            </Text>
            <Text style={styles.message}>{offerMessage}</Text>
          </View>
        )}

        {/* Accept Offer Button - Only shown to task poster */}
        {isTaskPoster && status !== 'accepted' && (
          <TouchableOpacity 
            style={styles.acceptOfferButton}
            onPress={() => onAcceptOffer && onAcceptOffer(offer._id)}
          >
            <Text style={styles.acceptOfferButtonText}>Accept Offer</Text>
          </TouchableOpacity>
        )}

        {/* Status Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {status === 'accepted' 
              ? isViewingOthersOffer
                ? 'This offer has been accepted.'
                : 'Congratulations! Your offer has been accepted.' 
              : isViewingOthersOffer
                ? 'Review this offer and accept if interested.'
                : 'Waiting for the task poster to review your offer.'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#004aad',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cce7ff',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004aad',
    marginLeft: 8,
    flex: 1,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  acceptedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pendingText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    gap: 12,
  },
  amountContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004aad',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004aad',
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  acceptOfferButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptOfferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
