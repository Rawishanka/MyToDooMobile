import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { resolveTaskBudget } from '@/src/shared/utils/resolveTaskBudget';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface TaskSummarySectionProps {
  task: {
    title?: string;
    budget?: number;
    finalAmount?: number;
    formattedBudget?: string;
    currency?: string;
    location?: {
      address?: string;
    };
  };
}

export const TaskSummarySection: React.FC<TaskSummarySectionProps> = ({ task }) => {
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo, isInitialized } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  // Format the budget - prioritize task's formatted budget or direct budget data
  // Only show "Loading..." if we don't have any budget data AND location is not initialized
  const taskBudget = resolveTaskBudget(task);
  const displayBudget = task.formattedBudget || 
    (taskBudget && task.currency ? `${task.currency} ${taskBudget.toLocaleString()}` : 
    (taskBudget ? formatCurrency(taskBudget, currencyInfo) : 
    (!isInitialized ? 'Loading...' : 'Budget not specified')));

  return (
    <View style={styles.taskSummary}>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {task.title || 'Untitled Task'}
      </Text>
      <Text style={styles.taskBudget}>
        Budget: {displayBudget}
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
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskBudget: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: '#666',
  },
});
