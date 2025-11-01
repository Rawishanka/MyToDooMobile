// App.js or App.tsx

import { useAuthStore } from '@/store/auth-task-store';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import BrowseTasksScreen from './browse-screen';
import MakeOfferScreen from './make-offer-screen';
import PrivateMessagesScreen from './message-screen';
import MyTasksScreen from './mytasks-screen';
import AccountScreen from './profile-screen';
import TaskDetailScreen from './task-detail';
import GetItDoneScreen from './welcome-screen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

type CenterTextProps = {
  text: string;
};

const CenterText = ({ text }: CenterTextProps) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{text}</Text>
  </View>
);

function GetItDone() {
  return <GetItDoneScreen  />;
}

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

function MyTasks() {
  return <MyTasksScreen />;
}
function MessageScreen() {
  return <PrivateMessagesScreen />;
}
function Account() {
  return <AccountScreen />;
}

export default function App() {

  const token = useAuthStore((state) => state.token);

  // Redirect to login screen if not authenticated
  React.useEffect(() => {
    if (!token) {
      // Use expo-router navigation to redirect
      // @ts-ignore
      router.push('../login-screen');
    }
  }, [token]);
  if (!token) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { 
          height: 80, 
          paddingBottom: 20, 
          paddingTop: 5 
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
