import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskSummaryCardProps {
  title: string;
  creatorFirstName?: string;
  creatorLastName?: string;
  location?: string;
  budget: number;
}

export default function TaskSummaryCard({ 
  title, 
  creatorFirstName, 
  creatorLastName, 
  location, 
  budget 
}: TaskSummaryCardProps) {
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo);
  
  return (
    <View style={styles.taskSummary}>
      <Text style={styles.taskTitle}>{title}</Text>
      {creatorFirstName && creatorLastName && (
        <Text style={styles.taskCreator}>
          Posted by {creatorFirstName} {creatorLastName}
        </Text>
      )}
      <Text style={styles.taskLocation}>
        {location || 'Location not specified'}
      </Text>
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetLabel}>Budget:</Text>
        <Text style={styles.budgetAmount}>{formatCurrency(budget, currencyInfo)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  taskCreator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 20,
    color: '#28a745',
    fontWeight: '700',
  },
});
