import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PaymentDetailsProps {
  taskCreator?: {
    firstName?: string;
    lastName?: string;
  };
  taskPerformer?: {
    firstName?: string;
    lastName?: string;
  };
  amount?: number;
  offerMessage?: string;
}

export default function PaymentDetails({
  taskCreator,
  taskPerformer,
  amount,
  offerMessage,
}: PaymentDetailsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💰 Payment Details</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Task Creator:</Text>
          <Text style={styles.value}>
            {taskCreator?.firstName} {taskCreator?.lastName}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Task Performer:</Text>
          <Text style={styles.value}>
            {taskPerformer?.firstName} {taskPerformer?.lastName}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Agreed Amount:</Text>
          <Text style={styles.amount}>${amount}</Text>
        </View>
        
        {offerMessage && (
          <View style={styles.row}>
            <Text style={styles.label}>Offer Message:</Text>
            <Text style={styles.value} numberOfLines={3}>
              {offerMessage}
            </Text>
          </View>
        )}
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '700',
  },
});
