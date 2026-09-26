import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARD_BG, CARD_CHIP_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface TaskDetailsProps {
  description?: string;
  dueDate?: string;
  dateType?: string;
}

export default function TaskDetails({ description, dueDate, dateType }: TaskDetailsProps) {
  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Task Description</Text>
      <Text style={styles.taskDescription}>
        {description || 'No description provided.'}
      </Text>

      {dueDate && (
        <View style={styles.dueDateContainer}>
          <View style={styles.iconChip}><Ionicons name="calendar-outline" size={18} color={CARD_TEXT} /></View>
          <Text style={styles.dueDateText}>
            Due: {new Date(dueDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      {dateType && (
        <View style={styles.urgencyContainer}>
          <View style={styles.iconChip}><Ionicons name="time-outline" size={18} color="#FBBF24" /></View>
          <Text style={styles.urgencyText}>Date Type: {dateType}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    marginTop: 16,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 10,
  },
  taskDescription: {
    fontSize: 15,
    color: CARD_TEXT,
    lineHeight: 22,
    marginBottom: 16,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: CARD_CHIP_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dueDateText: {
    fontSize: 14,
    color: CARD_TEXT_MUTED,
    marginLeft: 12,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 14,
    color: '#FBBF24',
    fontWeight: '600',
    marginLeft: 12,
  },
});
