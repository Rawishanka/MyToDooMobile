import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatUserName, formatAvatarName } from '@/src/utils/formatUserName';
import { BRAND_ORANGE, CARD_BG, CARD_CHIP_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface Offer {
  _id: string;
  taskId: string;
  taskTakerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  offer: {
    amount: number;
    currency: string;
    message: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface OfferCardProps {
  offer: Offer;
  onAccept?: (offer: Offer) => void;
  onReject?: (offer: Offer) => void;
  onMessage?: (offer: Offer) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return '#28a745';
    case 'rejected': return '#dc3545';
    case 'pending': return '#ffc107';
    default: return '#6c757d';
  }
};

export default function OfferCard({ offer, onAccept, onReject, onMessage }: OfferCardProps) {
  const handleAccept = () => {
    Alert.alert(
      'Accept Offer',
      `Accept offer from ${offer.taskTakerId.firstName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            if (onAccept) {
              onAccept(offer);
            } else {
              Alert.alert('Success', 'Offer acceptance will be implemented in next phase');
            }
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Offer',
      `Reject offer from ${offer.taskTakerId.firstName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            if (onReject) {
              onReject(offer);
            } else {
              Alert.alert('Success', 'Offer rejection will be implemented in next phase');
            }
          }
        }
      ]
    );
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(offer);
    } else {
      Alert.alert('Contact', 'Messaging will be implemented in next phase');
    }
  };

  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.taskerInfo}>
          <Image
            source={{ 
              uri: `https://ui-avatars.com/api/?name=${formatAvatarName(offer.taskTakerId.firstName, offer.taskTakerId.lastName)}&background=random` 
            }}
            style={styles.taskerAvatar}
          />
          <View style={styles.taskerDetails}>
            <Text style={styles.taskerName}>
              {formatUserName(offer.taskTakerId.firstName, offer.taskTakerId.lastName)}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.ratingText}>
                {offer.taskTakerId.rating || 'No rating'} 
              </Text>
            </View>
            <Text style={styles.offerDate}>
              {formatDate(offer.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.offerPriceContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
            <Text style={styles.statusText}>
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {offer.offer.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{offer.offer.message}</Text>
        </View>
      )}

      {offer.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={handleReject}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.contactButton}
        onPress={handleMessage}
      >
        <Ionicons name="chatbubble-outline" size={16} color={CARD_TEXT} />
        <Text style={styles.contactButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  offerCard: {
    backgroundColor: CARD_BG,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  taskerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  taskerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  taskerName: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginLeft: 4,
  },
  offerDate: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
  },
  offerPriceContainer: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: RFValue(10),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageContainer: {
    backgroundColor: CARD_CHIP_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: RFValue(14),
    color: CARD_TEXT,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_TEXT,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: CARD_TEXT,
    fontSize: RFValue(14),
    fontWeight: '500',
  },
});
