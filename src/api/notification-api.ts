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
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);

  const url = queryParams.toString()
    ? `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}?${queryParams.toString()}`
    : API_CONFIG.ENDPOINTS.NOTIFICATIONS;

  const response = await api.get<NotificationResponse>(url);
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<UnreadCountResponse>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/unread-count`
  );
  return response.data;
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (): Promise<NotificationStatsResponse> => {
  const response = await api.get<NotificationStatsResponse>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/stats`
  );
  return response.data;
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = async (
  type: string,
  params?: { page?: number; limit?: number }
): Promise<NotificationResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = queryParams.toString()
    ? `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/type/${type}?${queryParams.toString()}`
    : `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/type/${type}`;

  const response = await api.get<NotificationResponse>(url);
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; message: string; data: Notification }> => {
  const response = await api.patch(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
  );
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.post(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/mark-all-read`
  );
  return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`
  );
  return response.data;
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferencesResponse> => {
  const response = await api.get<NotificationPreferencesResponse>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/preferences`
  );
  return response.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferencesResponse> => {
  const response = await api.put<NotificationPreferencesResponse>(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/preferences`,
    preferences
  );
  return response.data;
};

/**
 * Send webhook notification (for testing)
 */
export const sendWebhookNotification = async (data: {
  type: string;
  title: string;
  message: string;
  recipient: string;
  priority?: string;
}): Promise<{ success: boolean; message: string; data: Notification }> => {
  const response = await api.post(
    `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/webhook`,
    data
  );
  return response.data;
};
