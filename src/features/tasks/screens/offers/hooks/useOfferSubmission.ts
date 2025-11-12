import { useCreateOffer, useGetTaskOffers } from '@/src/shared/hooks/useTaskApi';
import { getCurrencyFromLocation } from '@/src/shared/utils/currency';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

interface UseOfferSubmissionProps {
  taskId: string;
  taskBudget?: number;
  taskLocation?: { address?: string };
}

export const useOfferSubmission = ({ taskId, taskBudget, taskLocation }: UseOfferSubmissionProps) => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const createOfferMutation = useCreateOffer();

  // Fetch offers for this specific task to check if user already made an offer
  const {
    data: taskOffersData,
    isLoading: isLoadingOffers,
  } = useGetTaskOffers(taskId || '', !!taskId);

  const offers = taskOffersData?.data?.offers || [];
  
  // Debug logging to check offer structure and user matching
  console.log('🔍 [useOfferSubmission] Checking existing offers:');
  console.log('📊 Current user ID:', currentUser?._id);
  console.log('📝 Total offers found:', offers.length);
  offers.forEach((offer: any, index: number) => {
    console.log(`📋 Offer ${index + 1}:`, {
      offerId: offer._id,
      taskTakerId: offer.taskTakerId?._id,
      status: offer.status,
      isMatch: offer.taskTakerId?._id === currentUser?._id
    });
  });
  
  // Check if current user has already made an offer on this task
  // Handle multiple possible data structures for robustness
  const userHasExistingOffer = offers.some(
    (offer: any) => {
      // Check multiple possible field structures
      const takerId = offer.taskTakerId?._id || offer.taskTaker?._id || offer.userId?._id || offer.user?._id;
      const currentUserId = currentUser?._id;
      
      const isMatch = takerId && currentUserId && takerId === currentUserId;
      
      if (isMatch) {
        console.log('✅ Found existing offer from current user:', {
          offerId: offer._id,
          status: offer.status,
          amount: offer.offer?.amount || offer.amount,
          takerId: takerId,
          currentUserId: currentUserId
        });
      }
      return isMatch;
    }
  );
  
  console.log('🚫 User has existing offer:', userHasExistingOffer);
  
  // Additional safety check - if we can't determine user ID, assume no existing offer to allow functionality
  if (!currentUser?._id) {
    console.log('⚠️ No current user ID found, allowing offer submission');
  }

  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [hasUserEditedAmount, setHasUserEditedAmount] = useState(false);

  // Get currency info based on task location
  const currencyInfo = useMemo(
    () => getCurrencyFromLocation(taskLocation),
    [taskLocation]
  );

  // Set default offer amount to task budget when available
  useEffect(() => {
    if (taskBudget && !hasUserEditedAmount) {
      setOfferAmount(taskBudget.toString());
    }
  }, [taskBudget, hasUserEditedAmount]);

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

    // Validate maximum amount against task budget (offer should be <= budget)
    if (taskBudget && numericAmount > taskBudget) {
      Alert.alert(
        'Amount Too High',
        `Your offer amount cannot exceed the task budget of ${currencyInfo.symbol}${taskBudget}.`
      );
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
    // Double-check if user already has an offer on this task (safety check)
    if (userHasExistingOffer) {
      Alert.alert(
        'Offer Already Submitted',
        'You have already made an offer on this task. You can only submit one offer per task.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Prevent submission while offers are still loading
    if (isLoadingOffers) {
      Alert.alert(
        'Please Wait',
        'Still checking your previous offers. Please wait a moment and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!validateOfferAmount(offerAmount)) return;
    if (!validateMessage(message)) return;

    setIsSubmitting(true);

    try {
      const offerData = {
        amount: parseFloat(offerAmount),
        // Removing currency field as it might be causing 400 error
        // currency: currencyInfo.code,
        message: message.trim(),
      };

      console.log("📤 [useOfferSubmission] Submitting offer data:", offerData);

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

  const handleOfferAmountFocus = () => {
    // Clear the field when user focuses for the first time
    if (!hasUserEditedAmount) {
      setHasUserEditedAmount(true);
      setOfferAmount('');
      setValidationError('');
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
    
    // Mark that user has started editing (this will prevent auto-population)
    if (!hasUserEditedAmount) {
      setHasUserEditedAmount(true);
    }
    
    // Set the cleaned text as the new value
    setOfferAmount(cleanedText);
    
    // Real-time validation
    if (cleanedText && taskBudget) {
      const numericAmount = parseFloat(cleanedText);
      if (!isNaN(numericAmount) && numericAmount > taskBudget) {
        setValidationError(`Amount cannot exceed budget of ${currencyInfo.symbol}${taskBudget}`);
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  };

  return {
    offerAmount,
    message,
    isSubmitting,
    isLoadingOffers,
    userHasExistingOffer,
    currencySymbol: currencyInfo.symbol,
    validationError,
    taskBudget,
    setMessage,
    handleOfferAmountChange,
    handleOfferAmountFocus,
    handleSubmitOffer,
  };
};
