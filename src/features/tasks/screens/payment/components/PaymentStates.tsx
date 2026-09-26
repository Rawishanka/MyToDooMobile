import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface PaymentLoadingStateProps {
  message?: string;
}

export function PaymentLoadingState({ message = 'Loading payment details...' }: PaymentLoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#FFFFFF'} />
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
      <BlueBackdrop />
      <Ionicons name="alert-circle-outline" size={64} color="#FCA5A5" />
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
    backgroundColor: '#003399',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#003399',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});
