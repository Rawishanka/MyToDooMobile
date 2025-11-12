import { TaskSearchParams } from '@/src/api/types/tasks';
import { useSearchTasks } from '@/src/shared/hooks/useTaskApi';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';

export interface FilterState {
  selectedCategory: string;
  taskType: 'all' | 'in-person' | 'remote';
  priceRange: [number, number];
  availableTasksOnly: boolean;
  showTasksWithNoOffers: boolean;
  selectedSort: number;
  searchText: string;
}

// Map frontend sort options to API values for /tasks/search
const SEARCH_SORT_MAPPING = [
  'latest', // 0: Recommended -> Latest (default)
  'price-high', // 1: Price: High to low
  'price-low', // 2: Price: Low to High
  'earliest', // 3: Due date: Earliest
  'latest', // 4: Due date: Latest
  'newest', // 5: Newest tasks
  'oldest', // 6: Oldest tasks
  'nearest', // 7: Closest to me
] as const;

export const useBrowseFiltersAPI = () => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location for proximity sorting
  React.useEffect(() => {
    const getLocation = async () => {
      if (selectedSort === 7) { // "Closest to me" selected
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          } else {
            console.warn('Location permission denied - falling back to Latest sort');
            setSelectedSort(0); // Fall back to "Recommended" (Latest)
          }
        } catch (error) {
          console.error('Error getting location:', error);
          console.warn('Location error - falling back to Latest sort');
          setSelectedSort(0); // Fall back to "Recommended" (Latest)
        }
      }
    };

    getLocation();
  }, [selectedSort]);

  // Determine which API to use based on search text
  const useSearchAPI = true; // Always use search API now

  // Build Search API parameters (for /tasks/search)
  const searchParams: TaskSearchParams = useMemo(() => {
    const params: TaskSearchParams = {
      sort: SEARCH_SORT_MAPPING[selectedSort],
    };

    // Search query - using 'q' parameter as per API spec
    if (searchText.trim()) {
      params.q = searchText.trim();
    }

    // Category filter - using 'category' parameter as per API spec
    if (selectedCategory !== 'All Categories') {
      params.category = selectedCategory;
    }

    // Price range filter - only if user has adjusted it from default
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 10000;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];  // Using 'minBudget' as per API spec
      params.maxBudget = priceRange[1];  // Using 'maxBudget' as per API spec
    }

    // Location filter (if task type is specified)
    if (taskType === 'in-person') {
      params.location = 'In-person';
    } else if (taskType === 'remote') {
      params.location = 'Online';
    }

    return params;
  }, [
    selectedCategory,
    taskType,
    priceRange,
    selectedSort,
    searchText,
  ]);

  // Use the search API only
  const {
    data: searchResponse,
    isLoading: searchLoading,
    error: searchError,
    refetch: searchRefetch,
  } = useSearchTasks(searchParams, true);

  // Get results from search API
  const filteredAndSortedTasks = searchResponse?.data || [];
  const isLoading = searchLoading;
  const error = searchError;
  const refetch = searchRefetch;

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
    setSelectedSort(0);
    setSearchText('');
  };

  console.log('🔍 Search API Strategy:', {
    useSearchAPI,
    hasSearchText: searchText.trim().length > 0,
    activeAPI: 'SEARCH',
    resultsCount: filteredAndSortedTasks.length,
    selectedSort,
    searchSortBy: SEARCH_SORT_MAPPING[selectedSort],
    isLoading,
    searchParams,
  });

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
    // API state
    isLoading,
    error,
    refetch,
    // Additional info  
    totalItems: filteredAndSortedTasks.length,
    // Debug info
    useSearchAPI,
    activeAPI: 'SEARCH',
  };
};