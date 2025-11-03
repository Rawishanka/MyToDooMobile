import { useGetAcceptedOffer, useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

// Components
import {
    PaymentDetails,
    PaymentErrorState,
    PaymentLoadingState,
    PaymentMethodSelector,
    PaymentNotes,
    TaskSummary,
} from './components';

// Hooks
import { usePaymentForm } from './hooks';

export default function CompletePaymentScreen() {
  const router = useRouter();
  const { taskId, offerId } = useLocalSearchParams<{ 
    taskId: string; 
    offerId?: string;
  }>();

  // Fetch task and offer data
  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: offerData, isLoading: isOfferLoading } = useGetAcceptedOffer(taskId || '', !!taskId);

  const task = taskData?.data;
  const acceptedOffer = offerData?.data;
  const isLoading = isTaskLoading || isOfferLoading;

  // Payment form hook
  const {
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    isSubmitting,
    handleCompletePayment,
    paymentMethods,
  } = usePaymentForm({
    taskId: taskId || '',
    offerId,
    acceptedOfferId: acceptedOffer?._id,
  });

  // Loading state
  if (isLoading) {
    return <PaymentLoadingState />;
  }

  // Error state
  if (!task || !acceptedOffer) {
    return (
      <PaymentErrorState
        title="Payment Not Available"
        subtitle={!task ? 'Task not found.' : 'No accepted offer found for this task.'}
        onBack={() => router.back()}
      />
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
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TaskSummary title={task.title} location={task.location?.address} />
        
        <PaymentDetails
          taskCreator={task.createdBy}
          taskPerformer={acceptedOffer.taskTakerId}
          amount={acceptedOffer.offer?.amount}
          offerMessage={acceptedOffer.offer?.message}
        />

        <View style={styles.formContainer}>
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          <PaymentNotes
            notes={notes}
            onChangeNotes={setNotes}
            maxLength={300}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleCompletePayment}
          disabled={isSubmitting || !paymentMethod}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                Complete Payment (${acceptedOffer.offer?.amount})
              </Text>
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
  },
  formContainer: {
    padding: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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