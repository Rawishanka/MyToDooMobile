import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CommitmentSection() {
  return (
    <View style={styles.commitmentContainer}>
      <Text style={styles.commitmentTitle}>🤝 Your Commitment</Text>
      <Text style={styles.commitmentText}>
        By accepting this task, you commit to:
      </Text>
      
      <View style={styles.commitmentList}>
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <Text style={styles.commitmentItemText}>
            Complete the task according to the provided description
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <Text style={styles.commitmentItemText}>
            Communicate regularly with the task creator
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <Text style={styles.commitmentItemText}>
            Deliver quality work within the agreed timeframe
          </Text>
        </View>
        
        <View style={styles.commitmentItem}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
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
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  commitmentText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 12,
  },
  commitmentList: {
    marginTop: 8,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commitmentItemText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
