import { Task } from '@/src/api/types/tasks';
import { useGetMyOffers, useGetMyTasks } from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Components
import {
  LoadingState,
  MyTasksHeader,
  SearchModal,
  TaskCard,
} from './components';

// Notification Modal
import NotificationModal from '@/src/features/messages/screens/notification-screen-api';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';

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
        return userRole === 'Tasker' 
          ? 'No tasks where you made offers are still open'
          : 'No open tasks available';
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
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?._id || currentUser?.id;
  
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
  } = useGetMyOffers({
    section: 'all-tasks'
  });

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

  const allTasks = myTasksData?.data || [];
  
  // Extract all offers from all tasks (both myTasksData and myOffersData)
  const allTasksWithOffers = [...allTasks, ...(myOffersData?.data || [])];
  const allOffers: any[] = [];
  
  allTasksWithOffers.forEach((task: Task) => {
    if (task.offers && Array.isArray(task.offers)) {
      task.offers.forEach((offer: any) => {
        // Add task reference to each offer for easy matching
        allOffers.push({
          ...offer,
          task: task, // Add full task data to the offer
          taskId: offer.taskId || task._id // Ensure taskId is available
        });
      });
    }
  });
  
  const isLoading = isLoadingTasks || isLoadingOffers;

  // Debug logging for API data
  console.log('📊 My Tasks Screen Data:', {
    totalTasks: allTasks.length,
    totalOffers: allOffers.length,
    isLoadingTasks,
    isLoadingOffers,
    userRole,
    sampleTasks: allTasks.slice(0, 2).map(t => ({ 
      id: t._id, 
      title: t.title, 
      status: t.status, 
      offersArray: t.offers?.length || 0,
      offerCount: t.offerCount || 0,
      hasOffers: !!(t.offers?.length || t.offerCount)
    })),
    sampleOffers: allOffers.slice(0, 3).map(o => ({
      id: o._id,
      taskId: o.taskId,
      taskTakerId: o.taskTakerId?._id,
      amount: o.offer?.amount || o.amount,
      currency: o.offer?.currency || o.currency
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

    // For Tasker role - show only tasks where current user has made offers (NOT tasks posted by user)
    if (userRole === 'Tasker') {
      console.log('📋 Filtering tasks for Tasker role. Current user ID:', currentUserId);
      console.log('📋 Available offers count:', allOffers.length);
      
      // Get tasks where current user made offers by filtering offers first
      const myOffers = allOffers.filter((offer: any) => {
        const isMyOffer = offer.taskTakerId?._id === currentUserId;
        console.log(`Offer by ${offer.taskTakerId?._id}, isMyOffer: ${isMyOffer}, currentUserId: ${currentUserId}`);
        return isMyOffer;
      });
      
      console.log(`📋 Found ${myOffers.length} offers made by current user`);
      
      // Extract tasks from these offers - use the task reference we added earlier
      const tasksWhereIOffered = myOffers.map((offer: any) => {
        // Use the task reference we added, or fallback to finding it by ID
        return offer.task || allTasksWithOffers.find((task: Task) => task._id === (offer.taskId?._id || offer.taskId));
      }).filter((task): task is Task => task !== undefined); // Type guard to filter out undefined
      
      console.log(`📋 Found ${tasksWhereIOffered.length} complete tasks where user made offers`);
      
      // Open Tasks: Tasks where I made offers and task is still open
      const openTasks = sortByCreatedDate(
        tasksWhereIOffered.filter((task: Task) => {
          const isOpenStatus = task.status === 'open' || task.status === 'active';
          console.log(`Task "${task.title}" - Status: ${task.status}, IsOpen: ${isOpenStatus}`);
          return isOpenStatus;
        })
      );
      
      // Todo Tasks: Tasks where my offer was accepted and task is assigned/in-progress  
      const todoTasks = sortByCreatedDate(
        tasksWhereIOffered.filter((task: Task) => {
          const isAssignedStatus = task.status === 'assigned' || task.status === 'in_progress' || task.status === 'accepted';
          return isAssignedStatus;
        })
      );
      
      // Completed Tasks: Tasks where my offer was accepted and task is completed
      const completedTasks = sortByCreatedDate(
        tasksWhereIOffered.filter((task: Task) => task.status === 'completed')
      );
      
      // Overdue Tasks: Tasks where my offer was accepted and task is overdue
      const overdueTasks = sortByCreatedDate(
        tasksWhereIOffered.filter((task: Task) => task.status === 'overdue')
      );
      
      // Cancelled Tasks: Tasks where my offer was involved and task was cancelled
      const cancelledTasks = sortByCreatedDate(
        tasksWhereIOffered.filter((task: Task) => task.status === 'cancelled')
      );
      
      // Use real cancelled tasks if available, otherwise use dummy data
      const finalCancelledTasks = cancelledTasks.length > 0 ? cancelledTasks : dummyCancelledTasks;
      
      console.log(`📋 Tasker Tasks Summary (offers I made):`, {
        openTasks: openTasks.length,
        todoTasks: todoTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        cancelledTasks: finalCancelledTasks.length,
        totalMyOffers: myOffers.length,
        tasksFound: tasksWhereIOffered.length,
        currentUserId
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
    
    // For Poster role - show only tasks posted by current user
    console.log('📋 Filtering tasks for Poster role. Current user ID:', currentUserId);
    
    // Posted Tasks: All tasks posted by current user  
    const postedTasks = sortByCreatedDate(
      allTasks.filter((task: Task) => {
        const isMyTask = task.createdBy?._id === currentUserId;
        console.log(`Task "${task.title}" - Posted by me: ${isMyTask}, Task creator: ${task.createdBy?._id}, Current user: ${currentUserId}`);
        return isMyTask;
      })
    );
    
    console.log(`📋 Poster Posted Tasks: ${postedTasks.length} tasks posted by current user`);

    // Accepted Tasks: Tasks where offers have been accepted (only user's posted tasks with accepted offers)
    const acceptedTasks = sortByCreatedDate(
      allTasks.filter((task: Task) => {
        const isMyTask = task.createdBy?._id === currentUserId;
        const hasAcceptedOffer = task.status === 'assigned' || task.status === 'accepted' || task.status === 'in_progress';
        return isMyTask && hasAcceptedOffer;
      })
    );
    
    // Completed Tasks: User's posted tasks that are completed
    const completedTasks = sortByCreatedDate(
      allTasks.filter((task: Task) => {
        const isMyTask = task.createdBy?._id === currentUserId;
        return isMyTask && task.status === 'completed';
      })
    );
    
    // Cancelled Tasks: User's posted tasks that are cancelled
    const cancelledTasks = sortByCreatedDate(
      allTasks.filter((task: Task) => {
        const isMyTask = task.createdBy?._id === currentUserId;
        return isMyTask && task.status === 'cancelled';
      })
    );

    // Use real data only - no dummy fallbacks
    console.log('📊 Poster Tasks Summary:', {
      posted: postedTasks.length,
      accepted: acceptedTasks.length, 
      completed: completedTasks.length,
      cancelled: cancelledTasks.length
    });

    return {
      openTasks: [],
      todoTasks: [],
      completedTasks,
      overdueTasks: [],
      cancelledTasks, // Use real data only
      postedTasks,
      acceptedTasks, // Use real data only
    };
  }, [allTasks, allOffers, userRole, currentUserId]);

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
  }, [refetchTasks, refetchOffers]);

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
        notificationCount={notificationCount}
        onSearchPress={() => setSearchVisible(true)}
        onNotificationPress={() => setShowNotifications(true)}
      />

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

      {/* Search Modal - Only render when visible to prevent blocking touches */}
      {searchVisible && (
        <SearchModal
          visible={searchVisible}
          searchText={searchText}
          onClose={() => setSearchVisible(false)}
          onChangeText={setSearchText}
        />
      )}

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
