import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

// Notification Types
export interface Notification {
  _id: string;
  recipient: string;
  type: 'OFFER_MADE' | 'OFFER_ACCEPTED' | 'TASK_COMPLETED' | 'PAYMENT_RECEIVED' | 'MESSAGE_RECEIVED' | 'SYSTEM_UPDATE';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  createdAt: string;
  task?: {
    _id: string;
    title: string;
  };
  offer?: {
    _id: string;
    amount: number;
  };
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
  meta: {
    userId: string;
    userEmail: string;
    timestamp: string;
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  data: {
    total: number;
    unread: number;
    read: number;
    byType: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface NotificationPreferences {
  email: Record<string, boolean>;
  push: Record<string, boolean>;
  inApp: Record<string, boolean>;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

// API Functions
const api = createApi(API_CONFIG.BASE_URL);

/**
 * Get all notifications with pagination
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<NotificationResponse> => {
  // NOTE: This endpoint doesn't exist on backend - returning empty data
  // Backend only supports FCM push notifications, not notification history
  console.warn('⚠️  /api/notifications endpoint not available - notification history not supported');
  return { 
    success: true, 
    data: [], 
    pagination: { currentPage: 1, totalPages: 0, totalCount: 0 },
    unreadCount: 0 
  };
};

/**
 * Get unread notification count
 * NOTE: Endpoint doesn't exist - returning zero
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  console.warn('⚠️  /api/notifications/unread-count endpoint not available');
  return {
    success: true,
    unreadCount: 0,
    meta: {
      userId: '',
      userEmail: '',
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Get notification statistics
 * NOTE: Endpoint doesn't exist - returning empty stats
 */
export const getNotificationStats = async (): Promise<NotificationStatsResponse> => {
  console.warn('⚠️  /api/notifications/stats endpoint not available');
  return {
    success: true,
    data: {
      total: 0,
      unread: 0,
      read: 0,
      byType: []
    }
  };
};

/**
 * Get notifications by type
 * NOTE: Endpoint doesn't exist - returning empty list
 */
export const getNotificationsByType = async (
  type: string,
  params?: { page?: number; limit?: number }
): Promise<NotificationResponse> => {
  console.warn('⚠️  /api/notifications/type endpoint not available');
  return {
    success: true,
    data: [],
    pagination: { currentPage: 1, totalPages: 0, totalCount: 0 },
    unreadCount: 0
  };
};

/**
 * Mark a notification as read
 * NOTE: Endpoint doesn't exist - no-op
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; message: string; data: Notification }> => {
  console.warn('⚠️  /api/notifications/:id/read endpoint not available');
  return { 
    success: true, 
    message: 'Endpoint not available', 
    data: {} as Notification 
  };
};

/**
 * Mark all notifications as read
 * NOTE: Endpoint doesn't exist - no-op
 */
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.warn('⚠️  /api/notifications/mark-all-read endpoint not available');
  return { success: true, message: 'Endpoint not available' };
};

/**
 * Delete a notification
 * NOTE: Endpoint doesn't exist - no-op
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; message: string }> => {
  console.warn('⚠️  /api/notifications/:id endpoint not available');
  return { success: true, message: 'Endpoint not available' };
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferencesResponse> => {
  console.warn('⚠️  /api/notifications/preferences endpoint not available');
  return {
    success: true,
    data: {
      email: {},
      push: {},
      inApp: {}
    }
  };
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferencesResponse> => {
  console.warn('⚠️  /api/notifications/preferences endpoint not available');
  return {
    success: true,
    data: {
      email: {},
      push: {},
      inApp: {}
    }
  };
};

/**
 * Send webhook notification (for testing)
 * NOTE: Endpoint doesn't exist - no-op
 */
export const sendWebhookNotification = async (data: {
  type: string;
  title: string;
  message: string;
  recipient: string;
  priority?: string;
}): Promise<{ success: boolean; message: string; data: Notification }> => {
  console.warn('⚠️  /api/notifications/webhook endpoint not available');
  return { 
    success: false, 
    message: 'Endpoint not available', 
    data: {} as Notification 
  };
};

/**
 * Send test FCM notification (quick test using existing tokens)
 */
export const sendQuickTestNotification = async (data: {
  title: string;
  body: string;
}): Promise<{ success: boolean; message: string; sentTo: number }> => {
  const response = await api.post(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/quick-test`,
    data
  );
  return response.data;
};

/**
 * Send test FCM notification to specific user
 */
export const sendTestFCMNotification = async (data: {
  userId: string;
  title: string;
  body: string;
  data?: any;
}): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/test-fcm`,
    data
  );
  return response.data;
};
