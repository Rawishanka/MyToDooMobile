import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={HS.blue} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HS.page,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: HS.muted,
  },
});
