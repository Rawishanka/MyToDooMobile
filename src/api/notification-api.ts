import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

// Notification Types
export interface Notification {
  _id: string;
  id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'email' | 'in-app' | 'sms' | 'push' | string;
  isRead: boolean;
  readAt: string | null;
  deliveryStatus: string;
  resourceType?: string;
  resourceId?: string;
  data?: Record<string, any>;
  isActive: boolean;
  status: 'read' | 'unread' | string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: NotificationPagination;
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
 * GET /notifications
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}): Promise<NotificationResponse> => {
  const response = await api.get<NotificationResponse>(
    API_CONFIG.ENDPOINTS.NOTIFICATIONS,
    { params: { page: 1, limit: 20, ...params } }
  );
  return response.data;
};

/**
 * Get unread notification count (derived from getNotifications response)
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await getNotifications({ limit: 1 });
  return {
    success: true,
    unreadCount: response.unreadCount,
    meta: {
      userId: '',
      userEmail: '',
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Get notification statistics (derived from listing endpoint)
 */
export const getNotificationStats = async (): Promise<NotificationStatsResponse> => {
  const response = await getNotifications({ limit: 1 });
  const unread = response.unreadCount;
  const total = response.pagination.total;
  return {
    success: true,
    data: {
      total,
      unread,
      read: total - unread,
      byType: []
    }
  };
};

/**
 * Get notifications filtered by type
 */
export const getNotificationsByType = async (
  type: string,
  params?: { page?: number; limit?: number }
): Promise<NotificationResponse> => {
  return getNotifications({ type, ...params });
};

/**
 * Mark a notification as read
 * PATCH /notifications/{id}/read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; message: string; data: Notification }> => {
  const response = await api.patch<{ success: boolean; message: string; data: Notification }>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
  );
  return response.data;
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
  modifiedCount?: number;
}> => {
  const response = await api.patch<{ success: boolean; message: string; modifiedCount: number }>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/read-all`
  );
  return response.data;
};

/**
 * Delete a single notification
 * DELETE /notifications/{id}
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`
  );
  return response.data;
};

/**
 * Delete all notifications
 * DELETE /notifications/all
 */
export const deleteAllNotifications = async (): Promise<{
  success: boolean;
  message: string;
  modifiedCount?: number;
}> => {
  const response = await api.delete<{ success: boolean; message: string; modifiedCount: number }>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/all`
  );
  return response.data;
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
