import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

interface EmptyQuestionsStateProps {
  onAskQuestion: () => void;
}

export default function EmptyQuestionsState({ onAskQuestion }: EmptyQuestionsStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconChip}>
        <Ionicons name="help-circle-outline" size={40} color={HS.blue} />
      </View>
      <Text style={styles.emptyTitle}>No questions yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to ask a question about this task!
      </Text>
      <TouchableOpacity style={styles.askButton} onPress={onAskQuestion}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
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
  iconChip: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
