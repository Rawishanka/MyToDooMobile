import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens from features
import GetItDoneScreen from '@/src/features/dashboard/screens/welcome-screen';
import PrivateMessagesScreen from '@/src/features/messages/screens/message-screen';
import AccountScreen from '@/src/features/profile/screens/profile-screen';
import BrowseTasksScreen from '@/src/features/tasks/screens/browse/browse-screen';
import TaskDetailScreen from '@/src/features/tasks/screens/detail/task-detail-screen';
import MyTasksScreen from '@/src/features/tasks/screens/mytasks/mytasks-screen';
import MakeOfferScreen from '@/src/features/tasks/screens/offers/make-offer-screen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create a stack navigator for Browse tab to handle task details
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseList" component={BrowseTasksScreen} />
      <Stack.Screen name="task-detail" component={TaskDetailScreen} />
      <Stack.Screen name="make-offer-screen" component={MakeOfferScreen} />
    </Stack.Navigator>
  );
}

function GetItDone() {
  return <GetItDoneScreen />;
}

function MyTasks() {
  return <MyTasksScreen />;
}

function MessageScreen() {
  return <PrivateMessagesScreen />;
}

function Account() {
  return <AccountScreen />;
}

export default function TabNavigator() {
  // Don't check auth here - let individual screens handle auth if needed
  // This prevents unwanted redirects during navigation
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          height: 60 + insets.bottom, 
          paddingBottom: Math.max(insets.bottom, 8), 
          paddingTop: 6 
        },
        tabBarItemStyle: { 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingVertical: 5 
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '500',
          textAlign: 'center',
          marginTop: 2
        },
        tabBarIcon: ({ color, focused }) => {
          const iconSize = 20;
          const iconColor = focused ? '#007bff' : '#666';
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
              {route.name === 'index' && (
                <FontAwesome name="check" size={iconSize} color={iconColor} />
              )}
              {route.name === 'browse' && (
                <Ionicons name="search" size={iconSize} color={iconColor} />
              )}
              {route.name === 'my-tasks' && (
                <Ionicons name="clipboard-outline" size={iconSize} color={iconColor} />
              )}
              {route.name === 'message' && (
                <Entypo name="chat" size={iconSize} color={iconColor} />
              )}
              {route.name === 'account' && (
                <FontAwesome name="user-circle-o" size={iconSize} color={iconColor} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="index" component={GetItDone} options={{ tabBarLabel: 'Get it done' }} />
      <Tab.Screen name="browse" component={BrowseStack} options={{ tabBarLabel: 'Browse' }} />
      <Tab.Screen name="my-tasks" component={MyTasks} options={{ tabBarLabel: 'My tasks' }} />
      <Tab.Screen name="message" component={MessageScreen} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="account" component={Account} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}
