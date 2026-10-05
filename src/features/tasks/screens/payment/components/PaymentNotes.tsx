import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

interface PaymentNotesProps {
  notes: string;
  onChangeNotes: (text: string) => void;
  maxLength?: number;
}

export default function PaymentNotes({ 
  notes, 
  onChangeNotes, 
  maxLength = 300 
}: PaymentNotesProps) {
  return (
    <View style={styles.container}>
      {/* Notes Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Payment Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={onChangeNotes}
          placeholder="Add any notes about the payment method, transaction ID, or special instructions..."
          multiline
          maxFontSizeMultiplier={1.3}
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#94A3B8"
          maxLength={maxLength}
        />
        <Text style={styles.characterCount}>
          {notes.length}/{maxLength} characters
        </Text>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={20} color="#7ED957" />
        <Text style={styles.securityText}>
          Your payment information is secure. This confirmation helps both parties 
          track payment completion for the task.
        </Text>
      </View>

      {/* Important Notes */}
      <View style={styles.importantNotes}>
        <Text style={styles.notesTitle}>📝 Important Notes:</Text>
        <Text style={styles.noteItem}>• Confirm payment amount matches the accepted offer</Text>
        <Text style={styles.noteItem}>• Ensure task is completed before making payment</Text>
        <Text style={styles.noteItem}>• Keep receipts for your records</Text>
        <Text style={styles.noteItem}>• Both parties will be notified when payment is marked complete</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: RFValue(16),
    color: '#0B1B4D',
    minHeight: 80,
    backgroundColor: '#FFFFFF',
  },
  characterCount: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(126,217,87,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(126,217,87,0.4)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: RFValue(14),
    color: '#FFFFFF',
    marginLeft: 8,
    lineHeight: 20,
  },
  importantNotes: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.5)',
  },
  notesTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FCD34D',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: RFValue(12),
    color: '#FEF3C7',
    marginBottom: 4,
  },
});
