import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
    useAcceptOffer,
    useGetTaskById,
    useGetTaskOffers,
    useGetTaskQuestions,
    usePostTaskQuestion,
} from '../../../../../shared/hooks/useTaskApi';
import { useGetStripeAccountStatus } from '../../../../../shared/hooks/useStripeConnectApi';
import { useAuthStore } from '../../../../../store/auth-task-store';
import { moderateContent } from '../../../../../shared/utils/contentModeration';

interface UseTaskDetailProps {
  taskId: string;
}

export const useTaskDetail = ({ taskId }: UseTaskDetailProps) => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  
  // Stripe Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  
  // Stripe Payout Account Modal State (for Make Offer check)
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Fetch task details
  const {
    data: taskData,
    isLoading,
    error,
    refetch,
  } = useGetTaskById(taskId || '', !!taskId);

  // Fetch offers for THIS task using /api/tasks/:id/offers
  const {
    data: taskOffersData,
    isLoading: isLoadingTaskOffers,
    error: taskOffersError,
    refetch: refetchTaskOffers,
  } = useGetTaskOffers(taskId || '', !!taskId);

  // Fetch questions for this specific task ONLY
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions,
  } = useGetTaskQuestions(taskId || '', !!taskId); // Enabled when we have a taskId

  // NOTE: Removed public questions to maintain privacy - only show questions for current task
  // const {
  //   data: publicQuestionsData,
  //   isLoading: isLoadingPublicQuestions, 
  //   error: publicQuestionsError,
  // } = useGetAllPublicQuestions(true);

  // Post question mutation
  const postQuestionMutation = usePostTaskQuestion();

  // Accept offer mutation
  const acceptOfferMutation = useAcceptOffer();
  
  // Check if user has setup payout account (for Make Offer button)
  const { data: accountStatus, isLoading: isLoadingStripe, error: stripeError } = useGetStripeAccountStatus(true);
  const hasPayoutAccount = !stripeError && accountStatus && accountStatus.detailsSubmitted && accountStatus.payoutsEnabled;

  // Cleanup modal states when component unmounts or taskId changes
  useEffect(() => {
    return () => {
      // Reset modal states on cleanup
      setShowAskQuestion(false);
      setQuestionText('');
      setShowPaymentModal(false);
      setSelectedOfferId(null);
      setSelectedOffer(null);
      setShowPayoutModal(false);
    };
  }, [taskId]);

  const task = taskData?.data;
  const user = taskData?.user;
  
  // Get offers for THIS specific task (for both MyOfferCard and Offers tab)
  const taskOffers = taskOffersData?.data?.offers || [];
  
  // PRIVACY FIX: Only show questions specific to THIS task, not public questions from other tasks
  const taskQuestions = questionsData?.data || [];
  
  console.log('📝 Questions Debug (PRIVACY MODE):', {
    taskId: taskId,
    taskQuestionsCount: taskQuestions.length,
    questionsShownToUser: taskQuestions.length,
    privacyMode: 'enabled - only showing questions for this specific task',
    currentUserId: currentUser?._id,
    taskCreatorId: task?.createdBy?._id
  });
  
  // PRIVACY: Only use questions for THIS specific task
  // Updated filtering to show questions to all relevant users for better collaboration
  const filteredQuestions = taskQuestions.filter((question: any) => {
    // Show questions if user is:
    // 1. The task creator/poster
    // 2. The person who asked the question  
    // 3. A participant (has made offers or is viewing the task)
    // 4. Any authenticated user viewing this specific task (for better collaboration)
    
    const isTaskCreator = currentUser?._id === task?.createdBy?._id;
    const isQuestionAsker = currentUser?._id === (question.askedBy?._id || question.userId?._id || question.user?._id);
    const hasOfferOnTask = taskOffers.some((offer: any) => offer.taskTakerId?._id === currentUser?._id);
    const isAuthenticatedUser = !!currentUser?._id; // Allow any authenticated user to see questions for collaboration
    
    // Be more inclusive to allow proper Q&A collaboration
    return isTaskCreator || isQuestionAsker || hasOfferOnTask || isAuthenticatedUser;
  });
  
  // Sort questions by creation date (newest first)
  const questions = filteredQuestions.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Find the current user's offer on THIS task (if they made one)
  // Backend returns user info in 'user' field, not 'taskTakerId'
  const myOffer = taskOffers.find(
    (offer: any) => {
      const offerUserId = offer.user?._id || offer.taskTakerId?._id;
      return offerUserId === currentUser?._id;
    }
  );

  const handleMakeOffer = () => {
    console.log('🔘 [TaskDetail] Make Offer button clicked');
    console.log('💳 Payout check:', { 
      hasPayoutAccount, 
      willShowModal: !hasPayoutAccount,
      stripeError: stripeError?.message || stripeError?.status
    });
    
    // Check if payout account is setup BEFORE navigating to offer screen
    if (!hasPayoutAccount) {
      console.log('⚠️ No payout account - showing modal');
      setShowPayoutModal(true);
      return;
    }
    
    console.log('✅ Payout account verified - navigating to offer screen');
    router.push(`/make-offer-screen?taskId=${taskId}`);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      console.log('💳 Opening Stripe payment modal for offer:', offerId);
      
      // Find the offer data
      const offerToAccept = taskOffers.find((offer: any) => offer._id === offerId);
      
      if (!offerToAccept) {
        console.error('❌ Could not find offer data for:', offerId);
        return;
      }
      
      // Set the selected offer and show payment modal
      setSelectedOfferId(offerId);
      setSelectedOffer(offerToAccept);
      setShowPaymentModal(true);
      
      console.log('✅ Payment modal opened for offer:', {
        offerId,
        offerStructure: offerToAccept,
        amount: offerToAccept.offer?.amount || offerToAccept.amount,
        currency: offerToAccept.offer?.currency || offerToAccept.currency,
        amountPath: offerToAccept.offer?.amount ? 'offer.amount' : 'amount'
      });
      
    } catch (error) {
      console.error('Failed to open payment modal:', error);
    }
  };
  
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedOfferId(null);
    setSelectedOffer(null);
  };
  
  const handlePaymentSuccess = async () => {
    console.log('🎉 Payment completed successfully!');
    
    // Refresh task data to show updated status
    console.log('🔄 Refreshing task data and offers after payment success');
    await Promise.all([refetch(), refetchTaskOffers()]);
    
    handleClosePaymentModal();
    
    // Small delay to ensure UI updates before navigation
    setTimeout(() => {
      // Navigate to My Tasks → Poster → Todo tab (where in-progress/assigned tasks appear)
      console.log('🧭 Navigating to My Tasks - Poster - Todo tab (in-progress tasks)');
      router.push({
        pathname: '/(tabs)/my-tasks' as any,
        params: { role: 'Poster', tab: 'Todo' }
      });
    }, 500);
  };

  const handleAskQuestion = async (attachments: any[] = []) => {
    if (!questionText.trim()) return;

    // Moderate content before submitting
    const moderationResult = moderateContent(questionText);
    if (!moderationResult.isClean) {
      Alert.alert(
        'Question Blocked',
        moderationResult.reason || 'Your question contains inappropriate content.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('📝 Submitting question with attachments:', {
        questionText,
        attachments: attachments.length
      });

      // Convert attachments to the format expected by the API
      const files = attachments.map((att: any) => ({
        uri: att.uri,
        name: att.name,
        type: att.type === 'image' ? 'image/jpeg' : 'application/pdf'
      }));

      await postQuestionMutation.mutateAsync({
        taskId: taskId || '',
        question: questionText.trim(),
        files: files.length > 0 ? files : undefined,
      });
      
      console.log('✅ Question posted successfully');
      setQuestionText('');
      setShowAskQuestion(false);
      
      // Questions list will auto-refresh via React Query cache invalidation
      console.log('💫 Questions will refresh automatically via cache invalidation');
    } catch (error: any) {
      console.error('❌ Failed to post question:', error);
      let errorMessage = 'Failed to submit your question. Please try again.';
      if (error?.message?.includes('Authentication') || error?.response?.status === 401) {
        errorMessage = 'Please log in again to submit your question.';
      } else if (error?.message?.includes('Validation') || error?.response?.status === 400) {
        errorMessage = 'Invalid question. Please check your input and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Question Not Submitted', errorMessage);
    }
  };

  const getLocationIcon = (): 'location-outline' | 'desktop-outline' | 'car-outline' => {
    const address = task?.location?.address || '';
    if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
      return 'desktop-outline';
    } else if (address.includes(' → ') || address.includes(' to ')) {
      return 'car-outline';
    }
    return 'location-outline';
  };

  const getTimeDisplay = () => {
    if (task?.dateType === 'before') return 'Before specific date';
    if (task?.dateType === 'no-rush') return 'No rush';
    if (task?.time && task.time !== 'Anytime') return task.time;
    return 'Flexible';
  };

  return {
    task,
    user,
    taskOffers, // Offers for this specific task only
    myOffer,
    questions,
    isLoading,
    error,
    refetch,
    refetchTaskOffers,
    isLoadingTaskOffers,
    isLoadingQuestions: isLoadingQuestions, // Don't include public questions loading to avoid blocking UI
    questionsError: questionsError, // Only show error if task questions fail
    refetchQuestions,
    activeTab,
    setActiveTab,
    showAskQuestion,
    setShowAskQuestion,
    questionText,
    setQuestionText,
    handleMakeOffer,
    handleAcceptOffer,
    handleAskQuestion,
    getLocationIcon,
    getTimeDisplay,
    postQuestionMutation,
    currentUser,
    // Stripe Payment Modal
    showPaymentModal,
    selectedOfferId,
    selectedOffer,
    handleClosePaymentModal,
    handlePaymentSuccess,
    // Stripe Payout Modal (for Make Offer)
    showPayoutModal,
    setShowPayoutModal,
    hasPayoutAccount,
    isLoadingStripe,
  };
};
