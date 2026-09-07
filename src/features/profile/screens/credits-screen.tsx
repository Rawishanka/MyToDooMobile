import type { CreditLedgerEntry } from '@/src/api/credits-api';
import { useGetCreditsBalance, useGetCreditsLedger, useGetCreditsSettings } from '@/src/shared/hooks/useCreditsApi';
import { Ionicons } from '@expo/vector-icons';
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

export default function CreditsScreen({ onBack }: CreditsScreenProps) {
  const insets = useSafeAreaInsets();
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
      <View style={styles.ledgerRow}>
        <View style={[styles.directionDot, isCredit ? styles.creditDot : styles.debitDot]} />
        <View style={styles.ledgerBody}>
          <Text style={styles.ledgerReason}>{item.reason || (isCredit ? 'Credit' : 'Spend')}</Text>
          <Text style={styles.ledgerMeta}>
            {formatDate(item.createdAt)}
            {item.expiresAt ? ` · expires ${formatDate(item.expiresAt)}` : ''}
          </Text>
        </View>
        <Text style={[styles.ledgerAmount, isCredit ? styles.creditText : styles.debitText]}>
          {isCredit ? '+' : '−'}
          {Math.abs(Number(item.amount) || 0).toFixed(0)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits</Text>
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
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Promo credits balance</Text>
              <Text style={styles.balanceValue}>{balance.toFixed(0)}</Text>
              <Text style={styles.balanceHint}>
                Credits are promo value, not cash. They can offset eligible poster fees when the task
                amount meets the minimum
                {settings?.minTaskAmountForCreditSpend
                  ? ` ($${settings.minTaskAmountForCreditSpend}+)`
                  : ''}
                .
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No credit activity yet.</Text>
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
  listContent: { padding: 16, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: '#0052A2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: RFValue(13) },
  balanceValue: {
    color: '#fff',
    fontSize: RFValue(36),
    fontWeight: '700',
    marginVertical: 6,
  },
  balanceHint: { color: 'rgba(255,255,255,0.8)', fontSize: RFValue(12), lineHeight: 18 },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  directionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  creditDot: { backgroundColor: '#28a745' },
  debitDot: { backgroundColor: '#dc3545' },
  ledgerBody: { flex: 1 },
  ledgerReason: { fontSize: RFValue(14), fontWeight: '600', color: '#222' },
  ledgerMeta: { fontSize: RFValue(12), color: '#888', marginTop: 2 },
  ledgerAmount: { fontSize: RFValue(15), fontWeight: '700' },
  creditText: { color: '#28a745' },
  debitText: { color: '#dc3545' },
  emptyWrap: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: RFValue(14) },
});
