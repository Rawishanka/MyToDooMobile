import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { resolveTaskBudget } from '@/src/shared/utils/resolveTaskBudget';
import React from 'react';
import { useTheme } from '@/src/shared/theme';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { BRAND_BLUE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';

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
  const { isDarkMode } = useTheme();
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
    <View style={[styles.taskSummary, isDarkMode && { backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#334155" }]}>
      <Text style={[styles.taskTitle, isDarkMode && { color: "#F8FAFC" }]} numberOfLines={2}>
        {task.title || 'Untitled Task'}
      </Text>
      <Text style={[styles.taskBudget, isDarkMode && { color: "#38BDF8" }]}>
        Budget: {displayBudget}
      </Text>
      <Text style={[styles.taskLocation, isDarkMode && { color: "#94A3B8" }]}>
        {task.location?.address || 'Location not specified'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  taskSummary: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 18,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  taskTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  taskBudget: {
    fontSize: 16,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    lineHeight: 20,
    color: CARD_TEXT_MUTED,
  },
});
