import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface TaskSummaryHeaderProps {
  title: string;
  budget: string;
  offerCount: number;
}

export default function TaskSummaryHeader({ title, budget, offerCount }: TaskSummaryHeaderProps) {
  return (
    <View style={styles.taskSummary}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.taskBudget}>Budget: {budget}</Text>
      </View>
      <View style={styles.offerStats}>
        <Text style={styles.offerCount}>{offerCount}</Text>
        <Text style={styles.offerLabel}>Offers</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 4,
  },
  taskBudget: {
    fontSize: RFValue(14),
    color: CARD_TEXT,
    fontWeight: '500',
  },
  offerStats: {
    alignItems: 'center',
  },
  offerCount: {
    fontSize: 26,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  offerLabel: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginTop: 2,
  },
});
