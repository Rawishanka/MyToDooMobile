import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HS } from '@/src/shared/theme/homeStyle';
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
    backgroundColor: HS.amberBg,
    padding: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: HS.amberText,
    marginBottom: 8,
  },
  noteItem: {
    fontSize: 13,
    lineHeight: 19,
    color: HS.text,
    marginBottom: 4,
  },
});
