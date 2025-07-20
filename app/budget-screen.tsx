// BudgetScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function BudgetScreen() {
  const [budget, setBudget] = useState('');
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Enter Your budget</Text>
      <Text style={styles.subtitle}>
        Don{'\u0027'}t worry, you can always negotiate the final price later
      </Text>

      {/* Budget Display */}
      <View style={styles.inputBox}>
        <Text style={styles.budgetText}>{budget}</Text>
      </View>

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
        style={[styles.button, (!budget || /^0+$/.test(budget)) && { backgroundColor: '#D1D1D6' }]}
        onPress={() => router.push('/description-screen')}
        disabled={!budget || /^0+$/.test(budget)}
      >
        <Text style={styles.buttonText}>Get Start</Text>
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
  },
  budgetText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002366',
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
});
