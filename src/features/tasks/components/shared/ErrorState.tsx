import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS } from '@/src/shared/theme/homeStyle';
import { useTheme } from '@/src/shared/theme';
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
    <View style={styles.errorContainer}>
      <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E293B' : HS.redBg }]}>
        <Ionicons name="alert-circle-outline" size={40} color={isDarkMode ? '#FCA5A5' : HS.redText} />
      </View>
      <Text style={[styles.errorTitle, { color: isDarkMode ? '#F8FAFC' : HS.navy }]}>{title}</Text>
      <Text style={[styles.errorSubtitle, { color: isDarkMode ? '#94A3B8' : HS.muted }]}>{subtitle}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.backButton, { borderColor: isDarkMode ? '#475569' : HS.blue }]}
        onPress={onGoBack}
        activeOpacity={0.8}
      >
        <Text style={[styles.backButtonText, { color: isDarkMode ? '#F8FAFC' : HS.blue }]}>Go Back</Text>
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
