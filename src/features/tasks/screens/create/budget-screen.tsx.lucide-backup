// BudgetScreen.tsx

import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { formatNumber, getCurrencySymbol, getDefaultBudget, getMinimumBudget } from '@/src/shared/utils/currency';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  const navigation = useNavigation();
  const { myTask, updateMyTask } = useCreateTaskStore();
  const insets = useSafeAreaInsets();

  // Auto-detect country for currency if no location set yet
  const { countryInfo, isDetecting, isInitialized } = useLocationCountry();

  console.log('🏗️ Budget screen useLocationCountry state:', {
    countryInfo,
    isDetecting,
    isInitialized,
    hookResult: { countryInfo, isDetecting, isInitialized }
  });

  // Get currency based on task location or detected country
  const location = 'location' in myTask ? myTask.location : undefined;
  // Handle both string location and object location formats
  const locationForCurrency = typeof location === 'string' 
    ? { address: location }
    : location && typeof location === 'object' && 'address' in location 
    ? location 
    : undefined;
  
  // Always use user's current GPS location for currency in budget screen (auto geo-location feature)
  // This ensures users see budget amounts in their local currency regardless of task location
  const currencyInfo = { 
    code: countryInfo?.currency || 'AUD', 
    symbol: getCurrencySymbol(countryInfo?.currency || 'AUD') 
  };

  const minimumBudget = getMinimumBudget(currencyInfo.code);
  const defaultBudgetAmount = getDefaultBudget(currencyInfo.code);

  console.log('💰 Budget screen currency info:', {
    hasLocation: !!locationForCurrency,
    detectedCountry: countryInfo?.countryName || 'Unknown',
    detectedCurrency: countryInfo?.currency || 'AUD',
    finalCurrency: currencyInfo.code,
    symbol: currencyInfo.symbol,
    minimumBudget,
    defaultBudgetAmount,
    isDetecting
  });

  const [budget, setBudget] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Initialize with existing data from store only
  useEffect(() => {
    if (myTask.budget && myTask.budget > 0) {
      setBudget(myTask.budget.toString());
      setHasUserInteracted(true); // Mark as interacted if we have existing budget
    }
    // Don't set default budget automatically - let it show as placeholder
  }, [myTask.budget]);

  const handleKeyPress = (value: string) => {
    // Mark that user has interacted with the field and clear placeholder
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      // If this is the first interaction and we're not deleting, start fresh
      if (value !== 'delete') {
        setBudget(value);
        setErrorMessage('');
        return;
      }
    }

    if (value === 'delete') {
      setBudget(budget.slice(0, -1));
      setErrorMessage(''); // Clear error when deleting
    } else {
      // Prevent leading zero (e.g., 0250)
      if (budget === '0' || (budget === '' && value === '0')) {
        setErrorMessage('Budget cannot start with zero');
        return;
      }
      
      // Clear error and add digit
      setErrorMessage('');
      setBudget(budget + value);
    }
  };

  // Handle tapping on the budget display area to clear it
  const handleBudgetFieldTap = () => {
    setBudget('');
    setErrorMessage('');
    setHasUserInteracted(true);
  };

  const renderKey = (value: string | number) => (
    <TouchableOpacity
      key={value}
      style={styles.key}
      onPress={() => handleKeyPress(value.toString())}
    >
      {value === 'delete' ? (
        <Ionicons name="backspace-outline" size={24} color="#002366" />
      ) : (
        <Text style={styles.keyText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const numberPad = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'delete'],
  ];

  // Helper to update zustand store with budget
  const handleCreateTask = () => {
    const finalBudget = budget || (!hasUserInteracted ? defaultBudgetAmount.toString() : '0');
    const budgetNumber = Number(finalBudget);
    // Only update if valid and meets minimum for currency
    if (budgetNumber >= minimumBudget) {
      updateMyTask({
        budget: budgetNumber,
        currency: currencyInfo.code, // Save the detected currency
      });
      router.push('/detail-screen');
    }
  };

  // Check if budget is valid (user has entered a value and it meets minimum)
  const currentBudgetValue = budget || (!hasUserInteracted ? defaultBudgetAmount : 0);
  const isBudgetValid = hasUserInteracted ? (budget && Number(budget) >= minimumBudget) : (Number(currentBudgetValue) >= minimumBudget);

  // Show loading state while location is being detected to prevent currency flicker
  if (!isInitialized || isDetecting) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Detecting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Enter Your budget</Text>
      <Text style={styles.subtitle}>
        Minimum budget is {currencyInfo.symbol}{formatNumber(minimumBudget, { forceDecimals: true })}. Don&apos;t worry, you can always negotiate the final price later
      </Text>

      {/* Budget Display */}
      <TouchableOpacity style={styles.inputBox} onPress={handleBudgetFieldTap} activeOpacity={0.7}>
        <Text style={styles.currencySymbol}>{currencyInfo.symbol}</Text>
        <Text style={[
          styles.budgetText, 
          budget && Number(budget) < minimumBudget && Number(budget) > 0 && styles.invalidBudgetText,
          !hasUserInteracted && !budget && styles.placeholderText
        ]}>
          {budget ? formatNumber(Number(budget)) : (!hasUserInteracted ? formatNumber(defaultBudgetAmount) : '0')}
        </Text>
      </TouchableOpacity>
      
      {/* Validation Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : budget && Number(budget) < minimumBudget && Number(budget) > 0 ? (
        <Text style={styles.validationText}>
          Minimum budget is {currencyInfo.symbol}{formatNumber(minimumBudget, { forceDecimals: true })}
        </Text>
      ) : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {numberPad.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((value) => value !== null ? renderKey(value) : <View key="empty" style={{ width: isTablet ? wp('10%') : wp('18%'), height: isTablet ? wp('10%') : wp('18%'), marginHorizontal: isTablet ? wp('2%') : wp('2.5%') }} />)}
          </View>
        ))}
      </View>

      {/* Create Task Button */}
      <TouchableOpacity
        style={[
          styles.button, 
          !isBudgetValid && styles.buttonDisabled,
          { marginBottom: Math.max(insets.bottom, 30) }
        ]}
        onPress={handleCreateTask}
        disabled={!isBudgetValid}
      >
        <Text style={[styles.buttonText, !isBudgetValid && styles.buttonTextDisabled]}>
          Create Task
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: isTablet ? wp('12.5%') : wp('6%'),
    paddingTop: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    maxWidth: isTablet ? 900 : undefined,
    alignSelf: isTablet ? 'center' : 'auto',
    width: '100%',
  },
  back: {
    position: 'absolute',
    top: 50,
    left: isTablet ? wp('12.5%') : wp('6%'),
    zIndex: 1,
  },
  title: {
    fontSize: RFValue(isTablet ? 24 : 20),
    fontWeight: 'bold',
    color: '#002366',
    marginTop: hp('5%'),
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6e6e6e',
    marginTop: hp('1%'),
    fontSize: RFValue(isTablet ? 14 : 13),
  },
  inputBox: {
    marginTop: hp('3%'),
    height: isTablet ? hp('8%') : hp('6%'),
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySymbol: {
    fontSize: RFValue(isTablet ? 24 : 18),
    fontWeight: '600',
    color: '#002366',
    marginRight: wp('1.5%'),
  },
  budgetText: {
    fontSize: RFValue(isTablet ? 24 : 18),
    fontWeight: '600',
    color: '#002366',
  },
  placeholderText: {
    color: '#999999',
    fontWeight: '400',
  },
  invalidBudgetText: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: RFValue(13),
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: hp('1%'),
    fontWeight: '600',
  },
  validationText: {
    fontSize: RFValue(13),
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: hp('1%'),
    fontWeight: '500',
  },
  keypad: {
    marginVertical: hp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
  },
  key: {
    width: isTablet ? wp('10%') : wp('18%'),
    height: isTablet ? wp('10%') : wp('18%'),
    backgroundColor: '#fff',
    borderRadius: isTablet ? wp('5%') : wp('9%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: isTablet ? wp('2%') : wp('2.5%'),
    borderWidth: 1,
    borderColor: '#eee',
  },
  keyText: {
    fontSize: RFValue(isTablet ? 24 : 20),
    color: '#002366',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: RFValue(16),
    color: '#6e6e6e',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0050C8',
    paddingVertical: hp('1.8%'),
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  buttonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(14),
    textTransform: 'capitalize',
  },
  buttonTextDisabled: {
    color: '#8E8E93',
  },
});