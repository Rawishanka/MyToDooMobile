import type { ServiceListing } from '@/src/api/service-listing-api';
import {
  useDeleteServiceListing,
  useGetMyServiceListings,
} from '@/src/shared/hooks/useServiceListingApi';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { BRAND_BLUE, BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED, CARD_DIVIDER, CARD_CHIP_BG } from '@/src/shared/theme/brandColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MyServicesScreenProps {
  onBack: () => void;
  onCreate: () => void;
}

export default function MyServicesScreen({ onBack, onCreate }: MyServicesScreenProps) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, refetch, isRefetching } = useGetMyServiceListings();
  const deleteMutation = useDeleteServiceListing();

  const confirmDelete = (listing: ServiceListing) => {
    Alert.alert('Remove service', `Remove "${listing.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(listing._id);
          } catch (error: any) {
            Alert.alert(
              'Could not remove',
              error?.response?.data?.message || error?.message || 'Please try again.'
            );
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ServiceListing }) => (
    <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}>
      <View style={styles.cardBody}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>{item.title}</Text>
        <Text style={[styles.meta, isDarkMode && { color: '#94A3B8' }]}>
          ${Number(item.price).toFixed(0)} {item.currency || 'AUD'} · {item.suburb}
        </Text>
        <Text style={[styles.status, isDarkMode && { color: '#64748B' }]}>Status: {item.status}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={isDarkMode ? "#dc3545" : "#FCA5A5"} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }, isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#334155' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>My services</Text>
        <TouchableOpacity onPress={onCreate} style={styles.createButton}>
          <Ionicons name="add" size={22} color={isDarkMode ? '#38BDF8' : CARD_TEXT} />
        </TouchableOpacity>
      </View>

      {isLoading && data.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#003399" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#003399" />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>You have not listed any services yet.</Text>
              <TouchableOpacity style={styles.emptyCta} onPress={onCreate}>
                <Text style={styles.emptyCtaText}>Create a service</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_BLUE,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: RFValue(18),
    fontWeight: '600',
    color: CARD_TEXT,
    marginLeft: 8,
  },
  createButton: { padding: 4 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  title: { fontSize: RFValue(15), fontWeight: '600', color: CARD_TEXT },
  meta: { fontSize: RFValue(13), color: CARD_TEXT_MUTED, marginTop: 4 },
  status: { fontSize: RFValue(12), color: CARD_TEXT_MUTED, marginTop: 4, textTransform: 'capitalize' },
  deleteButton: { padding: 8 },
  emptyWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: RFValue(14), marginBottom: 16 },
  emptyCta: {
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyCtaText: { color: '#fff', fontWeight: '600' },
});
