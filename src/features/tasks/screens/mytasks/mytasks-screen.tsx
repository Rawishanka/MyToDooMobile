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

// Network components
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';

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
    // Refresh the task list to update the UI
    onRefresh();
  }, [onRefresh]);

  const handleTaskDeleted = useCallback((taskId: string) => {
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
              // Navigate to task detail screen to view task and make offers
              router.push({
                pathname: '/task-detail',
                params: {
                  taskId: taskId,
                  fromUserRole: userRole,
                  fromStatus: status
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
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [networkAlertMessage, setNetworkAlertMessage] = useState('');
  
  // Network status monitoring
  const { isConnected } = useNetworkStatus();
  
  // Get current user from auth store
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id || currentUser?._id;
  
  // Get navigation params
  const params = useLocalSearchParams<{ role?: string; tab?: string }>();

  // Set initial role and tab based on navigation params
  useEffect(() => {
    if (params.role === 'Poster') {
      setUserRole('Poster');
    }
    if (params.tab) {
      // The tab will be handled by the Tab.Navigator's initialRouteName if needed
    }
  }, [params.role, params.tab]);

  // Handle route parameters to set initial role
  useEffect(() => {
    if (params.role === 'Poster') {
      setUserRole('Poster');
    }
  }, [params.role]);

  // FIX: Log when screen mounts to verify layout is ready
  useEffect(() => {
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

  // For Tasker role: Get tasks assigned to current user (after offer accepted & paid)
  // This uses /api/tasks/my-tasks?role=tasker endpoint which returns tasks assigned to user
  const {
    data: taskerAssignedTasksData,
    isLoading: isLoadingTaskerTasks,
    refetch: refetchTaskerTasks,
  } = useGetMyTasks({
    role: 'tasker',
    section: 'all-tasks'
  });
  
  // For Tasker Open Tasks: Get user's offers to filter tasks
  // This uses /api/tasks/my-offers endpoint which returns offers made by user
  const {
    data: myOffersData,
    isLoading: isLoadingMyOffers,
    refetch: refetchMyOffers,
  } = useGetMyOffers({
    section: 'all-tasks'
  });
  
  // Also get all offers for additional data (for Poster view)
  const {
    data: allOffersData,
    isLoading: isLoadingAllOffers,
    refetch: refetchAllOffers,
  } = useGetAllOffers({
    limit: 100
  });

  // For Tasker role: Fetch ALL system tasks to show available tasks from other users
  const {
    data: allSystemTasksData,
    isLoading: isLoadingAllTasks,
    refetch: refetchAllTasks,
  } = useGetAllTasks();

  // Removed hardcoded dummy cancelled tasks - only show real user cancelled tasks from API

  // Note: dummyAcceptedOffers removed - using real data from API

  // Use different data sources based on user role
  // For Tasker: Use all system tasks to show available tasks from other users
  // For Poster: Use own tasks to show posted tasks
  const allTasks = React.useMemo(() => {
    return userRole === 'Tasker' 
      ? (allSystemTasksData?.data || []) 
      : (myTasksData?.data || []);
  }, [userRole, allSystemTasksData?.data, myTasksData?.data]);
  
  // For Tasker: Use tasks from my-offers endpoint (tasks where user made offers)
  // For Poster: Use all offers data
  const taskerAssignedTasks = React.useMemo(() => {
    return taskerAssignedTasksData?.data || [];
  }, [taskerAssignedTasksData?.data]);
  
  // For Tasker: Extract offers data and create a map of taskIds where user has made offers
  const myOffers = React.useMemo(() => {
    return myOffersData?.data || [];
  }, [myOffersData?.data]);
  
  // Create a map of taskId -> offer for quick lookup in Open Tasks filter
  const myOffersMap = React.useMemo(() => {
    const map = new Map();
    myOffers.forEach((offer: any) => {
      const taskId = offer.taskId?._id || offer.taskId;
      if (taskId) {
        map.set(taskId, offer);
      }
    });
    return map;
  }, [myOffers]);
  
  const allOffers = React.useMemo(() => {
    return allOffersData?.data || [];
  }, [allOffersData?.data]);
  
  const isLoading = userRole === 'Tasker' 
    ? (isLoadingTasks || isLoadingTaskerTasks || isLoadingAllTasks || isLoadingMyOffers)
    : (isLoadingTasks || isLoadingAllOffers);

  // Debug logging for API data

  // Debug logging for offers data structure

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
  
  // Check if user has made an offer on this task
  const myOffer = myOffersMap.get(task._id);
  const hasMyOffer = !!myOffer;
  
  // For Open Tasks: Only show tasks where user has made an offer AND offer is still pending
  const isOfferPending = myOffer?.status === 'pending';
  
  // Debug logging for filtering
  const shouldInclude = isOpenStatus && isNotMyTask && hasMyOffer && isOfferPending;
  if (allTasks.length <= 10) { // Only log for small datasets to avoid spam
  }
  
  // For Tasker Open Tasks: Show ONLY open tasks where user has made a PENDING offer
  return shouldInclude;
});

      // Sort Open Tasks by offer creation date (newest offers first)
      // This ensures newly made offers appear at the top
      const sortedOpenTasks = [...openTasksFiltered].sort((a: Task, b: Task) => {
        const offerA = myOffersMap.get(a._id);
        const offerB = myOffersMap.get(b._id);
        
        // Get offer creation dates
        const dateA = offerA?.createdAt ? new Date(offerA.createdAt).getTime() : 0;
        const dateB = offerB?.createdAt ? new Date(offerB.createdAt).getTime() : 0;
        
        // Sort descending (newest offers first)
        return dateB - dateA;
      });
      
      // Apply search filter after sorting
      const openTasks = filterBySearch(sortedOpenTasks);

      // Debug log the final result for Tasker Open Tasks

      
      // Todo Tasks: Use /api/tasks/my-tasks?role=tasker endpoint which returns tasks assigned to user
      // CRITICAL: Only show tasks where offer was ACCEPTED AND PAID (backend sets assignedTo after payment)
      
      const todoTasksFiltered = taskerAssignedTasks.filter((task: Task) => {
        // IMPORTANT: After payment, backend sets status to "todo", "assigned", or "in_progress"
        // and assigns the task to the tasker (assignedTo field set, userRole = "assignee")
        // We show tasks that are ready to work on (not completed, overdue, or cancelled)
        // NOTE: Tasks with pending cancellation requests keep status until approved
        const isActiveTask = task.status === 'todo' || 
                            task.status === 'assigned' || 
                            task.status === 'in_progress' ||
                            task.status === 'pending_cancellation' || // Backend might add this
                            task.status === 'awaiting_cancellation'; // Backend might add this
        
        // Alternative: Exclude only completed, cancelled, overdue, and open tasks
        const isExcluded = task.status === 'completed' || 
                          task.status === 'cancelled' || 
                          task.status === 'overdue' ||
                          task.status === 'open';
        
        // Verify task is actually assigned to current user (userRole should be 'assignee')
        const isAssignedToMe = (task as any).userRole === 'assignee';
        
        const shouldInclude = !isExcluded && isAssignedToMe;
        
        if (taskerAssignedTasks.length <= 10) {
        }
        
        return shouldInclude;
      });
      
      const todoTasks = sortByCreatedDate(filterBySearch(todoTasksFiltered));
      
      
      const completedTasks = sortByCreatedDate(filterBySearch(
        taskerAssignedTasks.filter((task: Task) => task.status === 'completed')
      ));
      
      const overdueTasks = sortByCreatedDate(filterBySearch(
        taskerAssignedTasks.filter((task: Task) => task.status === 'overdue')
      ));
      
      // Cancelled Tasks: Combine tasks from assigned tasks and all tasks that are cancelled
      const cancelledTasksFromAssigned = taskerAssignedTasks.filter((task: Task) => 
        task.status === 'cancelled'
      );
      
      const cancelledTasksFromAll = allTasks.filter((task: Task) => 
        task.status === 'cancelled'
      );
      
      // Merge and deduplicate cancelled tasks by _id
      const allCancelledTasks = [...cancelledTasksFromAssigned, ...cancelledTasksFromAll];
      const uniqueCancelledTasks = Array.from(
        new Map(allCancelledTasks.map(task => [task._id, task])).values()
      );
      
      const sortedCancelledTasks = sortByCreatedDate(uniqueCancelledTasks);
      
      // Only show real cancelled tasks from API - no dummy data
      const finalCancelledTasks = filterBySearch(sortedCancelledTasks);
      
      
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
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          const isOpenStatus = task.status === 'open' || task.status === 'active';
          return isUsersTask && isOpenStatus;
        })
      )
    );
    
    // Debug: Log sorting for Open Tasks
    if (openTasks.length > 0) {
    }
    
    const todoTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          const isTodoStatus = task.status === 'assigned' || task.status === 'in_progress';
          return isUsersTask && isTodoStatus;
        })
      )
    );
    
    const completedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          return isUsersTask && task.status === 'completed';
        })
      )
    );
    
    const overdueTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          return isUsersTask && task.status === 'overdue';
        })
      )
    );
    
    const cancelledTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          return isUsersTask && task.status === 'cancelled';
        })
      )
    );
    
    // Only show real cancelled tasks from API - no hardcoded dummy data
    const finalCancelledTasks = filterBySearch(cancelledTasks);

    // For Poster role - tasks they've posted (sorted by creation date, newest first)
    // Posted tab shows only PRE-PAYMENT tasks that are waiting for offers
    // Once payment is made, task moves to Accepted tab with status: assigned/accepted/todo/in_progress
    const postedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          // Only show open/active tasks (pre-payment) - NOT assigned (post-payment)
          const isPostedStatus = task.status === 'open' || task.status === 'active';
          return isUsersTask && isPostedStatus;
        })
      )
    );

    // For Poster's Accepted tab - tasks they created that have been accepted/assigned
    // After payment, task status changes to 'assigned', 'in_progress', 'todo', or 'accepted'
    // These tasks should show in the Accepted tab until work is completed
    // NOTE: Tasks with pending cancellation requests keep their original status until approved
    // Only when cancellation is ACCEPTED does status change to 'cancelled' (moves to Cancelled tab)
    const acceptedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          // Check if task is in a post-acceptance state
          // Include ALL post-payment statuses to ensure tasks don't disappear
          const isAcceptedStatus = task.status === 'assigned' || 
                                  task.status === 'in_progress' || 
                                  task.status === 'todo' ||
                                  task.status === 'accepted' ||
                                  task.status === 'pending_cancellation' || // Backend might add this
                                  task.status === 'awaiting_cancellation'; // Backend might add this
          
          // Must be created by current user (Poster)
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          
          // CRITICAL: Exclude only completed, cancelled, and overdue tasks
          // Everything else should stay in Accepted tab
          const isExcluded = task.status === 'completed' || 
                            task.status === 'cancelled' || 
                            task.status === 'overdue' ||
                            task.status === 'open'; // Open = pre-payment, goes in Posted tab
          
          return isUsersTask && !isExcluded;
        })
      )
    );
    

    return {
      openTasks,
      todoTasks,
      completedTasks,
      overdueTasks,
      cancelledTasks: finalCancelledTasks,
      postedTasks,
      acceptedTasks: acceptedTasks,
    };
  }, [allTasks, taskerAssignedTasks, myOffers, myOffersMap, userRole, searchText, currentUserId]);

  // Debug log categorized data counts

  const handleRefresh = useCallback(() => {
    if (!isConnected) {
      setNetworkAlertMessage('You are offline. Please check your internet connection.');
      setShowNetworkAlert(true);
      return;
    }

    refetchTasks();
    refetchTaskerTasks();
    refetchMyOffers();
    refetchAllOffers();
    refetchAllTasks(); // Also refresh all system tasks for Tasker view
  }, [isConnected, refetchTasks, refetchTaskerTasks, refetchMyOffers, refetchAllOffers, refetchAllTasks]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Force refresh all data sources to ensure we get the latest offers after payment
      handleRefresh();
      
      // Additional refresh after a small delay to catch any async updates
      const delayedRefresh = setTimeout(() => {
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

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Notification Modal - Only render when visible to prevent blocking touches */}
      {showNotifications && (
        <NotificationModal
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Network Alert */}
      <NetworkAlert
        visible={showNetworkAlert}
        onClose={() => setShowNetworkAlert(false)}
        message={networkAlertMessage}
        actionText="OK"
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