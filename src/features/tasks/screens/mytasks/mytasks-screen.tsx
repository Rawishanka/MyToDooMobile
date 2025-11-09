import { Task } from '@/src/api/types/tasks';
import { useGetMyOffers, useGetMyTasks } from '@/src/shared/hooks/useTaskApi';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
const TabScreen: React.FC<TabScreenProps & { status?: string }> = ({ tasks, isLoading, onRefresh, status }) => {
  
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

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            status={status}
            onPress={(taskId: string) => {
              console.log('Navigating to edit-task with taskId:', taskId);
              router.push(`/edit-task?taskId=${taskId}` as any);
            }}
          />
        )}
        contentContainerStyle={[
          styles.flatListContent,
          tasks.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <View style={styles.emptyListContent}>
              <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

export default function MyTasksScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState('Tasker'); // 'Tasker' or 'Poster'
  const [searchText, setSearchText] = useState('');

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
  const allOffers = myOffersData?.data || [];
  const isLoading = isLoadingTasks || isLoadingOffers;

  // Debug logging for API data
  console.log('📊 My Tasks Screen Data:', {
    totalTasks: allTasks.length,
    totalOffers: allOffers.length,
    isLoadingTasks,
    isLoadingOffers,
    userRole
  });

  // Categorize tasks and offers based on status
  const categorizedData = useMemo(() => {
    const openTasks = allTasks.filter((task: Task) => 
      task.status === 'open' || task.status === 'active'
    );
    
    const todoTasks = allTasks.filter((task: Task) => 
      task.status === 'assigned' || task.status === 'in_progress'
    );
    
    const completedTasks = allTasks.filter((task: Task) => 
      task.status === 'completed'
    );
    
    const overdueTasks = allTasks.filter((task: Task) => 
      task.status === 'overdue'
    );
    
    const cancelledTasks = allTasks.filter((task: Task) => 
      task.status === 'cancelled'
    );

    // For Poster role - tasks they've posted
    const postedTasks = allTasks.filter((task: Task) => 
      task.status === 'open' || task.status === 'active' || task.status === 'assigned'
    );

    // For accepted offers - offers that have been accepted
    const acceptedTasks = allOffers.filter((offer: any) => 
      offer.status === 'accepted'
    );
    
    // If no accepted offers from API, use dummy data
    const finalAcceptedTasks = acceptedTasks.length > 0 ? acceptedTasks : dummyAcceptedOffers;

    return {
      openTasks,
      todoTasks,
      completedTasks,
      overdueTasks,
      cancelledTasks,
      postedTasks,
      acceptedTasks: finalAcceptedTasks,
    };
  }, [allTasks, allOffers, dummyAcceptedOffers]);

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
          onPress={() => setUserRole('Tasker')}
        >
          <Text style={[styles.roleText, userRole === 'Tasker' && styles.activeRoleText]}>Tasker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, userRole === 'Poster' && styles.activeRole]}
          onPress={() => setUserRole('Poster')}
        >
          <Text style={[styles.roleText, userRole === 'Poster' && styles.activeRoleText]}>Poster</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <Tab.Navigator
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
          lazy: true,
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
                />
              )}
            </Tab.Screen>
          </>
        )}
      </Tab.Navigator>

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
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContent: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
