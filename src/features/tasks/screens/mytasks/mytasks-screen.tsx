import { Task } from '@/src/api/types/tasks';
import { useGetAllOffers, useGetAllTasks, useGetMyOffers, useGetMyTasks } from '@/src/shared/hooks/useTaskApi';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Components
import { Ionicons } from '@expo/vector-icons';
import {
    LoadingState,
    MyTasksHeader,
    TaskCard,
} from './components';
import SearchBar from './components/SearchModal';

// Notification Modal
import NotificationModal from '@/src/features/messages/screens/notification-screen-api';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';

// Auth Store
import { useAuthStore } from '@/src/store/auth-task-store';

const Tab = createMaterialTopTabNavigator();

interface TabScreenProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
}

// Tab screen components
const TabScreen: React.FC<TabScreenProps & { status?: string; userRole?: string }> = React.memo(({ tasks, isLoading, onRefresh, status, userRole }) => {
  
  const getEmptyMessage = () => {
    switch (status) {
      case 'open':
        return 'No open tasks available';
      case 'assigned':
        return 'No tasks assigned to you';
      case 'accepted':
        return 'No accepted offers yet';
      case 'completed':
        return 'No completed tasks yet';
      case 'overdue':
        return 'No overdue tasks';
      case 'cancelled':
        return 'No cancelled tasks';
      default:
        return 'No tasks found';
    }
  };

  const handleTaskCancelled = useCallback((taskId: string) => {
    console.log('📋 Task cancelled:', taskId);
    console.log('   Refreshing task list to move task to Cancelled tab');
    // Refresh the task list to update the UI
    onRefresh();
  }, [onRefresh]);

  const handleTaskDeleted = useCallback((taskId: string) => {
    console.log('🗑️ Task deleted:', taskId);
    console.log('   Refreshing task list to remove task');
    // Refresh the task list to update the UI
    onRefresh();
  }, [onRefresh]);

  // FIX: Don't show empty state while loading - prevents layout shifts
  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.tabContent}>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.tabContent} pointerEvents="auto">
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            status={status}
            userRole={userRole}
            onPress={(taskId: string) => {
              console.log('👁️ Navigating to task-detail with taskId:', taskId);
              console.log('   Task data:', item);
              // Navigate to task detail screen to view task and make offers
              router.push({
                pathname: '/task-detail',
                params: {
                  taskId: taskId
                }
              } as any);
            }}
            onTaskCancelled={handleTaskCancelled}
            onTaskDeleted={handleTaskDeleted}
          />
        )}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.emptyListContent}>
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
});

TabScreen.displayName = 'TabScreen';

export default function MyTasksScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState('Tasker'); // 'Tasker' or 'Poster'
  const [searchText, setSearchText] = useState('');
  const [isRoleSwitching, setIsRoleSwitching] = useState(false); // FIX: Track role switching
  
  // Get current user from auth store
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id || currentUser?._id;
  
  // Get navigation params
  const params = useLocalSearchParams<{ role?: string; tab?: string }>();

  // Set initial role and tab based on navigation params
  useEffect(() => {
    if (params.role === 'Poster') {
      console.log('🎯 Setting userRole to Poster from navigation params');
      setUserRole('Poster');
    }
    if (params.tab) {
      console.log('🎯 Navigation requested tab:', params.tab);
      // The tab will be handled by the Tab.Navigator's initialRouteName if needed
    }
  }, [params.role, params.tab]);

  // Handle route parameters to set initial role
  useEffect(() => {
    if (params.role === 'Poster') {
      console.log('📋 Setting user role to Poster from route params');
      setUserRole('Poster');
    }
  }, [params.role]);

  // FIX: Log when screen mounts to verify layout is ready
  useEffect(() => {
    console.log('✅ My Tasks screen mounted and ready for interaction');
  }, []);

  // Get real notification count from API
  const { data: unreadCountData } = useUnreadCount();
  const notificationCount = (unreadCountData as any)?.unreadCount || 0;

  // Fetch real data from API
  const {
    data: myTasksData,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useGetMyTasks({
    section: 'all-tasks'
  });

  const {
    data: myOffersData,
    isLoading: isLoadingOffers,
    refetch: refetchOffers,
  } = useGetAllOffers({});

  // Also keep useGetMyOffers for legacy support
  const {
    data: legacyOffersData,
    isLoading: isLoadingLegacyOffers,
  } = useGetMyOffers({
    section: 'all-tasks'
  });

  // For Tasker role: Fetch ALL system tasks to show available tasks from other users
  const {
    data: allSystemTasksData,
    isLoading: isLoadingAllTasks,
    refetch: refetchAllTasks,
  } = useGetAllTasks();

  // Dummy data for Cancelled tab (Tasker role)
  const dummyCancelledTasks: Task[] = [
    {
      _id: 'cancelled-1',
      title: 'House Cleaning Service',
      categories: ['Cleaning'],
      dateType: 'specific',
      dateRange: {
        start: '2025-11-05T00:00:00.000Z',
        end: '2025-11-05T23:59:59.999Z',
      },
      time: 'Morning',
      location: {
        address: 'Kandy',
        coordinates: {},
      },
      details: 'Deep cleaning required for 3 bedroom house',
      budget: 3500,
      currency: 'LKR',
      images: [],
      status: 'cancelled',
      createdBy: {
        _id: 'poster-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        rating: 4.2,
        email: 'sarah@example.com',
      },
      statusHistory: [],
      createdAt: '2025-11-01T10:00:00.000Z',
      updatedAt: '2025-11-04T10:00:00.000Z',
      __v: 0,
      formattedBudget: 'LKR 3500',
    },
    {
      _id: 'cancelled-2',
      title: 'Furniture Assembly',
      categories: ['Handyman'],
      dateType: 'specific',
      dateRange: {
        start: '2025-11-08T00:00:00.000Z',
        end: '2025-11-08T23:59:59.999Z',
      },
      time: 'Afternoon',
      location: {
        address: 'Galle',
        coordinates: {},
      },
      details: 'Need help assembling IKEA furniture - wardrobe and bed frame',
      budget: 2800,
      currency: 'LKR',
      images: [],
      status: 'cancelled',
      createdBy: {
        _id: 'poster-2',
        firstName: 'Michael',
        lastName: 'Brown',
        rating: 4.6,
        email: 'michael@example.com',
      },
      statusHistory: [],
      createdAt: '2025-11-02T10:00:00.000Z',
      updatedAt: '2025-11-06T10:00:00.000Z',
      __v: 0,
      formattedBudget: 'LKR 2800',
    },
  ];

  // Dummy data for Accepted Offers tab
  const dummyAcceptedOffers: Task[] = [
    {
      _id: 'dummy-1',
      title: 'Good Task 1',
      categories: ['General'],
      dateType: 'specific',
      dateRange: {
        start: '2025-10-25T00:00:00.000Z',
        end: '2025-10-25T23:59:59.999Z',
      },
      time: 'Afternoon',
      location: {
        address: 'Colombo to Negombo',
        coordinates: {},
      },
      details: 'Need help with moving items from Colombo to Negombo',
      budget: 1200,
      currency: 'LKR',
      images: [],
      status: 'In Progress',
      createdBy: {
        _id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        rating: 4.5,
        email: 'john@example.com',
      },
      statusHistory: [],
      createdAt: '2025-10-20T10:00:00.000Z',
      updatedAt: '2025-10-25T10:00:00.000Z',
      __v: 0,
      formattedBudget: 'LKR 1200',
    },
    {
      _id: 'dummy-2',
      title: 'Good Task 2',
      categories: ['Appliance Installation & Repair'],
      dateType: 'specific',
      dateRange: {
        start: '2025-10-22T00:00:00.000Z',
        end: '2025-10-22T23:59:59.999Z',
      },
      time: 'Evening',
      location: {
        address: 'Colombo',
        coordinates: {},
      },
      details: 'Need to install and repair washing machine',
      budget: 5600,
      currency: 'LKR',
      images: [],
      status: 'Open',
      createdBy: {
        _id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        rating: 4.8,
        email: 'jane@example.com',
      },
      statusHistory: [],
      createdAt: '2025-10-15T10:00:00.000Z',
      updatedAt: '2025-10-22T10:00:00.000Z',
      __v: 0,
      formattedBudget: 'LKR 5600',
    },
  ];

  // Use different data sources based on user role
  // For Tasker: Use all system tasks to show available tasks from other users
  // For Poster: Use own tasks to show posted tasks
  const allTasks = userRole === 'Tasker' 
    ? (allSystemTasksData?.data || []) 
    : (myTasksData?.data || []);
  const allOffers = myOffersData?.data || [];
  const isLoading = userRole === 'Tasker' 
    ? (isLoadingTasks || isLoadingOffers || isLoadingAllTasks)
    : (isLoadingTasks || isLoadingOffers);

  // Debug logging for API data
  console.log('📊 My Tasks Screen Data:', {
    userRole,
    dataSource: userRole === 'Tasker' ? 'All System Tasks' : 'My Tasks Only',
    totalTasks: allTasks.length,
    totalOffers: allOffers.length,
    isLoadingTasks,
    isLoadingOffers,
    isLoadingAllTasks: userRole === 'Tasker' ? isLoadingAllTasks : 'N/A',
    sampleTasks: allTasks.slice(0, 3).map(t => ({ 
      id: t._id, 
      title: t.title, 
      status: t.status,
      createdBy: t.createdBy?._id || 'unknown',
      currentUserId: currentUserId,
      isMyTask: t.createdBy?._id === currentUserId,
      offersArray: t.offers?.length || 0,
      offerCount: t.offerCount || 0,
      hasOffers: !!(t.offers?.length || t.offerCount)
    }))
  });

  // Debug logging for offers data structure
  console.log('🤝 My Offers Data Structure:', {
    totalOffers: allOffers.length,
    sampleOffers: allOffers.slice(0, 3).map((offer: any) => ({
      id: offer._id || offer.id,
      status: offer.status,
      taskId: offer.taskId || offer.task?._id,
      hasTask: !!offer.task,
      taskTitle: offer.task?.title,
      taskStatus: offer.task?.status,
      offerAmount: offer.offer?.amount || offer.amount,
      fullStructure: JSON.stringify(offer, null, 2).substring(0, 200) + '...'
    })),
    acceptedOffers: allOffers.filter((offer: any) => offer.status === 'accepted').map((offer: any) => ({
      id: offer._id || offer.id,
      taskTitle: offer.task?.title,
      taskStatus: offer.task?.status,
      offerStatus: offer.status
    }))
  });

  // Categorize tasks and offers based on status and user role
  const categorizedData = useMemo(() => {
    // Helper function to sort tasks by creation date (newest first)
    const sortByCreatedDate = (tasks: Task[]) => {
      return [...tasks].sort((a: Task, b: Task) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    };

    // Helper function to filter tasks by search text
    const filterBySearch = (tasks: Task[]) => {
      const searchLower = searchText.toLowerCase().trim();
      if (!searchLower) return tasks;
      
      return tasks.filter((task: Task) => {
        // Search in title
        if (task.title?.toLowerCase().includes(searchLower)) return true;
        
        // Search in location
        if (task.location?.address?.toLowerCase().includes(searchLower)) return true;
        
        // Search in categories
        if (task.categories?.some(cat => cat.toLowerCase().includes(searchLower))) return true;
        
        // Search in details/description
        if (task.details?.toLowerCase().includes(searchLower)) return true;
        
        return false;
      });
    };

    // For Tasker role - show available tasks and their offer status
    if (userRole === 'Tasker') {

const openTasksFiltered = allTasks.filter((task: Task) => {
  // Must be open/active - tasks available for bidding
  const isOpenStatus = task.status === 'open' || task.status === 'active';
  
  // Must NOT be created by current user (can't bid on own tasks)
  const isNotMyTask = currentUserId ? task.createdBy?._id !== currentUserId : true;
  
  // Debug logging for filtering
  const shouldInclude = isOpenStatus && isNotMyTask;
  if (allTasks.length <= 5) { // Only log for small datasets to avoid spam
    console.log('🔍 Tasker Open Tasks Filter:', {
      taskId: task._id,
      title: task.title,
      status: task.status,
      createdBy: task.createdBy?._id,
      currentUserId,
      isOpenStatus,
      isNotMyTask,
      shouldInclude
    });
  }
  
  // For Tasker Open Tasks: Show ALL open tasks they can bid on (regardless of existing offers)
  return shouldInclude;
});

      // Process and sort the open tasks
      const openTasks = sortByCreatedDate(filterBySearch(openTasksFiltered));

      // Debug log the final result for Tasker Open Tasks
      console.log('🎯 Tasker Open Tasks Final Result:', {
        totalSystemTasks: allTasks.length,
        filteredOpenTasks: openTasksFiltered.length,
        finalOpenTasks: openTasks.length,
        currentUserId,
        taskSample: openTasks.slice(0, 2).map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          createdBy: t.createdBy?._id
        }))
      });

      
      // Todo Tasks: Tasks where their offers have been accepted and are in progress
      const todoTasks = filterBySearch(
        allOffers.filter((offer: any) => 
          offer.status === 'accepted' && 
          (offer.task?.status === 'assigned' || offer.task?.status === 'in_progress' || offer.task?.status === 'accepted')
        ).map((offer: any) => offer.task).filter(Boolean)
      );
      
      const completedTasks = filterBySearch(
        allOffers.filter((offer: any) => 
          offer.task?.status === 'completed'
        ).map((offer: any) => offer.task).filter(Boolean)
      );
      
      const overdueTasks = filterBySearch(
        allOffers.filter((offer: any) => 
          offer.task?.status === 'overdue'
        ).map((offer: any) => offer.task).filter(Boolean)
      );
      
      // Cancelled Tasks: Combine tasks from offers and all tasks that are cancelled
      const cancelledTasksFromOffers = allOffers.filter((offer: any) => 
        offer.task?.status === 'cancelled'
      ).map((offer: any) => offer.task).filter(Boolean);
      
      const cancelledTasksFromAll = allTasks.filter((task: Task) => 
        task.status === 'cancelled'
      );
      
      // Merge and deduplicate cancelled tasks by _id
      const allCancelledTasks = [...cancelledTasksFromOffers, ...cancelledTasksFromAll];
      const uniqueCancelledTasks = Array.from(
        new Map(allCancelledTasks.map(task => [task._id, task])).values()
      );
      
      const sortedCancelledTasks = sortByCreatedDate(uniqueCancelledTasks);
      
      // Use real cancelled tasks if available, otherwise use dummy data
      const baseCancelledTasks = sortedCancelledTasks.length > 0 
        ? sortedCancelledTasks 
        : dummyCancelledTasks;
      
      const finalCancelledTasks = filterBySearch(baseCancelledTasks);
      
      console.log('📋 Tasker Cancelled Tasks:', {
        fromOffers: cancelledTasksFromOffers.length,
        fromAllTasks: cancelledTasksFromAll.length,
        uniqueTotal: uniqueCancelledTasks.length,
        finalCount: finalCancelledTasks.length
      });
      
      return {
        openTasks,
        todoTasks,
        completedTasks,
        overdueTasks,
        cancelledTasks: finalCancelledTasks,
        postedTasks: [],
        acceptedTasks: [],
      };
    }
    
    // For Poster role - filter based on tasks posted by current user
    const openTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'open' || task.status === 'active'
        )
      )
    );
    
    // Debug: Log sorting for Open Tasks
    if (openTasks.length > 0) {
      console.log('📋 Open Tasks sorted by date:', openTasks.map(t => ({
        title: t.title,
        createdAt: t.createdAt,
        date: new Date(t.createdAt).toLocaleDateString()
      })));
    }
    
    const todoTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'assigned' || task.status === 'in_progress'
        )
      )
    );
    
    const completedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'completed'
        )
      )
    );
    
    const overdueTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'overdue'
        )
      )
    );
    
    const cancelledTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'cancelled'
        )
      )
    );
    
    // If no cancelled tasks from API, use dummy data
    const baseCancelledTasksForPoster = cancelledTasks.length > 0 ? cancelledTasks : dummyCancelledTasks;
    const finalCancelledTasks = filterBySearch(baseCancelledTasksForPoster);

    // For Poster role - tasks they've posted (sorted by creation date, newest first)
    const postedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => 
          task.status === 'open' || task.status === 'active' || task.status === 'assigned'
        )
      )
    );

    // For accepted offers - find tasks that have been paid for and accepted
    // These are tasks with status 'todo' and have an acceptedOffer or assignedTo
    const acceptedTasks = allTasks.filter((task: Task) => {
      const hasAcceptedOffer = task.status === 'todo' && 
                              ((task as any).acceptedOffer || (task as any).assignedTo);
      
      // For Poster role: Only show accepted offers for tasks they created
      let isUsersTask = true;
      if (userRole === 'Poster' && currentUserId) {
        isUsersTask = task.createdBy?._id === currentUserId;
      }
      
      console.log(`🔍 Task ${task._id} accepted filter check:`, {
        title: task.title,
        status: task.status,
        hasAcceptedOffer: !!(task as any).acceptedOffer,
        hasAssignedTo: !!(task as any).assignedTo,
        taskCreatorId: task.createdBy?._id,
        currentUserId,
        isUsersTask,
        shouldInclude: hasAcceptedOffer && isUsersTask
      });
      
      return hasAcceptedOffer && isUsersTask;
    });
    
    console.log('🎯 Processing Accepted Tasks for Poster:', {
      totalTasks: allTasks.length,
      acceptedTasksCount: acceptedTasks.length,
      acceptedTasksSample: acceptedTasks.slice(0, 2).map((task: any) => ({
        taskId: task._id,
        title: task.title,
        status: task.status,
        hasAcceptedOffer: !!task.acceptedOffer,
        hasAssignedTo: !!task.assignedTo,
        paymentIntentId: task.paymentIntentId
      }))
    });
    
    const finalAcceptedTasks = sortByCreatedDate(filterBySearch(acceptedTasks));
    
    console.log('✅ Final Accepted Tasks for Poster:', {
      count: finalAcceptedTasks.length,
      tasks: finalAcceptedTasks.map(task => ({
        id: task._id,
        title: task.title,
        status: task.status
      }))
    });

    return {
      openTasks,
      todoTasks,
      completedTasks,
      overdueTasks,
      cancelledTasks: finalCancelledTasks,
      postedTasks,
      acceptedTasks: finalAcceptedTasks,
    };
  }, [allTasks, allOffers, dummyCancelledTasks, userRole, searchText, currentUserId]);

  // Debug log categorized data counts
  console.log(`📋 Categorized Data for ${userRole}:`, {
    openTasks: categorizedData.openTasks.length,
    todoTasks: categorizedData.todoTasks.length,
    completedTasks: categorizedData.completedTasks.length,
    postedTasks: categorizedData.postedTasks.length,
    acceptedTasks: categorizedData.acceptedTasks.length,
  });

  const handleRefresh = useCallback(() => {
    refetchTasks();
    refetchOffers();
    refetchAllTasks(); // Also refresh all system tasks for Tasker view
  }, [refetchTasks, refetchOffers, refetchAllTasks]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 My Tasks screen focused, refreshing data...');
      // Force refresh all data sources to ensure we get the latest offers after payment
      handleRefresh();
      
      // Additional refresh after a small delay to catch any async updates
      const delayedRefresh = setTimeout(() => {
        console.log('🔄 Delayed refresh for latest data...');
        handleRefresh();
      }, 1000);

      return () => {
        clearTimeout(delayedRefresh);
      };
    }, [handleRefresh])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <MyTasksHeader
        notificationCount={notificationCount}
        onSearchPress={() => setSearchVisible(true)}
        onNotificationPress={() => setShowNotifications(true)}
      />

      {/* Search Bar */}
      <SearchBar 
        visible={searchVisible}
        searchText={searchText}
        onChangeText={setSearchText}
        onClose={() => setSearchVisible(false)}
      />

      {/* Search Results Info */}
      {searchText.trim().length > 0 && !searchVisible && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            Searching for &quot;{searchText}&quot;
          </Text>
          <TouchableOpacity onPress={() => {
            setSearchText('');
            setSearchVisible(false);
          }}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Role Selector */}
      <View style={styles.roleSelectorContainer}>
        <TouchableOpacity
          style={[styles.roleButton, userRole === 'Tasker' && styles.activeRole]}
          onPress={() => {
            setIsRoleSwitching(true);
            setUserRole('Tasker');
            // FIX: Allow Tab.Navigator to initialize before enabling interactions
            setTimeout(() => setIsRoleSwitching(false), 150);
          }}
        >
          <Text style={[styles.roleText, userRole === 'Tasker' && styles.activeRoleText]}>Tasker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, userRole === 'Poster' && styles.activeRole]}
          onPress={() => {
            setIsRoleSwitching(true);
            setUserRole('Poster');
            // FIX: Allow Tab.Navigator to initialize before enabling interactions
            setTimeout(() => setIsRoleSwitching(false), 150);
          }}
        >
          <Text style={[styles.roleText, userRole === 'Poster' && styles.activeRoleText]}>Poster</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation - Key prop forces proper remount when role changes */}
      <View style={{ flex: 1 }} pointerEvents={isRoleSwitching ? 'none' : 'auto'}>
        <Tab.Navigator
          key={`tab-nav-${userRole}`}
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: { 
              fontSize: 12, 
              fontWeight: '600',
              textTransform: 'none'
            },
            tabBarStyle: { 
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            },
            tabBarIndicatorStyle: { 
              backgroundColor: '#007AFF', 
              height: 2 
            },
            tabBarPressColor: '#e3f2fd',
            tabBarPressOpacity: 0.8,
            swipeEnabled: true,
            animationEnabled: true,
            lazy: false, // FIX: Disable lazy loading to ensure all tabs render immediately
            lazyPreloadDistance: 0,
            tabBarScrollEnabled: true
          }}
        >
        {userRole === 'Tasker' ? (
          <>
            <Tab.Screen
              name="OpenTasks"
              options={{ tabBarLabel: 'Open Tasks' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.openTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="open"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="TodooTasks"
              options={{ tabBarLabel: 'Todoo Tasks' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.todoTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="assigned"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Completed"
              options={{ tabBarLabel: 'Completed' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.completedTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="completed"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Overdue"
              options={{ tabBarLabel: 'Overdue' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.overdueTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="overdue"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Cancelled"
              options={{ tabBarLabel: 'Cancelled' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.cancelledTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="cancelled"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
          </>
        ) : (
          <>
            <Tab.Screen
              name="PostedTasks"
              options={{ tabBarLabel: 'Posted' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.postedTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="AcceptedOffers"
              options={{ tabBarLabel: 'Accepted' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.acceptedTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="accepted"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Completed"
              options={{ tabBarLabel: 'Completed' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.completedTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="completed"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="OverduePoster"
              options={{ tabBarLabel: 'Overdue' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.overdueTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="overdue"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Cancelled"
              options={{ tabBarLabel: 'Cancelled' }}
            >
              {() => (
                <TabScreen
                  tasks={categorizedData.cancelledTasks}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  status="cancelled"
                  userRole={userRole}
                />
              )}
            </Tab.Screen>
          </>
        )}
      </Tab.Navigator>
      </View>

      {/* Notification Modal - Only render when visible to prevent blocking touches */}
      {showNotifications && (
        <NotificationModal
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
    backgroundColor: '#fff',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContent: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeRole: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeRoleText: {
    color: '#fff',
  },
  searchResultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#d0e8ff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});