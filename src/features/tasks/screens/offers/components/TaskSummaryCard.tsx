import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
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
    backgroundColor: CARD_BG,
    padding: 18,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  taskCreator: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    marginBottom: 12,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: RFValue(16),
    color: CARD_TEXT,
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: RFValue(20),
    color: CARD_TEXT,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: RFValue(16),
    color: CARD_TEXT_MUTED,
    fontStyle: 'italic',
  },
});
