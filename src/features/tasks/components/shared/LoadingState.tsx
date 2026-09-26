import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, !isDarkMode && { backgroundColor: '#003399' }]}>
      <BlueBackdrop />
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
      <Text style={[styles.loadingText, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: RFValue(14),
    textAlign: 'center',
  },
});
