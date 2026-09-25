import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

export default function ImportantNotes() {
  return (
    <View style={styles.notesContainer}>
      <Text style={styles.notesTitle}>📋 Important Notes</Text>
      <Text style={styles.noteItem}>
        • You can message the task creator for clarifications
      </Text>
      <Text style={styles.noteItem}>
        • Payment will be processed after task completion
      </Text>
      <Text style={styles.noteItem}>
        • Task can be cancelled if agreed upon by both parties
      </Text>
      <Text style={styles.noteItem}>
        • All work should comply with local laws and regulations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notesContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: CARD_DIVIDER,
  },
  notesTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#FBBF24',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: RFValue(12),
    color: CARD_TEXT,
    marginBottom: 4,
  },
});
