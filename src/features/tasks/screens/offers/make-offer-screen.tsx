import { useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ErrorState,
    LoadingState,
    OfferForm,
    OfferFormHeader,
    TaskSummarySection,
    TipsSection,
} from './components';
import { useOfferSubmission } from './hooks/useOfferSubmission';

export default function MakeOfferScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  
  const {
    data: taskData,
    isLoading,
    error,
  } = useGetTaskById(taskId!);

  const task = taskData?.data;

  const {
    offerAmount,
    message,
    isSubmitting,
    setMessage,
    handleOfferAmountChange,
    handleSubmitOffer,
  } = useOfferSubmission({ taskId: taskId! });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error.message || 'Failed to load task details'} />;
  }

  if (!task) {
    return <ErrorState error="Task not found" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <OfferFormHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TaskSummarySection task={task} />

        <OfferForm
          offerAmount={offerAmount}
          message={message}
          onAmountChange={handleOfferAmountChange}
          onMessageChange={setMessage}
        />

        <TipsSection />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmitOffer}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Offer</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submittingButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
