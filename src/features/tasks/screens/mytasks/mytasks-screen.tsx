import { Task } from '@/src/api/types/tasks';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sampleTasks } from './sample-tasks-new';

// Components
import {
  LoadingState,
  MyTasksHeader,
  SearchModal,
  TaskCard,
} from './components';

// Notification Modal
import NotificationModal from '@/src/features/messages/screens/notification-screen';

const Tab = createMaterialTopTabNavigator();

interface TabScreenProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
}

// Tab screen components
const TabScreen: React.FC<TabScreenProps & { status?: string }> = ({ isLoading, onRefresh, status }) => {
  const tasks = React.useMemo(() => {
    switch (status) {
      case 'open':
        return sampleTasks.openTasks;
      case 'assigned':
        return sampleTasks.todoTasks;
      case 'completed':
        return sampleTasks.completedTasks;
      case 'overdue':
        return sampleTasks.overdueTasks;
      case 'cancelled':
        return sampleTasks.cancelledTasks;
      case 'accepted':
        return sampleTasks.acceptedTasks;
      default:
        return sampleTasks.postedTasks;
    }
  }, [status]);
  
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
        renderItem={({ item }) => <TaskCard task={item} />}
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
  const notificationCount = 5; // You can make this dynamic

  // Use dummy data for now
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
                  tasks={sampleTasks.openTasks}
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
                  tasks={sampleTasks.todoTasks}
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
                  tasks={sampleTasks.completedTasks}
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
                  tasks={sampleTasks.overdueTasks}
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
                  tasks={sampleTasks.cancelledTasks}
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
                  tasks={sampleTasks.postedTasks}
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
                  tasks={sampleTasks.acceptedTasks}
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
                  tasks={sampleTasks.completedTasks}
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
                  tasks={sampleTasks.cancelledTasks}
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
