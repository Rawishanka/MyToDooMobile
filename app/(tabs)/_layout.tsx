// Tab navigation layout - uses Expo Router Tabs with custom FloatingTabBar
import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const CIRCLE_SIZE = isSmallDevice ? 42 : 46;
const ICON_SIZE = isSmallDevice ? 20 : 22;
const BRAND_BLUE = '#003399';

const TAB_META = [
  { name: 'index', label: 'Post Task', icon: 'rocket-outline' as const, iconActive: 'rocket' as const },
  { name: 'browse', label: 'Find', icon: 'compass-outline' as const, iconActive: 'compass' as const },
  { name: 'my-tasks', label: 'My Tasks', icon: 'list-outline' as const, iconActive: 'list' as const },
  { name: 'message', label: 'Comms', icon: 'chatbubbles-outline' as const, iconActive: 'chatbubbles' as const },
  { name: 'account', label: 'Account', icon: 'person-circle-outline' as const, iconActive: 'person-circle' as const },
];

const AUTH_ONLY_TABS = new Set(['browse', 'my-tasks', 'message']);

// ─────────────────────────────────────────────────────────────────────────────
// Floating animated tab bar
// ─────────────────────────────────────────────────────────────────────────────
function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, token } = useAuthStore();
  const showAuthTabs = isAuthenticated && !!token;
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
          const meta = TAB_META.find((tab) => tab.name === route.name);
          if (!meta) return null;
          if (!showAuthTabs && AUTH_ONLY_TABS.has(route.name)) return null;

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
              <View style={tabStyles.iconWrapper}>
                <Animated.View
                  style={[
                    tabStyles.circleIndicator,
                    { transform: [{ scale: circleScale }], opacity: circleOpacity },
                  ]}
                />
                {meta.name === 'message' ? (
                  <View style={{ position: 'relative' }}>
                    <Ionicons
                      name={isFocused ? meta.iconActive : meta.icon}
                      size={ICON_SIZE}
                      color={isFocused ? '#fff' : '#888'}
                    />
                    {totalUnreadCount > 0 && (
                      <View style={tabStyles.badge}>
                        <Text style={tabStyles.badgeText} allowFontScaling={false}>
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
              <Text
                style={[tabStyles.label, isFocused && tabStyles.labelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                allowFontScaling={false}
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
// Tabs Layout (Expo Router)
// ─────────────────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as any)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Post Task' }} />
      <Tabs.Screen name="browse" options={{ tabBarLabel: 'Find' }} />
      <Tabs.Screen name="my-tasks" options={{ tabBarLabel: 'My Tasks' }} />
      <Tabs.Screen name="message" options={{ tabBarLabel: 'Comms' }} />
      <Tabs.Screen name="account" options={{ tabBarLabel: 'Account' }} />
    </Tabs>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
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
    paddingHorizontal: 2,
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
    width: '100%',
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
    fontSize: RFValue(9),
    fontWeight: 'bold',
  },
});

