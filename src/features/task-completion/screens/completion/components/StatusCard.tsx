import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';
import { CompletionUser } from '../hooks/useCompletionStatus';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import { useTheme } from '@/src/shared/theme';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
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

interface StatusCardProps {
  status: string;
  statusIcon: string;
  statusColor: string;
  completedBy?: CompletionUser;
  completedAt?: string;
  notes?: string;
  formatDate: (date: string) => string;
}

export default function StatusCard({
  status,
  statusIcon,
  statusColor,
  completedBy,
  completedAt,
  notes,
  formatDate,
}: StatusCardProps) {
  const { isDarkMode } = useTheme();
  const tone = (c: string) => (isDarkMode ? onBlue(c) : onLight(c));
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.header}>
        <View style={styles.indicator}>
          <Ionicons name={statusIcon as any} size={32} color={tone(statusColor)} />
          <Text style={[styles.statusText, { color: tone(statusColor) }]}>
            {status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {completedBy && (
        <View style={styles.info}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>Completed by:</Text>
          <Text style={[styles.value, isDarkMode && styles.valueDark]}>
            {formatUserName(completedBy.firstName, completedBy.lastName)}
            {completedBy.verified && ' ✓'}
          </Text>
        </View>
      )}

      {completedAt && (
        <View style={styles.info}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>Completed on:</Text>
          <Text style={[styles.value, isDarkMode && styles.valueDark]}>{formatDate(completedAt)}</Text>
        </View>
      )}

      {notes && (
        <View style={[styles.notesSection, !isDarkMode && { borderTopColor: HS.cardBorder }]}>
          <Text style={[styles.notesLabel, isDarkMode && styles.valueDark]}>Completion Notes:</Text>
          <Text style={[styles.notesText, isDarkMode && styles.labelDark]}>{notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...homeCard,
    marginHorizontal: 16,
    marginTop: 16,
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  indicator: {
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
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
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CARD_DIVIDER,
  },
  notesLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 8,
  },
  notesText: {
    fontSize: RFValue(14),
    color: HS.text,
    lineHeight: 20,
  },
});
