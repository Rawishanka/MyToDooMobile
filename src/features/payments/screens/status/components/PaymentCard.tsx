import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PaymentItem } from '../hooks/usePaymentStatus';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import { useTheme } from '@/src/shared/theme';
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
  const { isDarkMode } = useTheme();
  const chipTone = (c: string) =>
    c === '#28a745' ? { bg: HS.greenBg, fg: HS.greenText }
    : c === '#dc3545' ? { bg: HS.redBg, fg: HS.redText }
    : c === '#ffc107' ? { bg: HS.amberBg, fg: HS.amberText }
    : { bg: HS.blueBg, fg: HS.blueText };
  const tone = chipTone(getStatusColor(payment.status));
  const handlePress = () => {
    Alert.alert(
      'Payment Details',
      `Transaction ID: ${payment.transactionId || 'N/A'}\nPayment Method: ${payment.paymentMethod}\nDate: ${formatDate(payment.createdAt)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity style={[styles.card, isDarkMode && styles.cardDark]} activeOpacity={0.7} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.taskTitle, isDarkMode && styles.onBlue]} numberOfLines={2}>
            {payment.taskTitle}
          </Text>
          <Text style={[styles.paymentMethod, isDarkMode && styles.onBlueMuted]}>{payment.paymentMethod}</Text>
          <Text style={[styles.paymentDate, isDarkMode && styles.onBlueMuted]}>{formatDate(payment.createdAt)}</Text>
        </View>

        <View style={styles.right}>
          <Text style={[styles.amount, isDarkMode && styles.onBlue]}>
            {payment.formattedAmount || `${payment.currency}$${payment.amount}`}
          </Text>
          <View
            style={[
              styles.statusContainer,
              isDarkMode ? { backgroundColor: getStatusColor(payment.status) } : { backgroundColor: tone.bg },
            ]}
          >
            <Ionicons name={getStatusIcon(payment.status) as any} size={14} color={isDarkMode ? '#fff' : tone.fg} />
            <Text style={[styles.statusText, !isDarkMode && { color: tone.fg }]}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {payment.transactionId && (
        <View style={[styles.transactionInfo, !isDarkMode && { borderTopColor: HS.cardBorder }]}>
          <Text style={[styles.transactionLabel, isDarkMode && styles.onBlueMuted]}>Transaction ID:</Text>
          <Text style={[styles.transactionId, isDarkMode && styles.onBlue]}>{payment.transactionId}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...homeCard,
    padding: 16,
    marginBottom: 14,
  },
  onBlue: { color: CARD_TEXT },
  onBlueMuted: { color: CARD_TEXT_MUTED },
  cardDark: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 6,
  },
  paymentMethod: {
    fontSize: RFValue(13),
    color: HS.text,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: HS.blue,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CARD_DIVIDER,
  },
  transactionLabel: {
    fontSize: RFValue(12),
    color: HS.muted,
    marginRight: 6,
  },
  transactionId: {
    fontSize: RFValue(12),
    color: HS.navy,
    fontWeight: '500',
  },
});
