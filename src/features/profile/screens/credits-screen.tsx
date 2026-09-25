import type { CreditLedgerEntry } from '@/src/api/credits-api';
import { useGetCreditsBalance, useGetCreditsLedger, useGetCreditsSettings } from '@/src/shared/hooks/useCreditsApi';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { router } from 'expo-router';
import InviteFriendsScreen from './invite-friends-screen';
import { useTheme } from '@/src/shared/theme';
import { IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import { HS } from '@/src/shared/theme/homeStyle';

interface CreditsScreenProps {
  onBack: () => void;
  onNavigateToInvite?: () => void;
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

export default function CreditsScreen({ onBack, onNavigateToInvite }: CreditsScreenProps) {
  const { isDarkMode } = useTheme();
  const [showInvite, setShowInvite] = React.useState(false);

  // Unconditional hook calls at top-level (Fix React Rules of Hooks crash)
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

  if (showInvite) {
    return <InviteFriendsScreen onBack={() => setShowInvite(false)} />;
  }

  const refreshing = balanceRefetching || ledgerRefetching;
  const balance = Number(balanceData?.balance ?? 0);

  const renderItem = ({ item }: { item: CreditLedgerEntry }) => {
    const isCredit = item.direction === 'credit';
    return (
      <View style={[styles.ledgerCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={[styles.iconCircle, isCredit ? styles.creditIconBg : (isDarkMode ? { backgroundColor: '#0F172A' } : styles.debitIconBg)]}>
          <Ionicons
            name={isCredit ? 'gift-outline' : 'cart-outline'}
            size={19}
            color={isCredit ? (isDarkMode ? '#16A34A' : HS.greenText) : (isDarkMode ? '#38BDF8' : HS.blue)}
          />
        </View>
        <View style={styles.ledgerBody}>
          <Text style={[styles.ledgerReason, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>{formatReason(item.reason, isCredit)}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.ledgerDate, isDarkMode && { color: '#94A3B8' }]}>{formatDate(item.createdAt)}</Text>
            {item.expiresAt && (
              <View style={[styles.expiryBadge, isDarkMode && { backgroundColor: 'rgba(251,191,36,0.18)' }]}>
                <Text style={[styles.expiryText, isDarkMode && { color: '#FBBF24' }]}>Expires {formatDate(item.expiresAt)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.amountWrap}>
          <Text style={[styles.ledgerAmount, isCredit ? styles.creditText : styles.debitText, isDarkMode && { color: isCredit ? '#4ADE80' : 'rgba(255,255,255,0.75)' }]}>
            {isCredit ? '+' : '−'}${Math.abs(Number(item.amount) || 0).toFixed(0)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <LightHeader
        title="My Credits & Rewards"
        onBack={onBack}
        right={
          <TouchableOpacity style={styles.headerRightBtn} onPress={() => onBack()} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {(balanceLoading || ledgerLoading) && !balanceData ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : HS.blue} />
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
              tintColor={isDarkMode ? '#38BDF8' : HS.blue}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Premium 2026 Balance Card */}
              <View style={[styles.heroCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTagPill}>
                    <Ionicons name="sparkles" size={13} color="#FBBF24" />
                    <Text style={styles.cardTagText}>PROMO BALANCE</Text>
                  </View>
                  <IconChip name="wallet-outline" size={40} />
                </View>

                <View style={styles.balanceRow}>
                  <Text style={[styles.currencySymbol, isDarkMode && { color: '#38BDF8' }]}>$</Text>
                  <Text style={[styles.balanceValue, isDarkMode && { color: '#F8FAFC' }]}>{balance.toFixed(0)}</Text>
                  <Text style={[styles.creditsUnitText, isDarkMode && { color: '#94A3B8' }]}>AUD</Text>
                </View>

                <Text style={[styles.balanceHint, isDarkMode && { color: '#94A3B8' }]}>
                  Promo credits automatically offset eligible service fees on task amounts of
                  {settings?.minTaskAmountForCreditSpend
                    ? ` $${settings.minTaskAmountForCreditSpend}+`
                    : ' $100+'}
                  .
                </Text>

                {/* Quick Action: Invite Friends */}
                <View style={[styles.cardDivider, isDarkMode && { backgroundColor: '#334155' }]} />
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (onNavigateToInvite) {
                      onNavigateToInvite();
                    } else {
                      setShowInvite(true);
                    }
                  }}
                >
                  <View style={styles.actionBtnContent}>
                    <Ionicons name="gift-outline" size={17} color="#FFFFFF" />
                    <Text style={styles.cardActionBtnText}>Invite Friends & Earn +$10 Credits</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Transaction Section Header */}
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Credit History</Text>
                <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                  {ledger.length} {ledger.length === 1 ? 'activity' : 'activities'}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
                <Ionicons name="wallet-outline" size={36} color={isDarkMode ? '#38BDF8' : HS.blue} />
              </View>
              <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No credit activity yet</Text>
              <Text style={[styles.emptySubtitle, isDarkMode && { color: '#94A3B8' }]}>
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
  container: { flex: 1, backgroundColor: HS.page },
  headerRightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  headerSection: { paddingTop: 16 },

  // Hero Card
  heroCard: {
    backgroundColor: HS.blue,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HS.blueDeep,
    padding: 20,
    marginBottom: 20,
    shadowColor: HS.blue,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
    backgroundColor: 'rgba(251,191,36,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cardTagText: {
    color: '#FBBF24',
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
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.75)',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: RFValue(12.5),
    lineHeight: 18,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    color: HS.navy,
  },
  sectionSubtitle: {
    fontSize: RFValue(12),
    color: HS.muted,
    fontWeight: '500',
  },

  // Ledger Card
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: HS.cardBorder,
    shadowColor: HS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creditIconBg: {
    backgroundColor: HS.greenBg,
  },
  debitIconBg: {
    backgroundColor: HS.tint,
  },
  ledgerBody: { flex: 1, minWidth: 0 },
  ledgerReason: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
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
    color: HS.muted,
  },
  expiryBadge: {
    backgroundColor: HS.amberBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryText: {
    fontSize: RFValue(10.5),
    fontWeight: '600',
    color: HS.amberText,
  },
  amountWrap: {
    paddingLeft: 8,
  },
  ledgerAmount: {
    fontSize: RFValue(16),
    fontWeight: '800',
  },
  creditText: { color: HS.greenText },
  debitText: { color: HS.muted },

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
    backgroundColor: HS.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: RFValue(13),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
