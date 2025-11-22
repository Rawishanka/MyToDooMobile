import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    useAcceptOffer,
    useGetTaskById,
    useGetTaskOffers,
    useGetTaskQuestions,
    usePostTaskQuestion,
} from '../../../../../shared/hooks/useTaskApi';
import { useAuthStore } from '../../../../../store/auth-task-store';

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
        amount: offerToAccept.offer?.amount || (offerToAccept as any).amount,
        currency: offerToAccept.offer?.currency || (offerToAccept as any).currency
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
      // Navigate to My Tasks → Poster → Posted tab (where poster can see their accepted tasks)
      console.log('🧭 Navigating to My Tasks - Poster - Posted tab');
      router.push({
        pathname: '/(tabs)/my-tasks' as any,
        params: { role: 'Poster', tab: 'Posted' }
      });
    }, 500);
  };

  const handleAskQuestion = async (attachments: any[] = []) => {
    if (!questionText.trim()) return;

    try {
      console.log('📝 Submitting question with attachments:', {
        questionText,
        attachments: attachments.length
      });

      // TODO: Update API to support attachments
      // For now, we'll include attachment info in the question text if there are any
      let finalQuestion = questionText.trim();
      if (attachments.length > 0) {
        const attachmentInfo = attachments.map((att: any) => 
          `📎 ${att.type === 'image' ? '🖼️' : '📄'} ${att.name}`
        ).join('\n');
        finalQuestion += `\n\nAttached files:\n${attachmentInfo}`;
      }

      await postQuestionMutation.mutateAsync({
        taskId: taskId || '',
        question: finalQuestion,
      });
      
      console.log('✅ Question posted successfully');
      setQuestionText('');
      setShowAskQuestion(false);
      
      // Refresh questions list
      refetchQuestions();
    } catch (error: any) {
      console.error('❌ Failed to post question:', error);
      // The error will be handled by the mutation's onError callback
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
  };
};
