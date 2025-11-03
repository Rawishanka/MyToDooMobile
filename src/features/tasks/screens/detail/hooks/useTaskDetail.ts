import {
    useGetTaskById,
    useGetTaskOffers,
    useGetTaskQuestions,
    usePostTaskQuestion,
} from '@/src/shared/hooks/useTaskApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';

interface UseTaskDetailProps {
  taskId: string;
}

export const useTaskDetail = ({ taskId }: UseTaskDetailProps) => {
  const router = useRouter();
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

  // Fetch offers
  const {
    data: offersData,
    isLoading: isLoadingOffers,
  } = useGetTaskOffers(taskId || '', !!taskId);

  // Fetch questions
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
  } = useGetTaskQuestions(taskId || '', !!taskId);

  // Post question mutation
  const postQuestionMutation = usePostTaskQuestion();

  const task = taskData?.data;
  const user = taskData?.user;
  const offers = offersData?.data?.offers || [];
  const questions = questionsData?.data || [];

  const handleMakeOffer = () => {
    router.push(`/make-offer-screen?taskId=${taskId}`);
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
    offers,
    questions,
    isLoading,
    error,
    refetch,
    isLoadingOffers,
    isLoadingQuestions,
    activeTab,
    setActiveTab,
    showAskQuestion,
    setShowAskQuestion,
    questionText,
    setQuestionText,
    handleMakeOffer,
    handleAskQuestion,
    getLocationIcon,
    getTimeDisplay,
    postQuestionMutation,
  };
};
