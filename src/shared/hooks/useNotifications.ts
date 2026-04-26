import {
    deleteNotification,
    getNotificationPreferences,
    getNotifications,
    getNotificationsByType,
    getNotificationStats,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    Notification,
    NotificationResponse,
    updateNotificationPreferences,
} from '@/src/api/notification-api';
import { handleAuthenticationError, isAuthError } from '@/src/shared/utils/auth-utils';
import { getUnreadCount as getLocalUnreadCount } from '@/src/services/notification-storage';
import { onNotificationsChanged } from '@/src/services/notification-events';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { AppState, Alert } from 'react-native';

// Query keys
export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (params?: any) => [...NOTIFICATION_KEYS.lists(), params] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unreadCount'] as const,
  stats: () => [...NOTIFICATION_KEYS.all, 'stats'] as const,
  preferences: () => [...NOTIFICATION_KEYS.all, 'preferences'] as const,
  byType: (type: string) => [...NOTIFICATION_KEYS.all, 'type', type] as const,
};

/**
 * Hook to fetch notifications with pagination
 */
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  // Use getState() instead of subscribe to avoid re-renders
  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  }, []); // Empty deps - only check once on mount

  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => getNotifications(params),
    staleTime: 30000, // 30 seconds
    retry: 0, // Don't retry on 404 - endpoint might not exist yet
    enabled: isEnabled, // Only fetch when authenticated
  });
};

/**
 * Hook to fetch unread count
 */
export const useUnreadCount = () => {
  // Use getState() instead of subscribe to avoid re-renders
  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  }, []); // Empty deps - only check once on mount

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: isEnabled ? 60000 : false, // Only refetch when authenticated
    staleTime: 30000,
    retry: 0, // Don't retry on 404
    enabled: isEnabled, // Only fetch when authenticated
  });
};

/**
 * Hook that merges local AsyncStorage unread count + backend API unread count.
 * Returns the higher of the two so the bell badge always reflects FCM notifications.
 * Polls local storage every 30s and also refreshes when app comes to foreground.
 */
export const useMergedUnreadCount = (): number => {
  const [localCount, setLocalCount] = React.useState(0);
  const queryClient = useQueryClient();

  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  }, []);

  // Backend count (may be 0 if backend doesn't store FCM notifications in DB)
  const { data: apiData } = useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: isEnabled ? 60000 : false,
    staleTime: 30000,
    retry: 0,
    enabled: isEnabled,
  });

  // Local AsyncStorage count - polls every 30s + on app foreground
  React.useEffect(() => {
    if (!isEnabled) return;

    const fetchLocal = async () => {
      const count = await getLocalUnreadCount();
      setLocalCount(count);
    };

    fetchLocal();
    const interval = setInterval(fetchLocal, 30000);

    // Also refresh when app comes back to foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchLocal();
    });

    // Immediately refresh badge when notifications are deleted/read
    // (instead of waiting up to 30-60s for the next poll)
    const unsubscribe = onNotificationsChanged(() => {
      fetchLocal();
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
      unsubscribe();
    };
  }, [isEnabled, queryClient]);

  const apiCount = (apiData as any)?.unreadCount || 0;
  return Math.max(apiCount, localCount);
};

/**
 * Hook to fetch notification statistics
 */
export const useNotificationStats = () => {
  // Use getState() instead of subscribe to avoid re-renders
  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  }, []); // Empty deps - only check once on mount

  return useQuery({
    queryKey: NOTIFICATION_KEYS.stats(),
    queryFn: getNotificationStats,
    staleTime: 60000, // 1 minute
    retry: 0,
    enabled: isEnabled, // Only fetch when authenticated
  });
};

/**
 * Hook to fetch notifications by type
 */
export const useNotificationsByType = (
  type: string,
  params?: { page?: number; limit?: number }
) => {
  // Use getState() instead of subscribe to avoid re-renders
  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return !!type && isAuthenticated && !!token;
  }, [type]); // Depend on type

  return useQuery({
    queryKey: NOTIFICATION_KEYS.byType(type),
    queryFn: () => getNotificationsByType(type, params),
    enabled: isEnabled, // Only fetch when authenticated
    staleTime: 30000,
    retry: 0,
  });
};

/**
 * Hook to fetch notification preferences
 */
export const useNotificationPreferences = () => {
  // Use getState() instead of subscribe to avoid re-renders
  const isEnabled = React.useMemo(() => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  }, []); // Empty deps - only check once on mount

  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(),
    queryFn: getNotificationPreferences,
    staleTime: 300000, // 5 minutes
    retry: 0,
    enabled: isEnabled, // Only fetch when authenticated
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data, notificationId) => {
      // Update the notification in the cache
      queryClient.setQueryData<NotificationResponse>(
        NOTIFICATION_KEYS.lists(),
        (old: NotificationResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((notification: Notification) =>
              notification._id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        }
      );

      // Refetch unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error in mark as read - handling automatically");
        handleAuthenticationError(error);
        return;
      }
      
      if (error?.response?.status === 404) {
        console.log('⚠️ Notification mark-as-read endpoint not implemented yet');
        // Don't show alert for mark as read - it's not critical
      } else {
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      Alert.alert('Success', 'All notifications marked as read');
    },
    onError: (error: any) => {
      console.error('Failed to mark all as read:', error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error in notifications - handling automatically");
        handleAuthenticationError(error);
        return;
      }
      
      if (error?.response?.status === 404) {
        Alert.alert(
          'Feature Not Available',
          'The notification system is not yet implemented on the backend.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (data, notificationId) => {
      // Remove the notification from cache
      queryClient.setQueryData<NotificationResponse>(
        NOTIFICATION_KEYS.lists(),
        (old: NotificationResponse | undefined) => {
          if (!old) return old;
          const deletedNotification = old.data.find(
            (n: Notification) => n._id === notificationId
          );
          return {
            ...old,
            data: old.data.filter((n: Notification) => n._id !== notificationId),
            unreadCount: deletedNotification?.isRead
              ? old.unreadCount
              : Math.max(0, old.unreadCount - 1),
          };
        }
      );

      // Refetch counts
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error in delete notification - handling automatically");
        handleAuthenticationError(error);
        return;
      }
      
      if (error?.response?.status === 404) {
        Alert.alert(
          'Feature Not Available',
          'The notification system is not yet implemented on the backend. Please contact your administrator.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to delete notification');
      }
    },
  });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences() });
      Alert.alert('Success', 'Notification preferences updated');
    },
    onError: (error: any) => {
      console.error('Failed to update preferences:', error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error in update preferences - handling automatically");
        handleAuthenticationError(error);
        return;
      }
      
      Alert.alert('Error', 'Failed to update notification preferences');
    },
  });
};
