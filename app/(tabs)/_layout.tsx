// App.js or App.tsx

import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';
import BrowseTasksScreen from './browse-screen';
import PrivateMessagesScreen from './message-screen';
import MyTasksScreen from './mytasks-screen';
import GetItDoneScreen from './welcome-screen';
import AccountScreen from './profile-screen';

const Tab = createBottomTabNavigator();

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
function BrowseScreen() {
  return <BrowseTasksScreen />;
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#000',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { height: 60 },
        tabBarItemStyle: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' },
        tabBarIcon: ({ color, focused }) => {
          const iconSize = 19;
          const iconColor = focused ? '#3399ff' : '#bbb';
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
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
        tabBarLabelStyle: { textAlign: 'center', width: '100%' },
      })}
    >
      <Tab.Screen name="index" component={GetItDone} options={{ tabBarLabel: 'Get it done' }} />
      <Tab.Screen name="browse" component={BrowseScreen} options={{ tabBarLabel: 'Browse' }} />
      <Tab.Screen name="my-tasks" component={MyTasks} options={{ tabBarLabel: 'My tasks' }} />
      <Tab.Screen name="message" component={MessageScreen} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="account" component={Account} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}
