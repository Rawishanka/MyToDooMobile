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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accept Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <Ionicons name="chatbubble-outline" size={20} color="#007bff" />
            <Text style={styles.contactButtonText}>Ask a Question</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View style={styles.buttonContainer}>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
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
    fontWeight: '600',
  },
});