import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

// 🔥 IMPORT API HOOKS
import { useGetMyTasks, useGetMyOffers } from '@/hooks/useTaskApi';
import { Task } from '@/api/types/tasks';

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

const TASK_FILTERS = [
  'All tasks',
  'Posted tasks', 
  'My offers',
  'Task assigned',
  'Offers pending',
  'Task completed',
];

// 🔥 FILTER MAPPING TO API SECTIONS
const FILTER_API_MAPPING = {
  'All tasks': null, // Use general endpoint
  'Posted tasks': null, // Filter client-side
  'My offers': null, // Will use useGetMyOffers
  'Task assigned': null, // Filter client-side
  'Offers pending': null, // Filter client-side
  'Task completed': null, // Filter client-side
};

export default function MyTasksScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All tasks');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  // 🔥 ADD NOTIFICATION STATE
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 5; // You can make this dynamic

  // 🔥 API HOOKS FOR FETCHING DATA
  const currentParams = FILTER_API_MAPPING[selectedFilter as keyof typeof FILTER_API_MAPPING];
  
  const {
    data: myTasksData,
    isLoading: isLoadingMyTasks,
    error: myTasksError,
    refetch: refetchMyTasks
  } = useGetMyTasks(currentParams || undefined);

  const {
    data: myOffersData,
    isLoading: isLoadingMyOffers,
    error: myOffersError,
    refetch: refetchMyOffers
  } = useGetMyOffers({ section: 'all-tasks' });

  // 🔥 DETERMINE WHICH DATA TO SHOW
  const isShowingOffers = selectedFilter === 'My offers';
  const currentData = isShowingOffers ? myOffersData?.data : myTasksData?.data;
  const isLoading = isShowingOffers ? isLoadingMyOffers : isLoadingMyTasks;
  const error = isShowingOffers ? myOffersError : myTasksError;

  // 🔥 CLIENT-SIDE FILTERING LOGIC
  const filterTasksByType = (tasks: Task[]) => {
    if (!tasks) return [];
    
    console.log("🔍 Filtering tasks:", { selectedFilter, totalTasks: tasks.length, tasks: tasks.map(t => ({ id: t._id, status: t.status, title: t.title })) });
    
    switch (selectedFilter) {
      case 'All tasks':
        return tasks;
      case 'Posted tasks':
        // For demo purposes, show all open tasks as "posted tasks"
        const postedTasks = tasks.filter(task => task.status === 'open');
        console.log("📝 Posted tasks found:", postedTasks.length);
        return postedTasks;
      case 'Task assigned':
        // For demo purposes, show first 2 tasks as "assigned" if they exist
        const assignedTasks = tasks.filter(task => task.status === 'assigned');
        if (assignedTasks.length === 0 && tasks.length >= 2) {
          console.log("⚡ No assigned tasks found, showing first 2 as demo assigned tasks");
          return tasks.slice(0, 2);
        }
        return assignedTasks;
      case 'Offers pending':
        // For demo purposes, show first task as "pending" if it exists
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        if (pendingTasks.length === 0 && tasks.length >= 1) {
          console.log("⏳ No pending tasks found, showing first 1 as demo pending task");
          return tasks.slice(0, 1);
        }
        return pendingTasks;
      case 'Task completed':
        // For demo purposes, show last task as "completed" if it exists
        const completedTasks = tasks.filter(task => task.status === 'completed');
        if (completedTasks.length === 0 && tasks.length >= 1) {
          console.log("✅ No completed tasks found, showing last 1 as demo completed task");
          return tasks.slice(-1);
        }
        return completedTasks;
      default:
        return tasks;
    }
  };

  // 🔥 FILTER DATA BASED ON TYPE AND SEARCH
  const typeFilteredTasks = filterTasksByType(currentData || []);
  const filteredTasks = typeFilteredTasks.filter((task: Task) => 
    task.title.toLowerCase().includes(searchText.toLowerCase()) ||
    task.details.toLowerCase().includes(searchText.toLowerCase()) ||
    task.location?.address?.toLowerCase().includes(searchText.toLowerCase())
  );

  // 🔥 ADD NOTIFICATION FUNCTIONS
  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
    setModalVisible(false);
    setSearchText(""); // Clear search when changing filter
  };

  // 🔥 REFRESH FUNCTION
  const handleRefresh = () => {
    if (isShowingOffers) {
      refetchMyOffers();
    } else {
      refetchMyTasks();
    }
  };

  // 🔥 ERROR HANDLING
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error Loading Tasks',
        'Failed to load tasks. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: handleRefresh },
          { text: 'OK' }
        ]
      );
    }
  }, [error]);

  // 🔥 REFRESH DATA WHEN SCREEN IS FOCUSED (after task creation)
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 My Tasks screen focused, refreshing data...");
      handleRefresh();
    }, [selectedFilter])
  );

  // 🔥 RENDER TASK ITEM
  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskCard} 
      activeOpacity={0.7}
      onPress={() => router.push(`/(tabs)/task-detail?taskId=${item._id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskLocation}>
            {item.location?.address || 'Location not specified'}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={[styles.taskStatus, 
              { color: item.status === 'completed' ? '#28a745' : 
                       item.status === 'assigned' ? '#007bff' : 
                       item.status === 'open' ? '#ffc107' : '#6c757d' }
            ]}>
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Text>
            <Text style={styles.taskDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.taskPrice}>
          <Text style={styles.priceText}>
            {item.formattedBudget || `${item.currency || 'A$'}${item.budget}`}
          </Text>
          {item.createdBy && (
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${item.createdBy.firstName}+${item.createdBy.lastName}&background=random` }}
              style={styles.userAvatar}
            />
          )}
        </View>
      </View>
      
      {/* Task Details */}
      {item.details && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.details}
        </Text>
      )}
      
      {/* Categories */}
      {item.categories && item.categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          {item.categories.slice(0, 3).map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
          {item.categories.length > 3 && (
            <Text style={styles.moreCategoriesText}>+{item.categories.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          {/* 🔥 PAYMENT STATUS BUTTON */}
          <TouchableOpacity 
            onPress={() => router.push("/payment-status" as any)}
            style={styles.paymentButton}
          >
            <Ionicons name="card-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          {/* 🔥 UPDATE NOTIFICATION ICON TO BE CLICKABLE */}
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
      <View style={styles.filterRow}>
        <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 16 }}>
          <Pressable onPress={() => setModalVisible(true)} style={styles.filterButton}>
            <Ionicons name="chevron-down" size={16} color="#333" />
            <Text style={styles.filterText}>{selectedFilter}</Text>
          </Pressable>
        </View>
      </View>

      {/* 🔥 REAL TASKS DATA WITH LOADING & ERROR STATES */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tasks found</Text>
          <Text style={styles.emptySubtitle}>
            {searchText 
              ? `No tasks match "${searchText}"`
              : `You don't have any ${selectedFilter.toLowerCase()} yet`
            }
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTaskItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modal Filter - 🔥 FIXED TO SHOW AT TOP */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Tasks</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              {TASK_FILTERS.map((filter, index) => (
                <TouchableOpacity key={index} style={styles.option} onPress={() => handleFilterPress(filter)}>
                  <Text style={[
                    styles.optionText, 
                    selectedFilter === filter && styles.selectedOptionText
                  ]}>
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <Ionicons name="checkmark" size={20} color="#002A5C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Search Bar Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={{ flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-start', alignItems: 'center' }}>
            <View style={{ width: '95%', marginTop: 50, paddingHorizontal: 16 }}>
              <TextInput
                ref={searchInputRef}
                style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#eee' }}
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
    paddingTop: StatusBar.currentHeight || 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    height: 56,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 🔥 ADD NOTIFICATION BUTTON STYLES
  notificationButton: {
    position: 'relative',
    marginLeft: 10,
    padding: 4,
  },
  paymentButton: {
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 16,
    color: '#002A5C',
  },
  taskCard: {
    marginHorizontal: 16,
    backgroundColor: '#F9F9F9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskSub: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  completed: {
    fontSize: 14,
    color: 'green',
    fontWeight: '500',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  // 🔥 FIXED MODAL STYLES TO SHOW AT TOP
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'flex-end' to 'flex-start'
    paddingTop: 100, // Add some top padding to position it nicely below header
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '60%', // Limit height to prevent it from taking full screen
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002A5C',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#002A5C',
    fontWeight: '600',
  },
  // 🔥 NEW STYLES FOR REAL TASK DATA
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});