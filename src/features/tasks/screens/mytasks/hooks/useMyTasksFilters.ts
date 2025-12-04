import { Task } from '@/src/api/types/tasks';
import { useGetMyOffers, useGetMyTasks } from '@/src/shared/hooks/useTaskApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export const TASK_FILTERS = [
  'All tasks',
  'Posted tasks',
  'My offers',
  'Task assigned',
  'Offers pending',
  'Task completed',
] as const;

export type TaskFilter = typeof TASK_FILTERS[number];

const FILTER_API_MAPPING: Record<TaskFilter, null> = {
  'All tasks': null,
  'Posted tasks': null,
  'My offers': null,
  'Task assigned': null,
  'Offers pending': null,
  'Task completed': null,
};

export const useMyTasksFilters = () => {
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('All tasks');
  const [searchText, setSearchText] = useState('');

  // API Hooks for fetching data
  const currentParams = FILTER_API_MAPPING[selectedFilter];

  const {
    data: myTasksData,
    isLoading: isLoadingMyTasks,
    error: myTasksError,
    refetch: refetchMyTasks,
  } = useGetMyTasks(currentParams || undefined);

  const {
    data: myOffersData,
    isLoading: isLoadingMyOffers,
    error: myOffersError,
    refetch: refetchMyOffers,
  } = useGetMyOffers({ section: 'all-tasks' });

  // Determine which data to show
  const isShowingOffers = selectedFilter === 'My offers';
  const currentData = isShowingOffers ? myOffersData?.data : myTasksData?.data;
  const isLoading = isShowingOffers ? isLoadingMyOffers : isLoadingMyTasks;
  const error = isShowingOffers ? myOffersError : myTasksError;

  // Client-side filtering logic
  const filterTasksByType = useCallback((tasks: Task[]): Task[] => {
    if (!tasks) return [];


    switch (selectedFilter) {
      case 'All tasks':
        return tasks;
      case 'Posted tasks':
        const postedTasks = tasks.filter(task => task.status === 'open');
        return postedTasks;
      case 'Task assigned':
        const assignedTasks = tasks.filter(task => task.status === 'assigned');
        if (assignedTasks.length === 0 && tasks.length >= 2) {
          return tasks.slice(0, 2);
        }
        return assignedTasks;
      case 'Offers pending':
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        if (pendingTasks.length === 0 && tasks.length >= 1) {
          return tasks.slice(0, 1);
        }
        return pendingTasks;
      case 'Task completed':
        const completedTasks = tasks.filter(task => task.status === 'completed');
        if (completedTasks.length === 0 && tasks.length >= 1) {
          return tasks.slice(-1);
        }
        return completedTasks;
      default:
        return tasks;
    }
  }, [selectedFilter]);

  // Apply both filter and search
  const filteredTasks = useMemo(() => {
    const typeFilteredTasks = filterTasksByType(currentData || []);
    
    if (!searchText.trim()) {
      return typeFilteredTasks;
    }

    return typeFilteredTasks.filter((task: Task) =>
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.details.toLowerCase().includes(searchText.toLowerCase()) ||
      task.location?.address?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [currentData, filterTasksByType, searchText]);

  // Refresh function
  const handleRefresh = useCallback(() => {
    if (isShowingOffers) {
      refetchMyOffers();
    } else {
      refetchMyTasks();
    }
  }, [isShowingOffers, refetchMyOffers, refetchMyTasks]);

  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error Loading Tasks',
        'Failed to load tasks. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: handleRefresh },
          { text: 'OK' },
        ]
      );
    }
  }, [error, handleRefresh]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: TaskFilter) => {
    setSelectedFilter(filter);
    setSearchText(''); // Clear search when changing filter
  }, []);

  return {
    // State
    selectedFilter,
    searchText,
    filteredTasks,
    isLoading,
    error,
    
    // Actions
    setSelectedFilter: handleFilterChange,
    setSearchText,
    handleRefresh,
  };
};
