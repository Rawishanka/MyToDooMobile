import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Platform, View } from 'react-native';

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

// Get screen width for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE and smaller
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 70;
const ICON_SIZE = isSmallDevice ? 18 : 22;
const FONT_SIZE = isSmallDevice ? 8 : 10;

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
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { 
          height: TAB_BAR_HEIGHT, 
          paddingBottom: Platform.OS === 'ios' ? 25 : 10, 
          paddingTop: 5,
          paddingHorizontal: isSmallDevice ? 2 : 5,
        },
        tabBarItemStyle: { 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingVertical: isSmallDevice ? 3 : 5,
          minWidth: isSmallDevice ? 60 : 70,
        },
        tabBarLabelStyle: { 
          fontSize: FONT_SIZE, 
          fontWeight: '500',
          textAlign: 'center',
          marginTop: 2,
          includeFontPadding: false,
          paddingHorizontal: 0,
        },
        tabBarAllowFontScaling: false,
        tabBarIcon: ({ color, focused }) => {
          const iconSize = ICON_SIZE;
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
      <Tab.Screen name="index" component={GetItDone} options={{ tabBarLabel: 'Get Done' }} />
      <Tab.Screen name="browse" component={BrowseStack} options={{ tabBarLabel: 'Browse' }} />
      <Tab.Screen name="my-tasks" component={MyTasks} options={{ tabBarLabel: 'My Tasks' }} />
      <Tab.Screen name="message" component={MessageScreen} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="account" component={Account} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}
