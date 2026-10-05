import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import {
    CompletionEmptyState,
    CompletionErrorState,
    CompletionLoadingState,
    MarkCompleteModal,
    MilestonesCard,
    RatingCard,
    StatusCard,
    VerificationCard,
} from './completion/components';

// Hooks
import { useCompletionStatus } from './completion/hooks';
import { BRAND_BLUE, BRAND_ORANGE, CARD_TEXT } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { useTheme } from '@/src/shared/theme';

export default function TaskCompletionStatusScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);

  const {
    completion,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusColor,
    getStatusIcon,
    getVerificationIcon,
    getVerificationColor,
  } = useCompletionStatus(taskId || '');

  // Loading state
  if (isLoading) {
    return <CompletionLoadingState />;
  }

  // Error state
  if (error) {
    return <CompletionErrorState onRetry={refetch} onBack={() => router.back()} />;
  }

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color={CARD_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completion Status</Text>
        <TouchableOpacity style={styles.helpIcon}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={CARD_TEXT}
            onPress={() => {
              Alert.alert(
                'Completion Help',
                'This screen shows the completion status and progress of your task. Mark tasks complete when finished.',
                [{ text: 'OK' }]
              );
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {!completion ? (
          <CompletionEmptyState />
        ) : (
          <>
            {/* Status Overview */}
            <StatusCard
              status={completion.status}
              statusIcon={getStatusIcon(completion.status)}
              statusColor={getStatusColor(completion.status)}
              completedBy={completion.completedBy}
              completedAt={completion.completedAt}
              notes={completion.notes}
              formatDate={formatDate}
            />

            {/* Verification Status */}
            {completion.verificationRequired && (
              <VerificationCard
                verificationStatus={completion.verificationStatus}
                verificationIcon={getVerificationIcon(completion.verificationStatus)}
                verificationColor={getVerificationColor(completion.verificationStatus)}
                verifiedBy={completion.verifiedBy}
                verifiedAt={completion.verifiedAt}
                formatDate={formatDate}
              />
            )}

            {/* Milestones */}
            {completion.milestones && completion.milestones.length > 0 && (
              <MilestonesCard milestones={completion.milestones} formatDate={formatDate} />
            )}

            {/* Rating */}
            {completion.rating && (
              <RatingCard rating={completion.rating} formatDate={formatDate} />
            )}
          </>
        )}
      </ScrollView>

      {/* Action Button */}
      {completion && completion.status === 'in_progress' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => setShowMarkCompleteModal(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mark Complete Modal */}
      <MarkCompleteModal
        visible={showMarkCompleteModal}
        onClose={() => setShowMarkCompleteModal(false)}
        onConfirm={() => {
          setShowMarkCompleteModal(false);
          refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CARD_TEXT,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    gap: 8,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
