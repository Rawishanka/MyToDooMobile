import { Task, TaskFilterParams, TaskSearchParams } from '@/src/api/types/tasks';
import { useFilterTasks, useSearchTasks } from '@/src/shared/hooks/useTaskApi';
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
  useFilterAPI: boolean;
}

/**
 * Client-side search filter for tasks
 * Searches across: title, description, location, category, budget, tags
 * Case-insensitive and space-tolerant
 */
const filterTasksBySearch = (tasks: Task[], searchText: string): Task[] => {
  if (!searchText || searchText.trim().length === 0) {
    return tasks;
  }

  const searchLower = searchText.toLowerCase().trim();
  const searchTerms = searchLower.split(/\s+/); // Split by whitespace for multi-word search

  console.log('🔍 Search Filter Debug:', {
    searchText,
    searchTerms,
    totalTasks: tasks.length,
    sampleTask: tasks[0] ? {
      title: tasks[0].title,
      details: tasks[0].details,
      location: tasks[0].location,
      categories: tasks[0].categories,
      budget: tasks[0].budget,
      currency: tasks[0].currency,
    } : null
  });

  const filtered = tasks.filter((task) => {
    // Extract all location fields for searching
    const locationText = task.location ? [
      task.location.address || '',
      // @ts-ignore - Handle additional location fields that might exist
      task.location.city || '',
      // @ts-ignore
      task.location.suburb || '',
      // @ts-ignore
      task.location.state || '',
      // @ts-ignore
      task.location.postcode || '',
      // @ts-ignore
      task.location.country || '',
    ].filter(Boolean).join(' ') : '';

    // Extract categories - handle both string array and object array
    const categoriesText = Array.isArray(task.categories) 
      ? task.categories.map(cat => 
          typeof cat === 'string' ? cat : (cat as any).name || ''
        ).join(' ')
      : '';

    // Build searchable text from all relevant fields
    const searchableFields = [
      task.title || '',
      task.details || '',
      locationText,
      categoriesText,
      task.budget?.toString() || '',
      task.currency || '',
      `${task.budget} ${task.currency}`,
      // @ts-ignore - Handle potential tags field
      ...(Array.isArray(task.tags) ? task.tags : []),
    ];

    const combinedText = searchableFields
      .join(' ')
      .toLowerCase()
      .replace(/\s+/g, ' '); // Normalize whitespace

    // Debug first task
    if (task === tasks[0]) {
      console.log('🔍 First Task Search Debug:', {
        taskTitle: task.title,
        locationText,
        categoriesText,
        searchableFields,
        combinedText: combinedText.substring(0, 300),
        searchTerms,
        matches: searchTerms.map(term => ({
          term,
          found: combinedText.includes(term)
        }))
      });
    }

    // Check if all search terms are found (AND logic)
    const matches = searchTerms.every(term => combinedText.includes(term));
    
    // Debug matches for first few tasks
    if (tasks.indexOf(task) < 3 && matches) {
      console.log(`✅ Task "${task.title}" MATCHED search "${searchText}"`);
    }

    return matches;
  });

  console.log('🔍 Search Filter Result:', {
    inputTasks: tasks.length,
    filteredTasks: filtered.length,
    searchText
  });

  return filtered;
};

const SEARCH_SORT_MAPPING = [
  'latest',
  'price-high', 
  'price-low',
  'earliest',
  'latest',
  'newest',
  'oldest',
  'nearest',
] as const;

const FILTER_SORT_MAPPING = [
  'latest',
  'price-high',
  'price-low', 
  'earliest',
  'latest',
  'newest',
  'oldest',
  'nearest',
] as const;

export const useBrowseFiltersAPI = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    const getLocation = async () => {
      if (selectedSort === 7) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          } else {
            setSelectedSort(0);
          }
        } catch (err) {
          console.error('Location error:', err);
          setSelectedSort(0);
        }
      }
    };
    getLocation();
  }, [selectedSort]);

  const shouldUseFilterAPI = React.useMemo(() => {
    // Always use Filter API to get all tasks, then do comprehensive client-side filtering
    // This allows searching across all fields (title, location, categories, etc.)
    // instead of relying on backend's limited title-only search
    return true;
  }, []);

  const searchParams: TaskSearchParams = useMemo(() => {
    const params: TaskSearchParams = {
      sort: SEARCH_SORT_MAPPING[selectedSort],
    };

    if (searchText.trim()) params.q = searchText.trim();
    if (selectedCategory !== 'All Categories') params.category = selectedCategory;
    
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 10000;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];
      params.maxBudget = priceRange[1];
    }

    if (taskType === 'in-person') params.location = 'In-person';
    else if (taskType === 'remote') params.location = 'Online';

    return params;
  }, [selectedCategory, taskType, priceRange, selectedSort, searchText]);

  const filterParams: TaskFilterParams = useMemo(() => {
    const params: TaskFilterParams = {
      sortBy: FILTER_SORT_MAPPING[selectedSort],
      status: 'open',
    };

    if (selectedCategory !== 'All Categories') params.categories = selectedCategory;
    
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 10000;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];
      params.maxBudget = priceRange[1];
    }

    if (taskType === 'in-person') params.locationType = 'In-person';
    else if (taskType === 'remote') params.locationType = 'Online';

    if (selectedSort === 7 && userLocation) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
      params.radius = 50;
    }

    // DON'T send search text to backend - we do comprehensive client-side filtering
    // Backend search only searches title field, we want to search ALL fields
    // if (searchText.trim()) params.search = searchText.trim();

    return params;
  }, [selectedCategory, taskType, priceRange, selectedSort, userLocation]);

  const {
    data: searchResponse,
    isLoading: searchLoading,
    error: searchError,
    refetch: searchRefetch,
  } = useSearchTasks(searchParams, !shouldUseFilterAPI && Object.keys(searchParams).length > 0);

  const {
    data: filterResponse,
    isLoading: filterLoading,
    error: filterError,
    refetch: filterRefetch,
  } = useFilterTasks(filterParams, shouldUseFilterAPI);

  // Apply client-side search filter to results
  const filteredAndSortedTasks = useMemo(() => {
    const baseTasks = shouldUseFilterAPI 
      ? (filterResponse?.data || [])
      : (searchResponse?.data || []);
    
    // Apply client-side search filter for multi-field search
    return filterTasksBySearch(baseTasks, searchText);
  }, [shouldUseFilterAPI, filterResponse?.data, searchResponse?.data, searchText]);
  
  const isLoading = shouldUseFilterAPI ? filterLoading : searchLoading;
  const error = shouldUseFilterAPI ? filterError : searchError;
  const refetch = shouldUseFilterAPI ? filterRefetch : searchRefetch;
  
  // Total items should reflect filtered results count
  const totalItems = filteredAndSortedTasks.length;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'All Categories') count++;
    if (taskType !== 'all') count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 10000) count++;
    if (availableTasksOnly) count++;
    if (showTasksWithNoOffers) count++;
    return count;
  };

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setTaskType('all');
    setPriceRange([0, 10000]);
    setAvailableTasksOnly(false);
    setShowTasksWithNoOffers(false);
    setSelectedSort(0);
    setSearchText('');
  };

  return {
    selectedCategory,
    taskType,
    priceRange,
    availableTasksOnly,
    showTasksWithNoOffers,
    selectedSort,
    searchText,
    setSelectedCategory,
    setTaskType,
    setPriceRange,
    setAvailableTasksOnly,
    setShowTasksWithNoOffers,
    setSelectedSort,
    setSearchText,
    filteredAndSortedTasks,
    activeFiltersCount: getActiveFiltersCount(),
    resetFilters,
    isLoading,
    error,
    refetch,
    totalItems,
    useSearchAPI: !shouldUseFilterAPI,
    activeAPI: shouldUseFilterAPI ? 'FILTER' : 'SEARCH',
  };
};
