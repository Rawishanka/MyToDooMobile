import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatUserName } from '@/src/utils/formatUserName';
import { CompletionUser } from '../hooks/useCompletionStatus';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

// Status colours from the hook are dark; lighten them so they stay readable on the blue card.
const ON_BLUE_TINT: Record<string, string> = {
  '#28a745': '#4ADE80',
  '#007bff': '#FFFFFF',
  '#dc3545': '#FCA5A5',
  '#6c757d': 'rgba(255,255,255,0.78)',
  '#ffc107': '#FBBF24',
};
const onBlue = (color: string) => ON_BLUE_TINT[color] || color;

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
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indicator}>
          <Ionicons name={statusIcon as any} size={32} color={onBlue(statusColor)} />
          <Text style={[styles.statusText, { color: onBlue(statusColor) }]}>
            {status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {completedBy && (
        <View style={styles.info}>
          <Text style={styles.label}>Completed by:</Text>
          <Text style={styles.value}>
            {formatUserName(completedBy.firstName, completedBy.lastName)}
            {completedBy.verified && ' ✓'}
          </Text>
        </View>
      )}

      {completedAt && (
        <View style={styles.info}>
          <Text style={styles.label}>Completed on:</Text>
          <Text style={styles.value}>{formatDate(completedAt)}</Text>
        </View>
      )}

      {notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Completion Notes:</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: RFValue(18),
    fontWeight: '700',
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
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CARD_DIVIDER,
  },
  notesLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  notesText: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    lineHeight: 20,
  },
});
