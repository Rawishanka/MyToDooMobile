import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

// Responsive sizing
const CIRCLE_SIZE  = isSmallDevice ? 42 : 46;   // active icon circle diameter
const ICON_SIZE    = isSmallDevice ? 20 : 22;

const TAB_ROUTES = ['index', 'browse', 'my-tasks', 'message', 'account'];

// Tab metadata
const TAB_META = [
  { name: 'index',    label: 'Get Done',  icon: 'rocket-outline'       as const, iconActive: 'rocket'        as const },
  { name: 'browse',   label: 'Browse',    icon: 'compass-outline'      as const, iconActive: 'compass'       as const },
  { name: 'my-tasks', label: 'My Tasks',  icon: 'list-outline'         as const, iconActive: 'list'          as const },
  { name: 'message',  label: 'Messages',  icon: 'chatbubbles-outline'  as const, iconActive: 'chatbubbles'   as const },
  { name: 'account',  label: 'Account',   icon: 'person-circle-outline' as const, iconActive: 'person-circle' as const },
];

// ─────────────────────────────────────────────────────────────────────────────
// Swipe wrapper (unchanged logic)
// ─────────────────────────────────────────────────────────────────────────────
function TabSwipeWrapper({ children, tabIndex }: { children: React.ReactNode; tabIndex: number }) {
  const navigation = useNavigation<any>();

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => { if (tabIndex < TAB_ROUTES.length - 1) navigation.navigate(TAB_ROUTES[tabIndex + 1]); })
    .runOnJS(true);

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => { if (tabIndex > 0) navigation.navigate(TAB_ROUTES[tabIndex - 1]); })
    .runOnJS(true);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(flingLeft, flingRight)}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen wrappers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function BrowseStack() {
  return (
    <TabSwipeWrapper tabIndex={1}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BrowseList" component={BrowseTasksScreen} />
        <Stack.Screen name="task-detail" component={TaskDetailScreen} />
        <Stack.Screen name="make-offer-screen" component={MakeOfferScreen} />
      </Stack.Navigator>
    </TabSwipeWrapper>
  );
}
function GetItDone()     { return <TabSwipeWrapper tabIndex={0}><GetItDoneScreen /></TabSwipeWrapper>; }
function MyTasks()       { return <TabSwipeWrapper tabIndex={2}><MyTasksScreen /></TabSwipeWrapper>; }
function MessageScreen() { return <TabSwipeWrapper tabIndex={3}><PrivateMessagesScreen /></TabSwipeWrapper>; }
function Account()       { return <TabSwipeWrapper tabIndex={4}><AccountScreen /></TabSwipeWrapper>; }

// ─────────────────────────────────────────────────────────────────────────────
// Floating animated tab bar  —  circle indicator + label below
// ─────────────────────────────────────────────────────────────────────────────
const BRAND_BLUE = '#003399';

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { data: chatData } = useGetUserChats();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const totalUnreadCount = React.useMemo(() => {
    if (!chatData?.chats || !Array.isArray(chatData.chats)) return 0;
    return chatData.chats.reduce((total: number, chat: any) => total + (chat.unreadCount || 0), 0);
  }, [chatData]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => setKeyboardVisible(false),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Animated scale + opacity for the circle indicator per tab
  const scaleAnims = useRef(
    state.routes.map((_: any, i: number) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  useEffect(() => {
    state.routes.forEach((_: any, i: number) => {
      Animated.spring(scaleAnims[i], {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    });
  }, [state.index]);

  if (keyboardVisible && Platform.OS === 'android') return null;

  return (
    <View style={[tabStyles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={tabStyles.pill}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const meta = TAB_META[index];

          const circleScale = scaleAnims[index];
          const circleOpacity = scaleAnims[index].interpolate({
            inputRange: [0, 1], outputRange: [0, 1],
          });

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={tabStyles.tabTouch}
              activeOpacity={0.8}
            >
              {/* Circle background — animates in/out */}
              <View style={tabStyles.iconWrapper}>
                <Animated.View
                  style={[
                    tabStyles.circleIndicator,
                    {
                      transform: [{ scale: circleScale }],
                      opacity: circleOpacity,
                    },
                  ]}
                />

                {/* Icon on top of circle */}
                {meta.name === 'message' ? (
                  <View style={{ position: 'relative' }}>
                    <Ionicons
                      name={isFocused ? meta.iconActive : meta.icon}
                      size={ICON_SIZE}
                      color={isFocused ? '#fff' : '#888'}
                    />
                    {totalUnreadCount > 0 && (
                      <View style={tabStyles.badge}>
                        <Text style={tabStyles.badgeText}>
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Ionicons
                    name={isFocused ? meta.iconActive : meta.icon}
                    size={ICON_SIZE}
                    color={isFocused ? '#fff' : '#888'}
                  />
                )}
              </View>

              {/* Label below circle */}
              <Text
                style={[tabStyles.label, isFocused && tabStyles.labelActive]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main TabNavigator
// ─────────────────────────────────────────────────────────────────────────────
export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // tabBarHideOnKeyboard is handled manually inside FloatingTabBar
      }}
    >
      <Tab.Screen name="index"    component={GetItDone}     options={{ tabBarLabel: 'Get Done'  }} />
      <Tab.Screen name="browse"   component={BrowseStack}   options={{ tabBarLabel: 'Browse'    }} />
      <Tab.Screen name="my-tasks" component={MyTasks}       options={{ tabBarLabel: 'My Tasks'  }} />
      <Tab.Screen name="message"  component={MessageScreen} options={{ tabBarLabel: 'Messages'  }} />
      <Tab.Screen name="account"  component={Account}       options={{ tabBarLabel: 'Account'   }} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles for FloatingTabBar
// ─────────────────────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
  },
  tabTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIndicator: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: BRAND_BLUE,
  },
  label: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '500',
    color: '#888',
    marginTop: 3,
    textAlign: 'center',
  },
  labelActive: {
    color: BRAND_BLUE,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
