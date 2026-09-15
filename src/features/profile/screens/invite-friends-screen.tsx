import { useGetMyReferral } from '@/src/shared/hooks/useReferralApi';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
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
      ? `Join me on MyToDoo! Use my invite link to get promo rewards: ${data.inviteUrl}`
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 44 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading && !data ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF914D" />
          <Text style={styles.loadingText}>Loading referral details...</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.loadingWrap}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
          </View>
          <Text style={styles.errorText}>Could not load your invite link.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.85}>
            <Text style={styles.retryText}>{isRefetching ? 'Retrying...' : 'Try Again'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 2026 Hero Banner */}
          <LinearGradient
            colors={['#1A2980', '#26D0CE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="gift" size={14} color="#FBBF24" />
              <Text style={styles.heroBadgeText}>PROMO REWARDS</Text>
            </View>
            <Text style={styles.heroTitle}>Invite Friends & Earn Credits</Text>
            <Text style={styles.heroSubtitle}>
              Give friends bonus promo credits when they join and get rewarded once they verify their account!
            </Text>
          </LinearGradient>

          {/* Referral Code Card */}
          <View style={styles.codeCard}>
            <Text style={styles.codeCardLabel}>YOUR REFERRAL CODE</Text>
            <View style={styles.codePill}>
              <Text style={styles.codeText} selectable>
                {data?.code || '—'}
              </Text>
            </View>

            {data?.inviteUrl ? (
              <View style={styles.urlContainer}>
                <Text style={styles.urlLabel}>INVITE LINK</Text>
                <View style={styles.urlBox}>
                  <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle" selectable>
                    {data.inviteUrl}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.88}>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareText}>Share Invite Link</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time-outline" size={18} color="#D97706" />
              </View>
              <Text style={styles.statValue}>{data?.pending ?? 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
              </View>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>{data?.rewarded ?? 0}</Text>
              <Text style={styles.statLabel}>Rewarded</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Share your unique link or code with your friends.</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Friends sign up and verify their phone and email.</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Both of you receive promo credits automatically!</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(14),
    color: '#64748B',
  },
  errorIconWrap: {
    marginBottom: 12,
  },
  errorText: {
    color: '#64748B',
    marginBottom: 16,
    fontSize: RFValue(14),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF914D',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: RFValue(14),
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1A2980',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: RFValue(21),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: RFValue(13),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 19,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  codeCardLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  codePill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  codeText: {
    fontSize: RFValue(26),
    fontWeight: '800',
    color: '#1A2980',
    letterSpacing: 2,
  },
  urlContainer: {
    width: '100%',
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  urlBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urlText: {
    fontSize: RFValue(12),
    color: '#475569',
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#FF914D',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF914D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: RFValue(12),
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#4F46E5',
  },
  stepText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#475569',
    lineHeight: 18,
  },
});
