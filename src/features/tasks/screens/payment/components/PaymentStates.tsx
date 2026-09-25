import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { HS } from '@/src/shared/theme/homeStyle';

interface PaymentLoadingStateProps {
  message?: string;
}

export function PaymentLoadingState({ message = 'Loading payment details...' }: PaymentLoadingStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#003399'} />
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
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
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
    fontWeight: '700',
  },
});
