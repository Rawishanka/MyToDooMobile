import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
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
