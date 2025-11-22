import { TaskAPI } from '@/src/api/task-api';
import { Task, TaskFilterParams, TaskSearchParams } from '@/src/api/types/tasks';
import { useFilterTasks, useSearchTasks } from '@/src/shared/hooks/useTaskApi';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';

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
  const [tasksWithOfferCounts, setTasksWithOfferCounts] = useState<Task[]>([]);

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

  // Enhance tasks with offer counts if missing
  useEffect(() => {
    const enhanceTasksWithOfferCounts = async () => {
      const baseTasks = shouldUseFilterAPI 
        ? (filterResponse?.data || [])
        : (searchResponse?.data || []);

      if (baseTasks.length === 0) {
        setTasksWithOfferCounts([]);
        return;
      }

      // Check if tasks already have offer count data
      const tasksNeedingOfferCounts = baseTasks.filter(task => 
        task.offerCount === undefined && 
        (!task.offers || task.offers.length === 0)
      );

      if (tasksNeedingOfferCounts.length === 0) {
        console.log('🔍 [useBrowseFiltersAPI] All tasks already have offer data');
        setTasksWithOfferCounts(baseTasks);
        return;
      }

      console.log('🔍 [useBrowseFiltersAPI] Fetching offer counts for tasks missing data:', {
        totalTasks: baseTasks.length,
        tasksNeedingOfferCounts: tasksNeedingOfferCounts.length
      });

      try {
        // Fetch offer counts for tasks in parallel (limit to first 20 to avoid API overload)
        const tasksToFetch = tasksNeedingOfferCounts.slice(0, 20);
        const offerCountPromises = tasksToFetch.map(async (task) => {
          try {
            const offersResponse = await TaskAPI.getTaskOffers(task._id);
            const offerCount = offersResponse.data?.offers?.length || 0;
            return { taskId: task._id, offerCount, offers: offersResponse.data?.offers || [] };
          } catch (error) {
            console.warn(`Failed to fetch offers for task ${task._id}:`, error);
            return { taskId: task._id, offerCount: 0, offers: [] };
          }
        });

        const offerCounts = await Promise.all(offerCountPromises);
        const offerCountMap = Object.fromEntries(
          offerCounts.map(({ taskId, offerCount, offers }) => [taskId, { offerCount, offers }])
        );

        // Enhance tasks with offer counts
        const enhancedTasks = baseTasks.map(task => {
          if (offerCountMap[task._id]) {
            return {
              ...task,
              offerCount: offerCountMap[task._id].offerCount,
              offers: offerCountMap[task._id].offers
            };
          }
          return task;
        });

        console.log('✅ [useBrowseFiltersAPI] Enhanced tasks with offer counts:', {
          totalTasks: enhancedTasks.length,
          tasksWithOffers: enhancedTasks.filter(t => (t.offerCount || 0) > 0).length
        });

        setTasksWithOfferCounts(enhancedTasks);
      } catch (error) {
        console.error('❌ [useBrowseFiltersAPI] Failed to enhance tasks with offer counts:', error);
        setTasksWithOfferCounts(baseTasks);
      }
    };

    enhanceTasksWithOfferCounts();
  }, [shouldUseFilterAPI, filterResponse?.data, searchResponse?.data]);

  // Apply client-side search filter to results
  const filteredAndSortedTasks = useMemo(() => {
    const baseTasks = tasksWithOfferCounts;
    
    // Debug logging for API response data
    console.log('🔍 [useBrowseFiltersAPI] Final Tasks Debug:', {
      baseTasksLength: baseTasks.length,
      sampleTask: baseTasks[0] ? {
        id: baseTasks[0]._id,
        title: baseTasks[0].title,
        offerCount: baseTasks[0].offerCount,
        offersLength: baseTasks[0].offers?.length,
        offersExists: !!baseTasks[0].offers,
        status: baseTasks[0].status
      } : null,
      tasksWithOffers: baseTasks.filter(t => (t.offerCount || 0) > 0).length
    });
    
    // Apply client-side search filter for multi-field search
    return filterTasksBySearch(baseTasks, searchText);
  }, [tasksWithOfferCounts, searchText]);
  
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
