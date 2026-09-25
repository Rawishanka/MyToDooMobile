import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PaymentItem } from '../hooks/usePaymentStatus';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface PaymentCardProps {
  payment: PaymentItem;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export default function PaymentCard({
  payment,
  formatDate,
  getStatusColor,
  getStatusIcon,
}: PaymentCardProps) {
  const handlePress = () => {
    Alert.alert(
      'Payment Details',
      `Transaction ID: ${payment.transactionId || 'N/A'}\nPayment Method: ${payment.paymentMethod}\nDate: ${formatDate(payment.createdAt)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {payment.taskTitle}
          </Text>
          <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
          <Text style={styles.paymentDate}>{formatDate(payment.createdAt)}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>
            {payment.formattedAmount || `${payment.currency}$${payment.amount}`}
          </Text>
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: getStatusColor(payment.status) },
            ]}
          >
            <Ionicons name={getStatusIcon(payment.status) as any} size={14} color="#fff" />
            <Text style={styles.statusText}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {payment.transactionId && (
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionLabel}>Transaction ID:</Text>
          <Text style={styles.transactionId}>{payment.transactionId}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 6,
  },
  paymentMethod: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  transactionInfo: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CARD_DIVIDER,
  },
  transactionLabel: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginRight: 6,
  },
  transactionId: {
    fontSize: RFValue(12),
    color: CARD_TEXT,
    fontWeight: '500',
  },
});
