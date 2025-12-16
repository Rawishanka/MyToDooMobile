import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// API and Hooks
import { Task } from '@/src/api/types/tasks';
import { useGetCategoriesWithAll } from '@/src/shared/hooks/useCategoriesApi';

// Components
import NotificationModal from '@/src/features/messages/screens/notification-screen-api';
import { TaskCard } from '@/src/features/tasks/components';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';
import {
    FilterButton,
    FilterModal,
    MapView,
    SearchBar,
    SortButton,
    SortModal,
    ViewModeToggle
} from './components';

// Network components
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';

// Custom Hooks
import { useBrowseFiltersAPI } from './hooks/useBrowseFiltersAPI';

// Responsive utilities
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';

export default function BrowseTasksScreen() {
  // FlatList ref for scroll position management
  const flatListRef = useRef<FlatList>(null);
  
  // Modal visibility states
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  
  // Track selectedTaskId changes
  useEffect(() => {
    console.log('🎯 selectedTaskId changed to:', selectedTaskId);
    console.log('🎯 Current viewMode:', viewMode);
  }, [selectedTaskId, viewMode]);

  // Clear selectedTaskId when switching back to list view
  useEffect(() => {
    if (viewMode === 'list' && selectedTaskId) {
      console.log('📝 Clearing selectedTaskId when switching to list view');
      setSelectedTaskId(null);
    }
  }, [viewMode, selectedTaskId]);
  
  const router = useRouter();

  // Get real notification count
  const { data: unreadCountData } = useUnreadCount();
  const notificationCount = (unreadCountData as any)?.unreadCount || 0;

  // API data fetching
  const { 
    data: categoriesWithAll, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetCategoriesWithAll();
  
  // Memoize categories array to prevent effect dependency issues
  const categories = useMemo(
    () => {
      console.log('📂 BrowseScreen: Categories debug:', {
        categoriesWithAll,
        categoriesLoading,
        categoriesError: categoriesError?.message
      });

      const result = categoriesWithAll || [
        'All Categories',
        'Appliance installation and repair',
        'Auto Mechanic and Electrician', 
        'Building Maintenance and Renovations',
        'Business and Accounting',
        'Carpentry',
        'Cleaning and Organising',
        'Data Entry & Admin',
        'Design & Creative',
        'Delivery Services',
        'Education and Tutoring',
        'Electrical',
        'Event Planning',
        'Gardening and Landscaping',
        'Graphic Design',
        'Handyman and Handywomen',
        'Health & Fitness',
        'IT & Tech',
        'Legal Services',
        'Marketing and Advertising',
        'Music and Entertainment',
        'Painting',
        'Pet Care',
        'Photography',
        'Plumbing',
        'Removalist',
        'Something Else',
        'Web & App Development',
      ];

      console.log('📂 Final categories being passed to FilterModal:', result);
      return result;
    },
    [categoriesWithAll, categoriesLoading, categoriesError?.message]
  );

  // Use combined API-based hook (intelligently uses search OR filter API)
  const {
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
    activeFiltersCount,
    resetFilters,
    isLoading,
    isLoadingMore,
    loadMore,
    error,
    refetch,
    totalItems,
    useSearchAPI,
    activeAPI,
    userCountry,
    isDetectingCountry,
  } = useBrowseFiltersAPI();

  // Custom map marker icon - bigger Airtasker marker
  // Use the actual airtasker-marker.svg as a data URI
  const markerIconUri = 'data:image/svg+xml;base64,' + btoa(`
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 938 938">
      <path d="M0 0 C4.36581165 3.64336636 8.60293638 7.38221093 12.73828125 11.28515625 C13.48722656 11.96964844 14.23617187 12.65414062 15.0078125 13.359375 C33.30378594 30.69408889 44.54197269 55.68090101 48.73828125 80.28515625 C49.01285156 81.84943359 49.01285156 81.84943359 49.29296875 83.4453125 C51.08702963 98.91515321 50.59697339 114.45822344 45.73828125 129.28515625 C45.48046875 130.08888672 45.22265625 130.89261719 44.95703125 131.72070312 C34.46979986 163.78929726 18.00457301 194.17291561 0.28369141 222.78613281 C-1.33334483 225.40098004 -2.93233085 228.02638507 -4.53125 230.65234375 C-18.71500301 253.78880679 -34.02211452 276.33020905 -49.87402344 298.35595703 C-51.4491356 300.54570655 -53.01534363 302.74171601 -54.58203125 304.9375 C-70.97830844 327.85735281 -70.97830844 327.85735281 -75.26171875 329.28515625 C-83.55957241 318.10970169 -91.75315431 306.87422428 -99.72998047 295.46728516 C-101.29532587 293.23727922 -102.87303146 291.01645067 -104.453125 288.796875 C-114.79265946 274.22325721 -124.55983409 259.28720589 -134.26171875 244.28515625 C-134.85259277 243.37314453 -135.4434668 242.46113281 -136.05224609 241.52148438 C-206.90299744 131.85345079 -206.90299744 131.85345079 -195.63671875 74.66015625 C-191.09916251 54.05149029 -181.77754541 35.43656911 -168.26171875 19.28515625 C-167.63265625 18.51558594 -167.00359375 17.74601562 -166.35546875 16.953125 C-126.39997213 -30.53943121 -48.64910081 -38.37946654 0 0 Z M-128.2265625 47.6484375 C-140.15798116 63.10660947 -143.81151279 81.18820561 -142.26171875 100.28515625 C-139.90068289 117.48755965 -130.74276717 133.20180485 -117.69921875 144.47265625 C-107.90133799 151.87820842 -96.39089738 157.27215614 -84.26171875 159.28515625 C-83.39675781 159.43726563 -82.53179687 159.589375 -81.640625 159.74609375 C-62.77353051 162.26918217 -44.58343562 155.5264439 -29.60546875 144.29296875 C-19.43385967 135.72244628 -12.51685316 124.83363107 -8.26171875 112.28515625 C-7.94332031 111.37765625 -7.62492188 110.47015625 -7.296875 109.53515625 C-2.26551904 92.84125629 -4.73261281 74.5224463 -12.01171875 58.91015625 C-20.35818715 43.49005588 -34.27774001 30.50328213 -51.09375 24.93359375 C-54.47013575 23.95072963 -57.83222789 23.06040514 -61.26171875 22.28515625 C-62.07898438 22.094375 -62.89625 21.90359375 -63.73828125 21.70703125 C-88.48877621 17.5691776 -112.21589368 29.20934272 -128.2265625 47.6484375 Z " fill="#FDC901" transform="translate(542.26171875,316.71484375)"/>
      <path d="M0 0 C6.29893152 5.53416059 9.8657249 11.48313936 10.53125 19.98046875 C10.78049411 28.17436895 9.83931735 35.16804617 4.875 41.875 C-4.09841526 51.37886345 -17.09365354 53.08029951 -29.5 53.5 C-40.68213443 53.24821684 -52.99313809 51.80746358 -61.6875 44.1875 C-67.71205895 37.26807978 -70.17925918 29.93787787 -69.9296875 20.80078125 C-69.13330802 12.20758973 -66.2372633 5.89042522 -59.6875 0.1875 C-44.80216312 -10.51031354 -15.12907149 -10.54793209 0 0 Z M-43.6875 15.375 C-45.45962626 20.35910511 -45.56676403 25.10503256 -43.5 30 C-40.16108166 34.02972904 -37.55590552 36.29560736 -32.3125 37.0625 C-27.2622603 37.38075723 -23.08461015 37.01184931 -18.921875 33.84375 C-15.58095605 30.53405459 -14.26901895 27.84645045 -14.0625 23.125 C-14.37948556 18.48996664 -15.41864508 15.62398851 -18.6875 12.1875 C-27.39226776 7.1655186 -36.81077282 7.85357964 -43.6875 15.375 Z " fill="#C1FF72" transform="translate(498.6875,347.8125)"/>
      <path d="M0 0 C22.44 0 44.88 0 68 0 C68 4.95 68 9.9 68 15 C60.74 15 53.48 15 46 15 C46 28.86 46 42.72 46 57 C38.08 57 30.16 57 22 57 C22 43.14 22 29.28 22 15 C14.74 15 7.48 15 0 15 C0 10.05 0 5.1 0 0 Z " fill="#FF914D" transform="translate(435,404)"/>
    </svg>
  `);

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

  // Debug logging
  useEffect(() => {
    console.log("🏷️ Categories Debug:", {
      categoriesLoading,
      categoriesError: categoriesError?.message,
      categoriesCount: categories.length,
      categories: categories
    });

    console.log("🔍 Browse Tasks - Combined API Debug:", {
      activeAPI,
      useSearchAPI,
      searchText: searchText.trim(),
      hasSearchText: searchText.trim().length > 0,
      isLoading,
      error: error?.message,
      totalItems,
      dataLength: filteredAndSortedTasks.length,
      activeFiltersCount,
      userCountry,
      isDetectingCountry,
    });
  }, [categoriesLoading, categoriesError, categories, isLoading, error, totalItems, filteredAndSortedTasks.length, activeFiltersCount, activeAPI, searchText, useSearchAPI, userCountry, isDetectingCountry]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Browse Tasks screen focused, refreshing data...");
      refetch();
    }, [refetch])
  );

  // Debug map data when switching to map view
  useEffect(() => {
    if (viewMode === 'map') {
      console.log('🗺️ Browse Screen Map Debug:', {
        totalTasks: filteredAndSortedTasks.length,
        taskSample: filteredAndSortedTasks.slice(0, 2).map(t => ({
          id: t._id,
          title: t.title,
          hasLocation: !!t.location,
          hasCoordinates: !!t.location?.coordinates,
          coordinatesType: typeof t.location?.coordinates,
          coordinates: t.location?.coordinates
        }))
      });
    }
  }, [viewMode, filteredAndSortedTasks]);

  // Render task card
  const renderTaskCard = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={(taskId) => {
        console.log(`🔗 Navigating to task detail: ${item.title} (ID: ${taskId})`);
        router.push({
          pathname: '/task-detail',
          params: { taskId }
        });
      }}
      onMapPress={(taskId) => {
        console.log('📍 Map button clicked for task:', {
          taskId: taskId,
          taskTitle: item.title,
          previousSelectedTaskId: selectedTaskId
        });
        setSelectedTaskId(taskId);
        setViewMode('map');
        console.log('📍 Updated selectedTaskId to:', taskId, 'and switched to map view');
      }}
      showMapButton={true}
      variant="default"
    />
  );

  return (
    <View style={styles.container}>
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <ViewModeToggle 
          viewMode={viewMode} 
          onToggle={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} 
        />
        <Text style={styles.headerTitle}>Browse Tasks</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowNotifications(true)} 
            style={styles.notificationButton}
          >
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
      <SearchBar 
        visible={searchVisible}
        searchText={searchText}
        onChangeText={setSearchText}
        onClose={() => setSearchVisible(false)}
        onSubmit={() => {
          console.log('🔍 Search submitted, triggering API call for:', searchText);
          refetch();
        }}
      />

      {/* Search Results Info */}
      {searchText.trim().length > 0 && !searchVisible && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {filteredAndSortedTasks.length} result{filteredAndSortedTasks.length !== 1 ? 's' : ''} for &quot;{searchText}&quot;
          </Text>
          <TouchableOpacity onPress={() => {
            setSearchText('');
            setSearchVisible(false);
          }}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter & Sort Row */}
      <View style={styles.filterSortRow}>
        <FilterButton 
          activeFiltersCount={activeFiltersCount}
          onPress={() => setFilterVisible(true)}
        />
        <SortButton onPress={() => setSortVisible(true)} />
      </View>

      {/* Content - Map or List */}
      {viewMode === 'map' ? (
        (() => {
          console.log('🗺️ Rendering MapView with:', {
            tasksCount: filteredAndSortedTasks.length,
            selectedTaskId: selectedTaskId,
            viewMode: viewMode,
            taskTitles: filteredAndSortedTasks.slice(0, 3).map(t => ({ id: t._id, title: t.title }))
          });
          return (
            <View style={styles.mapContainer}>
              <MapView 
                tasks={filteredAndSortedTasks}
                iconUrl={markerIconUri}
                focusTaskId={selectedTaskId}
                onMapAction={(action, taskId) => {
                  if (action === 'viewDetails') {
                    // Navigate to task details
                    router.push({
                      pathname: '/task-detail',
                      params: { taskId }
                    });
                  } else if (action === 'openInMaps') {
                    // Open in device maps app - could implement later
                    console.log('Open in Maps for task:', taskId);
                  }
                }}
              />
            </View>
          );
        })()
      ) : (
        <>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 16 }} />
              <Text style={styles.loadingText}>
                {searchText.trim() ? 'Searching tasks...' : 'Loading tasks...'}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load tasks</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredAndSortedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchText.trim() 
                  ? `No tasks found matching "${searchText.replace(/"/g, '\\"')}"`
                  : 'No tasks found matching your criteria'}
              </Text>
              {searchText.trim() && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchText('');
                    setSearchVisible(false);
                  }}
                >
                  <Text style={styles.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={filteredAndSortedTasks}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ 
                paddingBottom: hp('12%'),
                paddingHorizontal: isTablet ? wp('12.5%') : 0,
              }}
              renderItem={renderTaskCard}
              refreshing={false}
              onRefresh={() => {
                console.log("🔄 Pull to refresh triggered in Browse Tasks");
                refetch();
              }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              windowSize={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={100}
              initialNumToRender={10}
              removeClippedSubviews={false}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10
              }}
              onScrollToIndexFailed={(info) => {
                console.log('Scroll to index failed:', info);
              }}
              ListFooterComponent={() => 
                isLoadingMore ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading more tasks...</Text>
                  </View>
                ) : null
              }
            />
          )}
        </>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        taskType={taskType}
        onTaskTypeChange={setTaskType}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        availableTasksOnly={availableTasksOnly}
        onAvailableTasksChange={setAvailableTasksOnly}
        showTasksWithNoOffers={showTasksWithNoOffers}
        onShowTasksWithNoOffersChange={setShowTasksWithNoOffers}
        onResetFilters={resetFilters}
      />

      {/* Sort Modal */}
      <SortModal
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        selectedSort={selectedSort}
        onSortChange={(index: number) => setSelectedSort(index)}
        sortOptions={sortOptions}
      />

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Network Alert */}
      <NetworkAlert
        visible={showNetworkAlert}
        onClose={() => setShowNetworkAlert(false)}
        message="Network connection issue"
        actionText="OK"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: hp('6%'),
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('3%'),
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.2%'),
    minHeight: 50,
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: wp('2%'),
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  notificationButton: {
    position: 'relative',
    marginLeft: wp('2.5%'),
    padding: wp('1%'),
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: isTablet ? 20 : 18,
    height: isTablet ? 20 : 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: RFValue(8),
    fontWeight: '600',
  },
  searchResultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: '#f0f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchResultsText: {
    fontSize: RFValue(12),
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    marginBottom: hp('1.2%'),
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    marginBottom: hp('1.2%'),
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    padding: isTablet ? hp('6%') : hp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    marginTop: hp('1%'),
  },
  clearSearchButton: {
    marginTop: hp('2%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
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
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    backgroundColor: '#e6f2ff',
    gap: wp('1%'),
  },
  locationIndicatorText: {
    fontSize: RFValue(11),
    color: '#007bff',
    fontWeight: '500',
  },
});
