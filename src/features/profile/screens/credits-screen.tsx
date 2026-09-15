import type { CreditLedgerEntry } from '@/src/api/credits-api';
import { useGetCreditsBalance, useGetCreditsLedger, useGetCreditsSettings } from '@/src/shared/hooks/useCreditsApi';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { router } from 'expo-router';
import InviteFriendsScreen from './invite-friends-screen';

interface CreditsScreenProps {
  onBack: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatReason(reason?: string | null, isCredit: boolean = true) {
  if (!reason) return isCredit ? 'Credit Added' : 'Credit Used';
  switch (reason) {
    case 'referral_reward_referrer':
      return 'Referral Reward (Friend Joined)';
    case 'referral_reward_referee':
      return 'Welcome Bonus (Invited)';
    case 'promo_credit':
      return 'Promotional Credit';
    case 'task_fee_discount':
      return 'Task Fee Offset';
    case 'task_payment_offset':
      return 'Task Payment Discount';
    case 'signup_bonus':
      return 'Sign-up Welcome Bonus';
    default:
      return reason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export default function CreditsScreen({ onBack }: CreditsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showInvite, setShowInvite] = React.useState(false);

  if (showInvite) {
    return <InviteFriendsScreen onBack={() => setShowInvite(false)} />;
  }
  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
    isRefetching: balanceRefetching,
  } = useGetCreditsBalance();
  const {
    data: ledger = [],
    isLoading: ledgerLoading,
    refetch: refetchLedger,
    isRefetching: ledgerRefetching,
  } = useGetCreditsLedger(50);
  const { data: settings } = useGetCreditsSettings();

  const refreshing = balanceRefetching || ledgerRefetching;
  const balance = Number(balanceData?.balance ?? 0);

  const renderItem = ({ item }: { item: CreditLedgerEntry }) => {
    const isCredit = item.direction === 'credit';
    return (
      <View style={styles.ledgerCard}>
        <View style={[styles.iconCircle, isCredit ? styles.creditIconBg : styles.debitIconBg]}>
          <Ionicons
            name={isCredit ? 'gift-outline' : 'cart-outline'}
            size={20}
            color={isCredit ? '#10B981' : '#64748B'}
          />
        </View>
        <View style={styles.ledgerBody}>
          <Text style={styles.ledgerReason}>{formatReason(item.reason, isCredit)}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.ledgerDate}>{formatDate(item.createdAt)}</Text>
            {item.expiresAt && (
              <View style={styles.expiryBadge}>
                <Text style={styles.expiryText}>Expires {formatDate(item.expiresAt)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.amountWrap}>
          <Text style={[styles.ledgerAmount, isCredit ? styles.creditText : styles.debitText]}>
            {isCredit ? '+' : '−'}${Math.abs(Number(item.amount) || 0).toFixed(0)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 2026 Modern Top Navigation */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 46 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Credits & Rewards</Text>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => onBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {(balanceLoading || ledgerLoading) && !balanceData ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0052A2" />
        </View>
      ) : (
        <FlatList
          data={ledger}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchBalance();
                refetchLedger();
              }}
              tintColor="#0052A2"
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Premium 2026 Balance Card */}
              <View style={styles.heroCard}>
                <View style={styles.cardDecorativeGlow} />
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTagPill}>
                    <Ionicons name="sparkles" size={13} color="#FBBF24" />
                    <Text style={styles.cardTagText}>PROMO BALANCE</Text>
                  </View>
                  <MaterialCommunityIcons name="wallet-giftcard" size={28} color="rgba(255,255,255,0.7)" />
                </View>

                <View style={styles.balanceRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Text style={styles.balanceValue}>{balance.toFixed(0)}</Text>
                  <Text style={styles.creditsUnitText}>AUD</Text>
                </View>

                <Text style={styles.balanceHint}>
                  Promo credits automatically offset eligible service fees on task amounts of
                  {settings?.minTaskAmountForCreditSpend
                    ? ` $${settings.minTaskAmountForCreditSpend}+`
                    : ' $100+'}
                  .
                </Text>

                {/* Quick Action: Invite Friends */}
                <View style={styles.cardDivider} />
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowInvite(true);
                  }}
                >
                  <View style={styles.actionBtnContent}>
                    <Ionicons name="gift-outline" size={17} color="#FFFFFF" />
                    <Text style={styles.cardActionBtnText}>Invite Friends & Earn +$10 Credits</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>

              {/* Transaction Section Header */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Credit History</Text>
                <Text style={styles.sectionSubtitle}>
                  {ledger.length} {ledger.length === 1 ? 'activity' : 'activities'}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="wallet-outline" size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No credit activity yet</Text>
              <Text style={styles.emptySubtitle}>
                Invite friends or complete eligible promotional actions to earn rewards!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRightBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  headerSection: { paddingTop: 16 },

  // Hero Card
  heroCard: {
    backgroundColor: '#003399',
    borderRadius: 22,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#003399',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  cardDecorativeGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cardTagText: {
    color: '#FFFFFF',
    fontSize: RFValue(11),
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currencySymbol: {
    color: '#93C5FD',
    fontSize: RFValue(24),
    fontWeight: '700',
    marginRight: 4,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: RFValue(42),
    fontWeight: '800',
    letterSpacing: -1,
  },
  creditsUnitText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: RFValue(12.5),
    lineHeight: 18,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: 12,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '700',
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: RFValue(12),
    color: '#64748B',
    fontWeight: '500',
  },

  // Ledger Card
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creditIconBg: {
    backgroundColor: '#ECFDF5',
  },
  debitIconBg: {
    backgroundColor: '#F1F5F9',
  },
  ledgerBody: { flex: 1 },
  ledgerReason: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ledgerDate: {
    fontSize: RFValue(12),
    color: '#64748B',
  },
  expiryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
    color: '#B45309',
  },
  amountWrap: {
    paddingLeft: 8,
  },
  ledgerAmount: {
    fontSize: RFValue(16),
    fontWeight: '800',
  },
  creditText: { color: '#059669' },
  debitText: { color: '#64748B' },

  // Empty Wrap
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: RFValue(13),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
