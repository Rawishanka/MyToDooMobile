import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#999"
          maxLength={maxLength}
        />
        <Text style={styles.characterCount}>
          {notes.length}/{maxLength} characters
        </Text>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={20} color="#28a745" />
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    minHeight: 80,
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    lineHeight: 20,
  },
  importantNotes: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});
