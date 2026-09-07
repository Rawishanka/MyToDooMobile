import type { ServiceListing } from '@/src/api/service-listing-api';
import {
  useBookServiceListing,
  useGetServiceListing,
} from '@/src/shared/hooks/useServiceListingApi';
import { RFValue } from '@/src/shared/utils/responsive';
import { formatUserName } from '@/src/utils/formatUserName';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid booking amount.');
      return;
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
      Alert.alert(
        'Booking created',
        'A task and pending offer were created. Accept and pay using the normal offer flow.',
        [
          {
            text: 'View task',
            onPress: () => {
              if (taskId) {
                router.push({ pathname: '/task-detail', params: { taskId } });
              } else {
                onBack();
              }
            },
          },
          { text: 'OK', onPress: onBack },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Booking failed',
        error?.response?.data?.message || error?.message || 'Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service details</Text>
      </View>

      {isLoading && !listing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0052A2" />
        </View>
      ) : !listing ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>Listing not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>
            ${Number(listing.price).toFixed(0)} {listing.currency || 'AUD'}
          </Text>
          <Text style={styles.meta}>
            {listing.suburb}
            {listing.radiusKm ? ` · within ${listing.radiusKm} km` : ''}
          </Text>
          <Text style={styles.tasker}>Offered by {taskerName}</Text>
          <Text style={styles.description}>{listing.description}</Text>

          <Text style={styles.label}>Your offer amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Amount"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a note for the tasker"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.bookButton, bookMutation.isPending && styles.bookDisabled]}
            onPress={handleBook}
            disabled={bookMutation.isPending}
          >
            {bookMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookText}>Book this service</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#003366',
    marginLeft: 8,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: RFValue(22), fontWeight: '700', color: '#222' },
  price: { fontSize: RFValue(18), fontWeight: '700', color: '#0052A2', marginTop: 8 },
  meta: { fontSize: RFValue(13), color: '#666', marginTop: 6 },
  tasker: { fontSize: RFValue(13), color: '#444', marginTop: 4 },
  description: {
    fontSize: RFValue(14),
    color: '#333',
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: RFValue(15),
    color: '#222',
  },
  textArea: { minHeight: 90 },
  bookButton: {
    marginTop: 24,
    backgroundColor: '#0052A2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookDisabled: { opacity: 0.7 },
  bookText: { color: '#fff', fontSize: RFValue(16), fontWeight: '600' },
});
