import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TermsConditionsScreen from '@/src/features/legal/screens/TermsConditionsScreen';
import { BRAND_ORANGE, CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#003399' }}>
          <TermsConditionsScreen onBack={() => setShowTerms(false)} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    marginTop: 16,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: CARD_TEXT_MUTED,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: BRAND_ORANGE,
    borderColor: BRAND_ORANGE,
  },
  termsText: {
    flex: 1,
    fontSize: RFValue(14),
    color: CARD_TEXT,
    lineHeight: 20,
  },
  termsLink: {
    color: CARD_TEXT,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
