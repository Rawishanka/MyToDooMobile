import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

export default function TaskCompletionStatusScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completion Status</Text>
        <TouchableOpacity style={styles.helpIcon}>
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="#666"
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  helpIcon: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
