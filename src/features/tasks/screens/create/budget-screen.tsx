// BudgetScreen.tsx

import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { getCurrencyFromLocation, getCurrencySymbol, getDefaultBudget, getMinimumBudget } from '@/src/shared/utils/currency';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
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
  const { countryInfo } = useLocationCountry();

  // Get currency based on task location or detected country
  const location = 'location' in myTask ? myTask.location : undefined;
  // Handle both string location and object location formats
  const locationForCurrency = typeof location === 'string' 
    ? { address: location }
    : location && typeof location === 'object' && 'address' in location 
    ? location 
    : undefined;
  
  // If no location set, use detected country's currency
  const currencyInfo = locationForCurrency 
    ? getCurrencyFromLocation(locationForCurrency)
    : { code: countryInfo.currency, symbol: getCurrencySymbol(countryInfo.currency) };

  const minimumBudget = getMinimumBudget(currencyInfo.code);
  const defaultBudgetAmount = getDefaultBudget(currencyInfo.code);

  console.log('💰 Budget screen currency info:', {
    hasLocation: !!locationForCurrency,
    detectedCountry: countryInfo.countryName,
    detectedCurrency: countryInfo.currency,
    finalCurrency: currencyInfo.code
  });

  const [budget, setBudget] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Initialize with existing data from store or default amount
  useEffect(() => {
    if (myTask.budget && myTask.budget > 0) {
      setBudget(myTask.budget.toString());
    } else {
      // Set default budget based on currency
      setBudget(defaultBudgetAmount.toString());
    }
  }, [myTask.budget, defaultBudgetAmount]);

  const handleKeyPress = (value: string) => {
    // Mark that user has interacted with the field
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
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
    const budgetNumber = Number(budget);
    // Only update if valid and meets minimum for currency
    if (budget && budgetNumber >= minimumBudget) {
      updateMyTask({
        budget: budgetNumber,
      });
      router.push('/detail-screen');
    }
  };

  // Check if budget is valid (not empty, not zero, and meets minimum)
  const isBudgetValid = budget && Number(budget) >= minimumBudget;

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Enter Your budget</Text>
      <Text style={styles.subtitle}>
        Minimum budget is {currencyInfo.symbol}{minimumBudget}. Don&apos;t worry, you can always negotiate the final price later
      </Text>

      {/* Budget Display */}
      <TouchableOpacity style={styles.inputBox} onPress={handleBudgetFieldTap} activeOpacity={0.7}>
        <Text style={styles.currencySymbol}>{currencyInfo.symbol}</Text>
        <Text style={[
          styles.budgetText, 
          budget && Number(budget) < minimumBudget && Number(budget) > 0 && styles.invalidBudgetText
        ]}>
          {budget || '0'}
        </Text>
      </TouchableOpacity>
      
      {/* Validation Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : budget && Number(budget) < minimumBudget && Number(budget) > 0 ? (
        <Text style={styles.validationText}>
          Minimum budget is {currencyInfo.symbol}{minimumBudget}
        </Text>
      ) : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {numberPad.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((value) => value !== null ? renderKey(value) : <View key="empty" style={{ width: 70, height: 70, marginHorizontal: 10 }} />)}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002366',
    marginTop: 40,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6e6e6e',
    marginTop: 8,
  },
  inputBox: {
    marginTop: 30,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002366',
    marginRight: 5,
  },
  budgetText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002366',
  },
  invalidBudgetText: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  validationText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  keypad: {
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  key: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  keyText: {
    fontSize: 22,
    color: '#002366',
  },
  button: {
    backgroundColor: '#0050C8',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  buttonTextDisabled: {
    color: '#8E8E93',
  },
});