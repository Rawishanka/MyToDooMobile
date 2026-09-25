import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HS } from '@/src/shared/theme/homeStyle';
import { BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';

interface LoadingStateProps {
  message?: string;
}

export function PaymentLoadingState({ message = 'Loading payment status...' }: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={HS.blue} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
  onBack: () => void;
}

export function PaymentErrorState({ onRetry, onBack }: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load payments</Text>
      <Text style={styles.errorSubtitle}>
        Could not load payment information. Please check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PaymentEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialIcons name="payment" size={40} color={HS.blue} />
      </View>
      <Text style={styles.emptyTitle}>No Payments Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your payment history will appear here once you complete transactions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
