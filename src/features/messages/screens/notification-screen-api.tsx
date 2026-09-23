// Notification Screen - Backend API + Local Storage Integration
// Loads notification history from the backend (GET /notifications) AND local FCM storage
// Supports mark-as-read, mark-all-as-read, delete, delete-all
import { AppAlert } from '@/src/shared/components/AppAlert';
import { BRAND_BLUE } from '@/src/shared/theme/brandColors';
import {
    deleteAllNotifications,
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type Notification as APINotification,
} from '@/src/api/notification-api';
import { NotificationHistoryList } from '@/src/features/messages/components/NotificationHistoryList';
import {
    clearAllNotifications as localClearAllNotifications,
    deleteNotification as localDeleteNotification,
    getNotifications as getLocalNotifications,
    markAllNotificationsAsRead as localMarkAllNotificationsAsRead,
    markNotificationAsRead as localMarkNotificationAsRead,
    type StoredNotification,
} from '@/src/services/notification-storage';
import { emitNotificationsChanged } from '@/src/services/notification-events';
import { navigateFromNotification } from '@/src/shared/utils/notification-navigation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue, isTablet, wp, hp } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

// Map backend Notification → StoredNotification shape used by NotificationHistoryList
function mapToDisplayNotification(n: APINotification): StoredNotification {
  const data = { ...(n.data || {}) };

  if (n.resourceId && !data.resourceId) {
    data.resourceId = n.resourceId;
  }
  if (n.resourceType && !data.resourceType) {
    data.resourceType = n.resourceType;
  }

  const resourceType = (n.resourceType || data.resourceType || '').toString().toUpperCase();
  if (n.resourceId) {
    if ((resourceType === 'CHAT' || resourceType === 'MESSAGE') && !data.chatId && !data.chat_id && n.resourceId) {
      data.chatId = n.resourceId;
    }
    if (resourceType === 'TASK' && !data.taskId && !data.task_id) {
      data.taskId = n.resourceId;
    }
    if (resourceType === 'REVIEW' && !data.reviewId) {
      const eventType = String(data.type || n.type || '').toUpperCase();
      if (eventType === 'REVIEW_REQUIRED') {
        if (!data.taskId && !data.task_id) data.taskId = n.resourceId;
      } else {
        data.reviewId = n.resourceId;
      }
    }
  }

  return {
    id: n._id || n.id,
    title: n.title,
    body: n.message,
    data,
    type: n.resourceType || data.type || n.type || 'unknown',
    createdAt: n.createdAt,
    readAt: n.readAt ?? undefined,
    isRead: n.isRead,
  };
}

const NotificationModalWithAPI: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all');

  // Load notifications from backend AND local FCM storage, then merge
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both sources in parallel
      const [apiResult, localResult] = await Promise.allSettled([
        getNotifications({ page: 1, limit: 50 }),
        getLocalNotifications(),
      ]);

      let merged: StoredNotification[] = [];

      // Add backend notifications
      if (apiResult.status === 'fulfilled' && apiResult.value.success) {
        console.log('🔔 Backend notifications:', apiResult.value.data.length);
        merged = apiResult.value.data.map(mapToDisplayNotification);
      } else {
        console.log('🔔 Backend notifications unavailable or empty, using local only');
      }

      // Merge local FCM notifications (deduplicate by id)
      if (localResult.status === 'fulfilled' && localResult.value.length > 0) {
        console.log('🔔 Local FCM notifications:', localResult.value.length);
        const backendIds = new Set(merged.map(n => n.id));
        const uniqueLocal = localResult.value.filter(n => !backendIds.has(n.id));
        merged = [...merged, ...uniqueLocal];
      }

      // Sort newest first
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('🔔 Total merged notifications:', merged.length);

      const unread = merged.filter(n => !n.isRead).length;

      // Auto-mark all as read when screen opens
      if (unread > 0) {
        try {
          await Promise.allSettled([
            markAllNotificationsAsRead(),
            localMarkAllNotificationsAsRead(),
          ]);
          emitNotificationsChanged();
          setNotifications(merged.map(n => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })));
          setUnreadCount(0);
          try {
            const Notifications = require('expo-notifications');
            Notifications.setBadgeCountAsync(0);
          } catch {}
        } catch {
          setNotifications(merged);
          setUnreadCount(unread);
        }
      } else {
        setNotifications(merged);
        setUnreadCount(0);
      }
      setTotalCount(merged.length);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  // Filter based on selected tab
  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === 'unread') return !n.isRead;
    if (selectedTab === 'read') return n.isRead;
    return true;
  });

  const readCount = totalCount - unreadCount;

  // Mark single notification as read (both backend + local)
  const handleMarkAsRead = async (id: string) => {
    try {
      await Promise.allSettled([
        markNotificationAsRead(id),
        localMarkNotificationAsRead(id),
      ]);
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => {
        const next = Math.max(0, prev - 1);
        try {
          const Notifications = require('expo-notifications');
          Notifications.setBadgeCountAsync(next);
        } catch {}
        return next;
      });
      emitNotificationsChanged();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Mark all as read (both backend + local)
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.allSettled([
        markAllNotificationsAsRead(),
        localMarkAllNotificationsAsRead(),
      ]);
      emitNotificationsChanged();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      try {
        const Notifications = require('expo-notifications');
        await Notifications.setBadgeCountAsync(0);
      } catch {}
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  // Delete single notification (both backend + local)
  const handleDelete = async (id: string) => {
    try {
      await Promise.allSettled([
        deleteNotification(id),
        localDeleteNotification(id),
      ]);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        emitNotificationsChanged();
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Delete all notifications (both backend + local)
  const handleDeleteAll = () => {
    AppAlert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.allSettled([
                deleteAllNotifications(),
                localClearAllNotifications(),
              ]);
              emitNotificationsChanged();
              setNotifications([]);
              setUnreadCount(0);
              setTotalCount(0);
              try {
                const Notifications = require('expo-notifications');
                await Notifications.setBadgeCountAsync(0);
              } catch {}
            } catch (error) {
              console.error('❌ Error deleting all notifications:', error);
              AppAlert.alert('Error', 'Failed to delete notifications. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#0B1120" : "#fff"} />

        {/* Header */}
        <View style={[styles.header, isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#F8FAFC' : '#000'} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Notifications</Text>
            {totalCount > 0 && (
              <View style={[styles.headerBadge, isDarkMode && { backgroundColor: '#38BDF8' }]}>
                <Text style={[styles.headerBadgeText, isDarkMode && { color: '#0F172A' }]}>{totalCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerActionBtn}>
                <Ionicons name="checkmark-done" size={20} color={isDarkMode ? '#38BDF8' : BRAND_BLUE} />
              </TouchableOpacity>
            )}
            {totalCount > 0 && (
              <TouchableOpacity onPress={handleDeleteAll} style={styles.headerActionBtn}>
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs — only show when there are notifications */}
        {totalCount > 0 && (
          <View style={[styles.tabContainer, isDarkMode && { backgroundColor: '#1E293B', borderBottomColor: '#334155' }]}>
            {[
              { key: 'all', label: `All (${totalCount})` },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'read', label: `Read (${readCount})` },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  selectedTab === tab.key && [styles.tabActive, isDarkMode && { borderBottomColor: '#38BDF8' }]
                ]}
                onPress={() => setSelectedTab(tab.key as any)}
              >
                <Text style={[
                  styles.tabText,
                  isDarkMode && { color: '#94A3B8' },
                  selectedTab === tab.key && [styles.tabTextActive, isDarkMode && { color: '#38BDF8' }]
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notification List */}
        <View style={styles.listContainer}>
          <NotificationHistoryList
            notifications={filteredNotifications}
            loading={isLoading}
            onRefresh={loadNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onNotificationPress={(notification) => {
              if (!notification.isRead) {
                handleMarkAsRead(notification.id);
              }

              onClose();
              setTimeout(() => {
                try {
                  const navigated = navigateFromNotification(router, notification);
                  if (!navigated) {
                    console.log('ℹ️ No navigation target for notification:', notification.id);
                  }
                } catch (error) {
                  console.error('❌ Notification navigation failed:', error);
                  AppAlert.alert(
                    'Navigation Error',
                    'Could not open this notification. Please try again from the relevant screen.'
                  );
                }
              }, 300);
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationModalWithAPI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? wp('6%') : 16,
    paddingVertical: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(isTablet ? 16 : 18),
    fontWeight: '600',
    color: '#000',
  },
  headerBadge: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: isTablet ? wp('6%') : 16,
    paddingVertical: isTablet ? 10 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: isTablet ? 10 : 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: BRAND_BLUE,
  },
  tabText: {
    fontSize: RFValue(isTablet ? 13 : 14),
    color: '#6c757d',
    fontWeight: '500',
  },
  tabTextActive: {
    color: BRAND_BLUE,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
});
