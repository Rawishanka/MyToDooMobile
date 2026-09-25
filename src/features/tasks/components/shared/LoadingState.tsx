import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BRAND_BLUE } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : BRAND_BLUE} />
      <Text style={[styles.loadingText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>{message}</Text>
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
