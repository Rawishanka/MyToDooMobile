import { useGetPayoutHistory } from '@/src/shared/hooks/useStripeConnectApi';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PayoutHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

const PayoutHistoryScreen: React.FC<PayoutHistoryScreenProps> = ({ onNavigate }) => {
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
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'in_transit':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      case 'canceled':
        return '#6b7280';
      default:
        return '#6b7280';
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

  // Render payout item
  const renderPayoutItem = ({ item }: any) => (
    <View style={styles.payoutItem}>
      <View style={styles.payoutHeader}>
        <View style={styles.payoutInfo}>
          <Text style={styles.payoutAmount}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          <Text style={styles.payoutDate}>{formatDate(item.created)}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.payoutDescription}>{item.description}</Text>
      )}

      {item.arrivalDate && (
        <View style={styles.arrivalInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.arrivalText}>
            Arrives: {formatDate(item.arrivalDate)}
          </Text>
        </View>
      )}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('paymentOptions')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading payout history...</Text>
        </View>
      </View>
    );
  }

  // Error state (no account)
  if (error?.status === 404 || !payoutData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('paymentOptions')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout History</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Payout Account</Text>
          <Text style={styles.emptyDescription}>
            Setup your payout account to start receiving payments.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('payoutAccount')}
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('paymentOptions')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout History</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#6200ee" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cash-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Payouts Yet</Text>
          <Text style={styles.emptyDescription}>
            Your payout history will appear here once you receive payments.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('paymentOptions')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout History</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#6200ee" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={payoutData.payouts}
        renderItem={renderPayoutItem}
        keyExtractor={(item) => item.payoutId}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      <View style={styles.loadMoreContainer}>
        <Text style={styles.loadMoreText}>
          Showing {payoutData.payouts.length} of {payoutData.count} payouts
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 24,
    color: '#000',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
    minHeight: 48,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  payoutItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  payoutDescription: {
    fontSize: 14,
    color: '#333',
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
    color: '#666',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  loadMoreText: {
    fontSize: 12,
    color: '#666',
  },
});

export default PayoutHistoryScreen;
