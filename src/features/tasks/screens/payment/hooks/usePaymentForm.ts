import { useCompletePayment } from '@/src/shared/hooks/useTaskApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', label: '💵 Cash', description: 'Pay in person with cash' },
  { id: 'bank_transfer', label: '🏦 Bank Transfer', description: 'Electronic bank transfer' },
  { id: 'paypal', label: '💳 PayPal', description: 'Pay via PayPal' },
  { id: 'venmo', label: '📱 Venmo', description: 'Pay via Venmo' },
  { id: 'zelle', label: '⚡ Zelle', description: 'Pay via Zelle' },
  { id: 'check', label: '📄 Check', description: 'Pay by check' },
  { id: 'other', label: '🔧 Other', description: 'Other payment method' }
];

interface UsePaymentFormProps {
  taskId: string;
  offerId?: string;
  acceptedOfferId?: string;
}

export const usePaymentForm = ({ taskId, offerId, acceptedOfferId }: UsePaymentFormProps) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completePaymentMutation = useCompletePayment();

  const handleCompletePayment = async () => {
    try {
      // Validate input
      if (!paymentMethod) {
        Alert.alert('Payment Method Required', 'Please select a payment method.');
        return;
      }

      setIsSubmitting(true);

      const finalOfferId = offerId || acceptedOfferId;
      

      const result = await completePaymentMutation.mutateAsync({
        taskId: taskId!,
        paymentData: {
          offerId: finalOfferId!,
          paymentMethod,
          notes: notes.trim() || undefined,
        }
      });


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
      Alert.alert(
        'Failed to Complete Payment',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    isSubmitting,
    handleCompletePayment,
    paymentMethods: PAYMENT_METHODS,
  };
};
