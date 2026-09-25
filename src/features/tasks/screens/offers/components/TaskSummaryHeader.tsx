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
    backgroundColor: CARD_BG,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: CARD_DIVIDER,
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
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
    fontSize: RFValue(24),
    fontWeight: '700',
    color: CARD_TEXT,
  },
  offerLabel: {
    fontSize: RFValue(12),
    color: CARD_TEXT_MUTED,
    marginTop: 2,
  },
});
