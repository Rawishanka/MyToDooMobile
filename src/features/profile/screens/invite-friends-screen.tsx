import { useGetMyReferral } from '@/src/shared/hooks/useReferralApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';
import AppLoader from '@/src/shared/components/AppLoader';
import { BlueBackdrop, LightHeader } from '@/src/shared/components/custom_components/lightCard';

interface InviteFriendsScreenProps {
  onBack: () => void;
}

export default function InviteFriendsScreen({ onBack }: InviteFriendsScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
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
    <View style={[styles.container, isDarkMode && { backgroundColor: "#0B1120" }]}>
      <BlueBackdrop />
      <LightHeader title="Invite Friends" onBack={onBack} />

      {isLoading && !data ? (
        <View style={styles.loadingWrap}>
          <AppLoader size={32} color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
          <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading referral details...</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.loadingWrap}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={38} color={isDarkMode ? '#DC2626' : '#FCA5A5'} />
          </View>
          <Text style={[styles.errorText, isDarkMode && { color: '#94A3B8' }]}>Could not load your invite link.</Text>
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
          {/* Hero */}
          <View style={[styles.heroCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.heroBadge}>
              <Ionicons name="gift" size={14} color="#FBBF24" />
              <Text style={styles.heroBadgeText}>PROMO REWARDS</Text>
            </View>
            <Text style={[styles.heroTitle, isDarkMode && { color: '#F8FAFC' }]}>Invite Friends & Earn Credits</Text>
            <Text style={[styles.heroSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Give friends bonus promo credits when they join and get rewarded once they verify their account!
            </Text>
          </View>

          {/* Referral Code Card */}
          <View style={[styles.codeCard, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
            <Text style={[styles.codeCardLabel, isDarkMode && { color: "#94A3B8" }]}>YOUR REFERRAL CODE</Text>
            <View style={[styles.codePill, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#38BDF8" }]}>
              <Text style={[styles.codeText, isDarkMode && { color: '#38BDF8' }]} selectable>
                {data?.code || '—'}
              </Text>
            </View>

            {data?.inviteUrl ? (
              <View style={styles.urlContainer}>
                <Text style={[styles.urlLabel, isDarkMode && { color: '#94A3B8' }]}>INVITE LINK</Text>
                <View style={[styles.urlBox, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#334155" }]}>
                  <Text style={[styles.urlText, isDarkMode && { color: "#94A3B8" }]} numberOfLines={1} ellipsizeMode="middle" selectable>
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
            <View style={[styles.statCard, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(251,191,36,0.18)' }]}>
                <Ionicons name="time-outline" size={18} color="#FBBF24" />
              </View>
              <Text style={[styles.statValue, isDarkMode && { color: "#F8FAFC" }]}>{data?.pending ?? 0}</Text>
              <Text style={[styles.statLabel, isDarkMode && { color: "#94A3B8" }]}>Pending</Text>
            </View>
            <View style={[styles.statCard, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(74,222,128,0.18)' }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#4ADE80" />
              </View>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>{data?.rewarded ?? 0}</Text>
              <Text style={[styles.statLabel, isDarkMode && { color: "#94A3B8" }]}>Rewarded</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={[styles.infoCard, isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" }]}>
            <Text style={[styles.infoTitle, isDarkMode && { color: "#F8FAFC" }]}>How it works</Text>
            <View style={styles.infoStep}>
              <View style={[styles.stepNumber, isDarkMode && { backgroundColor: "#0F172A" }]}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={[styles.stepText, isDarkMode && { color: "#94A3B8" }]}>Share your unique link or code with your friends.</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={[styles.stepNumber, isDarkMode && { backgroundColor: "#0F172A" }]}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={[styles.stepText, isDarkMode && { color: "#94A3B8" }]}>Friends sign up and verify their phone and email.</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={[styles.stepNumber, isDarkMode && { backgroundColor: "#0F172A" }]}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={[styles.stepText, isDarkMode && { color: "#94A3B8" }]}>Both of you receive promo credits automatically!</Text>
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
    backgroundColor: '#003399',
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
    color: 'rgba(255,255,255,0.85)',
  },
  errorIconWrap: {
    marginBottom: 12,
  },
  errorText: {
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
    fontSize: RFValue(14),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 20,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251,191,36,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#FBBF24',
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
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    alignItems: 'center',
  },
  codeCardLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  codePill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.55)',
    marginBottom: 16,
  },
  codeText: {
    fontSize: RFValue(26),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  urlContainer: {
    width: '100%',
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  urlBox: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  urlText: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.9)',
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    gap: 14,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },

  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },

  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 19,
  },
});
