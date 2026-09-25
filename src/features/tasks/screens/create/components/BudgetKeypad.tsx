import { formatNumber } from '@/src/shared/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { FLOW } from '../flowTheme';

interface BudgetKeypadProps {
  budget: string;
  onKeyPress: (value: string) => void;
}

export const BudgetKeypad: React.FC<BudgetKeypadProps> = ({ budget, onKeyPress }) => {
  const { isDarkMode } = useTheme();
  const renderKey = (value: string | number) => (
    <TouchableOpacity
      key={value}
      style={[styles.key, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.18)' }]}
      onPress={() => onKeyPress(value.toString())}
    >
      {value === 'delete' ? (
        <Ionicons name="backspace-outline" size={24} color={isDarkMode ? '#FFFFFF' : FLOW.navy} />
      ) : (
        <Text style={[styles.keyText, isDarkMode && { color: '#FFFFFF' }]}>{value}</Text>
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
      <Text style={[styles.sectionTitle, isDarkMode && { color: '#FFFFFF' }]}>Budget</Text>
      <Text style={[styles.sectionSubtitle, isDarkMode && { color: 'rgba(255,255,255,0.75)' }]}>
        Minimum budget is $20. You can negotiate the final price later
      </Text>

      {/* Budget Display */}
      <View style={[styles.inputBox, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.18)' }]}>
        <Text style={[styles.currencySymbol, isDarkMode && { color: 'rgba(255,255,255,0.8)' }]}>$</Text>
        <Text style={[
          styles.budgetText, 
          isDarkMode && { color: '#FFFFFF' },
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
    fontSize: RFValue(18),
    fontWeight: '700',
    color: FLOW.navy,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: RFValue(14),
    color: FLOW.muted,
    marginBottom: 16,
  },
  inputBox: {
    marginTop: 10,
    height: 84,
    borderRadius: 20,
    backgroundColor: FLOW.tint,
    borderWidth: 1.5,
    borderColor: FLOW.tintBorder,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: FLOW.blue,
    marginRight: 5,
  },
  budgetText: {
    fontSize: RFValue(34),
    fontWeight: '800',
    color: FLOW.blue,
  },
  invalidBudgetText: {
    color: FLOW.error,
  },
  validationText: {
    fontSize: RFValue(14),
    color: FLOW.error,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1.5,
    borderColor: FLOW.inputBorder,
  },
  keyText: {
    fontSize: RFValue(24),
    fontWeight: '600',
    color: FLOW.navy,
  },
});
