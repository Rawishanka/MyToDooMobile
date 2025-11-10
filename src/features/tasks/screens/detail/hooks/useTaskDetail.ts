import {
    useAcceptOffer,
    useGetTaskById,
    useGetTaskOffers,
    useGetTaskQuestions,
    usePostTaskQuestion,
} from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';

interface UseTaskDetailProps {
  taskId: string;
}

export const useTaskDetail = ({ taskId }: UseTaskDetailProps) => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');

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
  } = useGetTaskOffers(taskId || '', !!taskId);

  // Fetch questions for this specific task
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions,
  } = useGetTaskQuestions(taskId || '', !!taskId); // Enabled when we have a taskId

  // Post question mutation
  const postQuestionMutation = usePostTaskQuestion();

  // Accept offer mutation
  const acceptOfferMutation = useAcceptOffer();

  const task = taskData?.data;
  const user = taskData?.user;
  
  // Get offers for THIS specific task (for both MyOfferCard and Offers tab)
  const taskOffers = taskOffersData?.data?.offers || [];
  
  // Questions
  const questions = questionsData?.data || [];

  // Find the current user's offer on THIS task (if they made one)
  const myOffer = taskOffers.find(
    (offer: any) => offer.taskTakerId?._id === currentUser?._id
  );

  const handleMakeOffer = () => {
    router.push(`/make-offer-screen?taskId=${taskId}`);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOfferMutation.mutateAsync({
        taskId: taskId || '',
        offerId,
      });
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;

    try {
      console.log('📝 Submitting question:', questionText);
      await postQuestionMutation.mutateAsync({
        taskId: taskId || '',
        question: questionText,
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
    isLoadingTaskOffers,
    isLoadingQuestions,
    questionsError,
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
  };
};
