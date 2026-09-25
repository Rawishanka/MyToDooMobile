import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { HS } from '@/src/shared/theme/homeStyle';
import { RFValue } from '@/src/shared/utils/responsive';

interface ErrorStateProps {
  title: string;
  subtitle: string;
  onRetry?: () => void;
  onGoBack: () => void;
}

export default function ErrorState({ title, subtitle, onRetry, onGoBack }: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={44} color={HS.redText} />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorSubtitle}>{subtitle}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: HS.page,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: HS.blue,
    fontSize: 16,
    fontWeight: '700',
  },
});
