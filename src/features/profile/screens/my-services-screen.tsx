import type { ServiceListing } from '@/src/api/service-listing-api';
import {
  useDeleteServiceListing,
  useGetMyServiceListings,
} from '@/src/shared/hooks/useServiceListingApi';
import { BlueBackdrop, IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import { useTheme } from '@/src/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MyServicesScreenProps {
  onBack: () => void;
  onCreate: () => void;
}

export default function MyServicesScreen({ onBack, onCreate }: MyServicesScreenProps) {
  const { isDarkMode } = useTheme();
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
    <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <IconChip name="construct-outline" style={{ marginRight: 12 }} />
      <View style={styles.cardBody}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>
          ${Number(item.price).toFixed(0)} {item.currency || 'AUD'} · {item.suburb}
        </Text>
        <Text style={[styles.status, isDarkMode && { color: '#94A3B8' }]}>Status: {item.status}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={18} color={isDarkMode ? '#DC2626' : '#FCA5A5'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <LightHeader
        title="My services"
        onBack={onBack}
        right={
          <TouchableOpacity onPress={onCreate} style={styles.createButton} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {isLoading && data.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
                <Ionicons name="construct-outline" size={38} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
              </View>
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>You have not listed any services yet.</Text>
              <TouchableOpacity style={styles.emptyCta} onPress={onCreate} activeOpacity={0.85}>
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
  container: { flex: 1, backgroundColor: '#003399' },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  cardBody: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  meta: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  status: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, textTransform: 'capitalize' },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(252,165,165,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 20, textAlign: 'center' },
  emptyCta: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emptyCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
