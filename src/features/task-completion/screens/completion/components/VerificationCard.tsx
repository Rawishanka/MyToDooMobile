import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';
import { CompletionUser } from '../hooks/useCompletionStatus';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import { useTheme } from '@/src/shared/theme';
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
const ON_LIGHT_TINT: Record<string, string> = {
  '#28a745': HS.greenText,
  '#007bff': HS.blue,
  '#dc3545': HS.redText,
  '#6c757d': HS.muted,
  '#ffc107': HS.amberText,
};
const onLight = (color: string) => ON_LIGHT_TINT[color] || color;

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
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <Text style={[styles.title, isDarkMode && styles.valueDark]}>Verification Status</Text>

      <View style={styles.status}>
        <View style={styles.indicator}>
          <Ionicons name={verificationIcon as any} size={24} color={isDarkMode ? onBlue(verificationColor) : onLight(verificationColor)} />
          <Text style={[styles.statusText, isDarkMode && styles.valueDark]}>
            {verificationStatus?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>

      {verifiedBy && (
        <View style={styles.info}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>Verified by:</Text>
          <Text style={[styles.value, isDarkMode && styles.valueDark]}>
            {formatUserName(verifiedBy.firstName, verifiedBy.lastName)}
          </Text>
        </View>
      )}

      {verifiedAt && (
        <View style={styles.info}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>Verified on:</Text>
          <Text style={[styles.value, isDarkMode && styles.valueDark]}>{formatDate(verifiedAt)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...homeCard,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
  },
  labelDark: { color: CARD_TEXT_MUTED },
  valueDark: { color: CARD_TEXT },
  cardDark: {
    backgroundColor: CARD_BG,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOpacity: 0.18,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: HS.navy,
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
    color: HS.navy,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
  value: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
  },
});
