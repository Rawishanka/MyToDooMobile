import { HS, homeCard, homeIconChip } from '@/src/shared/theme/homeStyle';
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
    ...homeCard,
    borderLeftWidth: 4,
    borderLeftColor: HS.blue,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 8,
  },
  location: {
    fontSize: RFValue(14),
    color: HS.muted,
  },
});
