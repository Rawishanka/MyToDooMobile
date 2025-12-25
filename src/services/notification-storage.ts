/**
 * Notification Storage Service
 * 
 * Stores FCM notification history locally using AsyncStorage (mobile equivalent of localStorage on web)
 * This mirrors the web implementation where notifications are stored in localStorage.
 * 
 * Features:
 * - Store received notifications locally
 * - Retrieve notification history
 * - Mark notifications as read
 * - Clear old notifications
 * - Persist across app restarts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'fcm_notifications';
const MAX_NOTIFICATIONS = 100; // Keep last 100 notifications

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
}

/**
 * Save a new notification to storage
 */
export async function saveNotification(notification: {
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  try {
    const newNotification: StoredNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      type: notification.data?.type || 'unknown',
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Get existing notifications
    const existing = await getNotifications();
    
    // Add new notification at the beginning
    const updated = [newNotification, ...existing];
    
    // Keep only MAX_NOTIFICATIONS
    const trimmed = updated.slice(0, MAX_NOTIFICATIONS);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    console.log('✅ Notification saved to storage:', {
      id: newNotification.id,
      title: newNotification.title,
      total: trimmed.length
    });
  } catch (error) {
    console.error('❌ Error saving notification to storage:', error);
  }
}

/**
 * Get all stored notifications
 */
export async function getNotifications(): Promise<StoredNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    
    // Ensure all notifications have required fields
    return parsed.map((n: any) => ({
      id: n.id || `notif_${Date.now()}`,
      title: n.title || 'No Title',
      body: n.body || '',
      data: n.data || {},
      type: n.type || n.data?.type || 'unknown',
      createdAt: n.createdAt || new Date().toISOString(),
      readAt: n.readAt,
      isRead: n.isRead || false,
    }));
  } catch (error) {
    console.error('❌ Error loading notifications from storage:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    
    const updated = notifications.map(n => {
      if (n.id === notificationId && !n.isRead) {
        return {
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        };
      }
      return n;
    });
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const notifications = await getNotifications();
    
    const updated = notifications.map(n => ({
      ...n,
      isRead: true,
      readAt: n.readAt || new Date().toISOString(),
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    
    const filtered = notifications.filter(n => n.id !== notificationId);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    console.log('✅ Notification deleted:', notificationId);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ All notifications cleared');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  total: number;
  unread: number;
  read: number;
}> {
  try {
    const notifications = await getNotifications();
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      read: notifications.filter(n => n.isRead).length,
    };
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    return { total: 0, unread: 0, read: 0 };
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const notifications = await getNotifications();
    return notifications.filter(n => !n.isRead).length;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}
