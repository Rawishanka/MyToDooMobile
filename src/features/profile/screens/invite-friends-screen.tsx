import { useGetMyReferral } from '@/src/shared/hooks/useReferralApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';

interface InviteFriendsScreenProps {
  onBack: () => void;
}

export default function InviteFriendsScreen({ onBack }: InviteFriendsScreenProps) {
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch, isRefetching } = useGetMyReferral();

  const handleShare = useCallback(async () => {
    if (!data?.inviteUrl && !data?.code) return;
    const message = data.inviteUrl
      ? `Join me on MyToDoo! Use my invite link: ${data.inviteUrl}`
      : `Join me on MyToDoo! Use my referral code: ${data.code}`;
    try {
      await Share.share({
        message,
        url: data.inviteUrl,
        title: 'Invite friends to MyToDoo',
      });
    } catch {
      // User cancelled share sheet — ignore
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite friends</Text>
      </View>

      {isLoading && !data ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0052A2" />
        </View>
      ) : error && !data ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>Could not load your invite link.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{isRefetching ? 'Loading…' : 'Try again'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Your invite code</Text>
            <Text style={styles.code}>{data?.code || '—'}</Text>
            <Text style={styles.urlLabel}>Invite URL</Text>
            <Text style={styles.url} selectable>
              {data?.inviteUrl || '—'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{data?.pending ?? 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{data?.rewarded ?? 0}</Text>
                <Text style={styles.statLabel}>Rewarded</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareText}>Share invite</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Friends who sign up with your code can unlock promo credits after they verify email and
            phone (when the referral campaign is active).
          </Text>
        </View>
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#666', marginBottom: 12, fontSize: RFValue(14) },
  retryButton: {
    backgroundColor: '#0052A2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  label: { fontSize: RFValue(13), color: '#666', marginBottom: 6 },
  code: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: '#0052A2',
    letterSpacing: 1,
    marginBottom: 16,
  },
  urlLabel: { fontSize: RFValue(13), color: '#666', marginBottom: 4 },
  url: { fontSize: RFValue(13), color: '#222', lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: RFValue(20), fontWeight: '700', color: '#0052A2' },
  statLabel: { fontSize: RFValue(12), color: '#666', marginTop: 2 },
  shareButton: {
    backgroundColor: '#0052A2',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: { color: '#fff', fontSize: RFValue(16), fontWeight: '600' },
  hint: {
    marginTop: 16,
    fontSize: RFValue(12),
    color: '#888',
    lineHeight: 18,
  },
});
