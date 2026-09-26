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
            <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  methodCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: '#ff6b35',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
});
