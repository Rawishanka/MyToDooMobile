import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
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
const Stack = createNativeStackNavigator();

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
  const insets = useSafeAreaInsets();
  
  // Get chat data to calculate total unread count
  // Only fetches when user is authenticated
  const { data: chatData } = useGetUserChats();
  
  // Calculate total unread messages count from all chats
  // Safely handle when chatData is undefined (user not logged in)
  const totalUnreadCount = React.useMemo(() => {
    if (!chatData?.chats || !Array.isArray(chatData.chats)) return 0;
    
    return chatData.chats.reduce((total: number, chat: any) => {
      const unreadCount = chat.unreadCount || 0;
      return total + unreadCount;
    }, 0);
  }, [chatData]);
  
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
                <Ionicons name="rocket" size={iconSize} color={iconColor} />
              )}
              {route.name === 'browse' && (
                <Ionicons name="compass" size={iconSize} color={iconColor} />
              )}
              {route.name === 'my-tasks' && (
                <Ionicons name="list" size={iconSize} color={iconColor} />
              )}
              {route.name === 'message' && (
                <View style={{ position: 'relative' }}>
                  <Ionicons name="chatbubbles" size={iconSize} color={iconColor} />
                  {totalUnreadCount > 0 && (
                    <View style={styles.messageBadge}>
                      <Text style={styles.messageBadgeText}>
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {route.name === 'account' && (
                <Ionicons name="person-circle" size={iconSize} color={iconColor} />
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

const styles = StyleSheet.create({
  messageBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
