import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';

interface TermsCheckboxProps {
  agreed: boolean;
  onToggle: () => void;
}

export default function TermsCheckbox({ agreed, onToggle }: TermsCheckboxProps) {
  const [showTerms, setShowTerms] = useState(false);

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
          I agree to the{' '}
          <Text style={styles.termsLink} onPress={() => setShowTerms(true)}>
            terms and conditions
          </Text>
          , and I commit to completing this task 
          professionally and according to the requirements.
        </Text>
      </TouchableOpacity>

      <Modal visible={showTerms} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <TermsConditionsScreen onBack={() => setShowTerms(false)} />
        </SafeAreaView>
      </Modal>
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
  termsLink: {
    color: '#0052A2',
    textDecorationLine: 'underline',
  },
});
