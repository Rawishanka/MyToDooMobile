import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND_BLUE, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { RFValue } from '@/src/shared/utils/responsive';

interface ErrorStateProps {
  title: string;
  subtitle: string;
  onRetry?: () => void;
  onGoBack: () => void;
}

export default function ErrorState({ title, subtitle, onRetry, onGoBack }: ErrorStateProps) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.errorContainer, !isDarkMode && { backgroundColor: '#003399' }]}>
      <BlueBackdrop />
      <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E293B' : 'rgba(255,255,255,0.14)' }]}>
        <Ionicons name="alert-circle-outline" size={40} color="#FCA5A5" />
      </View>
      <Text style={[styles.errorTitle, { color: isDarkMode ? '#F8FAFC' : '#FFFFFF' }]}>{title}</Text>
      <Text style={[styles.errorSubtitle, { color: isDarkMode ? '#94A3B8' : 'rgba(255,255,255,0.75)' }]}>{subtitle}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.backButton, { borderColor: isDarkMode ? '#475569' : 'rgba(255,255,255,0.6)' }]}
        onPress={onGoBack}
        activeOpacity={0.8}
      >
        <Text style={[styles.backButtonText, { color: isDarkMode ? '#F8FAFC' : '#FFFFFF' }]}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  errorTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(14),
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: BRAND_ORANGE,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  backButton: {
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});
