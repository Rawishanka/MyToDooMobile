import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TipsSection: React.FC = () => {
  return (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>💡 Tips for a great offer:</Text>
      <Text style={styles.tip}>• Be clear about what's included in your price</Text>
      <Text style={styles.tip}>• Mention your relevant experience</Text>
      <Text style={styles.tip}>• Include your availability</Text>
      <Text style={styles.tip}>• Ask questions if anything is unclear</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tipsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
});
