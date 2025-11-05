import {
  useAcceptOffer,
  useGetAllOffers,
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

  // Fetch offers for THIS task using /api/tasks/:id/offers (for MyOfferCard)
  const {
    data: taskOffersData,
    isLoading: isLoadingTaskOffers,
    error: taskOffersError,
  } = useGetTaskOffers(taskId || '', !!taskId);

  // Fetch ALL offers using /api/offers/all (for Offers tab - shows all offers from all tasks)
  const {
    data: allOffersData,
    isLoading: isLoadingAllOffers,
  } = useGetAllOffers(
    { 
      limit: 100, 
      sortBy: 'createdAt', 
      order: 'desc' 
    }, 
    true // Always enabled
  );

  // Fetch questions (make it optional to avoid blocking)
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
  } = useGetTaskQuestions(taskId || '', false); // Disabled to avoid network error

  // Post question mutation
  const postQuestionMutation = usePostTaskQuestion();

  // Accept offer mutation
  const acceptOfferMutation = useAcceptOffer();

  const task = taskData?.data;
  const user = taskData?.user;
  
  // Get offers for THIS specific task (for MyOfferCard)
  const taskOffers = taskOffersData?.data?.offers || [];
  
  // Get ALL offers from ALL tasks (for Offers tab)
  const allOffers = allOffersData?.data || [];
  
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
      await postQuestionMutation.mutateAsync({
        taskId: taskId || '',
        question: questionText,
      });
      setQuestionText('');
      setShowAskQuestion(false);
    } catch (error) {
      console.error('Failed to post question:', error);
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
    taskOffers, // Offers for this specific task
    allOffers,  // All offers from all tasks
    myOffer,
    questions,
    isLoading,
    error,
    refetch,
    isLoadingTaskOffers,
    isLoadingAllOffers,
    isLoadingQuestions,
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
