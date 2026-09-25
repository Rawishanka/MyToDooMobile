import { HS, homeCard, homeIconChip } from '@/src/shared/theme/homeStyle';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PaymentMethod } from '../hooks/usePaymentForm';
import { RFValue } from '@/src/shared/utils/responsive';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
}

export default function PaymentMethodSelector({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.selectedCard
          ]}
          onPress={() => onSelectMethod(method.id)}
        >
          <View style={styles.methodContent}>
            <Text style={styles.methodLabel}>{method.label}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </View>
          {selectedMethod === method.id && (
            <Ionicons name="checkmark-circle" size={24} color={HS.blue} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 14,
  },
  methodCard: {
    ...homeCard,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: HS.blue,
    borderWidth: 1.5,
    backgroundColor: HS.tint,
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
});
