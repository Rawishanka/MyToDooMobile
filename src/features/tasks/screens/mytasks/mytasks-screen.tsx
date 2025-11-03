import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, View } from 'react-native';

// Components
import {
  EmptyState,
  FilterModal,
  LoadingState,
  MyTasksHeader,
  SearchModal,
  TaskCard,
} from './components';

// Hooks
import { useMyTasksFilters } from './hooks';

// Notification Modal
import NotificationModal from '@/src/features/messages/screens/notification-screen';

export default function MyTasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 5; // You can make this dynamic

  // Use custom hook for filters and data
  const {
    selectedFilter,
    searchText,
    filteredTasks,
    isLoading,
    setSelectedFilter,
    setSearchText,
    handleRefresh,
  } = useMyTasksFilters();

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 My Tasks screen focused, refreshing data...');
      handleRefresh();
    }, [handleRefresh])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <MyTasksHeader
        selectedFilter={selectedFilter}
        notificationCount={notificationCount}
        onFilterPress={() => setModalVisible(true)}
        onSearchPress={() => setSearchVisible(true)}
        onNotificationPress={() => setShowNotifications(true)}
      />

      {/* Task List with Loading & Empty States */}
      {isLoading ? (
        <LoadingState />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          searchText={searchText}
          selectedFilter={selectedFilter}
          onRefresh={handleRefresh}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <TaskCard task={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={modalVisible}
        selectedFilter={selectedFilter}
        onClose={() => setModalVisible(false)}
        onSelectFilter={setSelectedFilter}
      />

      {/* Search Modal */}
      <SearchModal
        visible={searchVisible}
        searchText={searchText}
        onClose={() => setSearchVisible(false)}
        onChangeText={setSearchText}
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
    paddingTop: StatusBar.currentHeight || 40,
    backgroundColor: '#fff',
  },
});
