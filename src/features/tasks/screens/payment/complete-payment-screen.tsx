import { HS, homeCard, homeIconChip } from '@/src/shared/theme/homeStyle';
import { useGetAcceptedOffer, useGetTaskById } from '@/src/shared/hooks/useTaskApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { RFValue } from '@/src/shared/utils/responsive';

export default function CompletePaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <StatusBar barStyle="light-content" backgroundColor={HS.blue} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 50 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
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
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleCompletePayment}
          disabled={isSubmitting || !paymentMethod}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFFFFF" />
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
    backgroundColor: HS.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: HS.blue,
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
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 36,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HS.cardBorder,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submittingButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '700',
  },
});