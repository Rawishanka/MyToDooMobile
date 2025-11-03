import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentItem } from '../hooks/usePaymentStatus';

interface PaymentSummaryProps {
  payments: PaymentItem[];
}

export default function PaymentSummary({ payments }: PaymentSummaryProps) {
  const calculateTotalPaid = () => {
    return payments
      .filter((payment) => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const calculatePendingAmount = () => {
    return payments
      .filter((payment) => payment.status === 'pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getTotalTransactions = () => {
    return payments.length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Paid</Text>
        <Text style={styles.amount}>${calculateTotalPaid().toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pending</Text>
        <Text style={[styles.amount, { color: '#ffc107' }]}>
          ${calculatePendingAmount().toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Transactions</Text>
        <Text style={[styles.amount, { color: '#007bff' }]}>
          {getTotalTransactions()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
  },
});
