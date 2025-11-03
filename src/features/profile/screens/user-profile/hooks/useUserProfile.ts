import { Task } from '@/src/api/types/tasks';
import { useGetUserTasks } from '@/src/shared/hooks/useTaskApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  joinedDate: string;
  lastActive: string;
  completedTasks: number;
  activeOffers: number;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  skills?: string[];
  bio?: string;
}

interface UserTasksData {
  user: UserProfile;
  tasks: {
    created: Task[];
    completed: Task[];
    inProgress: Task[];
  };
  stats: {
    totalTasksCreated: number;
    totalTasksCompleted: number;
    averageRating: number;
    totalEarnings: number;
    responseTime: string;
  };
}

export const useUserProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const [activeTab, setActiveTab] = useState<'created' | 'completed' | 'progress'>('created');

  const {
    data: userTasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserTasks(userId || '');

  const userData: UserTasksData | null = userTasksData?.data
    ? {
        user: {
          _id: userId || '',
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com',
          rating: 4.5,
          totalReviews: 10,
          verified: true,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          completedTasks: 0,
          activeOffers: 0,
        },
        tasks: {
          created: Array.isArray(userTasksData.data) ? userTasksData.data : [],
          completed: [],
          inProgress: [],
        },
        stats: {
          totalTasksCreated: 0,
          totalTasksCompleted: 0,
          averageRating: 4.5,
          totalEarnings: 0,
          responseTime: '2 hours',
        },
      }
    : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTasksByTab = () => {
    if (!userData) return [];
    
    switch (activeTab) {
      case 'created':
        return userData.tasks.created;
      case 'completed':
        return userData.tasks.completed;
      case 'progress':
        return userData.tasks.inProgress;
      default:
        return [];
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: '/task-detail',
      params: { taskId },
    });
  };

  return {
    userData,
    isLoading,
    isError,
    error,
    refetch,
    activeTab,
    setActiveTab,
    formatDate,
    getTasksByTab,
    handleTaskPress,
  };
};
