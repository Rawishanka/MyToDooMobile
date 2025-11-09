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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

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
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => getNotifications(params),
    staleTime: 30000, // 30 seconds
    retry: 0, // Don't retry on 404 - endpoint might not exist yet
    enabled: true,
  });
};

/**
 * Hook to fetch unread count
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
    retry: 0, // Don't retry on 404
    enabled: true,
  });
};

/**
 * Hook to fetch notification statistics
 */
export const useNotificationStats = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.stats(),
    queryFn: getNotificationStats,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

/**
 * Hook to fetch notifications by type
 */
export const useNotificationsByType = (
  type: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.byType(type),
    queryFn: () => getNotificationsByType(type, params),
    enabled: !!type,
    staleTime: 30000,
    retry: 2,
  });
};

/**
 * Hook to fetch notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(),
    queryFn: getNotificationPreferences,
    staleTime: 300000, // 5 minutes
    retry: 2,
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
      Alert.alert('Error', 'Failed to update notification preferences');
    },
  });
};
