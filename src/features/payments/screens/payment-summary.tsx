import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// API and Hooks
import { useGetAllOffers, useGetMyTasks, useGetPaymentStatus } from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';

// Utils
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';

interface PaymentSummaryItem {
  taskId: string;
  taskTitle: string;
  taskLocation: string;
  offerAmount: number;
  currency: string;
  formattedAmount: string;
  taskerName: string;
  posterName: string;
  acceptedDate: string;
  status: string;
  paymentStatus: string;
}

export default function PaymentSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { countryInfo } = useLocationCountry();
  const userCurrencyInfo = getCurrencyFromUserLocation(countryInfo);
  const currentUser = useAuthStore((state: any) => state.user);
  
  // Fetch payment status data (for actual payment information) - with better error handling
  const { 
    data: paymentStatusData, 
    isLoading: isPaymentStatusLoading,
    error: paymentStatusError,
    refetch: refetchPaymentStatus 
  } = useGetPaymentStatus();
  
  // Suppress error logging for known 404 errors
  React.useEffect(() => {
    if (paymentStatusError && paymentStatusError.message.includes('404')) {
      console.log('ℹ️ Payment status endpoint not available (expected), using fallback data');
    }
  }, [paymentStatusError]);
  
  // Fetch accepted offers data
  const { 
    data: offersData, 
    isLoading: isOffersLoading, 
    error: offersError,
    refetch: refetchOffers 
  } = useGetAllOffers({});
  
  // Fetch my tasks data
  const { 
    data: myTasksData, 
    isLoading: isTasksLoading,
    refetch: refetchTasks 
  } = useGetMyTasks({});
  
  const isLoading = isOffersLoading || isTasksLoading || isPaymentStatusLoading;
  const allOffers = offersData?.data || [];
  const myTasks = myTasksData?.data || [];
  const paymentStatus = paymentStatusData?.data || [];
  
  // Process accepted offers into payment summary items
  const paymentSummaryItems: PaymentSummaryItem[] = React.useMemo(() => {
    console.log('🔍 Payment Summary Debug:', {
      totalOffers: allOffers.length,
      totalTasks: myTasks.length,
      paymentStatusCount: Array.isArray(paymentStatus) ? paymentStatus.length : 0,
      offersData: allOffers.slice(0, 3),
      tasksData: myTasks.slice(0, 3),
      paymentStatusData: paymentStatus,
      currentUserId: currentUser?._id || currentUser?.id,
      paymentStatusError: paymentStatusError?.message || 'No error'
    });
    
    // Try to use payment status data if available, otherwise fall back to offers
    if (Array.isArray(paymentStatus) && paymentStatus.length > 0) {
      console.log('✅ Using Payment Status Data');
      return paymentStatus.map((payment: any) => ({
        taskId: payment.taskId || payment._id || 'unknown',
        taskTitle: payment.taskTitle || payment.title || 'Task',
        taskLocation: payment.taskLocation || payment.location?.address || 'Location not specified',
        offerAmount: payment.amount || payment.offerAmount || 0,
        currency: payment.currency || userCurrencyInfo.code,
        formattedAmount: formatCurrency(
          payment.amount || payment.offerAmount || 0, 
          { 
            code: payment.currency || userCurrencyInfo.code, 
            symbol: userCurrencyInfo.symbol 
          }
        ),
        taskerName: payment.taskerName || `${payment.taskTaker?.firstName || 'Unknown'} ${payment.taskTaker?.lastName || ''}`.trim(),
        posterName: payment.posterName || `${payment.taskCreator?.firstName || 'Unknown'} ${payment.taskCreator?.lastName || ''}`.trim(),
        acceptedDate: payment.completedAt || payment.paidAt || payment.updatedAt || payment.createdAt,
        status: payment.status || 'completed',
        paymentStatus: 'completed'
      }));
    }
    
    // Fallback to offers data - show all offers with payment activity, not just accepted
    console.log('⚠️ Falling back to Offers Data');
    
    // Filter offers that have payment-related status or significant activity
    const relevantOffers = allOffers.filter((offer: any) => {
      const status = offer.status?.toLowerCase() || '';
      return status === 'accepted' || 
             status === 'payment_completed' || 
             status === 'payment_failed' || 
             status === 'completed' ||
             (offer.amount && offer.amount > 0); // Any offer with amount is relevant
    });
    
    console.log('✅ Relevant Offers Found:', {
      total: relevantOffers.length,
      relevantOffers: relevantOffers.slice(0, 3),
      allStatuses: allOffers.map(o => o.status)
    });
    
    return relevantOffers.map((offer: any) => {
      // Find the associated task
      const associatedTask = myTasks.find((task: any) => task._id === offer.taskId?._id) || offer.task;
      
      return {
        taskId: offer.taskId?._id || offer.task?._id || 'unknown',
        taskTitle: offer.taskId?.title || offer.task?.title || 'Task',
        taskLocation: associatedTask?.location?.address || 'Location not specified',
        offerAmount: offer.offer?.amount || offer.amount || 0,
        currency: offer.offer?.currency || offer.currency || userCurrencyInfo.code,
        formattedAmount: formatCurrency(
          offer.offer?.amount || offer.amount || 0, 
          { 
            code: offer.offer?.currency || offer.currency || userCurrencyInfo.code, 
            symbol: userCurrencyInfo.symbol 
          }
        ),
        taskerName: `${offer.taskTakerId?.firstName || offer.taskTaker?.firstName || 'Unknown'} ${offer.taskTakerId?.lastName || offer.taskTaker?.lastName || ''}`.trim(),
        posterName: `${offer.taskCreatorId?.firstName || 'Unknown'} ${offer.taskCreatorId?.lastName || ''}`.trim(),
        acceptedDate: offer.updatedAt || offer.createdAt,
        status: offer.status,
        paymentStatus: offer.status === 'payment_completed' || offer.status === 'completed' ? 'completed' : 
                      offer.status === 'payment_failed' ? 'failed' : 'pending'
      };
    }).sort((a, b) => new Date(b.acceptedDate).getTime() - new Date(a.acceptedDate).getTime());
  }, [allOffers, myTasks, paymentStatus, userCurrencyInfo, paymentStatusError]);
  
  // Calculate totals
  const totalAmount = paymentSummaryItems.reduce((sum, item) => sum + item.offerAmount, 0);
  const completedPayments = paymentSummaryItems.filter(item => item.paymentStatus === 'completed').length;
  const pendingPayments = paymentSummaryItems.filter(item => item.paymentStatus === 'pending').length;
  const failedPayments = paymentSummaryItems.filter(item => item.paymentStatus === 'failed').length;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleRefresh = () => {
    refetchOffers();
    refetchTasks();
    refetchPaymentStatus();
  };
  
  const renderPaymentItem = ({ item }: { item: PaymentSummaryItem }) => (
    <TouchableOpacity 
      style={styles.paymentCard}
      onPress={() => {
        // Navigate to task detail
        router.push({
          pathname: '/task-detail',
          params: { taskId: item.taskId }
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.paymentCardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.taskTitle}
          </Text>
          <Text style={styles.taskLocation} numberOfLines={1}>
            📍 {item.taskLocation}
          </Text>
          <Text style={styles.taskParticipants}>
            👤 {item.taskerName} → 🏠 {item.posterName}
          </Text>
          <Text style={styles.acceptedDate}>
            Accepted {formatDate(item.acceptedDate)}
          </Text>
        </View>
        <View style={styles.cardAmountSection}>
          <Text style={styles.amount}>
            {item.formattedAmount}
          </Text>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: item.paymentStatus === 'completed' ? '#28a745' : 
                             item.paymentStatus === 'failed' ? '#dc3545' : '#ffc107' 
            }
          ]}>
            <Ionicons 
              name={item.paymentStatus === 'completed' ? 'checkmark-circle' : 
                   item.paymentStatus === 'failed' ? 'close-circle' : 'time'} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.statusText}>
              {item.paymentStatus === 'completed' ? 'Paid' : 
               item.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading payment summary...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "",
          headerShown: false,
        }} 
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Summary</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#007bff" />
          </TouchableOpacity>
        </View>
      
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {/* Debit Card Style Total Amount */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.debitCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>MYTODOO PAY</Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.cardAmount}>
              {formatCurrency(totalAmount, userCurrencyInfo)}
            </Text>
            <Text style={styles.cardSubtitle}>Available Balance</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardSmall]}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={[styles.summaryNumber, { color: '#28a745' }]}>
              {completedPayments}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, styles.summaryCardSmall]}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryNumber, { color: '#ffc107' }]}>
              {pendingPayments}
            </Text>
          </View>
          
          {failedPayments > 0 && (
            <View style={[styles.summaryCard, styles.summaryCardSmall]}>
              <Text style={styles.summaryLabel}>Failed</Text>
              <Text style={[styles.summaryNumber, { color: '#dc3545' }]}>
                {failedPayments}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Payment List */}
      {paymentSummaryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Payment Activity</Text>
          <Text style={styles.emptySubtitle}>
            {paymentStatusError ? 
              "Payment data is currently unavailable. Check your connection and try refreshing." :
              "You don't have any offers with payment activity yet. Start accepting offers to see payment information here."
            }
          </Text>
          <TouchableOpacity style={styles.refreshButton2} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={paymentSummaryItems}
          keyExtractor={(item) => `${item.taskId}-${item.acceptedDate}`}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      )}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 5,
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  // Debit Card Styles
  debitCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 2,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryCardSmall: {
    flex: 1,
    marginBottom: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  paymentCard: {
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
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskParticipants: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  acceptedDate: {
    fontSize: 12,
    color: '#999',
  },
  cardAmountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshButton2: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});