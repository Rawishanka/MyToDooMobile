import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionUser } from '../hooks/useCompletionStatus';

interface VerificationCardProps {
  verificationStatus?: string;
  verificationIcon: string;
  verificationColor: string;
  verifiedBy?: CompletionUser;
  verifiedAt?: string;
  formatDate: (date: string) => string;
}

export default function VerificationCard({
  verificationStatus,
  verificationIcon,
  verificationColor,
  verifiedBy,
  verifiedAt,
  formatDate,
}: VerificationCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Verification Status</Text>

      <View style={styles.status}>
        <View style={styles.indicator}>
          <Ionicons name={verificationIcon as any} size={24} color={verificationColor} />
          <Text style={styles.statusText}>
            {verificationStatus?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>

      {verifiedBy && (
        <View style={styles.info}>
          <Text style={styles.label}>Verified by:</Text>
          <Text style={styles.value}>
            {verifiedBy.firstName} {verifiedBy.lastName}
          </Text>
        </View>
      )}

      {verifiedAt && (
        <View style={styles.info}>
          <Text style={styles.label}>Verified on:</Text>
          <Text style={styles.value}>{formatDate(verifiedAt)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  status: {
    alignItems: 'center',
    marginBottom: 16,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
