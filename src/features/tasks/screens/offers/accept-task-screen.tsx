import { useAcceptTask, useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import { ErrorState, LoadingState } from '../../components/shared';
import CommitmentSection from './components/CommitmentSection';
import ImportantNotes from './components/ImportantNotes';
import TaskDetails from './components/TaskDetails';
import TaskSummaryCard from './components/TaskSummaryCard';
import TermsCheckbox from './components/TermsCheckbox';
import { BRAND_BLUE, BRAND_ORANGE, CARD_BG, CARD_PRICE_BG, CARD_PRICE_TEXT, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { RFValue } from '@/src/shared/utils/responsive';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
export default function AcceptTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading } = useGetTaskById(taskId || '', !!taskId);
  const acceptTaskMutation = useAcceptTask();

  const task = taskData?.data;

  const handleAcceptTask = async () => {
    try {
      if (!agreedToTerms) {
        Alert.alert('Terms Required', 'Please agree to the terms and conditions.');
        return;
      }

      setIsSubmitting(true);

      console.log('🤝 Accepting task:', taskId);

      const result = await acceptTaskMutation.mutateAsync(taskId!);

      console.log('✅ Task accepted successfully:', result);

      Alert.alert(
        'Task Accepted! 🎉',
        'You have successfully accepted this task. The task creator has been notified.',
        [
          {
            text: 'View My Tasks',
            onPress: () => router.push('./mytasks-screen')
          },
          {
            text: 'Back to Task',
            onPress: () => router.push(`./task-detail?taskId=${taskId}`)
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Failed to accept task:', error);
      Alert.alert(
        'Failed to Accept Task',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading task details..." />;
  }

  if (!task) {
    return (
      <ErrorState
        title="Task Not Found"
        subtitle="Could not load task details."
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <BlueBackdrop />
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color={CARD_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accept Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" removeClippedSubviews={false} contentContainerStyle={styles.scrollContent}>
        {/* Task Summary */}
        <TaskSummaryCard
          title={task.title}
          creatorFirstName={task.createdBy?.firstName}
          creatorLastName={task.createdBy?.lastName}
          location={task.location?.address}
          budget={task.budget}
        />

        {/* Task Details */}
        <TaskDetails
          description={task.details}
          dueDate={task.dateRange?.end}
          dateType={task.dateType}
        />

        {/* Commitment Information */}
        <CommitmentSection />

        {/* Important Notes */}
        <ImportantNotes />

        {/* Terms and Conditions */}
        <TermsCheckbox
          agreed={agreedToTerms}
          onToggle={() => setAgreedToTerms(!agreedToTerms)}
        />

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>💬 Need to ask questions?</Text>
          <Text style={styles.contactText}>
            You can contact the task creator before accepting to clarify any requirements.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push(`./ask-question-screen?taskId=${taskId}`)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={CARD_PRICE_TEXT} />
            <Text style={styles.contactButtonText}>Ask a Question</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity 
          style={[styles.acceptButton, (!agreedToTerms || isSubmitting) && styles.disabledButton]}
          onPress={handleAcceptTask}
          disabled={!agreedToTerms || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="hand-left-outline" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept Task</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
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
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  contactContainer: {
    marginTop: 16,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 8,
  },
  contactText: {
    fontSize: RFValue(14),
    color: CARD_TEXT_MUTED,
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_PRICE_BG,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: CARD_PRICE_TEXT,
    fontSize: RFValue(14),
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#003399',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  acceptButton: {
    backgroundColor: BRAND_ORANGE,
    height: 52,
    borderRadius: 14,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});