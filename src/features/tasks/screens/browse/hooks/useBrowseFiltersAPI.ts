import { TaskAPI } from '@/src/api/task-api';
import { Task, TaskFilterParams, TaskSearchParams } from '@/src/api/types/tasks';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useFilterTasks, useSearchTasks } from '@/src/shared/hooks/useTaskApi';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
 * Filter tasks by user's country location
 * Tasks will only be shown if they match the user's detected country
 * Also handles remote/online tasks that don't have a specific location
 */
const filterTasksByCountry = (tasks: Task[], userCountry: string): Task[] => {
  if (!userCountry) {
    console.log('🌍 No user country detected, showing all tasks');
    return tasks;
  }

  const userCountryLower = userCountry.toLowerCase().trim();
  
  console.log('🌍 Filtering tasks by country:', {
    userCountry,
    totalTasks: tasks.length,
  });

  const filtered = tasks.filter(task => {
    // Handle tasks with no location or remote tasks
    const locationAddress = task.location?.address?.toLowerCase() || '';
    const isRemoteTask = locationAddress.includes('remote') || locationAddress.includes('online');
    
    // Remote tasks can be seen by anyone
    if (isRemoteTask) {
      return true;
    }

    // Check if task has country in location
    // @ts-ignore - Handle country field that might exist on task.location
    const taskCountry = task.location?.country?.toLowerCase()?.trim() || '';
    
    // If task has explicit country, match it
    if (taskCountry) {
      const matches = taskCountry === userCountryLower || 
                     taskCountry.includes(userCountryLower) ||
                     userCountryLower.includes(taskCountry);
      return matches;
    }

    // Check address string for country name
    if (locationAddress) {
      // Check if address contains the country name
      const addressMatchesCountry = locationAddress.includes(userCountryLower);
      
      // Also check for common country-specific terms
      const countryKeywords: Record<string, string[]> = {
        'sri lanka': ['sri lanka', 'colombo', 'kandy', 'galle', 'negombo', 'jaffna', 'lk'],
        'australia': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'au', 'nsw', 'vic', 'qld'],
        'new zealand': ['new zealand', 'auckland', 'wellington', 'christchurch', 'nz'],
        'united states': ['usa', 'united states', 'america', 'new york', 'california', 'texas', 'us'],
        'united kingdom': ['uk', 'united kingdom', 'britain', 'england', 'london', 'manchester', 'gb'],
        'india': ['india', 'mumbai', 'delhi', 'bangalore', 'chennai', 'in'],
        'singapore': ['singapore', 'sg'],
        'malaysia': ['malaysia', 'kuala lumpur', 'my'],
      };

      // Get keywords for user's country
      const keywords = countryKeywords[userCountryLower] || [userCountryLower];
      const hasCountryKeyword = keywords.some(keyword => locationAddress.includes(keyword));
      
      if (addressMatchesCountry || hasCountryKeyword) {
        return true;
      }
    }

    // If no location info, exclude the task (could be incomplete data)
    // Or include it - depends on your business logic
    // For now, exclude tasks with no clear location
    return false;
  });

  console.log('🌍 Country filter result:', {
    userCountry,
    inputTasks: tasks.length,
    filteredTasks: filtered.length,
    removed: tasks.length - filtered.length,
  });

  return filtered;
};

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
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tasksWithOfferCounts, setTasksWithOfferCounts] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get user's country from geo-location for filtering tasks
  const { countryInfo, isDetecting: isDetectingCountry } = useLocationCountry();

  // Log country detection status
  useEffect(() => {
    console.log('🌍 [useBrowseFiltersAPI] User country detected:', {
      countryName: countryInfo.countryName,
      countryCode: countryInfo.countryCode,
      isDetecting: isDetectingCountry,
    });
  }, [countryInfo, isDetectingCountry]);

  // Debounce search text for API calls (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      console.log('🔍 [useBrowseFiltersAPI] Debounced search text updated:', searchText.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Control isSearching state based on debounce completion
  useEffect(() => {
    // User is typing if search text doesn't match debounced text
    const isTyping = searchText.trim() !== debouncedSearchText.trim();
    
    if (isTyping) {
      setIsSearching(true);
      console.log('⏳ User typing - isSearching = true');
    } else {
      setIsSearching(false);
      console.log('✅ Debounce complete - isSearching = false');
    }
  }, [searchText, debouncedSearchText]);

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
    const hasSearchText = debouncedSearchText.trim().length > 0;
    
    console.log('🔍 [useBrowseFiltersAPI] API Selection:', {
      hasSearchText,
      debouncedSearchText: debouncedSearchText.trim(),
      willUseFilterAPI: !hasSearchText,
      willUseSearchAPI: hasSearchText
    });
    
    // Use Filter API when there's no search text
    return !hasSearchText;
  }, [debouncedSearchText]);

  const searchParams: TaskSearchParams = useMemo(() => {
    // Only create search params if we have debounced search text
    if (!debouncedSearchText.trim()) {
      return {} as TaskSearchParams;
    }

    const params: TaskSearchParams = {
      q: debouncedSearchText.trim(), // Required parameter for search endpoint
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
  }, [selectedCategory, taskType, priceRange, selectedSort, debouncedSearchText]);

  const filterParams: TaskFilterParams = useMemo(() => {
    const params: TaskFilterParams = {
      sortBy: FILTER_SORT_MAPPING[selectedSort],
      status: 'open',
      page: currentPage,
      limit: 20,
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
  }, [selectedCategory, taskType, priceRange, selectedSort, userLocation, currentPage]);

  const {
    data: searchResponse,
    isLoading: searchLoading,
    error: searchError,
    refetch: searchRefetch,
  } = useSearchTasks(
    searchParams, 
    !shouldUseFilterAPI && debouncedSearchText.trim().length > 0 // Only enable when we have debounced search text
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

      // Handle pagination info
      if (shouldUseFilterAPI && filterResponse?.pagination) {
        const { hasNextPage, currentPage: apiPage } = filterResponse.pagination;
        setHasMore(hasNextPage);
        console.log('📄 Pagination info:', { currentPage: apiPage, hasNextPage });
      }

      // Always set processing when data changes
      setIsProcessingData(true);

      if (baseTasks.length === 0) {
        // Only clear if it's page 1, otherwise keep existing tasks
        if (currentPage === 1) {
          setTasksWithOfferCounts([]);
        }
        setIsLoadingMore(false);
        // Don't set isProcessingData false here - let it be controlled by API loading states
        // This prevents flash of empty state while API is still loading
        return;
      }

      // Check if tasks already have offer count data
      const tasksNeedingOfferCounts = baseTasks.filter(task => 
        task.offerCount === undefined && 
        (!task.offers || task.offers.length === 0)
      );

      if (tasksNeedingOfferCounts.length === 0) {
        console.log('✅ [useBrowseFiltersAPI] All tasks already have offer data');
        setTasksWithOfferCounts(baseTasks);
        setIsProcessingData(false);
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
          tasksWithOffers: enhancedTasks.filter(t => (t.offerCount || 0) > 0).length,
          currentPage,
          isAppending: currentPage > 1
        });

        // Append tasks if loading more pages, otherwise replace
        if (currentPage > 1) {
          setTasksWithOfferCounts(prev => {
            const newTaskIds = new Set(enhancedTasks.map(t => t._id));
            const uniquePrevTasks = prev.filter(t => !newTaskIds.has(t._id));
            return [...uniquePrevTasks, ...enhancedTasks];
          });
        } else {
          setTasksWithOfferCounts(enhancedTasks);
        }
        setIsProcessingData(false);
        setIsLoadingMore(false);
      } catch (error) {
        console.error('❌ [useBrowseFiltersAPI] Failed to enhance tasks with offer counts:', error);
        if (currentPage === 1) {
          setTasksWithOfferCounts(baseTasks);
        }
        setIsProcessingData(false);
        setIsLoadingMore(false);
      }
    };

    enhanceTasksWithOfferCounts();
  }, [shouldUseFilterAPI, filterResponse?.data, searchResponse?.data, currentPage]);

  // Reset isProcessingData when API loading completes
  useEffect(() => {
    const apiLoading = shouldUseFilterAPI ? filterLoading : searchLoading;
    const apiHasData = shouldUseFilterAPI ? !!filterResponse : !!searchResponse;
    
    // Only set false when API is not loading AND we have received a response
    if (!apiLoading && apiHasData) {
      console.log('✅ API complete and data received, setting isProcessingData = false');
      setIsProcessingData(false);
    }
  }, [shouldUseFilterAPI, filterLoading, searchLoading, filterResponse, searchResponse]);

  // Apply client-side search filter to results with TITLE PRIORITIZATION
  // During debounce period OR when using Search API, apply client-side filtering
  const filteredAndSortedTasks = useMemo(() => {
    let baseTasks = tasksWithOfferCounts;
    
    // Debug logging for API response data
    console.log('🔍 [useBrowseFiltersAPI] Final Tasks Debug:', {
      baseTasksLength: baseTasks.length,
      shouldUseFilterAPI,
      searchText: searchText.trim(),
      debouncedSearchText: debouncedSearchText.trim(),
      isSearching,
      activeAPI: shouldUseFilterAPI ? 'FILTER' : 'SEARCH',
      userCountry: countryInfo.countryName,
      sampleTask: baseTasks[0] ? {
        id: baseTasks[0]._id,
        title: baseTasks[0].title,
        offerCount: baseTasks[0].offerCount,
        offersLength: baseTasks[0].offers?.length,
        offersExists: !!baseTasks[0].offers,
        status: baseTasks[0].status,
        // @ts-ignore
        locationCountry: baseTasks[0].location?.country || 'N/A',
        locationAddress: baseTasks[0].location?.address || 'N/A',
      } : null,
      tasksWithOffers: baseTasks.filter(t => (t.offerCount || 0) > 0).length
    });

    // FIRST: Apply country-based filtering (filter tasks by user's location)
    // This ensures users only see tasks from their country
    if (countryInfo.countryName && !isDetectingCountry) {
      baseTasks = filterTasksByCountry(baseTasks, countryInfo.countryName);
      console.log('🌍 After country filter:', baseTasks.length, 'tasks for', countryInfo.countryName);
    }
    
    // CRITICAL: If user is typing (searchText exists but debounced hasn't caught up),
    // apply client-side filtering immediately with the current searchText
    if (searchText.trim() && searchText.trim() !== debouncedSearchText.trim()) {
      console.log('⚡ User is typing - applying immediate client-side filter with searchText:', searchText.trim());
      return filterTasksBySearch(baseTasks, searchText);
    }
    
    // If using Search API with debounced text, still apply client-side filtering for TITLE PRIORITIZATION
    if (!shouldUseFilterAPI && debouncedSearchText.trim()) {
      console.log('🎯 Search API results - applying title prioritization filter');
      return filterTasksBySearch(baseTasks, debouncedSearchText);
    }
    
    // If using Filter API without search text, return all results
    if (shouldUseFilterAPI && !searchText.trim()) {
      console.log('✅ Using Filter API results directly (no search text)');
      return baseTasks;
    }
    
    // Fallback: apply client-side filter
    console.log('⚠️ Fallback - applying client-side filter');
    return filterTasksBySearch(baseTasks, searchText || debouncedSearchText);
  }, [tasksWithOfferCounts, searchText, debouncedSearchText, shouldUseFilterAPI, isSearching, countryInfo.countryName, isDetectingCountry]);
  
  // Calculate loading state properly:
  // - Show loading during typing (debounce period)
  // - Show loading when the active API is actually loading
  // - Don't show loading from disabled queries
  const activeApiLoading = React.useMemo(() => {
    if (shouldUseFilterAPI) {
      // Using Filter API
      console.log('📊 Loading state - Filter API:', { filterLoading });
      return filterLoading;
    } else {
      // Using Search API - only show loading if search query is enabled
      const searchEnabled = debouncedSearchText.trim().length > 0;
      const loading = searchEnabled && searchLoading;
      console.log('📊 Loading state - Search API:', { searchEnabled, searchLoading, loading });
      return loading;
    }
  }, [shouldUseFilterAPI, filterLoading, searchLoading, debouncedSearchText]);
  
  const isLoading = isSearching || activeApiLoading || isProcessingData || isDetectingCountry;
  
  console.log('🎯 Final loading state:', { 
    isSearching, 
    activeApiLoading,
    isProcessingData,
    isDetectingCountry,
    isLoading,
    searchText: searchText.trim(),
    debouncedSearchText: debouncedSearchText.trim(),
    userCountry: countryInfo.countryName,
  });
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
    setCurrentPage(1);
    setTasksWithOfferCounts([]);
    setHasMore(true);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setTasksWithOfferCounts([]);
    setHasMore(true);
  }, [selectedCategory, taskType, priceRange, selectedSort, debouncedSearchText]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      console.log('📄 Loading more tasks, page:', currentPage + 1);
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage]);

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
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    totalItems,
    useSearchAPI: !shouldUseFilterAPI,
    activeAPI: shouldUseFilterAPI ? 'FILTER' : 'SEARCH',
    // User's detected country for location-based filtering
    userCountry: countryInfo.countryName,
    userCountryCode: countryInfo.countryCode,
    isDetectingCountry,
  };
};
