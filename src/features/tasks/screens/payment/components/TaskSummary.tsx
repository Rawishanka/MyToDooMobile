import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskSummaryProps {
  title: string;
  location?: string;
}

export default function TaskSummary({ title, location }: TaskSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.location}>
        {location || 'Location not specified'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
});
