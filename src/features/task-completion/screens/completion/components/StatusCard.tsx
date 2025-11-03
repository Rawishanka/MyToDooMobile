import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionUser } from '../hooks/useCompletionStatus';

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
          <Ionicons name={statusIcon as any} size={32} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {completedBy && (
        <View style={styles.info}>
          <Text style={styles.label}>Completed by:</Text>
          <Text style={styles.value}>
            {completedBy.firstName} {completedBy.lastName}
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
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: '700',
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
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
