import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <BlueBackdrop />
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003399',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
  },
});
