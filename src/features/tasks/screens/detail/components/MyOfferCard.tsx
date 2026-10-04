import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {BRAND_ORANGE, CARD_BG, CARD_CHIP_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED} from '@/src/shared/theme/brandColors';
import { GLASS_BG } from '../detailTheme';
import { VerifiedBadges } from './VerifiedBadges';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { AppLoader } from '@/src/shared/components/AppLoader';
import { useUpdateOffer } from '@/src/shared/hooks/useTaskApi';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface MyOfferCardProps {
  offer: any;
  isTaskPoster?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  isServiceBooking?: boolean;
  taskLocation?: { address?: string };
  taskId?: string;
  onOfferUpdated?: () => void;
}

export const MyOfferCard: React.FC<MyOfferCardProps> = ({ offer, isTaskPoster, onAcceptOffer, isServiceBooking, taskLocation, taskId, onOfferUpdated }) => {
  const { isDarkMode } = useTheme();
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });

  // Handle both nested and flat offer structures
  const offerAmount = offer.offer?.amount || offer.amount || 0;
  const offerCurrency = offer.offer?.currency || offer.currency || 'SGD';
  const offerMessage = offer.offer?.message || offer.message || '';
  const status = offer.status || 'pending';

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState(String(offerAmount || ''));
  const [editMessage, setEditMessage] = useState(offerMessage);
  const updateOfferMutation = useUpdateOffer();
  const isSaving = updateOfferMutation.isPending;

  const openEditModal = () => {
    setEditAmount(String(offerAmount || ''));
    setEditMessage(offerMessage);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const numericAmount = Number(editAmount);
    if (!editAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      AppAlert.alert('Invalid Amount', 'Please enter a valid offer amount.');
      return;
    }
    if (!taskId) return;
    try {
      await updateOfferMutation.mutateAsync({
        taskId,
        offerId: offer._id,
        updates: { amount: numericAmount, message: editMessage },
      });
      setShowEditModal(false);
      AppAlert.alert('Offer Updated', 'Your offer has been updated.');
      onOfferUpdated?.();
    } catch (err: any) {
      AppAlert.alert('Update Failed', err?.response?.data?.error || err?.message || 'Could not update your offer. Please try again.');
    }
  };
  
  // Debug logging to see what we're actually getting
  console.log('MyOfferCard - Raw offer data:', JSON.stringify(offer, null, 2));
  console.log('MyOfferCard - Extracted amount:', offerAmount);
  console.log('MyOfferCard - Extracted currency:', offerCurrency);
  
  // Determine if this is the task poster viewing someone else's offer
  const isViewingOthersOffer = isTaskPoster;

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#38BDF8" }]}>
      <View style={[styles.header, isDarkMode && { borderBottomColor: "#334155" }]}>
        <View style={[styles.headerChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
          <Ionicons name="document-text-outline" size={18} color={isDarkMode ? "#38BDF8" : CARD_TEXT} />
        </View>
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
        {!isViewingOthersOffer && status === 'pending' && taskId && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditModal}
            accessibilityLabel="Edit your offer"
          >
            <Ionicons name="pencil" size={16} color={CARD_TEXT} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <VerifiedBadges badges={(offer as any).user?.badges} style={{ marginTop: 0, marginBottom: 12 }} />
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
            <Text style={styles.acceptOfferButtonText}>{isServiceBooking ? 'Pay & Confirm Booking' : 'Accept Offer'}</Text>
          </TouchableOpacity>
        )}

        {/* Status Info */}
        <View style={[styles.infoContainer, isDarkMode && { backgroundColor: "#0F172A" }]}>
          <Ionicons name="information-circle-outline" size={18} color={isDarkMode ? "#94A3B8" : CARD_TEXT_MUTED} />
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

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editOverlay}
        >
          <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
            <View style={styles.editOverlayTouchable} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.editModalContent, isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}>
              <Text style={[styles.editModalTitle, isDarkMode && { color: '#F8FAFC' }]}>Edit Your Offer</Text>
              <Text style={[styles.editModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>You can update this while it's still pending.</Text>

              <Text style={[styles.editLabel, isDarkMode && { color: '#94A3B8' }]}>Amount</Text>
              <TextInput
                style={[styles.editInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholder="Amount"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                returnKeyType="done"
              />

              <Text style={[styles.editLabel, isDarkMode && { color: '#94A3B8' }]}>Message</Text>
              <TextInput
                style={[styles.editInput, styles.editMessageInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={editMessage}
                onChangeText={setEditMessage}
                placeholder="Message to the poster (optional)"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                multiline
                blurOnSubmit
              />

              <View style={styles.editButtonsRow}>
                <TouchableOpacity
                  style={[styles.editActionButton, styles.editCancelButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
                  onPress={() => setShowEditModal(false)}
                  disabled={isSaving}
                >
                  <Text style={[styles.editCancelButtonText, isDarkMode && { color: '#F8FAFC' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editActionButton, styles.editSaveButton]}
                  onPress={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? <AppLoader size={20} color="#fff" /> : <Text style={styles.editSaveButtonText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  headerChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: CARD_CHIP_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: CARD_DIVIDER,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: CARD_TEXT,
    marginLeft: 10,
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  amountLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
  },
  amount: {
    fontSize: 26,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  messageContainer: {
    backgroundColor: CARD_CHIP_BG,
    padding: 14,
    borderRadius: 14,
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
    padding: 12,
    borderRadius: 14,
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
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptOfferButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 12, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  editModalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 420,
  },
  editModalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 4,
    textAlign: 'center',
  },
  editModalSubtitle: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    marginBottom: 18,
    textAlign: 'center',
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CARD_TEXT_MUTED,
    marginBottom: 6,
    marginTop: 10,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D6E2FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0B1B4D',
  },
  editMessageInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editActionButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  editCancelButtonText: {
    color: CARD_TEXT,
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  editSaveButton: {
    backgroundColor: BRAND_ORANGE,
  },
  editSaveButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});
