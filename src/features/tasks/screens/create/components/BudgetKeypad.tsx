import { formatNumber } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BudgetKeypadProps {
  budget: string;
  onKeyPress: (value: string) => void;
}

export const BudgetKeypad: React.FC<BudgetKeypadProps> = ({ budget, onKeyPress }) => {
  const renderKey = (value: string | number) => (
    <TouchableOpacity
      key={value}
      style={styles.key}
      onPress={() => onKeyPress(value.toString())}
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Budget</Text>
      <Text style={styles.sectionSubtitle}>
        Minimum budget is $20. You can negotiate the final price later
      </Text>

      {/* Budget Display */}
      <View style={styles.inputBox}>
        <Text style={styles.currencySymbol}>$</Text>
        <Text style={[
          styles.budgetText, 
          budget && Number(budget) < 20 && Number(budget) > 0 && styles.invalidBudgetText
        ]}>
          {budget ? formatNumber(Number(budget)) : '0'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  inputBox: {
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
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
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  keypad: {
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
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
});
