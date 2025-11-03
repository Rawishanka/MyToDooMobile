import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TermsCheckboxProps {
  agreed: boolean;
  onToggle: () => void;
}

export default function TermsCheckbox({ agreed, onToggle }: TermsCheckboxProps) {
  return (
    <View style={styles.termsContainer}>
      <TouchableOpacity 
        style={styles.termsCheckbox}
        onPress={onToggle}
      >
        <View style={[styles.checkbox, agreed && styles.checkedBox]}>
          {agreed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.termsText}>
          I agree to the terms and conditions, and I commit to completing this task 
          professionally and according to the requirements.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
