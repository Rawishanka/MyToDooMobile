import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// 🚀 **NEW: Import our API hooks**
import { useGetAllTasks, useSearchTasks } from '@/hooks/useTaskApi';
import { Task } from '@/api/types/tasks';
import { useClearTaskCaches, useForceRefreshTasks } from '@/utils/cache-utils';

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

// 🚀 **UPDATED: Using real API types instead of hardcoded interface**
// The Task interface is now imported from '@/api/types/tasks'

// 🔥 **REMOVED HARDCODED DATA - NOW USING REAL API!**

const categories = [
  'All Categories',
  'Home & Garden', 
  'Design & Creative',
  'Technology',
  'Cleaning',
  'Admin & Data',
  'Business',
  'Writing & Translation',
];

export default function BrowseTasksScreen() {
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
    console.log("🔍 Browse Tasks - Final allTasks:", {
      length: allTasks.length,
      titles: allTasks.map(t => t.title)
    });
  }, [tasksResponse, allTasks]);

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

  // �🔥 ADD NOTIFICATION STATE AND ROUTER
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 3; // You can make this dynamic
  const router = useRouter();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 5000]); // 🔧 FIXED: Increased range to show all tasks
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(300);

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

    console.log("🔍 Filtering tasks:", {
      totalTasks: allTasks.length,
      selectedFilter: selectedCategory,
      priceRange,
      taskType,
      availableTasksOnly,
      showTasksWithNoOffers,
      searchText
    });

    // Apply search filter - updated for real API structure
    if (searchText.trim()) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.location.address.toLowerCase().includes(searchText.toLowerCase())
      );
      console.log(`📝 Search filter: ${beforeSearch} → ${filtered.length} tasks`);
    }

    // Apply category filter - updated for real API structure
    if (selectedCategory !== 'All Categories') {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(task => 
        task.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
      console.log(`📂 Category filter: ${beforeCategory} → ${filtered.length} tasks`);
    }

    // Apply task type filter - simplified since API doesn't have type field
    if (taskType === 'remote') {
      const beforeType = filtered.length;
      filtered = filtered.filter(task => 
        task.location.address.toLowerCase().includes('remote') ||
        task.details.toLowerCase().includes('remote')
      );
      console.log(`🏠 Remote filter: ${beforeType} → ${filtered.length} tasks`);
    } else if (taskType === 'in-person') {
      const beforeType = filtered.length;
      filtered = filtered.filter(task => 
        !task.location.address.toLowerCase().includes('remote') &&
        !task.details.toLowerCase().includes('remote')
      );
      console.log(`👥 In-person filter: ${beforeType} → ${filtered.length} tasks`);
    }

    // Apply price range filter - updated for real API structure
    const beforePrice = filtered.length;
    const taskBudgets = filtered.map(t => t.budget);
    console.log(`💰 Task budgets range: ${Math.min(...taskBudgets)} - ${Math.max(...taskBudgets)}, Filter range: ${priceRange[0]} - ${priceRange[1]}`);
    
    filtered = filtered.filter(task => 
      task.budget >= priceRange[0] && task.budget <= priceRange[1]
    );
    console.log(`💰 Price filter: ${beforePrice} → ${filtered.length} tasks`);

    // Apply available tasks only filter - updated for real API structure
    if (availableTasksOnly) {
      const beforeAvailable = filtered.length;
      filtered = filtered.filter(task => task.status === 'open');
      console.log(`✅ Available only filter: ${beforeAvailable} → ${filtered.length} tasks`);
    }

    // Apply show tasks with no offers filter - updated for real API structure
    if (showTasksWithNoOffers) {
      const beforeNoOffers = filtered.length;
      filtered = filtered.filter(task => (task.offerCount || 0) === 0);
      console.log(`🎯 No offers filter: ${beforeNoOffers} → ${filtered.length} tasks`);
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

    console.log(`🔍 Filtering tasks: ${allTasks.length} → ${sorted.length} final tasks`, {
      selectedFilter: selectedCategory,
      tasks: sorted.map(t => ({ id: t._id, title: t.title, status: t.status })),
      totalTasks: sorted.length
    });

    return sorted;
  }, [allTasks, searchText, selectedCategory, taskType, priceRange, availableTasksOnly, showTasksWithNoOffers, selectedSort]);

  // 🚀 **UPDATED: Generate map HTML with markers for real API data**
  const generateMapHTML = () => {
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
        
        // Create custom icon
        function createCustomIcon(taskId) {
            return L.divIcon({
                html: '<div class="marker-icon">' + taskId + '</div>',
                className: 'custom-div-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
        }
        
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
            
            L.marker([marker.lat, marker.lng], {
                icon: createCustomIcon(marker.id)
            })
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

  // 🚀 **UPDATED: Task card renderer for real API data**
  const renderTaskCard = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskCard} 
      activeOpacity={0.7}
      onPress={() => router.push(`/(tabs)/task-detail?taskId=${item._id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskSub}>{item.location.address}</Text>
        <Text style={styles.taskSub}>
          {item.dateType || 'Flexible'} • {item.time || 'Anytime'}
        </Text>
        <Text style={styles.taskStatus}>
          <Text style={{ color: item.status === 'open' ? '#007bff' : '#666' }}>
            {item.status}
          </Text>
          {' '}{item.offerCount || 0} offer{(item.offerCount || 0) !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.taskPrice}>
          {item.formattedBudget || `${item.currency}$${item.budget}`}
        </Text>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: `https://randomuser.me/api/portraits/men/${Math.abs(item._id.slice(-2).charCodeAt(0))}.jpg` 
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

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
          
          {/* 🔧 DEBUG: Cache Management Buttons
          <TouchableOpacity 
            onPress={() => {
              clearTaskCaches();
              setTimeout(() => refetch(), 100);
            }}
            style={{ marginLeft: 8, padding: 4, backgroundColor: '#ff6b35', borderRadius: 4 }}
          >
            <Text style={{ color: 'white', fontSize: 10 }}>Clear</Text>
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity 
            onPress={() => forceRefreshTasks()}
            style={{ marginLeft: 4, padding: 4, backgroundColor: '#007bff', borderRadius: 4 }}
          >
            <Text style={{ color: 'white', fontSize: 10 }}>Refresh</Text>
          </TouchableOpacity> */}
          
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
            source={{ html: generateMapHTML() }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
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
              >
                <Text style={styles.dropdownText}>{selectedCategory}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              {categoryDropdownVisible && (
                <View style={styles.dropdownList}>
                  {categories.map((category, index) => (
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
    backgroundColor: '#f9f9f9',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  taskSub: {
    fontSize: 13,
    color: '#444',
  },
  taskStatus: {
    marginTop: 4,
    fontSize: 13,
  },
  taskPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
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
});

 