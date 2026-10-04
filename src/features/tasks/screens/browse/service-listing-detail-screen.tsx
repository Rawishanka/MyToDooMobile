import type { ServiceListing } from '@/src/api/service-listing-api';
import { AppAlert, appAlert } from '@/src/shared/components/AppAlert';
import {
  useBookServiceListing,
  useGetServiceListing,
} from '@/src/shared/hooks/useServiceListingApi';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { useTheme } from '@/src/shared/theme';
import { validateContactContent } from '@/src/shared/utils/contactModeration';
import { RFValue } from '@/src/shared/utils/responsive';
import { useAuthStore } from '@/src/store/auth-task-store';
import { formatUserName } from '@/src/utils/formatUserName';
import {
  BRAND_BLUE,
  BRAND_ORANGE,
  CARD_CHIP_BG,
  CARD_DIVIDER,
  CARD_PRICE_BG,
  CARD_PRICE_TEXT,
  CARD_TEXT,
  CARD_TEXT_MUTED,
} from '@/src/shared/theme/brandColors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppLoader from '@/src/shared/components/AppLoader';
import { DateOptionSelector } from '@/src/features/tasks/screens/create/components/DateOptionSelector';

interface ServiceListingDetailScreenProps {
  listingId: string;
  initialListing?: ServiceListing | null;
  onBack: () => void;
}

export default function ServiceListingDetailScreen({
  listingId,
  initialListing,
  onBack,
}: ServiceListingDetailScreenProps) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, token, user: currentUser } = useAuthStore();
  const { data, isLoading, refetch } = useGetServiceListing(listingId, !!listingId);
  const bookMutation = useBookServiceListing();
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(
    initialListing?.price != null ? String(initialListing.price) : ''
  );

  // "When" -- only shown for listings the tasker marked as bookingRequired.
  // Same Easy/DoneBy/DoneOn choices (as "Flexible"/"On Date"/"Before Date")
  // as posting a task, including the native date picker wiring.
  const [whenOption, setWhenOption] = useState('');
  const [touchedWhen, setTouchedWhen] = useState(false);
  // Pre-filled exactly like Post Task: "On Date" starts at today and "Before
  // Date" five days out, so picking either shows a real date straight away
  // instead of an empty "Select date".
  const [onDate, setOnDate] = useState<Date | null>(() => new Date());
  const [beforeDate, setBeforeDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePickerOption, setActivePickerOption] = useState('');

  const whenOptions = [
    { label: 'On Date', value: 'on_time' },
    { label: 'Before Date', value: 'before' },
    { label: 'Flexible', value: 'no_rush' },
  ];

  const handleOpenPicker = (pickerType: string) => {
    setActivePickerOption(pickerType);
    setShowDatePicker(true);
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      if (activePickerOption === 'on_time') setOnDate(date);
      else if (activePickerOption === 'before') setBeforeDate(date);
    }
    setActivePickerOption('');
  };

  const listing = data || initialListing;
  const isNegotiable = listing?.pricingType === 'negotiable';
  // The viewer already has an unresolved booking on this listing: either it
  // is awaiting the provider's approval, or it is approved/ready and waiting
  // on the poster's payment. Either way they can't send another request.
  const myBooking = listing?.myBooking || null;
  const awaitingApproval = myBooking?.status === 'countered';
  const isOwnListing = !!(
    currentUser?._id &&
    listing?.tasker &&
    (typeof listing.tasker === 'string' ? listing.tasker : listing.tasker._id) === currentUser._id
  );
  const taskerName = useMemo(() => {
    if (!listing?.tasker || typeof listing.tasker === 'string') return 'Tasker';
    return formatUserName(listing.tasker.firstName, listing.tasker.lastName) || 'Tasker';
  }, [listing]);

  React.useEffect(() => {
    if (listing?.price == null) return;
    // Fixed listings always book at the listed price -- keep the field locked to it.
    if (!isNegotiable || !amount) {
      setAmount(String(listing.price));
    }
  }, [listing?.price, isNegotiable]);

  // Default "When" to Flexible once a bookingRequired listing loads -- most
  // bookings don't need a specific date, and Flexible is what books
  // instantly, so it should be pre-selected rather than forcing every poster
  // to make an extra tap before they can book.
  React.useEffect(() => {
    if (listing?.bookingRequired && !whenOption) {
      setWhenOption('no_rush');
    }
  }, [listing?.bookingRequired]);

  const handleBook = async () => {
    if (!isAuthenticated || !token) {
      AppAlert.alert('Login Required', 'Please log in or sign up to book this service.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      AppAlert.alert('Invalid Amount', 'Please enter a valid booking amount.');
      return;
    }

    if (isNegotiable && listing?.price != null && numericAmount < listing.price && numericAmount < 20) {
      AppAlert.alert('Amount Too Low', 'Negotiated offers must be at least $20.');
      return;
    }

    let dateType: 'Easy' | 'DoneBy' | 'DoneOn' | undefined;
    let whenDate: Date | null = null;
    if (listing?.bookingRequired) {
      if (!whenOption) {
        setTouchedWhen(true);
        AppAlert.alert('When?', 'Please select when you need this service.');
        return;
      }
      if (whenOption === 'no_rush') {
        dateType = 'Easy';
      } else if (whenOption === 'on_time') {
        dateType = 'DoneOn';
        whenDate = onDate;
      } else if (whenOption === 'before') {
        dateType = 'DoneBy';
        whenDate = beforeDate;
      }
      if (dateType !== 'Easy' && !whenDate) {
        AppAlert.alert('Date Required', 'Please select a date.');
        return;
      }
    }

    if (message.trim()) {
      const moderation = validateContactContent(message);
      if (!moderation.isClean) {
        AppAlert.alert(
          'Contact Details Not Permitted',
          moderation.reason || 'Do not include personal contact details (phone, email, or websites). Please amend and resubmit.'
        );
        return;
      }
    }

    try {
      const result = await bookMutation.mutateAsync({
        id: listingId,
        input: {
          amount: numericAmount,
          message: message.trim() || undefined,
          ...(dateType ? { dateType, date: whenDate ? whenDate.toISOString() : undefined } : {}),
        },
      });
      const taskId = result.data?.taskId;
      const offerId = result.data?.offerId;
      const isNegotiating = result.data?.negotiating === true;

      if (!isNegotiating && taskId && offerId) {
        // Ready to pay immediately -- go straight into the task detail
        // screen and open the payment modal, instead of making the poster
        // come back later to find "Accept Offer" themselves.
        router.push({
          pathname: '/task-detail',
          params: { taskId, autoPayOfferId: offerId },
        });
        return;
      }

      AppAlert.alert(
        isNegotiating ? 'Booking Request Sent' : 'Booking Created',
        isNegotiating
          ? `Your request was sent to ${taskerName} for approval. You'll be notified once they respond.`
          : 'Your booking is ready to pay.',
        [
          {
            text: 'View Task',
            onPress: () => {
              if (taskId) {
                router.push({ pathname: '/task-detail', params: { taskId } });
              } else {
                onBack();
              }
            },
          },
          { text: 'Done', onPress: onBack },
        ]
      );
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.code === 'DUPLICATE_BOOKING_REQUEST') {
        // Refresh so the button flips to its disabled/awaiting state, and tell
        // the poster why -- the notice closes itself after a few seconds.
        refetch();
        appAlert(
          'Booking Request Pending',
          data.message,
          [{ text: 'OK' }],
          { type: 'warning', autoCloseMs: 6000 }
        );
        return;
      }
      AppAlert.alert(
        'Booking Failed',
        data?.message || error?.message || 'Please try again.'
      );
    }
  };

  const handleCompletePayment = () => {
    if (!myBooking) return;
    router.push({
      pathname: '/task-detail',
      params: { taskId: String(myBooking.taskId), autoPayOfferId: String(myBooking.offerId) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0B1120' : BRAND_BLUE },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? '#0B1120' : BRAND_BLUE} />
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 45,
            backgroundColor: isDarkMode ? '#1E293B' : 'transparent',
            borderBottomColor: isDarkMode ? '#334155' : 'transparent',
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
          Service Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && !listing ? (
        <View style={styles.loadingWrap}>
          <AppLoader size={32} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
        </View>
      ) : !listing ? (
        <View style={styles.loadingWrap}>
          <View style={[styles.stateIconCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <Ionicons name="search-outline" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.emptyText, { color: isDarkMode ? '#F8FAFC' : '#FFFFFF' }]}>
            Listing not found
          </Text>
          <Text style={[styles.emptySub, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)' }]}>
            This service may have been removed.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.bookText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardBlue]}>
            <Text style={[styles.title, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
              {listing.title}
            </Text>
            
            <View style={styles.priceRow}>
              <View style={[styles.pricePill, isDarkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: CARD_PRICE_BG }]}>
                <Text style={[styles.price, { color: isDarkMode ? '#38BDF8' : CARD_PRICE_TEXT }]}>
                  ${Number(listing.price).toFixed(0)}
                </Text>
                <Text style={[styles.currency, { color: isDarkMode ? '#94A3B8' : CARD_PRICE_TEXT }]}>
                  {listing.currency || 'AUD'}
                </Text>
              </View>
              {isNegotiable ? (
                <View style={styles.negotiableBadge}>
                  <Ionicons name="swap-horizontal" size={12} color="#FFFFFF" />
                  <Text style={styles.negotiableBadgeText}>Negotiable</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                <Ionicons name="location-outline" size={18} color={isDarkMode ? '#94A3B8' : CARD_TEXT} />
              </View>
              <Text style={[styles.metaText, { color: isDarkMode ? '#94A3B8' : CARD_TEXT_MUTED }]} numberOfLines={2}>
                {listing.suburb}
                {listing.radiusKm ? ` · within ${listing.radiusKm} km` : ''}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                <Ionicons name="person-outline" size={18} color={isDarkMode ? '#94A3B8' : CARD_TEXT} />
              </View>
              <Text numberOfLines={2} style={[styles.taskerText, { color: isDarkMode ? '#CBD5E1' : CARD_TEXT_MUTED }]}>
                Offered by <Text style={{ fontWeight: '600', color: isDarkMode ? undefined : CARD_TEXT }}>{taskerName}</Text>
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? '#334155' : CARD_DIVIDER }]} />

            <Text style={[styles.sectionHeading, { color: isDarkMode ? '#94A3B8' : CARD_TEXT_MUTED }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: isDarkMode ? '#CBD5E1' : CARD_TEXT }]}>
              {listing.description}
            </Text>
          </View>

          {/* Own listing -- can't book your own service (same as every other
              marketplace), so show a clear state instead of a dead-end
              booking form that would just fail on submit. */}
          {isOwnListing && (
            <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardBlue, { marginTop: 16 }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                  <Ionicons name="information-circle-outline" size={18} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
                </View>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
                  This Is Your Listing
                </Text>
              </View>
              <Text style={[styles.helperNote, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)', marginTop: -8 }]}>
                You can't book your own service. Go to My Services to edit or manage it.
              </Text>
            </View>
          )}

          {/* When -- only for listings the tasker marked as needing a booking date */}
          {!isOwnListing && !myBooking && listing.bookingRequired && (
            <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardBlue, { marginTop: 16 }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                  <Ionicons name="time-outline" size={18} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
                </View>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
                  When <Text style={{ color: '#FCA5A5' }}>*</Text>
                </Text>
              </View>
              <Text style={[styles.helperNote, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)', marginTop: -8 }]}>
                Flexible books instantly. A specific date needs the tasker's approval first.
              </Text>
              <DateOptionSelector
                options={whenOptions}
                selectedOption={whenOption}
                onSelectOption={(option) => {
                  setWhenOption(option);
                  setTouchedWhen(true);
                }}
                onTimeDate={onDate}
                beforeDate={beforeDate}
                onOpenPicker={handleOpenPicker}
              />
              {touchedWhen && !whenOption && (
                <Text style={styles.validationText}>Please select when you need this service</Text>
              )}
            </View>
          )}

          {/* Existing booking -- the poster can't send a second request, so the
              Book button is replaced by a disabled "awaiting approval" state
              (or a way to finish paying once the provider has approved). */}
          {!isOwnListing && myBooking && (
            <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardBlue, { marginTop: 16 }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                  <Ionicons
                    name={awaitingApproval ? 'time-outline' : 'card-outline'}
                    size={18}
                    color={isDarkMode ? '#38BDF8' : CARD_TEXT}
                  />
                </View>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
                  {awaitingApproval ? 'Booking Request Sent' : 'Booking Awaiting Payment'}
                </Text>
              </View>
              <Text style={[styles.helperNote, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)', marginTop: -8 }]}>
                {awaitingApproval
                  ? `You've already sent a booking request${myBooking.amount != null ? ` of $${Number(myBooking.amount).toFixed(0)}` : ''} for this service. You'll be notified as soon as ${taskerName} responds.`
                  : `Your booking${myBooking.amount != null ? ` of $${Number(myBooking.amount).toFixed(0)}` : ''} is ready. Complete the payment to confirm it.`}
              </Text>
              <TouchableOpacity
                style={[styles.bookButton, awaitingApproval && styles.bookDisabled]}
                onPress={handleCompletePayment}
                disabled={awaitingApproval}
                activeOpacity={0.85}
              >
                <Text style={styles.bookText}>
                  {awaitingApproval
                    ? 'Awaiting approval from provider'
                    : myBooking.status === 'payment_failed'
                    ? 'Retry Payment'
                    : 'Complete Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Booking Section */}
          {!isOwnListing && !myBooking && (
          <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardBlue, { marginTop: 16 }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.iconChip, isDarkMode && { backgroundColor: '#0F172A' }]}>
                <Ionicons name="calendar-outline" size={18} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
              </View>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F8FAFC' : CARD_TEXT }]}>
                Book this Service
              </Text>
            </View>

            <Text style={[styles.label, { color: isDarkMode ? '#E2E8F0' : CARD_TEXT }]}>
              {isNegotiable ? 'Your Offer ($)' : 'Price ($)'}
            </Text>
            {isNegotiable ? (
              <Text style={[styles.helperNote, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)' }]}>
                This tasker accepts offers below the listed price (min $20). Offering ${listing.price} or more books instantly — a lower offer goes to the tasker for approval.
              </Text>
            ) : null}
            <TextInput
              style={[
                styles.input,
                isNegotiable
                  ? {
                      backgroundColor: isDarkMode ? '#0F172A' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : 'rgba(255,255,255,0.6)',
                      color: isDarkMode ? '#F8FAFC' : '#0B1B4D',
                    }
                  : {
                      backgroundColor: isDarkMode ? '#1E293B' : 'rgba(255,255,255,0.5)',
                      borderColor: isDarkMode ? '#334155' : 'rgba(255,255,255,0.4)',
                      color: isDarkMode ? '#94A3B8' : CARD_TEXT_MUTED,
                    },
              ]}
              value={amount}
              onChangeText={isNegotiable ? setAmount : undefined}
              editable={isNegotiable}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            />

            <Text style={[styles.label, { color: isDarkMode ? '#E2E8F0' : CARD_TEXT, marginTop: 16 }]}>
              Message for Tasker (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : 'rgba(255,255,255,0.6)',
                  color: isDarkMode ? '#F8FAFC' : '#0B1B4D',
                },
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder="Add details about your task (no phone numbers or emails)"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.bookButton,
                bookMutation.isPending && styles.bookDisabled,
              ]}
              onPress={handleBook}
              disabled={bookMutation.isPending}
              activeOpacity={0.85}
            >
              {bookMutation.isPending ? (
                <AppLoader color="#fff" />
              ) : (
                <Text style={styles.bookText}>
                  {isNegotiable && listing?.price != null && Number(amount) < listing.price
                    ? 'Send Price Request'
                    : 'Confirm & Book Service'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          )}
        </ScrollView>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={
            activePickerOption === 'on_time'
              ? onDate || new Date()
              : activePickerOption === 'before'
              ? beforeDate || new Date()
              : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          textColor="#FFFFFF"
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 36 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: RFValue(18),
    fontWeight: '700',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  stateIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: { fontSize: RFValue(18), fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: RFValue(14), textAlign: 'center', marginTop: 8, marginBottom: 24 },
  emptyButton: {
    backgroundColor: BRAND_ORANGE,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  cardBlue: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: CARD_CHIP_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: RFValue(18), fontWeight: '700', flexShrink: 1 },
  title: { fontSize: RFValue(20), fontWeight: '700', lineHeight: RFValue(26) },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  price: { fontSize: RFValue(22), fontWeight: '800' },
  currency: { fontSize: RFValue(13), fontWeight: '600' },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ff6b35',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  negotiableBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  metaText: { fontSize: RFValue(14), flex: 1 },
  taskerText: { fontSize: RFValue(14), flex: 1 },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: RFValue(12),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: RFValue(15),
    lineHeight: 23,
    marginTop: 10,
  },
  label: {
    fontSize: RFValue(13),
    fontWeight: '600',
    marginBottom: 8,
  },
  helperNote: {
    fontSize: RFValue(12),
    lineHeight: 17,
    marginBottom: 8,
    marginTop: -4,
  },
  validationText: {
    color: '#FCA5A5',
    fontSize: RFValue(12),
    marginTop: 4,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: RFValue(15),
  },
  textArea: { minHeight: 100 },
  bookButton: {
    marginTop: 24,
    backgroundColor: BRAND_ORANGE,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookDisabled: { opacity: 0.6 },
  bookText: { color: '#fff', fontSize: RFValue(16), fontWeight: '700' },
});
