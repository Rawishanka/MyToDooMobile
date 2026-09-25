import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentItem } from '../hooks/usePaymentStatus';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

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
        <Text style={[styles.amount, { color: '#FBBF24' }]}>
          ${calculatePendingAmount().toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Transactions</Text>
        <Text style={[styles.amount, { color: CARD_TEXT }]}>
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
    backgroundColor: CARD_BG,
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
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginBottom: 8,
  },
  amount: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#4ADE80',
  },
});
