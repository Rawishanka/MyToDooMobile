import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARD_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

export default function CommitmentSection() {
  return (
    <View style={styles.commitmentContainer}>
      <Text style={styles.commitmentTitle}>🤝 Your Commitment</Text>
      <Text style={styles.commitmentText}>
        By accepting this task, you commit to:
      </Text>
      
      <View style={styles.commitmentList}>
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
          <Text style={styles.commitmentItemText}>
            Complete the task according to the provided description
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
          <Text style={styles.commitmentItemText}>
            Communicate regularly with the task creator
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
          <Text style={styles.commitmentItemText}>
            Deliver quality work within the agreed timeframe
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
          <Text style={styles.commitmentItemText}>
            Follow safety guidelines and professional standards
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commitmentContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  commitmentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  commitmentText: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    marginBottom: 12,
  },
  commitmentList: {
    marginTop: 8,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  commitmentItemText: {
    fontSize: RFValue(14),
    color: CARD_TEXT,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
