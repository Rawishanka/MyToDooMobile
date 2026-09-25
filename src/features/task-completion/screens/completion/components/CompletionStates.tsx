import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface LoadingStateProps {
  message?: string;
}

export function CompletionLoadingState({
  message = 'Loading completion status...',
}: LoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#003399'} />
      <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
  onBack: () => void;
}

export function CompletionErrorState({ onRetry, onBack }: ErrorStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.errorContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>Failed to load completion status</Text>
      <Text style={[styles.errorSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Could not load task completion information. Please check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backButtonText, isDarkMode && { color: '#38BDF8' }]}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export function CompletionEmptyState() {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: 'transparent' }]}>
        <MaterialIcons name="assignment" size={isDarkMode ? 64 : 40} color={isDarkMode ? '#475569' : HS.blue} />
      </View>
      <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No completion data</Text>
      <Text style={[styles.emptySubtitle, isDarkMode && { color: '#94A3B8' }]}>
        This task doesn't have completion tracking enabled or hasn't been started yet.
      </Text>
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
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 32,
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
    paddingHorizontal: 32,
    height: 48,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HS.blue,
  },
  backButtonText: {
    color: HS.blue,
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
    backgroundColor: HS.page,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(16),
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
