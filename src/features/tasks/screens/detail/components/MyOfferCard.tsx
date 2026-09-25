import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { BRAND_ORANGE, CARD_BG, CARD_CHIP_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MyOfferCardProps {
  offer: any;
  isTaskPoster?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  taskLocation?: { address?: string };
}

export const MyOfferCard: React.FC<MyOfferCardProps> = ({ offer, isTaskPoster, onAcceptOffer, taskLocation }) => {
  const { isDarkMode } = useTheme();
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
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
    <View style={[styles.container, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#38BDF8" }]}>
      <View style={[styles.header, isDarkMode && { borderBottomColor: "#334155" }]}>
        <Ionicons name="document-text" size={20} color={isDarkMode ? "#38BDF8" : CARD_TEXT} />
        <Text style={[styles.headerText, isDarkMode && { color: "#38BDF8" }]}>
          {isViewingOthersOffer ? 'Offer' : 'Your Offer'}
        </Text>
        {status === 'completed' && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done-circle" size={16} color="#2E7D32" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
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
        <View style={[styles.amountContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#38BDF8" }]}>
          <Text style={[styles.amountLabel, isDarkMode && { color: "#94A3B8" }]}>
            {isViewingOthersOffer ? 'Offer Amount:' : 'Your Offer Amount:'}
          </Text>
          <Text style={[styles.amount, isDarkMode && { color: "#38BDF8" }]}>
            {formatCurrency(offerAmount, currencyInfo)}
          </Text>
        </View>

        {/* Message */}
        {offerMessage && (
          <View style={[styles.messageContainer, isDarkMode && { backgroundColor: "#0F172A" }]}>
            <Text style={[styles.messageLabel, isDarkMode && { color: "#94A3B8" }]}>
              {isViewingOthersOffer ? 'Message:' : 'Your Message:'}
            </Text>
            <Text style={[styles.message, isDarkMode && { color: "#F8FAFC" }]}>{offerMessage}</Text>
          </View>
        )}

        {/* Accept Offer Button - Only shown to task poster */}
        {isTaskPoster && status !== 'accepted' && status !== 'completed' && (
          <TouchableOpacity 
            style={styles.acceptOfferButton}
            onPress={() => onAcceptOffer && onAcceptOffer(offer._id)}
          >
            <Text style={styles.acceptOfferButtonText}>Accept Offer</Text>
          </TouchableOpacity>
        )}

        {/* Status Info */}
        <View style={[styles.infoContainer, isDarkMode && { backgroundColor: "#0F172A" }]}>
          <Ionicons name="information-circle-outline" size={16} color={CARD_TEXT_MUTED} />
          <Text style={[styles.infoText, isDarkMode && { color: "#94A3B8" }]}>
            {status === 'completed'
              ? isViewingOthersOffer
                ? 'This task has been completed successfully.'
                : 'Congratulations! You have successfully completed this task.'
              : status === 'accepted' 
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
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: CARD_DIVIDER,
    borderRadius: 12,
    padding: isTablet ? wp('3%') : wp('4%'),
    marginBottom: hp('2%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    paddingBottom: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: CARD_DIVIDER,
  },
  headerText: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: CARD_TEXT,
    marginLeft: wp('2%'),
    flex: 1,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 12,
  },
  acceptedText: {
    color: '#4CAF50',
    fontSize: RFValue(11),
    fontWeight: '600',
    marginLeft: wp('1%'),
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 12,
  },
  completedText: {
    color: '#2E7D32',
    fontSize: RFValue(11),
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 12,
  },
  pendingText: {
    color: '#FFA500',
    fontSize: RFValue(11),
    fontWeight: '600',
    marginLeft: wp('1%'),
  },
  content: {
    gap: 12,
  },
  amountContainer: {
    backgroundColor: CARD_CHIP_BG,
    padding: isTablet ? wp('2%') : wp('3%'),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CARD_DIVIDER,
  },
  amountLabel: {
    fontSize: RFValue(11),
    color: CARD_TEXT_MUTED,
    marginBottom: hp('0.5%'),
  },
  amount: {
    fontSize: RFValue(isTablet ? 26 : 22),
    fontWeight: '700',
    color: CARD_TEXT,
  },
  messageContainer: {
    backgroundColor: CARD_CHIP_BG,
    padding: 12,
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginBottom: 6,
    fontWeight: '600',
  },
  message: {
    fontSize: RFValue(14),
    color: CARD_TEXT,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_CHIP_BG,
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  acceptOfferButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptOfferButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});
