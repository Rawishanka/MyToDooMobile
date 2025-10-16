// BudgetScreen.tsx

import { useCreateTaskStore } from '@/store/create-task-store';
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

export default function BudgetScreen() {
  const [budget, setBudget] = useState('');
  const navigation = useNavigation();
  const { myTask, updateMyTask } = useCreateTaskStore();

  // Initialize with existing data from store
  useEffect(() => {
    if (myTask.budget && myTask.budget > 0) {
      setBudget(myTask.budget.toString());
    }
  }, [myTask.budget]);

  const handleKeyPress = (value: string) => {
    if (value === 'delete') {
      setBudget(budget.slice(0, -1));
    } else {
      setBudget(budget + value);
    }
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
  const handleContinue = () => {
    const budgetNumber = Number(budget);
    // Only update if valid and minimum 20
    if (budget && budgetNumber >= 20) {
      updateMyTask({
        budget: budgetNumber,
      });
      router.push('/description-screen');
    }
  };

  // Check if budget is valid (not empty, not zero, and at least 20)
  const isBudgetValid = budget && Number(budget) >= 20;

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Enter Your budget</Text>
      <Text style={styles.subtitle}>
        Minimum budget is $20. Don't worry, you can always negotiate the final price later
      </Text>

      {/* Budget Display */}
      <View style={styles.inputBox}>
        <Text style={styles.currencySymbol}>$</Text>
        <Text style={[
          styles.budgetText, 
          budget && Number(budget) < 20 && Number(budget) > 0 && styles.invalidBudgetText
        ]}>
          {budget || '0'}
        </Text>
      </View>
      
      {/* Validation Message */}
      {budget && Number(budget) < 20 && Number(budget) > 0 && (
        <Text style={styles.validationText}>
          Minimum budget is $20
        </Text>
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {numberPad.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((value) => value !== null ? renderKey(value) : <View key="empty" style={{ width: 70, height: 70, marginHorizontal: 10 }} />)}
          </View>
        ))}
      </View>

      {/* Get Start Button */}
      <TouchableOpacity
        style={[styles.button, !isBudgetValid && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!isBudgetValid}
      >
        <Text style={[styles.buttonText, !isBudgetValid && styles.buttonTextDisabled]}>
          Get Start
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