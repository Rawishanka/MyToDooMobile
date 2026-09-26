import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';

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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  location: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.75)',
  },
});
