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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: CARD_TEXT_MUTED,
    marginBottom: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4ADE80',
  },
});
