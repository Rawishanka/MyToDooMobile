import { HS } from '@/src/shared/theme/homeStyle';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

export const LoadingState: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : BRAND_BLUE} />
      <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading task details...</Text>
    </View>
  );
};

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.errorContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
      <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>Failed to load task</Text>
      <Text style={[styles.errorSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Could not load task details. Please check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backButton, isDarkMode && { borderColor: '#334155', borderWidth: 1, borderRadius: 14 }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, isDarkMode && { color: '#38BDF8' }]}>Go Back</Text>
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
    fontWeight: '600',
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
  retryButton: {
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 40,
    height: 50,
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: BRAND_BLUE,
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
