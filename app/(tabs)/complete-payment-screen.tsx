import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetTaskById, useGetAcceptedOffer } from '@/hooks/useTaskApi';
import { useCompletePayment } from '@/hooks/useTaskApi';

export default function CompletePaymentScreen() {
  const router = useRouter();
  const { taskId, offerId } = useLocalSearchParams<{ 
    taskId: string; 
    offerId?: string;
  }>();
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskData, isLoading: isTaskLoading } = useGetTaskById(taskId || '', !!taskId);
  const { data: offerData, isLoading: isOfferLoading } = useGetAcceptedOffer(taskId || '', !!taskId);
  const completePaymentMutation = useCompletePayment();

  const task = taskData?.data;
  const acceptedOffer = offerData?.data;
  const isLoading = isTaskLoading || isOfferLoading;

  const paymentMethods = [
    { id: 'cash', label: '💵 Cash', description: 'Pay in person with cash' },
    { id: 'bank_transfer', label: '🏦 Bank Transfer', description: 'Electronic bank transfer' },
    { id: 'paypal', label: '💳 PayPal', description: 'Pay via PayPal' },
    { id: 'venmo', label: '📱 Venmo', description: 'Pay via Venmo' },
    { id: 'zelle', label: '⚡ Zelle', description: 'Pay via Zelle' },
    { id: 'check', label: '📄 Check', description: 'Pay by check' },
    { id: 'other', label: '🔧 Other', description: 'Other payment method' }
  ];

  const handleCompletePayment = async () => {
    try {
      // Validate input
      if (!paymentMethod) {
        Alert.alert('Payment Method Required', 'Please select a payment method.');
        return;
      }

      setIsSubmitting(true);

      console.log('💰 Completing payment:', {
        taskId,
        offerId: offerId || acceptedOffer?._id,
        paymentMethod,
        notes: notes.trim()
      });

      const result = await completePaymentMutation.mutateAsync({
        taskId: taskId!,
        paymentData: {
          offerId: offerId || acceptedOffer?._id!,
          paymentMethod,
          notes: notes.trim() || undefined,
        }
      });

      console.log('✅ Payment completed successfully:', result);

      Alert.alert(
        'Payment Completed! 🎉',
        'The payment has been marked as complete. Both parties have been notified.',
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
      console.error('❌ Failed to complete payment:', error);
      Alert.alert(
        'Failed to Complete Payment',
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
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!task || !acceptedOffer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorTitle}>Payment Not Available</Text>
        <Text style={styles.errorSubtitle}>
          {!task ? 'Task not found.' : 'No accepted offer found for this task.'}
        </Text>
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
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.taskSummary}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            {task.location?.address || 'Location not specified'}
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetails}>
          <Text style={styles.sectionTitle}>💰 Payment Details</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Task Creator:</Text>
              <Text style={styles.paymentValue}>
                {task.createdBy?.firstName} {task.createdBy?.lastName}
              </Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Task Performer:</Text>
              <Text style={styles.paymentValue}>
                {acceptedOffer.taskTakerId?.firstName} {acceptedOffer.taskTakerId?.lastName}
              </Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Agreed Amount:</Text>
              <Text style={styles.paymentAmount}>${acceptedOffer.offer?.amount}</Text>
            </View>
            
            {acceptedOffer.offer?.message && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Offer Message:</Text>
                <Text style={styles.paymentValue} numberOfLines={3}>
                  {acceptedOffer.offer?.message}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                paymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                <Text style={styles.paymentMethodDescription}>{method.description}</Text>
              </View>
              {paymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#28a745" />
              )}
            </TouchableOpacity>
          ))}

          {/* Payment Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payment Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about the payment method, transaction ID, or special instructions..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
              maxLength={300}
            />
            <Text style={styles.characterCount}>
              {notes.length}/300 characters
            </Text>
          </View>

          {/* Payment Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#28a745" />
            <Text style={styles.securityText}>
              Your payment information is secure. This confirmation helps both parties 
              track payment completion for the task.
            </Text>
          </View>

          {/* Important Notes */}
          <View style={styles.importantNotes}>
            <Text style={styles.notesTitle}>📝 Important Notes:</Text>
            <Text style={styles.noteItem}>• Confirm payment amount matches the accepted offer</Text>
            <Text style={styles.noteItem}>• Ensure task is completed before making payment</Text>
            <Text style={styles.noteItem}>• Keep receipts for your records</Text>
            <Text style={styles.noteItem}>• Both parties will be notified when payment is marked complete</Text>
          </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  paymentDetails: {
    marginTop: 24,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paymentValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  paymentAmount: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '700',
  },
  formContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentMethod: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    minHeight: 80,
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    lineHeight: 20,
  },
  importantNotes: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
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