import { Task } from '@/src/api/types/tasks';
import { useGetAllOffers, useGetAllTasks, useGetMyOffers, useGetMyTasks } from '@/src/shared/hooks/useTaskApi';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
import { useMergedUnreadCount } from '@/src/shared/hooks/useNotifications';

// Network components
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';

// Auth Store
import { useAuthStore } from '@/src/store/auth-task-store';

// Responsive utilities
import { hp, isTablet, RFValue, TAB_BAR_CLEARANCE, wp } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { BlueBackdrop } from '@/src/shared/components/custom_components/lightCard';
import { BRAND_ORANGE, CARD_CHIP_BG, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';

interface TabScreenProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
  offersMap?: Map<string, any>;
  promptReviewTaskId?: string;
  onTaskMarkedComplete?: (taskId: string) => void;
  oppositeReviewCount?: number;
  onSwitchRole?: () => void;
}

// Tab screen components
const TabScreen: React.FC<TabScreenProps & { status?: string; userRole?: string }> = React.memo(({ tasks, isLoading, onRefresh, status, userRole, offersMap, promptReviewTaskId, onTaskMarkedComplete, oppositeReviewCount, onSwitchRole }) => {
  const { isDarkMode } = useTheme();
  
  const getEmptyMessage = () => {
    switch (status) {
      case 'open':
        return 'No open tasks available';
      case 'assigned':
        return 'No tasks assigned to you';
      case 'make_payment':
        return 'No bookings waiting for payment';
      case 'accepted':
        return 'No accepted offers yet';
      case 'pending_payment':
        return userRole === 'Poster'
          ? 'No payments waiting to be released'
          : 'No pending payments';
      case 'completed':
        return 'No completed tasks yet';
      case 'review_required':
        return 'No tasks waiting for your review';
      case 'overdue':
        return 'No overdue tasks';
      case 'cancelled':
        return 'No cancelled tasks';
      case 'unserviced':
        return 'No unserviced tasks';
      default:
        return 'No tasks found';
    }
  };

  const handleTaskCancelled = useCallback((taskId: string) => {
    console.log('📋 Task cancelled:', taskId);
    console.log('   Refreshing task list to move task to Cancelled tab');
    // Refresh the task list to update the UI
    onRefresh();
  }, [onRefresh]);

  const handleTaskDeleted = useCallback((taskId: string) => {
    console.log('🗑️ Task deleted:', taskId);
    console.log('   Refreshing task list to remove task');
    // Refresh the task list to update the UI
    onRefresh();
  }, [onRefresh]);

  const handleOfferDeleted = useCallback((_offerId: string) => {
    console.log('🗑️ Offer deleted, refreshing task list...');
    onRefresh();
  }, [onRefresh]);

  const handleTaskCompleted = useCallback((taskId: string) => {
    console.log('✅ Task marked complete:', taskId);
    onTaskMarkedComplete?.(taskId);
    onRefresh();
  }, [onRefresh, onTaskMarkedComplete]);

  // FIX: Don't show empty state while loading - prevents layout shifts
  if (isLoading && tasks.length === 0) {
    return (
      <View style={[styles.tabContent, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={[styles.tabContent, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <FlatList keyboardShouldPersistTaps="handled"
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            status={status}
            userRole={userRole}
            myOffer={offersMap?.get(item._id)}
            autoPromptReview={promptReviewTaskId === item._id}
            onPress={status === 'completed' || status === 'review_required' ? undefined : (taskId: string) => {
              console.log('👁️ Navigating to task-detail with taskId:', taskId);
              console.log('   Task data:', item);
              console.log('   From tab:', status, 'Role:', userRole);
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
            onTaskCompleted={handleTaskCompleted}
            onOfferDeleted={handleOfferDeleted}
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
          status === 'review_required' && (oppositeReviewCount ?? 0) > 0 ? (
            <View style={styles.emptyListContent}>
              <View style={styles.smartReviewCard}>
                <View style={styles.smartReviewIconBadge}>
                  <Ionicons name="star" size={26} color="#FBBF24" />
                </View>
                <Text style={styles.smartReviewTitle}>
                  {oppositeReviewCount} {oppositeReviewCount === 1 ? 'task' : 'tasks'} waiting for review
                </Text>
                <Text style={styles.smartReviewSubtitle}>
                  You have completed tasks waiting for your review in your {userRole === 'Poster' ? 'Tasker' : 'Poster'} profile.
                </Text>
                <TouchableOpacity
                  style={styles.switchRoleBtn}
                  activeOpacity={0.85}
                  onPress={onSwitchRole}
                >
                  <Text style={styles.switchRoleBtnText}>
                    Switch to {userRole === 'Poster' ? 'Tasker' : 'Poster'} ({oppositeReviewCount})
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyListContent}>
              <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
                <Ionicons name="document-text-outline" size={40} color={isDarkMode ? '#94A3B8' : '#FFFFFF'} />
              </View>
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>{getEmptyMessage()}</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
});

TabScreen.displayName = 'TabScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Top Tabs (replaces @react-navigation/material-top-tabs)
// ─────────────────────────────────────────────────────────────────────────────
interface TopTabDef {
  key: string;
  label: string;
  status?: string;
  tasks: Task[];
  offersMap?: Map<string, any>;
}

function CustomTopTabs({ userRole, categorizedData, isLoading, onRefresh, myOffersMap, promptReviewTaskId, initialTabKey, navStamp, initialRole, onTaskMarkedComplete, onSwitchRole }: {
  userRole: string;
  categorizedData: any;
  isLoading: boolean;
  onRefresh: () => void;
  myOffersMap?: Map<string, any>;
  promptReviewTaskId?: string;
  initialTabKey?: string;
  navStamp?: string;
  initialRole?: string;
  onTaskMarkedComplete?: (taskId: string) => void;
  onSwitchRole?: () => void;
}) {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Reset to first tab when role changes (only if no initial tab was requested)
  useEffect(() => { if (!initialTabKey) setActiveIndex(0); }, [userRole, initialTabKey]);

  const allTabs: TopTabDef[] = useMemo(() => {
    if (userRole === 'Tasker') {
      return [
        { key: 'open', label: 'Open Offers', status: 'open', tasks: categorizedData.openTasks, offersMap: myOffersMap },
        { key: 'todoo', label: 'Todoo Tasks', status: 'assigned', tasks: categorizedData.todoTasks },
        { key: 'pending_payment', label: 'Pending Payments', status: 'pending_payment', tasks: categorizedData.pendingPaymentTasks },
        { key: 'review_required', label: 'Review Required', status: 'review_required', tasks: categorizedData.reviewRequiredTasks },
        { key: 'completed', label: 'Completed', status: 'completed', tasks: categorizedData.completedTasks },
        { key: 'overdue', label: 'Overdue', status: 'overdue', tasks: categorizedData.overdueTasks },
        { key: 'cancelled', label: 'Cancelled', status: 'cancelled', tasks: categorizedData.cancelledTasks },
      ];
    }
    return [
      { key: 'posted', label: 'Posted', tasks: categorizedData.postedTasks },
      { key: 'make_payment', label: 'Make Payment', status: 'make_payment', tasks: categorizedData.makePaymentTasks || [] },
      { key: 'accepted', label: 'Accepted', status: 'accepted', tasks: categorizedData.acceptedTasks },
      { key: 'pending_payment', label: 'Release Payment', status: 'pending_payment', tasks: categorizedData.pendingPaymentTasks },
      { key: 'review_required', label: 'Review Required', status: 'review_required', tasks: categorizedData.reviewRequiredTasks },
      { key: 'completed', label: 'Completed', status: 'completed', tasks: categorizedData.completedTasks },
      { key: 'unserviced', label: 'Unserviced', status: 'unserviced', tasks: categorizedData.unservicedTasks || [] },
      { key: 'overdue', label: 'Overdue', status: 'overdue', tasks: categorizedData.overdueTasks },
      { key: 'cancelled', label: 'Cancelled', status: 'cancelled', tasks: categorizedData.cancelledTasks },
    ];
  }, [userRole, categorizedData, myOffersMap]);

  // Tracks the currently-active tab's key across renders (written after each
  // render below) so the filter can tell "the tab the user is looking at"
  // apart from "a tab that's merely empty" without an index-space mismatch
  // between the full tab list and the filtered one.
  const activeKeyRef = useRef<string | undefined>(undefined);

  // Hide tabs with zero tasks so the tab bar only shows what's actionable --
  // except "Open Offers"/"Posted" (the role's default landing tab, always
  // shown even when empty) and the currently-active tab (never hide the one
  // the user is looking at out from under them).
  const tabs: TopTabDef[] = useMemo(() => {
    const defaultKey = userRole === 'Tasker' ? 'open' : 'posted';
    const activeKey = activeKeyRef.current;
    const visible = allTabs.filter(
      (tab) => tab.tasks.length > 0 || tab.key === defaultKey || tab.key === activeKey
    );
    return visible.length > 0 ? visible : allTabs.slice(0, 1);
  }, [allTabs, userRole]);

  useEffect(() => {
    activeKeyRef.current = tabs[activeIndex]?.key;
  }, [tabs, activeIndex]);

  // Keep activeIndex valid as the visible tab set changes (e.g. a tab the
  // user was on empties out and gets hidden, or role switches).
  useEffect(() => {
    if (activeIndex >= tabs.length) {
      setActiveIndex(0);
    }
  }, [tabs.length, activeIndex]);

  const activeTab = tabs[activeIndex] || tabs[0];

  useEffect(() => {
    if (!promptReviewTaskId) return;
    const reviewTabIndex = tabs.findIndex((tab) => tab.key === 'review_required');
    const fallbackIndex = tabs.findIndex((tab) => tab.key === 'completed');
    const targetIndex = reviewTabIndex >= 0 ? reviewTabIndex : fallbackIndex;
    if (targetIndex >= 0) {
      setActiveIndex(targetIndex);
    }
  }, [promptReviewTaskId, tabs]);

  // Open the tab a notification asked for, once per tap. This used to re-run on every data
  // refresh, which dragged people back to that tab after they had moved to another one.
  // `tab` may list fallbacks ("review_required,completed") because empty tabs are hidden.
  const appliedNavKeyRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!initialTabKey) return;
    // Wait until the role the notification asked for is the one on screen, so the tab index
    // is looked up in the right role's tab list
    if (initialRole && initialRole !== userRole) return;
    const navKey = `${initialTabKey}|${navStamp || ''}`;
    if (appliedNavKeyRef.current === navKey) return;
    const candidates = initialTabKey
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);
    for (const candidate of candidates) {
      const cleanKey = candidate.toLowerCase().replace(/[s-]/g, '_');
      const tabIndex = tabs.findIndex((tab) => tab.key === candidate || tab.key === cleanKey);
      if (tabIndex >= 0) {
        appliedNavKeyRef.current = navKey;
        setActiveIndex(tabIndex);
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: Math.max(0, tabIndex * 110 - 40), animated: true });
        }, 100);
        return;
      }
    }
  }, [initialTabKey, navStamp, initialRole, userRole, tabs]);

  return (
    <>
      {/* Tab Bar */}
      <View style={[topTabStyles.tabBarContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <ScrollView keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={topTabStyles.tabBarContent}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                topTabStyles.tabItem,
                isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                index === activeIndex && topTabStyles.tabItemActive,
              ]}
              onPress={() => setActiveIndex(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                topTabStyles.tabLabel,
                isDarkMode && { color: '#94A3B8' },
                index === activeIndex && topTabStyles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Active Tab Content */}
      <TabScreen
        tasks={activeTab.tasks}
        isLoading={isLoading}
        onRefresh={onRefresh}
        status={activeTab.status}
        userRole={userRole}
        offersMap={activeTab.offersMap}
        promptReviewTaskId={promptReviewTaskId}
        onTaskMarkedComplete={onTaskMarkedComplete}
        oppositeReviewCount={categorizedData.oppositeReviewCount}
        onSwitchRole={onSwitchRole}
      />
    </>
  );
}

const topTabStyles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'transparent',
    paddingTop: 4,
    paddingBottom: 12,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    flexGrow: 1,
    justifyContent: isTablet ? 'center' : 'flex-start',
  },
  tabItem: {
    paddingHorizontal: isTablet ? 20 : 16,
    height: isTablet ? 42 : 36,
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  tabItemActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  tabLabel: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default function MyTasksScreen() {
  const { isDarkMode } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState<'Tasker' | 'Poster'>('Poster'); // set from isTasker on open
  const [searchText, setSearchText] = useState('');
  const [isRoleSwitching, setIsRoleSwitching] = useState(false); // FIX: Track role switching
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [networkAlertMessage, setNetworkAlertMessage] = useState('');
  const [completionToast, setCompletionToast] = useState<string | null>(null);
  const completionToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Network status monitoring
  const { isConnected } = useNetworkStatus();
  const prevConnectedRef = useRef(true);
  useEffect(() => {
    if (prevConnectedRef.current && !isConnected) {
      setNetworkAlertMessage('No internet connection. Please check your Wi-Fi or mobile data.');
      setShowNetworkAlert(true);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);
  
  // Get current user from auth store
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id || currentUser?._id;
  
  // Get navigation params
  const params = useLocalSearchParams<{ role?: string; tab?: string; ts?: string; promptReviewTaskId?: string; focusTaskId?: string }>();
  const promptReviewTaskId = typeof params.promptReviewTaskId === 'string'
    ? params.promptReviewTaskId
    : typeof params.focusTaskId === 'string'
    ? params.focusTaskId
    : undefined;
  const initialTabKey = typeof params.tab === 'string' ? params.tab : undefined;

  // Default role from profile isTasker / notifyNewTask once; route params override
  const roleInitializedRef = useRef(false);
  const appliedRoleKeyRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (params.role === 'Poster' || params.role === 'Tasker') {
      const roleKey = `${params.role}|${params.ts || ''}`;
      roleInitializedRef.current = true;
      if (appliedRoleKeyRef.current === roleKey) return;
      appliedRoleKeyRef.current = roleKey;
      console.log('🎯 Setting userRole from navigation params:', params.role);
      setUserRole(params.role);
      return;
    }
    if (roleInitializedRef.current || !currentUser) return;
    const profileIsTasker = !!(
      (currentUser as any)?.isTasker ||
      (currentUser as any)?.notifyNewTask ||
      (currentUser as any)?.taskerProfile?.isTasker
    );
    const defaultRole = profileIsTasker ? 'Tasker' : 'Poster';
    console.log('🎯 Default My Tasks role from profile:', defaultRole, { profileIsTasker });
    setUserRole(defaultRole);
    roleInitializedRef.current = true;
  }, [params.role, params.ts, currentUser]);

  // FIX: Log when screen mounts to verify layout is ready
  useEffect(() => {
    console.log('✅ My Tasks screen mounted and ready for interaction');
  }, []);

  useEffect(() => {
    return () => {
      if (completionToastTimerRef.current) {
        clearTimeout(completionToastTimerRef.current);
      }
    };
  }, []);

  const handleTaskMarkedComplete = useCallback((_taskId: string) => {
    if (completionToastTimerRef.current) {
      clearTimeout(completionToastTimerRef.current);
    }
    setCompletionToast(
      'The poster has been informed the task has been completed and to release payment.'
    );
    completionToastTimerRef.current = setTimeout(() => {
      setCompletionToast(null);
      completionToastTimerRef.current = null;
    }, 3000);
  }, []);

  // Get merged notification count (local AsyncStorage + backend API)
  const notificationCount = useMergedUnreadCount();

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
  console.log('📊 My Tasks Screen Data:', {
    userRole,
    dataSource: userRole === 'Tasker' ? 'All System Tasks' : 'My Tasks Only',
    totalTasks: allTasks.length,
    totalOffers: allOffers.length,
    taskerAssignedTasksCount: taskerAssignedTasks.length,
    myOffersCount: myOffers.length,
    myOffersMapSize: myOffersMap.size,
    isLoadingTasks,
    isLoadingTaskerTasks,
    isLoadingMyOffers,
    isLoadingAllOffers,
    isLoadingAllTasks: userRole === 'Tasker' ? isLoadingAllTasks : 'N/A',
    sampleTasks: allTasks.slice(0, 3).map(t => ({ 
      id: t._id, 
      title: t.title, 
      status: t.status,
      createdBy: t.createdBy?._id || 'unknown',
      currentUserId: currentUserId,
      isMyTask: t.createdBy?._id === currentUserId,
      offersArray: t.offers?.length || 0,
      offerCount: t.offerCount || 0,
      hasOffers: !!(t.offers?.length || t.offerCount)
    }))
  });

  // Debug logging for offers data structure
  console.log('🤝 My Offers Data Structure:', {
    totalOffers: allOffers.length,
    sampleOffers: allOffers.slice(0, 3).map((offer: any) => ({
      id: offer._id || offer.id,
      status: offer.status,
      taskId: offer.taskId || offer.task?._id,
      hasTask: !!offer.task,
      taskTitle: offer.task?.title,
      taskStatus: offer.task?.status,
      offerAmount: offer.offer?.amount || offer.amount,
      fullStructure: JSON.stringify(offer, null, 2).substring(0, 200) + '...'
    })),
    acceptedOffers: allOffers.filter((offer: any) => offer.status === 'accepted').map((offer: any) => ({
      id: offer._id || offer.id,
      taskTitle: offer.task?.title,
      taskStatus: offer.task?.status,
      offerStatus: offer.status
    }))
  });

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

    // Helper: completed tasks where THIS user still owes a review.
    // task.reviewStatus alone can't decide it: it only flips once BOTH sides have
    // reviewed (and is missing on older jobs), so a job I had already reviewed sat
    // in Review Required with no review button and Completed stayed empty/hidden.
    // The backend now tells us whether I've reviewed (myReviewDone); once I have,
    // the job belongs under Completed (where the card shows the review status).
    const isReviewRequired = (task: Task): boolean => {
      if (task.status !== 'completed') return false;
      if (task.myReviewDone === true) return false;
      const rs = task.reviewStatus;
      if (rs === 'reviews_complete') return false;
      return rs === 'review_required' || rs === 'none' || !rs;
    };

    // Helper: overdue tab — only explicit overdue status
    const isTaskOverdue = (task: Task): boolean => {
      if (task.status === 'overdue') {
        return true;
      }
      return false;
    };

    // For Tasker role - show available tasks and their offer status
    if (userRole === 'Tasker') {

      // ─── BUILD OPEN OFFERS FROM myOffers DIRECTLY ───────────────────────
      // Primary source: myOffers from /api/tasks/my-offers
      // Each offer has the task data populated in offer.taskId (object) or as an ID
      // We build the open offers list from myOffers, NOT from allTasks filter.
      // This ensures tasks show up even if allTasks pagination missed them.
      // "countered" = a negotiated price request on a service booking awaiting
      // this tasker's approve/reject -- surfaced in Open Offers alongside normal
      // pending offers so the tasker doesn't miss it.
      const pendingOfferStatuses = ['pending', 'payment_pending', 'payment_failed', 'countered'];

      const openTasksFromOffers: Task[] = myOffers
        .filter((offer: any) => pendingOfferStatuses.includes(offer.status))
        .map((offer: any) => {
          // Try to get task data from populated taskId first
          let taskData: Task | undefined;
          if (offer.taskId && typeof offer.taskId === 'object' && offer.taskId._id) {
            // taskId is populated as object - but may be sparse
            // Prefer allTasks version (more complete) if available
            const tId = offer.taskId._id;
            const fullTask = allTasks.find((t: Task) => t._id === tId);
            taskData = fullTask || (offer.taskId as Task);
          } else {
            // taskId is a plain string - look it up in allTasks
            const tId = typeof offer.taskId === 'string' ? offer.taskId : String(offer.taskId);
            taskData = allTasks.find((t: Task) => t._id === tId);
          }
          return taskData || null;
        })
        .filter((t: Task | null): t is Task => {
          if (!t) return false;
          // Exclude tasks created by current user
          const isNotMyTask = currentUserId ? t.createdBy?._id !== currentUserId : true;
          return isNotMyTask;
        });

      // Deduplicate by task ID (in case same task appears in multiple offers)
      const seenIds = new Set<string>();
      const deduped: Task[] = [];
      for (const t of openTasksFromOffers) {
        if (!seenIds.has(t._id)) {
          seenIds.add(t._id);
          deduped.push(t);
        }
      }

      // Sort by offer creation date (newest first)
      const sortedOpenTasks = deduped.sort((a: Task, b: Task) => {
        const offerA = myOffersMap.get(a._id);
        const offerB = myOffersMap.get(b._id);
        const dateA = offerA?.createdAt ? new Date(offerA.createdAt).getTime() : 0;
        const dateB = offerB?.createdAt ? new Date(offerB.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // Apply search filter
      const openTasks = filterBySearch(sortedOpenTasks);

      console.log('🎯 Tasker Open Tasks (from myOffers):', {
        totalMyOffers: myOffers.length,
        pendingOffers: myOffers.filter((o: any) => pendingOfferStatuses.includes(o.status)).length,
        resolvedTasks: openTasksFromOffers.length,
        deduped: deduped.length,
        finalOpenTasks: openTasks.length,
        isLoadingMyOffers,
        sampleOffers: myOffers.slice(0, 3).map((o: any) => ({
          offerId: o._id,
          offerStatus: o.status,
          taskIdType: typeof o.taskId,
          taskId: typeof o.taskId === 'object' ? o.taskId?._id : o.taskId,
          taskTitle: typeof o.taskId === 'object' ? o.taskId?.title : 'not populated'
        }))
      });

      
      // Todo Tasks: Use /api/tasks/my-tasks?role=tasker endpoint which returns tasks assigned to user
      // CRITICAL: Only show tasks where offer was ACCEPTED AND PAID (backend sets assignedTo after payment)
      console.log('🔍 Tasker Assigned Tasks (from /api/tasks/my-tasks?role=tasker):', {
        totalAssignedTasks: taskerAssignedTasks.length,
        allStatuses: taskerAssignedTasks.map((t: Task) => t.status),
        sampleTasks: taskerAssignedTasks.slice(0, 5).map((task: Task) => ({
          id: task._id,
          title: task.title,
          status: task.status,
          budget: task.budget,
          userRole: (task as any).userRole,
          assignedTo: (task as any).assignedTo?._id
        }))
      });
      
      const todoTasksFiltered = taskerAssignedTasks.filter((task: Task) => {
        // IMPORTANT: After payment, backend sets status to "accepted", "todo", "assigned", or "in_progress"
        // and assigns the task to the tasker (assignedTo field set, userRole = "assignee")
        // We show tasks that are ready to work on (not completed, overdue, or cancelled)
        // NOTE: Tasks with pending cancellation requests (cancel_request_by_poster) keep status until approved
        
        // Verify task is actually assigned to current user (userRole should be 'assignee')
        const isAssignedToMe = (task as any).userRole === 'assignee';
        if (!isAssignedToMe) return false;
        
        // Check if task is overdue (by date or status) - exclude from Todoo if overdue
        const taskIsOverdue = isTaskOverdue(task);
        if (taskIsOverdue) {
          console.log('⚠️ Excluding overdue task from Todoo Tasks:', {
            taskId: task._id,
            title: task.title,
            status: task.status,
            endDate: task.dateRange?.end
          });
          return false; // Overdue tasks should go to Overdue tab, not Todoo tab
        }
        
        // Exclude completed, cancelled, open, and pending_completion (Pending Payments tab)
        // BUT INCLUDE tasks with pending cancellation requests (cancel_request_by_poster)
        // so tasker can see and respond to the cancellation request
        const isExcluded = task.status === 'completed' || 
                          task.status === 'cancelled' || 
                          task.status === 'open' ||
                          task.status === 'pending_completion';
        
        // IMPORTANT: Tasks with status 'cancel_request_by_poster' should show in Todoo
        // so tasker can accept/reject the poster's cancellation request
        const hasPendingCancellation = task.status === 'cancel_request_by_poster';
        
        const shouldInclude = (hasPendingCancellation || !isExcluded) && isAssignedToMe;
        
        if (taskerAssignedTasks.length <= 10) {
          console.log('🎯 Tasker Todoo Tasks Filter (from my-tasks?role=tasker):', {
            taskId: task._id,
            title: task.title,
            status: task.status,
            budget: task.budget,
            userRole: (task as any).userRole,
            isAssignedToMe,
            taskIsOverdue,
            hasPendingCancellation,
            shouldInclude,
            reason: shouldInclude ? 
                   hasPendingCancellation ? 'INCLUDED: Task has pending cancellation request from poster' :
                   'INCLUDED: Task assigned and active' : 
                   taskIsOverdue ? 'EXCLUDED: Task is overdue (moved to Overdue tab)' :
                   !isAssignedToMe ? 'EXCLUDED: Not assigned to current user' :
                   task.status === 'pending_completion' ? 'EXCLUDED: Pending payment (Pending Payments tab)' :
                   'EXCLUDED: Task completed/cancelled/open'
          });
        }
        
        return shouldInclude;
      });
      
      const todoTasks = sortByCreatedDate(filterBySearch(todoTasksFiltered));

      // Pending Payments: tasks marked complete by tasker awaiting poster release
      const pendingPaymentTasks = sortByCreatedDate(filterBySearch(
        taskerAssignedTasks.filter((task: Task) => {
          const isAssignedToMe = (task as any).userRole === 'assignee';
          return isAssignedToMe && task.status === 'pending_completion';
        })
      ));
      
      console.log('✅ Tasker Todoo Tasks Result:', {
        totalAssignedTasks: taskerAssignedTasks.length,
        activeTasks: taskerAssignedTasks.filter((t: Task) => 
          t.status === 'todo' || t.status === 'assigned' || t.status === 'in_progress'
        ).length,
        completedTasks: taskerAssignedTasks.filter((t: Task) => t.status === 'completed').length,
        pendingPaymentTasks: pendingPaymentTasks.length,
        filteredTodoTasks: todoTasksFiltered.length,
        finalTodoTasks: todoTasks.length,
        taskSample: todoTasks.slice(0, 2).map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          budget: t.budget,
          userRole: (t as any).userRole
        }))
      });
      
      const completedTasks = sortByCreatedDate(filterBySearch(
        taskerAssignedTasks.filter((task: Task) => task.status === 'completed' && !isReviewRequired(task))
      ));

      const reviewRequiredTasks = sortByCreatedDate(filterBySearch(
        taskerAssignedTasks.filter((task: Task) => isReviewRequired(task))
      ));
      
      // Overdue Tasks: Include tasks assigned to tasker that are past their due date
      // Check both backend status and client-side date comparison
      console.log('🔍 Checking Tasker Overdue Tasks from assigned tasks:', {
        totalAssignedTasks: taskerAssignedTasks.length,
        tasksWithEndDates: taskerAssignedTasks.filter(t => t.dateRange?.end).length,
        sampleTasksWithDates: taskerAssignedTasks.filter(t => t.dateRange?.end).slice(0, 3).map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          endDate: t.dateRange?.end,
          userRole: (t as any).userRole,
          isPastDue: new Date() > new Date(t.dateRange.end)
        }))
      });
      
      const overdueTasksFiltered = taskerAssignedTasks.filter((task: Task) => {
        // Must be assigned to current user
        const isAssignedToMe = (task as any).userRole === 'assignee';
        if (!isAssignedToMe) {
          if (taskerAssignedTasks.length <= 10) {
            console.log('❌ Not assigned to me:', {
              taskId: task._id,
              title: task.title,
              userRole: (task as any).userRole
            });
          }
          return false;
        }
        
        // Check if task is overdue (either status='overdue' or past due date)
        const overdue = isTaskOverdue(task);
        
        if (overdue) {
          console.log('📌 Tasker Overdue Task FOUND:', {
            taskId: task._id,
            title: task.title,
            status: task.status,
            endDate: task.dateRange?.end,
            currentDate: new Date().toISOString(),
            isAssignedToMe,
            userRole: (task as any).userRole
          });
        } else if (taskerAssignedTasks.length <= 10) {
          console.log('✅ Task NOT overdue:', {
            taskId: task._id,
            title: task.title,
            status: task.status,
            endDate: task.dateRange?.end,
            hasEndDate: !!task.dateRange?.end
          });
        }
        
        return overdue;
      });
      
      const overdueTasks = sortByCreatedDate(filterBySearch(overdueTasksFiltered));
      
      console.log('⏰ Tasker Overdue Tasks Result:', {
        totalAssignedTasks: taskerAssignedTasks.length,
        overdueFiltered: overdueTasksFiltered.length,
        finalOverdue: overdueTasks.length,
        taskSample: overdueTasks.slice(0, 3).map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          endDate: t.dateRange?.end,
          daysOverdue: t.dateRange?.end ? Math.floor((new Date().getTime() - new Date(t.dateRange.end).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
        }))
      });
      
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
      
      console.log('📋 Tasker Cancelled Tasks:', {
        fromAssigned: cancelledTasksFromAssigned.length,
        fromAllTasks: cancelledTasksFromAll.length,
        uniqueTotal: uniqueCancelledTasks.length,
        finalCount: finalCancelledTasks.length
      });
      
      const posterPendingCount = (myTasksData?.data || []).filter((t: Task) => isReviewRequired(t)).length;

      return {
        openTasks,
        todoTasks,
        pendingPaymentTasks,
        reviewRequiredTasks,
        completedTasks,
        overdueTasks,
        cancelledTasks: finalCancelledTasks,
        postedTasks: [],
        makePaymentTasks: [],
        acceptedTasks: [],
        unservicedTasks: [],
        oppositeReviewCount: posterPendingCount,
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
      console.log('📋 Open Tasks sorted by date:', openTasks.map(t => ({
        title: t.title,
        createdAt: t.createdAt,
        date: new Date(t.createdAt).toLocaleDateString()
      })));
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
          return isUsersTask && task.status === 'completed' && !isReviewRequired(task);
        })
      )
    );

    const reviewRequiredTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = !currentUserId || 
            (typeof task.createdBy === 'string' ? task.createdBy === currentUserId : (task.createdBy?._id === currentUserId || (task.createdBy as any)?.id === currentUserId)) || 
            !task.createdBy;
          return isUsersTask && isReviewRequired(task);
        })
      )
    );
    
    // Overdue Tasks: Include tasks created by poster that are past their due date
    // Check both backend status and client-side date comparison
    const overdueTasksFiltered = allTasks.filter((task: Task) => {
      // Must be poster's task
      const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
      if (!isUsersTask) return false;
      
      // Check if task is overdue (either status='overdue' or past due date)
      const overdue = isTaskOverdue(task);
      
      if (overdue) {
        console.log('📌 Poster Overdue Task:', {
          taskId: task._id,
          title: task.title,
          status: task.status,
          endDate: task.dateRange?.end,
          isUsersTask
        });
      }
      
      return overdue;
    });
    
    const overdueTasks = sortByCreatedDate(filterBySearch(overdueTasksFiltered));
    
    console.log('⏰ Poster Overdue Tasks Result:', {
      totalTasks: allTasks.length,
      overdueFiltered: overdueTasksFiltered.length,
      finalOverdue: overdueTasks.length,
      taskSample: overdueTasks.slice(0, 3).map(t => ({
        id: t._id,
        title: t.title,
        status: t.status,
        endDate: t.dateRange?.end,
        daysOverdue: t.dateRange?.end ? Math.floor((new Date().getTime() - new Date(t.dateRange.end).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
      }))
    });
    
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

    // Offer-a-Service bookings that are ready for the poster to pay (a single
    // "pending" offer tied to a serviceListingId). These are pulled out of
    // Posted into their own "Make Payment" tab -- Posted stays for ordinary
    // open marketplace tasks (and bookings still awaiting tasker negotiation
    // approval, whose offer is "countered", not yet "pending").
    const isReadyServiceBookingPayment = (task: Task): boolean => {
      if (!task.serviceListingId) return false;
      return (task.offers || []).some((o: any) => o.status === 'pending');
    };

    // For Poster role - tasks they've posted (sorted by creation date, newest first)
    // Posted tab shows only PRE-PAYMENT tasks that are waiting for offers
    // Once payment is made, task moves to Accepted tab with status: assigned/accepted/todo/in_progress
    const postedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          // Only show open/active tasks (pre-payment) - NOT assigned (post-payment)
          const isPostedStatus = task.status === 'open' || task.status === 'active';
          return isUsersTask && isPostedStatus && !isReadyServiceBookingPayment(task);
        })
      )
    );

    // Make Payment tab: service bookings with a tasker-ready offer awaiting the poster's payment
    const makePaymentTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          const isPostedStatus = task.status === 'open' || task.status === 'active';
          return isUsersTask && isPostedStatus && isReadyServiceBookingPayment(task);
        })
      )
    );

    // For Poster's Accepted tab - tasks they created that have been accepted/assigned
    // After payment, task status changes to 'assigned', 'in_progress', 'todo', or 'accepted'
    // These tasks should show in the Accepted tab until work is completed
    // pending_completion moves to Release Payment tab
    // NOTE: Tasks with pending cancellation requests keep their original status until approved
    // Only when cancellation is ACCEPTED does status change to 'cancelled' (moves to Cancelled tab)
    const acceptedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          // Must be created by current user (Poster)
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          
          // CRITICAL: Exclude completed, cancelled, overdue, open, and pending_completion
          const isExcluded = task.status === 'completed' || 
                            task.status === 'cancelled' || 
                            task.status === 'overdue' ||
                            task.status === 'open' ||
                            task.status === 'unserviced' ||
                            task.status === 'pending_completion';
          
          return isUsersTask && !isExcluded;
        })
      )
    );

    // Release Payment tab: poster tasks awaiting payment release
    const pendingPaymentTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          return isUsersTask && task.status === 'pending_completion';
        })
      )
    );
    
    console.log('✅ Poster Accepted Tasks (from myTasks API):', {
      count: acceptedTasks.length,
      pendingPaymentCount: pendingPaymentTasks.length,
      tasks: acceptedTasks.map(task => ({
        id: task._id,
        title: task.title,
        status: task.status
      }))
    });

    const unservicedTasks = sortByCreatedDate(
      filterBySearch(
        allTasks.filter((task: Task) => {
          const isUsersTask = currentUserId ? task.createdBy?._id === currentUserId : false;
          return isUsersTask && task.status === 'unserviced';
        })
      )
    );

    const taskerPendingCount = taskerAssignedTasks.filter((t: Task) => isReviewRequired(t)).length;

    return {
      openTasks,
      todoTasks,
      pendingPaymentTasks,
      reviewRequiredTasks,
      completedTasks,
      overdueTasks,
      cancelledTasks: finalCancelledTasks,
      postedTasks,
      makePaymentTasks,
      acceptedTasks: acceptedTasks,
      unservicedTasks,
      oppositeReviewCount: taskerPendingCount,
    };
  }, [allTasks, taskerAssignedTasks, myOffers, myOffersMap, isLoadingMyOffers, userRole, searchText, currentUserId]);

  // Debug log categorized data counts
  console.log(`📋 Categorized Data for ${userRole}:`, {
    openTasks: categorizedData.openTasks.length,
    todoTasks: categorizedData.todoTasks.length,
    pendingPaymentTasks: categorizedData.pendingPaymentTasks.length,
    reviewRequiredTasks: categorizedData.reviewRequiredTasks.length,
    completedTasks: categorizedData.completedTasks.length,
    postedTasks: categorizedData.postedTasks.length,
    acceptedTasks: categorizedData.acceptedTasks.length,
  });

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
      console.log('🔄 My Tasks screen focused, refreshing data...');
      // Force refresh all data sources to ensure we get the latest offers after payment
      handleRefresh();
      
      // Additional refresh after a small delay to catch any async updates
      const delayedRefresh = setTimeout(() => {
        console.log('🔄 Delayed refresh for latest data...');
        handleRefresh();
      }, 1000);

      return () => {
        clearTimeout(delayedRefresh);
      };
    }, [handleRefresh])
  );

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#003399" />
      <BlueBackdrop />

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
            <Ionicons name="close-circle" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Role Selector */}
      <View style={[styles.roleSelectorContainer, isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#0B1120' }]}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            userRole === 'Tasker' && (isDarkMode ? { backgroundColor: '#003399' } : styles.activeRole)
          ]}
          onPress={() => {
            setIsRoleSwitching(true);
            setUserRole('Tasker');
            setTimeout(() => setIsRoleSwitching(false), 150);
          }}
        >
          <Text style={[styles.roleText, isDarkMode && { color: '#94A3B8' }, userRole === 'Tasker' && (isDarkMode ? { color: '#FFF', fontWeight: 'bold' } : styles.activeRoleText)]}>Tasker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            userRole === 'Poster' && (isDarkMode ? { backgroundColor: '#003399' } : styles.activeRole)
          ]}
          onPress={() => {
            setIsRoleSwitching(true);
            setUserRole('Poster');
            setTimeout(() => setIsRoleSwitching(false), 150);
          }}
        >
          <Text style={[styles.roleText, isDarkMode && { color: '#94A3B8' }, userRole === 'Poster' && (isDarkMode ? { color: '#FFF', fontWeight: 'bold' } : styles.activeRoleText)]}>Poster</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation - Custom tab bar (no @react-navigation dependency) */}
      <View style={{ flex: 1 }} pointerEvents={isRoleSwitching ? 'none' : 'auto'}>
        <CustomTopTabs
          userRole={userRole}
          categorizedData={categorizedData}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          myOffersMap={myOffersMap}
          promptReviewTaskId={promptReviewTaskId}
          initialTabKey={initialTabKey}
          navStamp={typeof params.ts === 'string' ? params.ts : undefined}
          initialRole={params.role === 'Poster' || params.role === 'Tasker' ? params.role : undefined}
          onTaskMarkedComplete={handleTaskMarkedComplete}
          onSwitchRole={() => {
            setIsRoleSwitching(true);
            setUserRole((prev) => (prev === 'Poster' ? 'Tasker' : 'Poster'));
            setTimeout(() => setIsRoleSwitching(false), 150);
          }}
        />
      </View>

      {completionToast ? (
        <View style={styles.completionToast} pointerEvents="none">
          <Text style={styles.completionToastText}>{completionToast}</Text>
        </View>
      ) : null}

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
    paddingTop: 0,
    backgroundColor: '#003399',
  },
  tabContent: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    alignSelf: 'center',
  },
  flatListContent: {
    paddingTop: 4,
    paddingBottom: TAB_BAR_CLEARANCE,
    paddingHorizontal: isTablet ? wp('12.5%') : wp('0%'),
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('8%'),
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: RFValue(isTablet ? 16 : 14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  refreshButton: {
    paddingHorizontal: 32,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  smartReviewCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  smartReviewIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CARD_CHIP_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  smartReviewTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: CARD_TEXT,
    marginBottom: 6,
    textAlign: 'center',
  },
  smartReviewSubtitle: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND_ORANGE,
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 24,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  switchRoleBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  roleButton: {
    flex: 1,
    maxWidth: 200,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    marginHorizontal: 4,
  },
  activeRole: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#001A66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  roleText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  activeRoleText: {
    color: '#003399',
    fontWeight: '700',
  },
  searchResultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  searchResultsText: {
    fontSize: RFValue(isTablet ? 14 : 12),
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1%'),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#003399',
  },
  tabText: {
    fontSize: RFValue(isTablet ? 16 : 12),
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#003399',
    fontWeight: '600',
  },
  completionToast: {
    position: 'absolute',
    left: wp('4%'),
    right: wp('4%'),
    bottom: TAB_BAR_CLEARANCE + hp('2%'),
    backgroundColor: 'rgba(0, 26, 102, 0.96)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  completionToastText: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
});