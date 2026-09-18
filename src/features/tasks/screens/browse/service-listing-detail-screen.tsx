import type { ServiceListing } from '@/src/api/service-listing-api';
import { AppAlert } from '@/src/shared/components/AppAlert';
import {
  useBookServiceListing,
  useGetServiceListing,
} from '@/src/shared/hooks/useServiceListingApi';
import { useTheme } from '@/src/shared/theme';
import { validateContactContent } from '@/src/shared/utils/contactModeration';
import { RFValue } from '@/src/shared/utils/responsive';
import { useAuthStore } from '@/src/store/auth-task-store';
import { formatUserName } from '@/src/utils/formatUserName';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { isAuthenticated, token } = useAuthStore();
  const { data, isLoading } = useGetServiceListing(listingId, !!listingId);
  const bookMutation = useBookServiceListing();
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(
    initialListing?.price != null ? String(initialListing.price) : ''
  );

  const listing = data || initialListing;
  const taskerName = useMemo(() => {
    if (!listing?.tasker || typeof listing.tasker === 'string') return 'Tasker';
    return formatUserName(listing.tasker.firstName, listing.tasker.lastName) || 'Tasker';
  }, [listing]);

  React.useEffect(() => {
    if (listing?.price != null && !amount) {
      setAmount(String(listing.price));
    }
  }, [listing?.price, amount]);

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
        },
      });
      const taskId = result.data?.taskId;
      AppAlert.alert(
        'Booking Created',
        'A task and pending offer have been created. Accept and pay using the standard offer flow to confirm.',
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
      AppAlert.alert(
        'Booking Failed',
        error?.response?.data?.message || error?.message || 'Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0B1120' : '#f8fafc' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 45,
            backgroundColor: isDarkMode ? '#1E293B' : '#ffffff',
            borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0',
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#38BDF8' : '#0052A2'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#F8FAFC' : '#003366' }]}>
          Service Details
        </Text>
      </View>

      {isLoading && !listing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#0052A2'} />
        </View>
      ) : !listing ? (
        <View style={styles.loadingWrap}>
          <Text style={[styles.emptyText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
            Listing not found.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]}>
            <Text style={[styles.title, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
              {listing.title}
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: isDarkMode ? '#38BDF8' : '#0052A2' }]}>
                ${Number(listing.price).toFixed(0)}
              </Text>
              <Text style={[styles.currency, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                {listing.currency || 'AUD'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <Text style={[styles.metaText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                {listing.suburb}
                {listing.radiusKm ? ` · within ${listing.radiusKm} km` : ''}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <Text style={[styles.taskerText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
                Offered by <Text style={{ fontWeight: '600' }}>{taskerName}</Text>
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }]} />

            <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
              {listing.description}
            </Text>
          </View>

          {/* Booking Section */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', marginTop: 16 }]}>
            <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#0F172A', marginBottom: 12 }]}>
              Book this Service
            </Text>

            <Text style={[styles.label, { color: isDarkMode ? '#E2E8F0' : '#334155' }]}>
              Agreed Offer Amount ($)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#f8fafc',
                  borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                  color: isDarkMode ? '#F8FAFC' : '#0F172A',
                },
              ]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            />

            <Text style={[styles.label, { color: isDarkMode ? '#E2E8F0' : '#334155', marginTop: 14 }]}>
              Message for Tasker (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#f8fafc',
                  borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                  color: isDarkMode ? '#F8FAFC' : '#0F172A',
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bookText}>Confirm & Book Service</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: RFValue(14) },
  content: { padding: 16, paddingBottom: 50 },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  title: { fontSize: RFValue(20), fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 6,
  },
  price: { fontSize: RFValue(22), fontWeight: '800' },
  currency: { fontSize: RFValue(14), fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  metaText: { fontSize: RFValue(13) },
  taskerText: { fontSize: RFValue(13) },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  description: {
    fontSize: RFValue(14),
    lineHeight: 22,
    marginTop: 8,
  },
  label: {
    fontSize: RFValue(13),
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: RFValue(15),
  },
  textArea: { minHeight: 90 },
  bookButton: {
    marginTop: 20,
    backgroundColor: '#0052A2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookDisabled: { opacity: 0.7 },
  bookText: { color: '#fff', fontSize: RFValue(16), fontWeight: '700' },
});
