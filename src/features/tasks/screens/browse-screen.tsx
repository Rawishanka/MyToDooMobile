import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// API and Hooks
import { Task } from '@/src/api/types/tasks';
import { useGetCategoriesWithAll } from '@/src/shared/hooks/useCategoriesApi';
import { useGetAllTasks } from '@/src/shared/hooks/useTaskApi';
import { useClearAllCaches, useForceRefreshCategories, useForceRefreshTasks } from '@/src/shared/utils/cache-utils';

// Components
import NotificationModal from '@/src/features/messages/screens/notification-screen';
import { TaskCard } from '@/src/features/tasks/components';
import { LoadingState } from '../components/shared';
import {
  DebugTools,
  FilterButton,
  FilterModal,
  MapView,
  SearchBar,
  SortButton,
  SortModal,
  ViewModeToggle
} from './browse/components';

// Custom Hooks
import { useBrowseFilters } from './browse/hooks/useBrowseFilters';

export default function BrowseTasksScreen() {
  // Modal visibility states
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 3;
  
  const router = useRouter();

  // API data fetching
  const { 
    data: categoriesWithAll, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetCategoriesWithAll();
  
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

  const { 
    data: tasksResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllTasks();

  const allTasks = tasksResponse?.data || [];

  // Use custom filter hook
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
  } = useBrowseFilters(allTasks);

  // Cache management utilities
  const clearAllCaches = useClearAllCaches();
  const forceRefreshTasks = useForceRefreshTasks();
  const forceRefreshCategories = useForceRefreshCategories();

  // Custom map marker icon
  const markerIconUri = Image.resolveAssetSource(require('@/assets/icons/map.png')).uri;

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
    console.log("🔧 API Configuration Debug:", {
      useMockOnly: require('@/src/api/config').default.USE_MOCK_ONLY,
      baseUrl: require('@/src/api/config').default.BASE_URL,
      currentTime: new Date().toISOString()
    });

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
        dataLength: tasksResponse.data?.length,
      });
    }
  }, [tasksResponse, categoriesLoading, categoriesError, categories]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Browse Tasks screen focused, refreshing data...");
      refetch();
    }, [refetch])
  );

  // Render task card
  const renderTaskCard = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={(taskId: string) => {
        console.log(`🔗 Navigating to task detail: ${item.title} (ID: ${taskId})`);
        router.push({
          pathname: '/task-detail',
          params: { taskId }
        });
      }}
      onMapPress={(taskId: string) => {
        setSelectedTaskId(taskId);
        setViewMode('map');
      }}
      showMapButton={true}
      variant="default"
    />
  );

  return (
    <View style={styles.container}>
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
          
          {/* Debug: Cache Management Buttons */}
          <DebugTools
            onClearAll={() => {
              console.log("🔄 Manual refresh triggered");
              clearAllCaches();
              setTimeout(() => {
                refetch();
                forceRefreshCategories();
              }, 100);
            }}
            onRefresh={() => {
              console.log("🔄 Force refresh triggered");
              forceRefreshTasks();
              forceRefreshCategories();
            }}
          />
          
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
      />

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
        <View style={styles.mapContainer}>
          <MapView 
            tasks={filteredAndSortedTasks}
            iconUrl={markerIconUri}
            focusTaskId={selectedTaskId}
          />
        </View>
      ) : (
        <>
          {isLoading ? (
            <LoadingState message="Loading tasks..." />
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
        onSortChange={(index) => setSelectedSort(index)}
        sortOptions={sortOptions}
      />

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
