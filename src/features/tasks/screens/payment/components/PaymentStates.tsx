import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface PaymentLoadingStateProps {
  message?: string;
}

export function PaymentLoadingState({ message = 'Loading payment details...' }: PaymentLoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#007bff'} />
      <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>{message}</Text>
    </View>
  );
}

interface PaymentErrorStateProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function PaymentErrorState({ title, subtitle, onBack }: PaymentErrorStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.errorContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
      <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>{title}</Text>
      <Text style={[styles.errorSubtitle, isDarkMode && { color: '#94A3B8' }]}>{subtitle}</Text>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backButtonText, isDarkMode && { color: '#38BDF8' }]}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
});
