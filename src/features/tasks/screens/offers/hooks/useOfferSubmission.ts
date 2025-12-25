import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useCreateOffer, useGetTaskOffers } from '@/src/shared/hooks/useTaskApi';
import { getCurrencyFromUserLocation } from '@/src/shared/utils/currency';
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
  
  // Use user's current location for currency display (auto geo-location)
  const { countryInfo } = useLocationCountry();

  // Fetch offers for this specific task to check if user already made an offer
  const {
    data: taskOffersData,
    isLoading: isLoadingOffers,
    refetch: refetchOffers,
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
      // Backend returns user info in 'user' field, not 'taskTakerId'
      isMatch: (offer.user?._id || offer.taskTakerId?._id) === currentUser?._id
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
  const [messageError, setMessageError] = useState<string>('');
  const [hasUserEditedAmount, setHasUserEditedAmount] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // Get currency info based on user's current location (auto geo-location)
  const currencyInfo = useMemo(
    () => getCurrencyFromUserLocation(countryInfo || { currency: 'AUD' }),
    [countryInfo]
  );

  // Set default offer amount to task budget when available (with formatting)
  useEffect(() => {
    if (taskBudget && !hasUserEditedAmount) {
      // Format the default budget value with thousand separators and 2 decimal places
      const formattedBudget = taskBudget.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
      setOfferAmount(formattedBudget);
    }
  }, [taskBudget, hasUserEditedAmount]);

  const validateOfferAmount = (amount: string): boolean => {
    if (!amount || amount.trim() === '') {
      setValidationError('Please enter an offer amount.');
      return false;
    }

    // Remove commas before parsing
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setValidationError('Please enter a valid positive amount.');
      return false;
    }

    // Validate maximum amount against task budget (offer should be <= budget)
    if (taskBudget && numericAmount > taskBudget) {
      setValidationError(
        `Your offer amount cannot exceed the task budget of ${currencyInfo.symbol}${taskBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  const validateMessage = (msg: string): boolean => {
    if (!msg || msg.trim() === '') {
      setMessageError('Please include a message with your offer.');
      return false;
    }

    if (msg.trim().length < 10) {
      setMessageError(
        'Your message should be at least 10 characters long.'
      );
      return false;
    }

    setMessageError('');
    return true;
  };

  const handleSubmitOffer = async () => {
    // Prevent double submission - if already submitting or submitted within last 3 seconds, ignore
    const now = Date.now();
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring duplicate call');
      return;
    }
    
    if (now - lastSubmitTime < 3000) {
      console.log('⚠️ Duplicate submission detected within 3 seconds, ignoring');
      Alert.alert(
        'Please Wait',
        'Your offer is being submitted. Please wait a moment.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

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
    setLastSubmitTime(now);
    
    console.log('🚀 [useOfferSubmission] Starting offer submission...');

    try {
      const offerData = {
        amount: parseFloat(offerAmount.replace(/,/g, '')), // Remove commas before parsing
        // Removing currency field as it might be causing 400 error
        // currency: currencyInfo.code,
        message: message.trim(),
      };

      console.log("📤 [useOfferSubmission] Submitting offer data:", offerData);

      const result = await createOfferMutation.mutateAsync({
        taskId,
        offerData,
      });

      console.log('✅ [useOfferSubmission] Offer submitted successfully:', result);
      
      // Refetch offers to verify the submission and update the list
      console.log('🔄 Refetching offers to verify submission...');
      await refetchOffers();

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
      console.error('❌ [useOfferSubmission] Error submitting offer:', error);
      
      // Even if there's an error, refetch offers to check if it was actually created
      // (handles case where offer creation succeeded but chat creation failed)
      console.log('🔄 Refetching offers to check if submission succeeded despite error...');
      const refetchResult = await refetchOffers();
      
      // Check if user now has an offer (meaning it was created despite the error)
      const updatedOffers = refetchResult.data?.data?.offers || [];
      const offerWasCreated = updatedOffers.some((offer: any) => {
        const takerId = offer.taskTakerId?._id || offer.taskTaker?._id || offer.userId?._id || offer.user?._id;
        return takerId === currentUser?._id;
      });
      
      if (offerWasCreated) {
        console.log('✅ Offer was created successfully despite error - showing success message');
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
      } else {
        console.log('❌ Offer was not created - showing error message');
        setIsSubmitting(false); // Reset on error so user can retry
        Alert.alert(
          'Failed to Submit Offer',
          error?.message || 'Something went wrong. Please try again.'
        );
      }
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
  
  const handleMessageChange = (text: string) => {
    setMessage(text);
    // Clear message error when user starts typing
    if (messageError) {
      setMessageError('');
    }
  };
  
  const handleMessageFocus = () => {
    // Clear message error when user focuses on the field
    if (messageError) {
      setMessageError('');
    }
  };

  const handleOfferAmountChange = (text: string) => {
    // Remove all non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    // Mark that user has started editing (this will prevent auto-population)
    if (!hasUserEditedAmount) {
      setHasUserEditedAmount(true);
    }
    
    // Format the display value with thousand separators
    let formattedValue = cleanedText;
    if (cleanedText) {
      const [integerPart, decimalPart] = cleanedText.split('.');
      // Add thousand separators to integer part
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedValue = decimalPart !== undefined 
        ? `${formattedInteger}.${decimalPart}` 
        : formattedInteger;
    }
    
    // Set the formatted text as the display value
    setOfferAmount(formattedValue);
    
    // Real-time validation - clear errors when user types valid input
    if (cleanedText) {
      const numericAmount = parseFloat(cleanedText);
      
      // Check if amount exceeds budget
      if (taskBudget && !isNaN(numericAmount) && numericAmount > taskBudget) {
        setValidationError(`Amount cannot exceed budget of ${currencyInfo.symbol}${taskBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      } else if (!isNaN(numericAmount) && numericAmount > 0) {
        // Valid positive amount entered - clear any validation error
        setValidationError('');
      } else if (numericAmount === 0) {
        // Zero is not valid
        setValidationError('Please enter a valid positive amount.');
      }
    } else {
      // Field is empty - only clear error if user is actively editing (not from submit)
      if (hasUserEditedAmount) {
        setValidationError('');
      }
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
    messageError,
    taskBudget,
    setMessage: handleMessageChange,
    handleOfferAmountChange,
    handleOfferAmountFocus,
    handleMessageFocus,
    handleSubmitOffer,
  };
};
