import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {}

export const LoadingState: React.FC<LoadingStateProps> = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={HS.blue} />
    <Text style={styles.loadingText}>Loading task details...</Text>
  </View>
);

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const router = useRouter();

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Unable to Load Task</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: HS.page,
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: HS.blue,
    fontSize: 16,
    fontWeight: '700',
  },
});
