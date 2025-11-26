import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useGetPosterPayments, useGetTaskerPayments } from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';

// Utils
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';

interface PaymentSummaryItem {
  paymentId: string;
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
  
  // Role state management
  const [userRole, setUserRole] = useState<'Tasker' | 'Poster'>('Tasker');
  
  // Fetch Tasker payments
  const { 
    data: taskerPaymentsData, 
    isLoading: isTaskerPaymentsLoading,
    error: taskerPaymentsError,
    refetch: refetchTaskerPayments 
  } = useGetTaskerPayments();
  
  // Fetch Poster payments
  const { 
    data: posterPaymentsData, 
    isLoading: isPosterPaymentsLoading,
    error: posterPaymentsError,
    refetch: refetchPosterPayments 
  } = useGetPosterPayments();
  
  // Determine which data to use based on selected role
  const isLoading = userRole === 'Tasker' ? isTaskerPaymentsLoading : isPosterPaymentsLoading;
  const paymentsError = userRole === 'Tasker' ? taskerPaymentsError : posterPaymentsError;
  
  // Process payments into payment summary items
  const paymentSummaryItems: PaymentSummaryItem[] = React.useMemo(() => {
    const paymentsData = userRole === 'Tasker' 
      ? (taskerPaymentsData?.payments || []) 
      : (posterPaymentsData?.payments || []);
      
    console.log('🔍 Payment Summary Debug:', {
      userRole,
      paymentsCount: paymentsData.length,
      samplePayments: paymentsData.slice(0, 2),
      currentUserId: currentUser?._id || currentUser?.id
    });
    
    // Process payment data from dedicated endpoints
    return paymentsData.map((payment: any) => {
      const task = payment.task || {};
      const offer = payment.offer || {};
      
      // Enhanced location parsing to handle ALL possible formats
      let locationText = 'Location not specified';
      
      if (task.location) {
        const locationType = typeof task.location;
        
        console.log('🔍 RAW Location Debug:', {
          taskId: task._id,
          taskTitle: task.title,
          locationType: locationType,
          locationValue: task.location,
          isString: locationType === 'string',
          isObject: locationType === 'object',
          stringified: JSON.stringify(task.location)
        });
        
        if (locationType === 'string') {
          // If it's already a string, check if it's a JSON string
          const trimmedLocation = task.location.trim();
          
          // Check if string starts with { or [ (JSON format)
          if (trimmedLocation.startsWith('{') || trimmedLocation.startsWith('[')) {
            try {
              // Try to parse JSON string
              const parsedLocation = JSON.parse(trimmedLocation);
              if (parsedLocation.address) {
                locationText = parsedLocation.address;
              } else if (parsedLocation.city) {
                locationText = parsedLocation.city;
              } else {
                // Construct from parts
                const parts = [];
                if (parsedLocation.street) parts.push(parsedLocation.street);
                if (parsedLocation.city) parts.push(parsedLocation.city);
                if (parsedLocation.state) parts.push(parsedLocation.state);
                if (parsedLocation.country) parts.push(parsedLocation.country);
                locationText = parts.length > 0 ? parts.join(', ') : trimmedLocation;
              }
              console.log('✅ Parsed JSON string location:', locationText);
            } catch (error) {
              // If JSON parsing fails, use the string as-is
              locationText = trimmedLocation;
              console.log('⚠️ Failed to parse JSON, using raw string:', locationText, error);
            }
          } else {
            // Regular string location
            locationText = trimmedLocation;
            console.log('✅ Using string location:', locationText);
          }
        } else if (locationType === 'object' && task.location !== null) {
          // If it's an object, extract the address or city
          if (task.location.address) {
            locationText = task.location.address;
          } else if (task.location.city) {
            locationText = task.location.city;
          } else {
            // Fallback: try to construct from available fields
            const parts = [];
            if (task.location.street) parts.push(task.location.street);
            if (task.location.city) parts.push(task.location.city);
            if (task.location.state) parts.push(task.location.state);
            if (task.location.country) parts.push(task.location.country);
            locationText = parts.length > 0 ? parts.join(', ') : 'Location not specified';
          }
          console.log('✅ Using object location:', locationText);
        }
      }
      
      console.log('📍 Final Location:', {
        taskId: task._id,
        finalLocation: locationText
      });
      
      return {
        paymentId: payment._id || `payment-${Date.now()}-${Math.random()}`,
        taskId: task._id || payment.task || 'unknown',
        taskTitle: task.title || 'Task',
        taskLocation: locationText,
        offerAmount: payment.amount || offer.offer?.amount || 0,
        currency: payment.currency || offer.offer?.currency || userCurrencyInfo.code,
        formattedAmount: formatCurrency(
          payment.amount || offer.offer?.amount || 0,
          {
            code: payment.currency || offer.offer?.currency || userCurrencyInfo.code,
            symbol: userCurrencyInfo.symbol
          }
        ),
        taskerName: userRole === 'Tasker' 
          ? `${currentUser?.firstName || 'You'} ${currentUser?.lastName || ''}`.trim()
          : `${task.assignedTo?.firstName || 'Tasker'} ${task.assignedTo?.lastName || ''}`.trim(),
        posterName: userRole === 'Poster'
          ? `${currentUser?.firstName || 'You'} ${currentUser?.lastName || ''}`.trim()
          : `${task.createdBy?.firstName || 'Poster'} ${task.createdBy?.lastName || ''}`.trim(),
        acceptedDate: payment.releasedAt || payment.updatedAt || payment.createdAt,
        status: payment.status,
        paymentStatus: payment.status === 'completed' || payment.status === 'released' ? 'completed' :
                      payment.status === 'failed' ? 'failed' : 'pending'
      };
    }).sort((a, b) => new Date(b.acceptedDate).getTime() - new Date(a.acceptedDate).getTime());
  }, [taskerPaymentsData?.payments, posterPaymentsData?.payments, userCurrencyInfo, currentUser, userRole]);
  
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
    if (userRole === 'Tasker') {
      refetchTaskerPayments();
    } else {
      refetchPosterPayments();
    }
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
      <View style={styles.paymentCardContent}>
        {/* Top Section - Title and Amount */}
        <View style={styles.cardTopSection}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.taskTitle}
            </Text>
          </View>
          <View style={styles.cardAmountContainer}>
            <Text style={styles.amount} numberOfLines={1}>
              {item.formattedAmount}
            </Text>
          </View>
        </View>

        {/* Middle Section - Details */}
        <View style={styles.cardDetailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={14} color="#666" style={styles.detailIcon} />
            <Text style={styles.taskLocation} numberOfLines={1}>
              {typeof item.taskLocation === 'string' ? item.taskLocation : 'Location not specified'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people" size={14} color="#666" style={styles.detailIcon} />
            <Text style={styles.taskParticipants} numberOfLines={1}>
              {item.taskerName} → {item.posterName}
            </Text>
          </View>
        </View>

        {/* Bottom Section - Status and Date */}
        <View style={styles.cardBottomSection}>
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
              size={14} 
              color="#fff" 
            />
            <Text style={styles.statusText}>
              {item.paymentStatus === 'completed' ? 'Paid' : 
               item.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color="#999" style={styles.dateIcon} />
            <Text style={styles.acceptedDate}>
              {formatDate(item.acceptedDate)}
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

        {/* Role Selector */}
        <View style={styles.roleSelectorContainer}>
          <TouchableOpacity
            style={[styles.roleButton, userRole === 'Tasker' && styles.activeRole]}
            onPress={() => setUserRole('Tasker')}
          >
            <Text style={[styles.roleText, userRole === 'Tasker' && styles.activeRoleText]}>Tasker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, userRole === 'Poster' && styles.activeRole]}
            onPress={() => setUserRole('Poster')}
          >
            <Text style={[styles.roleText, userRole === 'Poster' && styles.activeRoleText]}>Poster</Text>
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
            {paymentsError ? 
              "Payment data is currently unavailable. Check your connection and try refreshing." :
              userRole === 'Tasker' 
                ? "You don't have any payments as a Tasker yet. Start completing tasks to see payment information here."
                : "You don't have any payments as a Poster yet. Start posting tasks to see payment information here."
            }
          </Text>
          <TouchableOpacity style={styles.refreshButton2} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={paymentSummaryItems}
          keyExtractor={(item) => item.paymentId}
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
    backgroundColor: '#fff',
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeRole: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeRoleText: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  // Debit Card Styles
  debitCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    minHeight: 190,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2.5,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -1,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardSmall: {
    flex: 1,
    marginBottom: 0,
    minWidth: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007bff',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 120, // Extra padding for bottom navigation
    backgroundColor: '#f8f9fa',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  paymentCardContent: {
    padding: 16,
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardAmountContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#007bff',
    letterSpacing: -0.5,
  },
  cardDetailsSection: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  taskParticipants: {
    fontSize: 13,
    color: '#888',
    flex: 1,
    lineHeight: 20,
  },
  cardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  acceptedDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Account for bottom navigation
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  refreshButton2: {
    backgroundColor: '#007bff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});