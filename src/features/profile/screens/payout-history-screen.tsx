import { useGetPayoutHistory } from '@/src/shared/hooks/useStripeConnectApi';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BlueBackdrop, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import { useTheme } from '@/src/shared/theme';
import AppLoader from '@/src/shared/components/AppLoader';

interface PayoutHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

const PayoutHistoryScreen: React.FC<PayoutHistoryScreenProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const { data: payoutData, isLoading, error, refetch } = useGetPayoutHistory(20);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'AUD') => {
    return `$${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#16A34A';
      case 'pending':
        return '#D97706';
      case 'in_transit':
        return '#0EA5E9';
      case 'failed':
        return '#DC2626';
      case 'canceled':
        return '#64748B';
      default:
        return '#64748B';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'in_transit':
        return 'In Transit';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  const pageBg = isDarkMode && { backgroundColor: '#0B1120' };
  const mutedText = isDarkMode && { color: '#94A3B8' };
  const titleText = isDarkMode && { color: '#F8FAFC' };
  const accent = isDarkMode ? '#38BDF8' : '#FFFFFF';

  const refreshBtn = (
    <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton} activeOpacity={0.7}>
      <Ionicons name="refresh" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Render payout item
  const renderPayoutItem = ({ item }: any) => (
    <View style={[styles.payoutItem, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.payoutHeader}>
        <View style={styles.payoutInfo}>
          <Text style={[styles.payoutAmount, titleText]} numberOfLines={1}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          <Text style={[styles.payoutDate, mutedText]}>{formatDate(item.created)}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.payoutDescription, isDarkMode && { color: '#CBD5E1' }]}>{item.description}</Text>
      )}

      {item.arrivalDate && (
        <View style={styles.arrivalInfo}>
          <Ionicons name="calendar-outline" size={14} color={accent} />
          <Text style={[styles.arrivalText, mutedText]}>
            Arrives: {formatDate(item.arrivalDate)}
          </Text>
        </View>
      )}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, pageBg]}>
      <BlueBackdrop />
        <LightHeader title="Payout History" onBack={() => onNavigate('paymentOptions')} />
        <View style={styles.loadingContainer}>
          <AppLoader size={32} color={accent} />
          <Text style={[styles.loadingText, mutedText]}>Loading payout history...</Text>
        </View>
      </View>
    );
  }

  // Error state (no account)
  if (error?.status === 404 || !payoutData) {
    return (
      <View style={[styles.container, pageBg]}>
      <BlueBackdrop />
        <LightHeader title="Payout History" onBack={() => onNavigate('paymentOptions')} />
        <View style={styles.emptyState}>
          <View style={[styles.emptyCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <Ionicons name="wallet-outline" size={40} color={accent} />
          </View>
          <Text style={[styles.emptyTitle, titleText]}>No Payout Account</Text>
          <Text style={[styles.emptyDescription, mutedText]}>
            Setup your payout account to start receiving payments.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('payoutAccount')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Setup Payout Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state (no payouts)
  if (payoutData.payouts.length === 0) {
    return (
      <View style={[styles.container, pageBg]}>
      <BlueBackdrop />
        <LightHeader title="Payout History" onBack={() => onNavigate('paymentOptions')} right={refreshBtn} />
        <View style={styles.emptyState}>
          <View style={[styles.emptyCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <Ionicons name="cash-outline" size={40} color={accent} />
          </View>
          <Text style={[styles.emptyTitle, titleText]}>No Payouts Yet</Text>
          <Text style={[styles.emptyDescription, mutedText]}>
            Your payout history will appear here once you receive payments.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, pageBg]}>
      <BlueBackdrop />
      <LightHeader title="Payout History" onBack={() => onNavigate('paymentOptions')} right={refreshBtn} />

      <FlatList keyboardShouldPersistTaps="handled"
        data={payoutData.payouts}
        renderItem={renderPayoutItem}
        keyExtractor={(item) => item.payoutId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
        }
      />

      <View style={[styles.loadMoreContainer, isDarkMode && { backgroundColor: '#0F172A', borderTopColor: '#334155' }]}>
        <Text style={[styles.loadMoreText, mutedText]}>
          Showing {payoutData.payouts.length} of {payoutData.count} payouts
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    color: '#FFFFFF',
  },
  emptyDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 28,
    height: 52,
    gap: 8,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  payoutItem: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payoutInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  payoutDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  arrivalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  arrivalText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  loadMoreContainer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
  },
  loadMoreText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
});

export default PayoutHistoryScreen;
