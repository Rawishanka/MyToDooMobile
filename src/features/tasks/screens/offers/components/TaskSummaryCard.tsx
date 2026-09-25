import { HS, homeCard } from '@/src/shared/theme/homeStyle';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { formatUserName } from '@/src/utils/formatUserName';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

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
  const { countryInfo, isInitialized } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  // Show loading state while currency is being determined
  if (!isInitialized) {
    return (
      <View style={styles.taskSummary}>
        <Text style={styles.taskTitle}>{title}</Text>
        {(creatorFirstName || creatorLastName) && (
          <Text style={styles.taskCreator}>
            Posted by {formatUserName(creatorFirstName, creatorLastName)}
          </Text>
        )}
        <Text style={styles.taskLocation}>
          {location || 'Location not specified'}
        </Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.taskSummary}>
      <Text style={styles.taskTitle}>{title}</Text>
      {(creatorFirstName || creatorLastName) && (
        <Text style={styles.taskCreator}>
          Posted by {formatUserName(creatorFirstName, creatorLastName)}
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
    ...homeCard,
    padding: 18,
    marginTop: 0,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
  },
  taskCreator: {
    fontSize: RFValue(14),
    color: HS.muted,
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: HS.muted,
    marginBottom: 12,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: RFValue(16),
    color: HS.text,
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: RFValue(20),
    color: HS.blue,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: RFValue(16),
    color: HS.muted,
    fontStyle: 'italic',
  },
});
