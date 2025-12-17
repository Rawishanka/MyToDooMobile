import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
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
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo, isInitialized } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  // Format the budget with location-appropriate currency
  const displayBudget = !isInitialized 
    ? 'Loading...'
    : task.formattedBudget || 
      (task.budget ? formatCurrency(task.budget, currencyInfo) : 'Budget not specified');

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
