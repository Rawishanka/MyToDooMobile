import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PaymentMethod } from '../hooks/usePaymentForm';

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
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
  },
});
