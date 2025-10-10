import { useAcceptTask, useGetTaskById } from '@/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AcceptTaskScreen() {
  const router = useRouter();
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorSubtitle}>Could not load task details.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accept Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskCreator}>
            Posted by {task.createdBy?.firstName} {task.createdBy?.lastName}
          </Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Budget:</Text>
            <Text style={styles.budgetAmount}>${task.budget}</Text>
          </View>
        </View>

        {/* Task Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Task Description</Text>
          <Text style={styles.taskDescription}>
            {task.details || 'No description provided.'}
          </Text>

          {task.dateRange && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dueDateText}>
                Due: {new Date(task.dateRange.end).toLocaleDateString()}
              </Text>
            </View>
          )}

          {task.dateType && (
            <View style={styles.urgencyContainer}>
              <Ionicons name="time-outline" size={20} color="#ff6b6b" />
              <Text style={styles.urgencyText}>Date Type: {task.dateType}</Text>
            </View>
          )}
        </View>

        {/* Commitment Information */}
        <View style={styles.commitmentContainer}>
          <Text style={styles.commitmentTitle}>🤝 Your Commitment</Text>
          <Text style={styles.commitmentText}>
            By accepting this task, you commit to:
          </Text>
          
          <View style={styles.commitmentList}>
            <View style={styles.commitmentItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.commitmentItemText}>
                Complete the task according to the provided description
              </Text>
            </View>
            
            <View style={styles.commitmentItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.commitmentItemText}>
                Communicate regularly with the task creator
              </Text>
            </View>
            
            <View style={styles.commitmentItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.commitmentItemText}>
                Deliver quality work within the agreed timeframe
              </Text>
            </View>
            
            <View style={styles.commitmentItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.commitmentItemText}>
                Follow safety guidelines and professional standards
              </Text>
            </View>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>📋 Important Notes</Text>
          <Text style={styles.noteItem}>
            • You can message the task creator for clarifications
          </Text>
          <Text style={styles.noteItem}>
            • Payment will be processed after task completion
          </Text>
          <Text style={styles.noteItem}>
            • Task can be cancelled if agreed upon by both parties
          </Text>
          <Text style={styles.noteItem}>
            • All work should comply with local laws and regulations
          </Text>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={styles.termsCheckbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkedBox]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the terms and conditions, and I commit to completing this task 
              professionally and according to the requirements.
            </Text>
          </TouchableOpacity>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  taskCreator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 20,
    color: '#28a745',
    fontWeight: '700',
  },
  detailsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
    marginLeft: 8,
  },
  commitmentContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  commitmentText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 12,
  },
  commitmentList: {
    marginTop: 8,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commitmentItemText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  notesContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
  termsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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