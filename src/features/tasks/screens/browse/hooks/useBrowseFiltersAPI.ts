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
 * Client-side search filter for tasks with STRICT TITLE PRIORITIZATION
 * Priority: 
 * 1. Title starts with search text (highest priority)
 * 2. Title contains search text as whole word
 * 3. Title contains search text anywhere
 * 4. Other fields match (lowest priority)
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
  });

  // Multiple priority levels for title matching
  const titleStartsWith: Task[] = [];
  const titleWholeWord: Task[] = [];
  const titleContains: Task[] = [];
  const otherMatches: Task[] = [];

  tasks.forEach((task) => {
    const titleLower = (task.title || '').toLowerCase();
    const titleWords = titleLower.split(/\s+/);
    
    // Check different levels of title matching
    let titleMatchLevel = 0; // 0=no match, 1=contains, 2=whole word, 3=starts with
    
    // Level 3: Title starts with search text (highest priority)
    if (titleLower.startsWith(searchLower)) {
      titleMatchLevel = 3;
      titleStartsWith.push(task);
      console.log(`🥇 TITLE STARTS WITH: "${task.title}" starts with "${searchText}"`);
    }
    // Level 2: Title contains search as whole word
    else if (titleWords.some(word => word === searchLower || searchTerms.every(term => titleWords.some(w => w === term)))) {
      titleMatchLevel = 2;
      titleWholeWord.push(task);
      console.log(`🥈 TITLE WHOLE WORD: "${task.title}" has whole word match for "${searchText}"`);
    }
    // Level 1: Title contains search text anywhere
    else if (searchTerms.every(term => titleLower.includes(term))) {
      titleMatchLevel = 1;
      titleContains.push(task);
      console.log(`🥉 TITLE CONTAINS: "${task.title}" contains "${searchText}"`);
    }

    // Only check other fields if NO title match at all
    if (titleMatchLevel === 0) {
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

      // Build searchable text from other fields (excluding title)
      const searchableFields = [
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

      // Check if all search terms are found in other fields
      const matchesOtherFields = searchTerms.every(term => combinedText.includes(term));
      
      if (matchesOtherFields) {
        otherMatches.push(task);
        console.log(`📋 OTHER FIELD MATCH: "${task.title}" matched in other fields for "${searchText}"`);
      }
    }
  });

  // Combine results in priority order: starts with > whole word > contains > other fields
  const filtered = [...titleStartsWith, ...titleWholeWord, ...titleContains, ...otherMatches];

  console.log('🔍 Search Filter Result:', {
    inputTasks: tasks.length,
    titleStartsWith: titleStartsWith.length,
    titleWholeWord: titleWholeWord.length,
    titleContains: titleContains.length,
    otherMatches: otherMatches.length,
    totalFiltered: filtered.length,
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
    // Use Search API ONLY when there's actual search text (at least 1 character)
    // This ensures we call /tasks/search endpoint only for searches
    const hasSearchText = searchText.trim().length > 0;
    
    console.log('🔍 [useBrowseFiltersAPI] API Selection:', {
      hasSearchText,
      searchText: searchText.trim(),
      willUseFilterAPI: !hasSearchText,
      willUseSearchAPI: hasSearchText
    });
    
    // Use Filter API when there's no search text
    return !hasSearchText;
  }, [searchText]);

  const searchParams: TaskSearchParams = useMemo(() => {
    // Only create search params if we have search text
    if (!searchText.trim()) {
      return {} as TaskSearchParams;
    }

    const params: TaskSearchParams = {
      q: searchText.trim(), // Required parameter for search endpoint
      sort: SEARCH_SORT_MAPPING[selectedSort],
    };

    if (selectedCategory !== 'All Categories') params.category = selectedCategory;
    
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 10000;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];
      params.maxBudget = priceRange[1];
    }

    if (taskType === 'in-person') params.location = 'In-person';
    else if (taskType === 'remote') params.location = 'Online';

    console.log('🔍 [useBrowseFiltersAPI] Search Params:', params);
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
  } = useSearchTasks(
    searchParams, 
    !shouldUseFilterAPI && searchText.trim().length > 0 // Only enable when we have search text
  );

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

  // Apply client-side search filter to results ONLY if using Filter API
  // When using Search API, backend already filtered results
  const filteredAndSortedTasks = useMemo(() => {
    const baseTasks = tasksWithOfferCounts;
    
    // Debug logging for API response data
    console.log('🔍 [useBrowseFiltersAPI] Final Tasks Debug:', {
      baseTasksLength: baseTasks.length,
      shouldUseFilterAPI,
      searchText: searchText.trim(),
      activeAPI: shouldUseFilterAPI ? 'FILTER' : 'SEARCH',
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
    
    // If using Search API, return results as-is (backend already filtered)
    if (!shouldUseFilterAPI) {
      console.log('✅ Using Search API results directly (no client-side filtering)');
      return baseTasks;
    }
    
    // If using Filter API without search text, return all results
    if (shouldUseFilterAPI && !searchText.trim()) {
      console.log('✅ Using Filter API results directly (no search text)');
      return baseTasks;
    }
    
    // This shouldn't happen, but keep as fallback
    console.log('⚠️ Unexpected state - applying client-side filter');
    return filterTasksBySearch(baseTasks, searchText);
  }, [tasksWithOfferCounts, searchText, shouldUseFilterAPI]);
  
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
