import { Task } from '@/src/api/types/tasks';
import { useMemo, useState } from 'react';

export interface FilterState {
  selectedCategory: string;
  taskType: 'all' | 'in-person' | 'remote';
  priceRange: [number, number];
  availableTasksOnly: boolean;
  showTasksWithNoOffers: boolean;
  selectedSort: number;
  searchText: string;
}

export const useBrowseFilters = (allTasks: Task[]) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchText, setSearchText] = useState('');

  // Compute active filter count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'All Categories') count++;
    if (taskType !== 'all') count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 10000) count++;
    if (availableTasksOnly) count++;
    if (showTasksWithNoOffers) count++;
    return count;
  };

  // Reset all filters to defaults
  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setTaskType('all');
    setPriceRange([0, 10000]);
    setAvailableTasksOnly(false);
    setShowTasksWithNoOffers(false);
  };

  // Filter and sort tasks based on current filter state
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = allTasks;

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.location.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(task => 
        task.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Apply task type filter
    if (taskType === 'remote') {
      filtered = filtered.filter(task => 
        task.location.address.toLowerCase().includes('remote') ||
        task.details.toLowerCase().includes('remote')
      );
    } else if (taskType === 'in-person') {
      filtered = filtered.filter(task => 
        !task.location.address.toLowerCase().includes('remote') &&
        !task.details.toLowerCase().includes('remote')
      );
    }

    // Apply price range filter - only if user has adjusted it from default
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 10000;
    if (!isDefaultPriceRange) {
      filtered = filtered.filter(task => 
        task.budget >= priceRange[0] && task.budget <= priceRange[1]
      );
    }

    // Apply available tasks only filter
    if (availableTasksOnly) {
      filtered = filtered.filter(task => task.status === 'open');
    }

    // Apply show tasks with no offers filter
    if (showTasksWithNoOffers) {
      filtered = filtered.filter(task => (task.offerCount || 0) === 0);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 1: // Price: High to low
          return b.budget - a.budget;
        case 2: // Price: Low to High
          return a.budget - b.budget;
        case 3: // Due date: Earliest
          return new Date(a.dateRange?.end || a.createdAt).getTime() - 
                 new Date(b.dateRange?.end || b.createdAt).getTime();
        case 4: // Due date: Latest
          return new Date(b.dateRange?.end || b.createdAt).getTime() - 
                 new Date(a.dateRange?.end || a.createdAt).getTime();
        case 5: // Newest tasks
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 6: // Oldest tasks
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // Recommended
          return 0;
      }
    });

    return sorted;
  }, [allTasks, searchText, selectedCategory, taskType, priceRange, availableTasksOnly, showTasksWithNoOffers, selectedSort]);

  return {
    // State
    selectedCategory,
    taskType,
    priceRange,
    availableTasksOnly,
    showTasksWithNoOffers,
    selectedSort,
    searchText,
    // Setters
    setSelectedCategory,
    setTaskType,
    setPriceRange,
    setAvailableTasksOnly,
    setShowTasksWithNoOffers,
    setSelectedSort,
    setSearchText,
    // Computed
    filteredAndSortedTasks,
    activeFiltersCount: getActiveFiltersCount(),
    // Actions
    resetFilters,
  };
};
