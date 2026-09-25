import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HS, homeCard } from '@/src/shared/theme/homeStyle';
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
          <Ionicons name="checkmark-circle" size={18} color={HS.greenText} />
          <Text style={styles.commitmentItemText}>
            Complete the task according to the provided description
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color={HS.greenText} />
          <Text style={styles.commitmentItemText}>
            Communicate regularly with the task creator
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color={HS.greenText} />
          <Text style={styles.commitmentItemText}>
            Deliver quality work within the agreed timeframe
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={18} color={HS.greenText} />
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
    ...homeCard,
    padding: 18,
    marginTop: 16,
  },
  commitmentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: HS.navy,
    marginBottom: 8,
  },
  commitmentText: {
    fontSize: RFValue(14),
    color: HS.muted,
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
    color: HS.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
