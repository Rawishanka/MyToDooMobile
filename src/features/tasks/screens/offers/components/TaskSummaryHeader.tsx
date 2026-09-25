import { HS, homeCard } from '@/src/shared/theme/homeStyle';
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
    ...homeCard,
    padding: 18,
    marginBottom: 16,
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 4,
  },
  taskBudget: {
    fontSize: RFValue(14),
    color: HS.blue,
    fontWeight: '600',
  },
  offerStats: {
    alignItems: 'center',
  },
  offerCount: {
    fontSize: 26,
    fontWeight: '700',
    color: HS.blue,
  },
  offerLabel: {
    fontSize: RFValue(12),
    color: HS.muted,
    marginTop: 2,
  },
});
