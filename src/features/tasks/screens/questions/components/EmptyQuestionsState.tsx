import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyQuestionsStateProps {
  onAskQuestion: () => void;
}

export default function EmptyQuestionsState({ onAskQuestion }: EmptyQuestionsStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="help-circle-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No questions yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to ask a question about this task!
      </Text>
      <TouchableOpacity style={styles.askButton} onPress={onAskQuestion}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
        <Text style={styles.askButtonText}>Ask a Question</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
