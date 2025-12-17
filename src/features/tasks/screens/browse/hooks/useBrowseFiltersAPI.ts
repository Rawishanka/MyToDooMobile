import { TaskAPI } from '@/src/api/task-api';
import { Task, TaskFilterParams, TaskSearchParams } from '@/src/api/types/tasks';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { useFilterTasks, useSearchTasks } from '@/src/shared/hooks/useTaskApi';
import { getMaxPriceForCurrency } from '@/src/shared/utils/currency';
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
    const locationAddress = task.location?.address?.toLowerCase() || '';
    
    // 1. ✅ PRIORITY: If task has coordinates, ALWAYS include it
    // The backend handles geospatial filtering, we trust database coordinates
    const taskCoords = task.location?.coordinates as any;
    const hasCoordinates = taskCoords && (
      // GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
      (Array.isArray(taskCoords.coordinates) && taskCoords.coordinates.length === 2) ||
      // Direct coordinates format: { lat: number, lng: number }
      (typeof taskCoords.lat === 'number' && typeof taskCoords.lng === 'number') ||
      // Alternative format: { latitude: number, longitude: number }
      (typeof taskCoords.latitude === 'number' && typeof taskCoords.longitude === 'number')
    );
    
    if (hasCoordinates) {
      console.log(`✅ Has coordinates: "${task.title}" (address: ${locationAddress}) - INCLUDED`);
      return true;
    }
    
    // 2. ✅ Remote/Online tasks can be seen by anyone
    const isRemoteTask = locationAddress.includes('remote') || locationAddress.includes('online');
    if (isRemoteTask) {
      console.log(`✅ Remote task: "${task.title}"`);
      return true;
    }

    // 3. ✅ Check if task has explicit country field matching user's country
    // @ts-ignore - Handle country field that might exist on task.location
    const taskCountry = task.location?.country?.toLowerCase()?.trim() || '';
    if (taskCountry) {
      const matches = taskCountry === userCountryLower || 
                     taskCountry.includes(userCountryLower) ||
                     userCountryLower.includes(taskCountry);
      if (matches) {
        console.log(`✅ Country match: "${task.title}" (country: ${taskCountry})`);
        return true;
      } else {
        console.log(`❌ Country mismatch: "${task.title}" (country: ${taskCountry} vs user: ${userCountryLower})`);
        return false;
      }
    }

    // 4. ✅ ENHANCED: Check address for country name OR major cities/states
    if (locationAddress) {
      // Define country patterns with cities, states, and country names
      const countryLocationMap: Record<string, {
        patterns: string[];
        states?: string[];
        cities?: string[];
        regions?: string[];
      }> = {
        'australia': {
          patterns: ['australia', 'australian'],
          states: ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt', 'new south wales', 'victoria', 'queensland', 'western australia', 'south australia', 'tasmania', 'northern territory'],
          cities: ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'gold coast', 'canberra', 'newcastle', 'wollongong', 'hobart', 'geelong', 'townsville', 'cairns', 'toowoomba', 'darwin', 'ballarat', 'bendigo', 'albury', 'launceston', 'mackay', 'rockhampton', 'bunbury', 'bundaberg', 'wagga wagga', 'hervey bay', 'mildura', 'shepparton', 'port macquarie', 'gladstone', 'tamworth']
        },
        'new zealand': {
          patterns: ['new zealand', 'zealand'],
          regions: ['auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga', 'napier', 'dunedin', 'palmerston north', 'nelson', 'rotorua', 'whangarei', 'invercargill', 'whanganui', 'gisborne', 'queenstown']
        },
        'sri lanka': {
          patterns: ['sri lanka', 'lanka'],
          cities: ['colombo', 'kandy', 'galle', 'jaffna', 'negombo', 'anuradhapura', 'trincomalee', 'batticaloa', 'matara', 'kurunegala', 'gampaha', 'kalutara', 'ratnapura']
        }
      };
      
      const userLocationData = countryLocationMap[userCountryLower];
      if (userLocationData) {
        // Check country name/patterns
        const hasCountryName = userLocationData.patterns.some((pattern: string) => 
          locationAddress.includes(pattern.toLowerCase())
        );
        if (hasCountryName) {
          console.log(`✅ Address contains country name: "${task.title}" (address: ${locationAddress})`);
          return true;
        }
        
        // Check states (for Australia)
        if (userLocationData.states) {
          const hasState = userLocationData.states.some((state: string) => 
            locationAddress.includes(` ${state.toLowerCase()} `) || 
            locationAddress.includes(` ${state.toLowerCase()},`) ||
            locationAddress.endsWith(` ${state.toLowerCase()}`)
          );
          if (hasState) {
            console.log(`✅ Address contains state/region: "${task.title}" (address: ${locationAddress})`);
            return true;
          }
        }
        
        // Check cities
        if (userLocationData.cities) {
          const hasCity = userLocationData.cities.some((city: string) => 
            locationAddress.includes(city.toLowerCase())
          );
          if (hasCity) {
            console.log(`✅ Address contains city: "${task.title}" (address: ${locationAddress})`);
            return true;
          }
        }
        
        // Check regions (for New Zealand)
        if (userLocationData.regions) {
          const hasRegion = userLocationData.regions.some((region: string) => 
            locationAddress.includes(region.toLowerCase())
          );
          if (hasRegion) {
            console.log(`✅ Address contains region: "${task.title}" (address: ${locationAddress})`);
            return true;
          }
        }
      } else {
        // Fallback for other countries - just check country name
        if (locationAddress.includes(userCountryLower)) {
          console.log(`✅ Address contains country: "${task.title}" (address: ${locationAddress})`);
          return true;
        }
      }
    }

    // 5. ✅ Include tasks with no location data (they might be newly posted)
    if (!locationAddress && !taskCountry) {
      console.log(`⚠️ No location data: "${task.title}" - INCLUDED`);
      return true;
    }

    // If we get here, task doesn't match user's country
    console.log(`❌ No match: "${task.title}" (address: ${locationAddress}, user country: ${userCountryLower})`);
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
    console.log('🔍 No search text provided, returning all tasks:', tasks.length);
    return tasks;
  }

  const searchLower = searchText.toLowerCase().trim();
  const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0); // Split by whitespace, remove empty

  console.log('🔍 Search Filter Debug:', {
    originalSearch: searchText,
    searchLower,
    searchTerms,
    totalTasks: tasks.length,
  });

  // Multiple priority levels for matching
  const titleExactMatch: Task[] = [];
  const titleStartsWith: Task[] = [];
  const titleWordMatch: Task[] = [];
  const titleContains: Task[] = [];
  const locationMatches: Task[] = [];
  const otherMatches: Task[] = [];

  tasks.forEach((task) => {
    const titleLower = (task.title || '').toLowerCase().trim();
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 0);
    
    let matched = false;
    
    // PRIORITY 1: Exact title match (ignoring case)
    if (titleLower === searchLower) {
      titleExactMatch.push(task);
      console.log(`🏆 EXACT MATCH: "${task.title}" === "${searchText}"`);
      matched = true;
    }
    // PRIORITY 2: Title starts with search text
    else if (titleLower.startsWith(searchLower)) {
      titleStartsWith.push(task);
      console.log(`🥇 STARTS WITH: "${task.title}" starts with "${searchText}"`);
      matched = true;
    }
    // PRIORITY 3: Any title word starts with search (for partial word matching)
    else if (titleWords.some(word => word.startsWith(searchLower))) {
      titleWordMatch.push(task);
      console.log(`🥈 WORD STARTS: "${task.title}" has word starting with "${searchText}"`);
      matched = true;
    }
    // PRIORITY 4: Title contains all search terms anywhere
    else if (searchTerms.every(term => titleLower.includes(term))) {
      titleContains.push(task);
      console.log(`🥉 CONTAINS: "${task.title}" contains "${searchText}"`);
      matched = true;
    }

    // PRIORITY 5: Location matches (only if no title match)
    if (!matched) {
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
      ].filter(Boolean).join(' ').toLowerCase() : '';

      if (locationText && searchTerms.every(term => locationText.includes(term))) {
        locationMatches.push(task);
        console.log(`📍 LOCATION: "${task.title}" matched in location for "${searchText}"`);
        matched = true;
      }
    }

    // PRIORITY 6: Other fields (category, description, etc.) - only if no other match
    if (!matched) {
      // Extract categories - handle both string array and object array
      const categoriesText = Array.isArray(task.categories) 
        ? task.categories.map(cat => 
            typeof cat === 'string' ? cat : (cat as any).name || ''
          ).join(' ').toLowerCase()
        : '';

      // Build searchable text from other fields (excluding title and location)
      const searchableFields = [
        task.details || '',
        categoriesText,
        task.budget?.toString() || '',
        task.currency || '',
        // @ts-ignore - Handle potential tags field
        ...(Array.isArray(task.tags) ? task.tags : []),
      ];

      const combinedText = searchableFields
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, ' '); // Normalize whitespace

      // Check if all search terms are found in other fields
      if (searchTerms.every(term => combinedText.includes(term))) {
        otherMatches.push(task);
        console.log(`📋 OTHER: "${task.title}" matched in other fields for "${searchText}"`);
        matched = true;
      }
    }
  });

  // Combine results in priority order: exact > starts with > word match > contains > location > other
  const filtered = [
    ...titleExactMatch,
    ...titleStartsWith, 
    ...titleWordMatch,
    ...titleContains,
    ...locationMatches,
    ...otherMatches
  ];

  console.log('🔍 Search Filter Result:', {
    inputTasks: tasks.length,
    exactMatches: titleExactMatch.length,
    startsWithMatches: titleStartsWith.length,
    wordMatches: titleWordMatch.length,
    containsMatches: titleContains.length,
    locationMatches: locationMatches.length,
    otherMatches: otherMatches.length,
    totalFiltered: filtered.length,
    searchText,
    searchLower
  });

  return filtered;
};

// Sort mapping for browse-screen.tsx sort options:
// 0: 'Recommended' → 'latest'
// 1: 'Price: High to low' → 'price-high'
// 2: 'Price: Low to High' → 'price-low'
// 3: 'Due date: Earliest' → 'earliest'
// 4: 'Due date: Latest' → 'latest'
// 5: 'Newest tasks' → 'newest'
// 6: 'Oldest tasks' → 'oldest'
const SEARCH_SORT_MAPPING = [
  'latest',      // 0: Recommended
  'price-high',  // 1: Price: High to low
  'price-low',   // 2: Price: Low to High
  'earliest',    // 3: Due date: Earliest
  'latest',      // 4: Due date: Latest
  'newest',      // 5: Newest tasks
  'oldest',      // 6: Oldest tasks
] as const;

const FILTER_SORT_MAPPING = [
  'latest',      // 0: Recommended
  'price-high',  // 1: Price: High to low
  'price-low',   // 2: Price: Low to High
  'earliest',    // 3: Due date: Earliest
  'latest',      // 4: Due date: Latest
  'newest',      // 5: Newest tasks
  'oldest',      // 6: Oldest tasks
] as const;

export const useBrowseFiltersAPI = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  
  // Get user's country from geo-location for filtering tasks
  const { countryInfo, isDetecting: isDetectingCountry } = useLocationCountry();
  
  // Use dynamic max price based on user's currency
  const MAX_PRICE = getMaxPriceForCurrency(countryInfo.currency);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [tasksWithOfferCounts, setTasksWithOfferCounts] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Track the last processed page to prevent duplicate processing
  const lastProcessedPageRef = React.useRef<number>(0);
  const lastProcessedDataHashRef = React.useRef<string>('');
  const isResettingRef = React.useRef<boolean>(false);

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
      q: debouncedSearchText.trim().toLowerCase(), // Normalize to lowercase for consistent cache keys
      sort: SEARCH_SORT_MAPPING[selectedSort],
    };

    if (selectedCategory !== 'All Categories') params.category = selectedCategory;
    
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === MAX_PRICE;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];
      params.maxBudget = priceRange[1];
    }

    if (taskType === 'in-person') params.location = 'In-person';
    else if (taskType === 'remote') params.location = 'Online';

    console.log('🔍 [useBrowseFiltersAPI] Search Params:', params);
    return params;
  }, [selectedCategory, taskType, priceRange, selectedSort, debouncedSearchText, MAX_PRICE]);

  const filterParams: TaskFilterParams = useMemo(() => {
    const params: TaskFilterParams = {
      sortBy: FILTER_SORT_MAPPING[selectedSort],
      status: 'open',
      page: currentPage,
      limit: 20,
    };

    if (selectedCategory !== 'All Categories') params.categories = selectedCategory;
    
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === MAX_PRICE;
    if (!isDefaultPriceRange) {
      params.minBudget = priceRange[0];
      params.maxBudget = priceRange[1];
    }

    if (taskType === 'in-person') params.locationType = 'In-person';
    else if (taskType === 'remote') params.locationType = 'Online';

    // Note: 'nearest' sort option was removed from browse-screen sort options
    // If you need location-based sorting, add it back to browse-screen.tsx sortOptions

    // DON'T send search text to backend - we do comprehensive client-side filtering
    // Backend search only searches title field, we want to search ALL fields
    // if (searchText.trim()) params.search = searchText.trim();

    return params;
  }, [selectedCategory, taskType, priceRange, selectedSort, currentPage, MAX_PRICE]);

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

      // Create a hash of the current data to detect if it's actually new
      const dataHash = baseTasks.map(t => t._id).join(',');
      
      // Skip if we've already processed this exact data for this page
      if (currentPage === lastProcessedPageRef.current && dataHash === lastProcessedDataHashRef.current) {
        console.log('⏭️ Skipping duplicate processing - same page and data');
        return;
      }

      console.log('🔍 [enhanceTasksWithOfferCounts] Processing new data:', {
        currentPage,
        lastProcessedPage: lastProcessedPageRef.current,
        baseTasksLength: baseTasks.length,
        shouldUseFilterAPI,
        isLoadingMore,
        dataChanged: dataHash !== lastProcessedDataHashRef.current
      });

      // Handle pagination info
      if (shouldUseFilterAPI && filterResponse?.pagination) {
        const { hasNextPage, currentPage: apiPage } = filterResponse.pagination;
        setHasMore(hasNextPage);
        console.log('📄 Pagination info:', { currentPage: apiPage, hasNextPage, receivedTasks: baseTasks.length });
      }

      // If no new tasks received, don't process
      if (baseTasks.length === 0) {
        console.log('⚠️ No tasks in API response');
        // Only clear if it's page 1, otherwise keep existing tasks
        if (currentPage === 1) {
          setTasksWithOfferCounts([]);
          setIsProcessingData(false);
        }
        setIsLoadingMore(false);
        return;
      }

      // Update tracking refs
      lastProcessedPageRef.current = currentPage;
      lastProcessedDataHashRef.current = dataHash;

      // Always set processing when we have data to process
      setIsProcessingData(true);

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
            // Create a map of existing task IDs for faster lookup
            const existingTaskIds = new Set(prev.map(t => t._id));
            // Filter out duplicates from new tasks
            const newUniqueTasks = enhancedTasks.filter(t => !existingTaskIds.has(t._id));
            // Append only new unique tasks to existing list
            const combined = [...prev, ...newUniqueTasks];
            console.log('📄 Appending tasks:', {
              previousCount: prev.length,
              newTasksCount: enhancedTasks.length,
              uniqueNewTasks: newUniqueTasks.length,
              totalCount: combined.length,
              page: currentPage
            });
            return combined;
          });
        } else {
          console.log('📄 Replacing tasks (page 1):', enhancedTasks.length);
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

    // Backend already handles location-based filtering correctly
    // Frontend country filtering is disabled to prevent filtering out valid tasks
    // that backend has already validated based on coordinates and location
    console.log('🌍 Using backend-filtered tasks:', baseTasks.length, 'tasks');
    
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
    if (priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE) count++;
    if (availableTasksOnly) count++;
    if (showTasksWithNoOffers) count++;
    return count;
  };

  const resetFilters = () => {
    console.log('🔄 Resetting all filters to defaults (MAX_PRICE:', MAX_PRICE, ')');
    
    // Set flag to indicate we're resetting - prevents clearing tasks in useEffect
    isResettingRef.current = true;
    
    setSelectedCategory('All Categories');
    setTaskType('all');
    setPriceRange([0, MAX_PRICE]);
    setAvailableTasksOnly(false);
    setShowTasksWithNoOffers(false);
    setSelectedSort(0);
    setSearchText('');
    setCurrentPage(1);
    // Don't clear tasks - let them reload from API with reset filters
    // setTasksWithOfferCounts([]); // REMOVED: This was causing tasks to disappear
    setHasMore(true);
    
    // Clear the flag after a short delay to allow state updates to propagate
    setTimeout(() => {
      isResettingRef.current = false;
    }, 100);
  };

  // Reset to page 1 when filters change (but not during pagination)
  useEffect(() => {
    // Skip if we're resetting - let reset handle it
    if (isResettingRef.current) {
      console.log('⏭️ Skipping filter reset - reset operation in progress');
      return;
    }
    
    // Skip reset if we're in the middle of paginating
    if (isLoadingMore) {
      console.log('⏭️ Skipping filter reset - pagination in progress');
      return;
    }
    
    console.log('🔄 Filter changed, resetting to page 1');
    setCurrentPage(1);
    setTasksWithOfferCounts([]);
    setHasMore(true);
    setIsLoadingMore(false);
    // Reset tracking refs
    lastProcessedPageRef.current = 0;
    lastProcessedDataHashRef.current = '';
  }, [selectedCategory, taskType, priceRange, selectedSort, debouncedSearchText]);

  const loadMore = useCallback(() => {
    // Prevent multiple simultaneous load attempts
    if (isLoadingMore || !hasMore || isLoading) {
      console.log('⏸️ Skipping loadMore - already loading or no more data:', {
        isLoadingMore,
        hasMore,
        isLoading,
        currentPage
      });
      return;
    }
    
    console.log('📄 LoadMore triggered - fetching page:', currentPage + 1);
    setIsLoadingMore(true);
    setCurrentPage(prev => {
      const nextPage = prev + 1;
      console.log('🔢 Page updated from', prev, 'to', nextPage);
      return nextPage;
    });
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
