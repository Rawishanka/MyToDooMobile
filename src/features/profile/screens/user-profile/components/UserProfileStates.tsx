import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { HS } from '@/src/shared/theme/homeStyle';

export const LoadingState: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : HS.blue} />
      <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading user profile...</Text>
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
      <View style={[styles.stateCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
        <Ionicons name="person-circle-outline" size={44} color={isDarkMode ? '#38BDF8' : HS.blue} />
      </View>
      <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>Failed to load user profile</Text>
      <Text style={[styles.errorSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Could not load user information. Please check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
  stateCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 28,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: HS.blue,
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
