import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useAcceptOffer, useGetTaskById, useGetTaskOffers } from '@/src/shared/hooks/useTaskApi';
import { formatUserName } from '@/src/utils/formatUserName';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import { ErrorState, LoadingState } from '../../components/shared';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

export default function AcceptOfferScreen() {
  const router = useRouter();
  const { taskId, offerId } = useLocalSearchParams<{ 
    taskId: string; 
    offerId?: string;
  }>();
  const [showTermsWebView, setShowTermsWebView] = useState(false);
  
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offerId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: offersData, isLoading: isOffersLoading } = useGetTaskOffers(taskId || '', !!taskId);
  const acceptOfferMutation = useAcceptOffer();

  const task = taskData?.data;
  const offers = offersData?.data?.offers || [];
  const selectedOffer = offers.find((offer: any) => offer._id === selectedOfferId);
  const isLoading = isTaskLoading || isOffersLoading;

  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });

  const handleAcceptOffer = async () => {
    try {
      if (!selectedOfferId) {
        Alert.alert('No Offer Selected', 'Please select an offer to accept.');
        return;
      }

      setIsSubmitting(true);

      console.log('✅ Accepting offer:', selectedOfferId);

      const result = await acceptOfferMutation.mutateAsync({
        taskId: taskId!,
        offerId: selectedOfferId,
      });

      console.log('✅ Offer accepted successfully:', result);

      Alert.alert(
        'Offer Accepted! 🎉',
        'The offer has been accepted. The task performer has been notified.',
        [
          {
            text: 'View My Tasks',
            onPress: () => router.push('./mytasks-screen')
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to accept offer:', error?.message);
      }
      Alert.alert(
        'Failed to Accept Offer',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading offers..." />;
  }

  if (!task) {
    return (
      <ErrorState
        title="Task Not Found"
        subtitle="Could not load task details."
        onGoBack={() => router.back()}
      />
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accept Offer</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="document-outline" size={44} color={HS.blue} />
          </View>
          <Text style={styles.emptyTitle}>No Offers Yet</Text>
          <Text style={styles.emptySubtitle}>
            No offers have been submitted for this task yet. Check back later!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accept Offer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" removeClippedSubviews={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 28 }}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Offers List */}
        <View style={styles.offersContainer}>
          <Text style={styles.sectionTitle}>Available Offers ({offers.length})</Text>
          
          {offers.map((offer: any) => (
            <TouchableOpacity
              key={offer._id}
              style={[
                styles.offerCard,
                selectedOfferId === offer._id && styles.selectedOfferCard
              ]}
              onPress={() => setSelectedOfferId(offer._id)}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerUserInfo}>
                  <Text style={styles.offerUserName}>
                    {formatUserName(offer.taskTakerId?.firstName, offer.taskTakerId?.lastName)}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#ffc107" />
                    <Text style={styles.ratingText}>{offer.taskTakerId?.rating || 4.8} (24 reviews)</Text>
                  </View>
                </View>
                <View style={styles.offerAmount}>
                  {selectedOfferId === offer._id && (
                    <Ionicons name="checkmark-circle" size={24} color={HS.greenText} />
                  )}
                </View>
              </View>

              {offer.offer.message && (
                <View style={styles.offerMessage}>
                  <Text style={styles.offerMessageText}>{offer.offer.message}</Text>
                </View>
              )}

              <View style={styles.offerFooter}>
                <Text style={styles.offerDate}>
                  Submitted {new Date(offer.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.offerStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: offer.status === 'pending' ? HS.amberBg : HS.greenBg }
                  ]}>
                    <Text style={[styles.statusText, { color: offer.status === 'pending' ? HS.amberText : HS.greenText }]}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Selection Info */}
          {selectedOffer && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionTitle}>✅ Selected Offer Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Task Performer:</Text>
                <Text style={styles.summaryValue}>
                  {formatUserName(selectedOffer.taskTakerId?.firstName, selectedOffer.taskTakerId?.lastName)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Offer Amount:</Text>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(selectedOffer.offer?.amount || 0, currencyInfo)}
                </Text>
              </View>
              {selectedOffer.offer?.message && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Message:</Text>
                  <Text style={styles.summaryValue}>{selectedOffer.offer.message}</Text>
                </View>
              )}
            </View>
          )}

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>📋 By accepting this offer, you agree to:</Text>
            <Text style={styles.termItem}>• Pay the agreed amount upon task completion</Text>
            <Text style={styles.termItem}>• Provide clear task instructions and requirements</Text>
            <Text style={styles.termItem}>• Be available for communication during task execution</Text>
            <Text style={styles.termItem}>• Follow MyToDoo's{' '}
              <Text style={styles.termLink} onPress={() => setShowTermsWebView(true)}>terms of service</Text>
              {' '}and community guidelines
            </Text>
          </View>

          <Modal visible={showTermsWebView} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <TermsConditionsScreen onBack={() => setShowTermsWebView(false)} />
            </SafeAreaView>
          </Modal>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.acceptButton, (!selectedOfferId || isSubmitting) && styles.disabledButton]}
          onPress={handleAcceptOffer}
          disabled={!selectedOfferId || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={HS.blue} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={!selectedOfferId ? HS.muted : '#fff'} />
              <Text style={[styles.acceptButtonText, !selectedOfferId && { color: HS.muted }]}>
                Accept Offer {selectedOffer ? `(${formatCurrency(selectedOffer.offer?.amount || 0, currencyInfo)})` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HS.page,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#003399',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 14,
    backgroundColor: BRAND_BLUE,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskSummary: {
    ...homeCard,
    padding: 18,
    marginTop: 0,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
  offersContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 14,
  },
  offerCard: {
    ...homeCard,
    padding: 16,
    marginBottom: 14,
  },
  selectedOfferCard: {
    borderWidth: 2,
    borderColor: BRAND_ORANGE,
    backgroundColor: HS.tint,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerUserInfo: {
    flex: 1,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: RFValue(14),
    color: HS.muted,
    marginLeft: 4,
  },
  offerAmount: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  offerPrice: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.blue,
  },
  offerMessage: {
    backgroundColor: HS.tint,
    borderWidth: 1,
    borderColor: HS.tintBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  offerMessageText: {
    fontSize: RFValue(14),
    color: HS.text,
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDate: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
  offerStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: RFValue(12),
    color: HS.blue,
    fontWeight: '600',
  },
  selectionInfo: {
    ...homeCard,
    padding: 18,
    marginTop: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: HS.greenText,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: RFValue(14),
    color: HS.muted,
    flex: 1,
  },
  summaryValue: {
    fontSize: RFValue(14),
    color: HS.navy,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  summaryAmount: {
    fontSize: 20,
    color: HS.blue,
    fontWeight: '700',
  },
  termsContainer: {
    ...homeCard,
    padding: 18,
    marginTop: 16,
  },
  termsTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.amberText,
    marginBottom: 8,
  },
  termItem: {
    fontSize: 13,
    lineHeight: 19,
    color: HS.text,
    marginBottom: 4,
  },
  termLink: {
    color: HS.blue,
    textDecorationLine: 'underline' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HS.cardBorder,
  },
  acceptButton: {
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: HS.tintStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});