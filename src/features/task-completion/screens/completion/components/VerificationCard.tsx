import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';
import { CompletionUser } from '../hooks/useCompletionStatus';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

// Status colours from the hook are dark; lighten them so they stay readable on the blue card.
const ON_BLUE_TINT: Record<string, string> = {
  '#28a745': '#4ADE80',
  '#007bff': '#BFD4FF',
  '#dc3545': '#FCA5A5',
  '#6c757d': 'rgba(255,255,255,0.78)',
  '#ffc107': '#FBBF24',
};
const onBlue = (color: string) => ON_BLUE_TINT[color] || color;

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
          <Ionicons name={verificationIcon as any} size={24} color={onBlue(verificationColor)} />
          <Text style={styles.statusText}>
            {verificationStatus?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>

      {verifiedBy && (
        <View style={styles.info}>
          <Text style={styles.label}>Verified by:</Text>
          <Text style={styles.value}>
            {formatUserName(verifiedBy.firstName, verifiedBy.lastName)}
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
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 14,
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
    fontSize: RFValue(16),
    fontWeight: '600',
    color: CARD_TEXT,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
  },
  value: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
  },
});
