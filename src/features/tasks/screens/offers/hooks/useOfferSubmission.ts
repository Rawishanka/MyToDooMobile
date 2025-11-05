import { useCreateOffer, useGetAllOffers } from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseOfferSubmissionProps {
  taskId: string;
}

export const useOfferSubmission = ({ taskId }: UseOfferSubmissionProps) => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const createOfferMutation = useCreateOffer();

  // Fetch offers for this task to check if user already made an offer
  const {
    data: offersData,
    isLoading: isLoadingOffers,
  } = useGetAllOffers(
    { 
      taskId: taskId || '',
      limit: 50, 
      sortBy: 'createdAt', 
      order: 'desc' 
    }, 
    !!taskId
  );

  const offers = offersData?.data || [];
  
  // Check if current user has already made an offer on this task
  const userHasExistingOffer = offers.some(
    (offer: any) => offer.taskTakerId?._id === currentUser?._id
  );

  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateOfferAmount = (amount: string): boolean => {
    if (!amount || amount.trim() === '') {
      Alert.alert('Validation Error', 'Please enter an offer amount.');
      return false;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return false;
    }

    return true;
  };

  const validateMessage = (msg: string): boolean => {
    if (!msg || msg.trim() === '') {
      Alert.alert('Validation Error', 'Please include a message with your offer.');
      return false;
    }

    if (msg.trim().length < 10) {
      Alert.alert(
        'Validation Error',
        'Your message should be at least 10 characters long.'
      );
      return false;
    }

    return true;
  };

  const handleSubmitOffer = async () => {
    // Check if user already has an offer on this task
    if (userHasExistingOffer) {
      Alert.alert(
        'Offer Already Submitted',
        'You have already made an offer on this task. You can only submit one offer per task.'
      );
      return;
    }

    if (!validateOfferAmount(offerAmount)) return;
    if (!validateMessage(message)) return;

    setIsSubmitting(true);

    try {
      const offerData = {
        amount: parseFloat(offerAmount),
        currency: 'SGD',
        message: message.trim(),
      };

      await createOfferMutation.mutateAsync({
        taskId,
        offerData,
      });

      Alert.alert(
        'Offer Submitted!',
        "Your offer has been sent to the task creator. You'll be notified when they respond.",
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting offer:', error);
      Alert.alert(
        'Failed to Submit Offer',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    setOfferAmount(cleanedText);
  };

  return {
    offerAmount,
    message,
    isSubmitting,
    isLoadingOffers,
    userHasExistingOffer,
    setMessage,
    handleOfferAmountChange,
    handleSubmitOffer,
  };
};
