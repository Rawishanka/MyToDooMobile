import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatUserName, formatAvatarName } from '@/src/utils/formatUserName';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
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
    case 'accepted': return HS.greenBg;
    case 'rejected': return HS.redBg;
    case 'pending': return HS.amberBg;
    default: return HS.tint;
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'accepted': return HS.greenText;
    case 'rejected': return HS.redText;
    case 'pending': return HS.amberText;
    default: return HS.muted;
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
            <Text style={[styles.statusText, { color: getStatusTextColor(offer.status) }]}>
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
        <Ionicons name="chatbubble-outline" size={16} color={HS.blue} />
        <Text style={styles.contactButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  offerCard: {
    ...homeCard,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: HS.tint,
  },
  taskerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  taskerName: {
    fontSize: 16,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: RFValue(12),
    color: HS.muted,
    marginLeft: 4,
  },
  offerDate: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
  offerPriceContainer: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: HS.blue,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: RFValue(10),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageContainer: {
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: RFValue(12),
    color: HS.muted,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: RFValue(14),
    color: HS.text,
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
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: HS.blue,
    height: 44,
    borderRadius: 14,
    gap: 6,
  },
  contactButtonText: {
    color: HS.blue,
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});
