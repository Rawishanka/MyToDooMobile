import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import {
    PaymentCard,
    PaymentEmptyState,
    PaymentErrorState,
    PaymentLoadingState,
    PaymentSummary,
} from './status/components';

// Hooks
import { usePaymentStatus } from './status/hooks';

export default function PaymentStatusScreen() {
  const router = useRouter();

  const {
    payments,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusColor,
    getStatusIcon,
  } = usePaymentStatus();

  // Loading state
  if (isLoading) {
    return <PaymentLoadingState />;
  }

  // Error state
  if (error) {
    return <PaymentErrorState onRetry={refetch} onBack={() => router.back()} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Status</Text>
        <TouchableOpacity style={styles.helpIcon}>
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="#666"
            onPress={() => {
              Alert.alert(
                'Payment Help',
                'This screen shows all your payment transactions for completed tasks. Contact support if you have any payment issues.',
                [{ text: 'OK' }]
              );
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Payment Summary */}
      {payments.length > 0 && <PaymentSummary payments={payments} />}

      {/* Payment List */}
      {payments.length === 0 ? (
        <PaymentEmptyState />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  helpIcon: {
    padding: 5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
});
