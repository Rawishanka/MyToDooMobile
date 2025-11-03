import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskSummarySectionProps {
  task: {
    title?: string;
    budget?: number;
    formattedBudget?: string;
    currency?: string;
    location?: {
      address?: string;
    };
  };
}

export const TaskSummarySection: React.FC<TaskSummarySectionProps> = ({ task }) => {
  return (
    <View style={styles.taskSummary}>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {task.title || 'Untitled Task'}
      </Text>
      <Text style={styles.taskBudget}>
        Budget: {task.formattedBudget || `${task.currency || 'A$'}${task.budget}`}
      </Text>
      <Text style={styles.taskLocation}>
        {task.location?.address || 'Location not specified'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  taskSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
});
