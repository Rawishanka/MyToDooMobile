import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatCurrency, getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
import { formatUserName } from '@/src/utils/formatUserName';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface PaymentDetailsProps {
  taskCreator?: {
    firstName?: string;
    lastName?: string;
  };
  taskPerformer?: {
    firstName?: string;
    lastName?: string;
  };
  amount?: number;
  offerMessage?: string;
  taskLocation?: { address?: string };
}

export default function PaymentDetails({
  taskCreator,
  taskPerformer,
  amount,
  offerMessage,
  taskLocation,
}: PaymentDetailsProps) {
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo, isInitialized } = useLocationCountry();
  const currencyInfo = getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' });
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💰 Payment Details</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Task Creator:</Text>
          <Text style={styles.value}>
            {formatUserName(taskCreator?.firstName, taskCreator?.lastName)}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Task Performer:</Text>
          <Text style={styles.value}>
            {formatUserName(taskPerformer?.firstName, taskPerformer?.lastName)}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Agreed Amount:</Text>
          <Text style={styles.amount}>
            {!isInitialized ? 'Loading...' : (amount ? formatCurrency(amount, currencyInfo) : 'N/A')}
          </Text>
        </View>
        
        {offerMessage && (
          <View style={styles.row}>
            <Text style={styles.label}>Offer Message:</Text>
            <Text style={styles.value} numberOfLines={3}>
              {offerMessage}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
    flex: 1,
  },
  value: {
    fontSize: RFValue(14),
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: RFValue(18),
    color: '#7ED957',
    fontWeight: '700',
  },
});
