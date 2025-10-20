import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// 🚀 **NEW: Import our API hooks**
// import { useApiFunctions } from '@/api/mytasks'; // ❌ REMOVED: Using old API that causes network errors
import { Task } from '@/api/types/tasks';
import { useGetAllTasks, useSearchTasks } from '@/hooks/useTaskApi';
import { useClearAllCaches, useClearTaskCaches, useForceRefreshCategories, useForceRefreshTasks } from '@/utils/cache-utils';

// 🏷️ **NEW: Import Categories API hooks**
import { CategoriesAPI } from '@/api/categories-api'; // ✅ ADDED: Import categories API directly for testing
import { useGetCategoriesWithAll } from '@/hooks/useCategoriesApi';

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

// 🚀 **UPDATED: Using real API types instead of hardcoded interface**
// The Task interface is now imported from '@/api/types/tasks'

// 🔥 **REMOVED HARDCODED DATA - NOW USING REAL API!**
// Categories are now fetched dynamically from the database

export default function BrowseTasksScreen() {
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // 🏷️ **NEW: Dynamic categories from database**
  const { 
    data: categoriesWithAll, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetCategoriesWithAll();
  
  // 🔍 Debug logging for categories
  console.log("🏷️ Browse Screen Categories Debug:", {
    categoriesWithAll,
    categoriesLoading,
    categoriesError: categoriesError?.message,
    hasCategoriesData: !!categoriesWithAll,
    categoriesLength: categoriesWithAll?.length
  });
  
  // Use database categories or fallback to default
  const categories = categoriesWithAll || [
    'All Categories',
    'Home & Garden', 
    'Design & Creative',
    'Technology',
    'Cleaning',
    'Admin & Data',
    'Business',
    'Writing & Translation',
  ];

  // � **NEW: Real API data fetching**
  const { 
    data: tasksResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllTasks();

  const { 
    data: searchResults 
  } = useSearchTasks({ 
    search: searchText 
  }, searchText.length > 2);

  // Use search results if searching, otherwise use all tasks
  const apiTasks = searchText.length > 2 ? searchResults?.data : tasksResponse?.data;
  const allTasks = apiTasks || [];

  // 🔍 DEBUG: Log the data being received
  useEffect(() => {
    // 🔧 DEBUG: Log API configuration
    console.log("🔧 API Configuration Debug:", {
      useMockOnly: require('@/api/config').default.USE_MOCK_ONLY,
      baseUrl: require('@/api/config').default.BASE_URL,
      currentTime: new Date().toISOString()
    });

    // 🏷️ DEBUG: Log categories data
    console.log("🏷️ Categories Debug:", {
      categoriesLoading,
      categoriesError: categoriesError?.message,
      categoriesCount: categories.length,
      categories: categories
    });

    if (tasksResponse) {
      console.log("🔍 Browse Tasks - Raw API Response:", {
        success: tasksResponse.success,
        total: tasksResponse.total,
        count: tasksResponse.count,
        pages: tasksResponse.pages,
        currentPage: tasksResponse.currentPage,
        dataLength: tasksResponse.data?.length,
        taskTitles: tasksResponse.data?.map(t => t.title)
      });
    }
    
    if (error) {
      console.error("❌ Browse Tasks - API Error:", error);
    }
    
    console.log("🔍 Browse Tasks - Final allTasks:", {
      length: allTasks.length,
      titles: allTasks.map(t => t.title),
      isLoading,
      hasError: !!error
    });
  }, [tasksResponse, allTasks, error, isLoading, categories, categoriesLoading, categoriesError]);

  // 🔄 REFRESH DATA WHEN SCREEN IS FOCUSED (after task creation)
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Browse Tasks screen focused, refreshing data...");
      refetch();
    }, [refetch])
  );

  // 🧹 Cache management utilities
  const clearTaskCaches = useClearTaskCaches();
  const forceRefreshTasks = useForceRefreshTasks();
  const clearAllCaches = useClearAllCaches();
  const forceRefreshCategories = useForceRefreshCategories();

  // �🔥 ADD NOTIFICATION STATE AND ROUTER
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 3; // You can make this dynamic
  const router = useRouter();
  const navigation = useNavigation();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 5000]); // 🔧 FIXED: Increased range to show all tasks
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(300);

  // 🧭 Custom map marker icon (replace default blue circles)
  // Resolve the bundled asset to a file/asset URI we can inject into the WebView HTML
  const markerIconUri = Image.resolveAssetSource(require('../../assets/icons/map.png')).uri;

  // 🔥 ADD NOTIFICATION FUNCTIONS
  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // Alternative: Navigate to notification screen instead of modal
  const navigateToNotifications = () => {
    router.push('/notification-screen');
  };

  const sortOptions = [
    'Recommended',
    'Price: High to low',
    'Price: Low to High',
    'Due date: Earliest',
    'Due date: Latest',
    'Newest tasks',
    'Oldest tasks',
    'Closest to me',
  ];

  // 🚀 **UPDATED: Filter and sort logic for real API data**
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = allTasks;

    // Apply search filter - updated for real API structure
    if (searchText.trim()) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.location.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply category filter - updated for real API structure
    if (selectedCategory !== 'All Categories') {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(task => 
        task.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Apply task type filter - simplified since API doesn't have type field
    if (taskType === 'remote') {
      const beforeType = filtered.length;
      filtered = filtered.filter(task => 
        task.location.address.toLowerCase().includes('remote') ||
        task.details.toLowerCase().includes('remote')
      );
    } else if (taskType === 'in-person') {
      const beforeType = filtered.length;
      filtered = filtered.filter(task => 
        !task.location.address.toLowerCase().includes('remote') &&
        !task.details.toLowerCase().includes('remote')
      );
    }

    // Apply price range filter - updated for real API structure
    const beforePrice = filtered.length;
    const taskBudgets = filtered.map(t => t.budget);
    
    filtered = filtered.filter(task => 
      task.budget >= priceRange[0] && task.budget <= priceRange[1]
    );

    // Apply available tasks only filter - updated for real API structure
    if (availableTasksOnly) {
      const beforeAvailable = filtered.length;
      filtered = filtered.filter(task => task.status === 'open');
    }

    // Apply show tasks with no offers filter - updated for real API structure
    if (showTasksWithNoOffers) {
      const beforeNoOffers = filtered.length;
      filtered = filtered.filter(task => (task.offerCount || 0) === 0);
    }

    // Apply sorting - updated for real API structure
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

  // Debug filtering results - only when results change
  useEffect(() => {
    console.log(`🔍 Browse Screen Filter Results: ${allTasks.length} → ${filteredAndSortedTasks.length} tasks`, {
      selectedFilter: selectedCategory,
      searchText,
      taskType,
      priceRange,
      availableTasksOnly,
      showTasksWithNoOffers,
      selectedSort,
      totalFiltered: filteredAndSortedTasks.length
    });
  }, [filteredAndSortedTasks.length, selectedCategory, searchText, taskType, priceRange, availableTasksOnly, showTasksWithNoOffers, selectedSort]);

  // 🚀 **UPDATED: Generate map HTML with markers for real API data**
  // Accept a marker icon URL so Leaflet can use our custom icon for markers
  const generateMapHTML = (iconUrl?: string) => {
    const tasksWithCoordinates = filteredAndSortedTasks.filter(task => {
      const coords = task.location.coordinates;
      return coords && 
             typeof coords === 'object' && 
             'coordinates' in coords &&
             Array.isArray(coords.coordinates) &&
             coords.coordinates.length === 2;
    });
    
    const markers = tasksWithCoordinates.map(task => {
      const coords = task.location.coordinates as { type: string; coordinates: [number, number] };
      return {
        id: task._id,
        lat: coords.coordinates[1],
        lng: coords.coordinates[0],
        title: task.title,
        price: task.formattedBudget || `${task.currency} ${task.budget}`,
        location: task.location.address,
        status: task.status,
        offers: task.offerCount || 0,
      };
    });

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Task Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        #map {
            height: 100vh;
            width: 100vw;
        }
        .custom-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .popup-price {
            font-weight: bold;
            color: #007bff;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .popup-location {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        .popup-status {
            font-size: 12px;
            color: #333;
        }
        .marker-icon {
            background-color: #007bff;
            border: 2px solid white;
            border-radius: 50%;
      width: 36px;
      height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    /* Reinforce fixed-size marker images regardless of map zoom */
    .my-custom-marker {
      width: 44px !important;
      height: 44px !important;
    }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map centered on Australia
        const map = L.map('map').setView([-25.2744, 133.7751], 4);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Task markers
        const markers = ${JSON.stringify(markers)};
        
        // Create custom image icon for markers
        const markerIconUrl = ${JSON.stringify(iconUrl || '')};
        const customIcon = markerIconUrl
          ? L.icon({
              iconUrl: markerIconUrl,
              iconSize: [44, 44],
              iconAnchor: [22, 44],
              popupAnchor: [0, -40],
              className: 'my-custom-marker'
            })
          : L.divIcon({
              // Fallback to simple circle if icon cannot be resolved
              html: '<div class="marker-icon"></div>',
              className: 'custom-div-icon',
              iconSize: [44, 44],
              iconAnchor: [22, 44],
              popupAnchor: [0, -40]
            });
        
        // Add markers to map
        markers.forEach(marker => {
            const popupContent = \`
                <div class="custom-popup">
                    <div class="popup-title">\${marker.title}</div>
                    <div class="popup-price">\${marker.price}</div>
                    <div class="popup-location">\${marker.location}</div>
                    <div class="popup-status">\${marker.status} • \${marker.offers} offer\${marker.offers !== 1 ? 's' : ''}</div>
                </div>
            \`;
            
      L.marker([marker.lat, marker.lng], { icon: customIcon })
            .bindPopup(popupContent)
            .addTo(map);
        });
        
        // Fit map to markers if there are any
        if (markers.length > 0) {
            const group = new L.featureGroup(map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    return layer;
                }
            }));
            
            if (markers.length === 1) {
                map.setView([markers[0].lat, markers[0].lng], 12);
            } else {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    </script>
</body>
</html>
    `;
  };

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setTaskType('all');
    setPriceRange([5, 200]);
    setAvailableTasksOnly(false);
    setShowTasksWithNoOffers(false);
  };

  const handleSliderTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    const value = Math.round(5 + (percentage * 195)); // 5 to 200 range
    
    // For simplicity, we'll just update the max value
    if (percentage > 0.5) {
      setPriceRange([priceRange[0], value]);
    } else {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'All Categories') count++;
    if (taskType !== 'all') count++;
    if (priceRange[0] !== 5 || priceRange[1] !== 200) count++;
    if (availableTasksOnly) count++;
    if (showTasksWithNoOffers) count++;
    return count;
  };

  // 🚀 **UPDATED: Task card renderer matching the new UI design**
  const renderTaskCard = ({ item }: { item: Task }) => {
    // Helper function to get location type with icon
    const getLocationInfo = () => {
      const address = item.location?.address || '';
      if (address.toLowerCase().includes('online') || address.toLowerCase().includes('remote')) {
        return { icon: '💻', text: 'Remote' };
      }
      if (address.includes(' → ') || address.includes(' to ')) {
        return { icon: '🚚', text: 'Moving' };
      }
      return { icon: '📍', text: 'In Person' };
    };

    // Helper function to get time preference
    const getTimePreference = () => {
      if (item.dateType === 'before') return 'Before specific date';
      if (item.dateType === 'no-rush') return 'No rush';
      if (item.time && item.time !== 'Anytime') return item.time;
      return 'Flexible';
    };

    const locationInfo = getLocationInfo();

    return (
      <TouchableOpacity 
        style={styles.taskCard} 
        activeOpacity={0.6} // Slightly more responsive feedback
        onPress={() => {
          console.log(`🔗 Navigating to task detail: ${item.title} (ID: ${item._id})`);
          
          // Use React Navigation to navigate within the stack
          console.log('🚀 Using React Navigation within stack...');
          // @ts-ignore
          navigation.navigate('task-detail', { taskId: item._id });
          console.log('✅ Navigation executed');
          try {
            // Try navigation to the tabs version first
            console.log('🚀 Attempting navigation to tabs task-detail...');
            router.push(`/task-detail?taskId=${item._id}`);
            
            // Add debugging to see what's happening
            console.log('� Navigation call completed, checking if it worked...');
          } catch (error) {
            console.error('❌ Navigation error:', error);
            // Try root level as backup
            try {
              console.log('🔄 Trying root level navigation...');
              router.push(`/task-detail?taskId=${item._id}`);
            } catch (altError) {
              console.error('❌ Root navigation also failed:', altError);
            }
          }
        }}
        // Add haptic feedback for better user experience
        onPressIn={() => {
          // Optional: Add haptic feedback here if needed
          console.log(`👆 Task card pressed: ${item.title}`);
        }}
      >
        {/* Task Title */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Location Type */}
        <View style={styles.taskRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.taskRowText}>{locationInfo.text}</Text>
        </View>

        {/* Time Preference */}
        <View style={styles.taskRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.taskRowText}>{getTimePreference()}</Text>
        </View>

        {/* Status and Offers Row */}
        <View style={styles.bottomRow}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Posted</Text>
            <Text style={styles.offerText}>
              {(item.offerCount || 0) > 0 ? `${item.offerCount} Offers` : 'Make the first offer'}
            </Text>
          </View>
          
          {/* Price */}
          <Text style={styles.priceText}>
            {item.formattedBudget || `SGD${item.budget}`}
          </Text>
        </View>

        {/* User Avatar */}
        <View style={styles.userAvatarContainer}>
          <Image
            source={{ 
              uri: `https://ui-avatars.com/api/?name=${item.createdBy?.firstName}+${item.createdBy?.lastName}&background=random&size=40` 
            }}
            style={styles.userAvatar}
          />
        </View>

        {/* Navigation Indicator */}
        <View style={styles.navigationIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
          <MaterialCommunityIcons 
            name={viewMode === 'list' ? 'map-outline' : 'format-list-bulleted'} 
            size={24} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Tasks</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          
          {/* 🔧 DEBUG: Cache Management Buttons */}
          <TouchableOpacity 
            onPress={() => {
              console.log("🔄 Manual refresh triggered");
              clearAllCaches();
              setTimeout(() => {
                refetch();
                forceRefreshCategories();
              }, 100);
            }}
            style={{ marginLeft: 8, padding: 4, backgroundColor: '#ff6b35', borderRadius: 4 }}
          >
            <Text style={{ color: 'white', fontSize: 10 }}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              console.log("🔄 Force refresh triggered");
              forceRefreshTasks();
              forceRefreshCategories();
            }}
            style={{ marginLeft: 4, padding: 4, backgroundColor: '#007bff', borderRadius: 4 }}
          >
            <Text style={{ color: 'white', fontSize: 10 }}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={async () => {
              console.log("🏷️ Testing Categories API directly...");
              try {
                const result = await CategoriesAPI.getAllCategories();
                console.log("🏷️ Direct API Test Result:", result);
                alert(`Categories API Test: ${JSON.stringify(result, null, 2)}`);
              } catch (error) {
                console.error("❌ Categories API Test Failed:", error);
                alert(`Categories API Test Failed: ${error}`);
              }
            }}
            style={{ marginLeft: 4, padding: 4, backgroundColor: '#28a745', borderRadius: 4 }}
          >
            <Text style={{ color: 'white', fontSize: 8 }}>Test Cat</Text>
          </TouchableOpacity>
          
          {/* 🔥 UPDATED NOTIFICATION BELL WITH BADGE AND NAVIGATION */}
          <TouchableOpacity onPress={openNotifications} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#000" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      )}

      {/* Filter & Sort Row */}
      <View style={styles.filterSortRow}>
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setFilterVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} />
          <Text style={styles.filterText}>
            Filter {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSortVisible(true)}>
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Content - Map or List */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHTML(markerIconUri) }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
          />
        </View>
      ) : (
        // 🚀 **UPDATED: List view with real API data and loading states**
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load tasks</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredAndSortedTasks}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={renderTaskCard}
              refreshing={isLoading}
              onRefresh={() => {
                console.log("🔄 Pull to refresh triggered in Browse Tasks");
                refetch();
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {searchText ? 'No tasks found matching your search' : 'No tasks found matching your criteria'}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterModal}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#007bff" />
            </TouchableOpacity>
            <Text style={styles.filterTitle}>Filter</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Categories */}
            <View style={[styles.filterSection, { zIndex: categoryDropdownVisible ? 1000 : 1 }]}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
                disabled={categoriesLoading}
              >
                <Text style={styles.dropdownText}>
                  {categoriesLoading ? 'Loading categories...' : selectedCategory}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              {categoryDropdownVisible && !categoriesLoading && (
                <View style={styles.dropdownList}>
                  {categories.map((category: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dropdownItem, index === categories.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => {
                        setSelectedCategory(category);
                        setCategoryDropdownVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCategory === category && styles.selectedDropdownItem
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {categoriesError && (
                <Text style={styles.categoryErrorText}>
                  Failed to load categories. Using defaults.
                </Text>
              )}
            </View>

            {/* To be done */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>To be done</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'in-person' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType(taskType === 'in-person' ? 'all' : 'in-person')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'in-person' && styles.typeButtonTextActive
                  ]}>
                    In person
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'remote' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType(taskType === 'remote' ? 'all' : 'remote')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'remote' && styles.typeButtonTextActive
                  ]}>
                    Remotely
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'all' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType('all')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'all' && styles.typeButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Price</Text>
              <Text style={styles.priceRangeText}>
                A${priceRange[0]} - A${priceRange[1]}
              </Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.sliderTrack}
                  onPress={handleSliderTouch}
                  onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                  activeOpacity={1}
                >
                  <View 
                    style={[
                      styles.sliderFill,
                      {
                        left: `${((priceRange[0] - 5) / 195) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / 195) * 100}%`
                      }
                    ]}
                  />
                  <View 
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${((priceRange[0] - 5) / 195) * 100}%`,
                      }
                    ]}
                  />
                  <View 
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${((priceRange[1] - 5) / 195) * 100}%`,
                      }
                    ]}
                  />
                </TouchableOpacity>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>A$5</Text>
                  <Text style={styles.sliderLabel}>A$200+</Text>
                </View>
              </View>
            </View>

            {/* Other filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Other filters</Text>
              
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Available tasks only</Text>
                  <Text style={styles.switchSubtitle}>Hide tasks that are already assigned</Text>
                </View>
                <Switch
                  value={availableTasksOnly}
                  onValueChange={setAvailableTasksOnly}
                  trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Show tasks with no offers</Text>
                  <Text style={styles.switchSubtitle}>Hide tasks that have offers</Text>
                </View>
                <Switch
                  value={showTasksWithNoOffers}
                  onValueChange={setShowTasksWithNoOffers}
                  trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom buttons */}
          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort by</Text>
              <Pressable onPress={() => setSortVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} />
              </Pressable>
            </View>
            {sortOptions.map((option, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.sortOption} 
                onPress={() => { 
                  setSelectedSort(i); 
                  setSortVisible(false); 
                }}
              >
                <View style={styles.sortOptionContent}>
                  <Text style={styles.sortOptionText}>{option}</Text>
                  {selectedSort === i && (
                    <MaterialCommunityIcons name="check" size={20} color="#007bff" style={{ marginLeft: 8 }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={styles.searchModalOverlay}>
            <View style={styles.searchModalContent}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search tasks..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => setSearchVisible(false)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 🔥 ADD NOTIFICATION MODAL */}
      <NotificationModal
        visible={showNotifications}
        onClose={closeNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 🔥 ADD NOTIFICATION BUTTON STYLES
  notificationButton: {
    position: 'relative',
    marginLeft: 10,
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 16,
  },
  sortText: {
    fontSize: 16,
    color: '#007bff',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webView: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2, // Increased elevation for better visual feedback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Enhanced shadow for clickable appearance
    shadowOpacity: 0.15, // Slightly more prominent shadow
    shadowRadius: 3,
    position: 'relative',
    minHeight: 120,
    // Add a subtle border to make it look more interactive
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 22,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskRowText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingRight: 80, // Increased padding to make space for both avatar and navigation indicator
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 2,
  },
  offerText: {
    fontSize: 12,
    color: '#666',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  userAvatarContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  navigationIndicator: {
    position: 'absolute',
    top: 16,
    right: 60, // Position next to user avatar
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItem: {
    color: '#007bff',
    fontWeight: '600',
  },
  buttonGroup: {
    gap: 12,
  },
  typeButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonPrimary: {
    backgroundColor: '#f5f5f5',
  },
  typeButtonActive: {
    backgroundColor: '#1a237e',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  typeButtonTextPrimary: {
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceRangeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  sliderContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 12,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#007bff',
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    position: 'absolute',
    top: -7,
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sortOption: {
    paddingVertical: 10,
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortOptionText: {
    fontSize: 16,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchModalContent: {
    width: '95%',
    marginTop: 50,
  },
  // 🚀 **NEW: API-related styles**
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // 🏷️ **NEW: Categories-related styles**
  categoryErrorText: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

 