import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskBudget: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  offerStats: {
    alignItems: 'center',
  },
  offerCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
  },
  offerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
