// Updated Notification Screen with Firebase FCM Integration
import { Notification, sendQuickTestNotification } from '@/src/api/notification-api';
import { useGetFCMTokens } from '@/src/shared/hooks/useFCM';
import {
    useDeleteNotification,
    useMarkAllAsRead,
    useMarkAsRead,
    useNotifications,
    useUnreadCount,
} from '@/src/shared/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

// Helper function to format time - simple version without date-fns
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
};

// Helper function to get notification icon
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'OFFER_MADE':
      return 'pricetag';
    case 'OFFER_ACCEPTED':
      return 'checkmark-circle';
    case 'TASK_COMPLETED':
      return 'checkmark-done';
    case 'PAYMENT_RECEIVED':
      return 'cash';
    case 'MESSAGE_RECEIVED':
      return 'chatbubble';
    case 'SYSTEM_UPDATE':
      return 'notifications';
    default:
      return 'information-circle';
  }
};

// Helper function to get notification color
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'OFFER_MADE':
      return '#007bff';
    case 'OFFER_ACCEPTED':
      return '#28a745';
    case 'TASK_COMPLETED':
      return '#17a2b8';
    case 'PAYMENT_RECEIVED':
      return '#ffc107';
    case 'MESSAGE_RECEIVED':
      return '#6c757d';
    case 'SYSTEM_UPDATE':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

// Notification Item Component
const NotificationItemComponent = ({
  item,
  onPress,
  onDelete,
}: {
  item: Notification;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const iconName = getNotificationIcon(item.type);
  const iconColor = getNotificationColor(item.type);

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName as any} size={24} color={iconColor} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#dc3545" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const NotificationModalWithAPI: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // Check FCM token status (non-blocking)
  const { data: fcmTokensData, isLoading: fcmLoading, error: fcmError } = useGetFCMTokens();
  
  // Only fetch notifications when modal is visible
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useNotifications({ page: 1, limit: 50 });

  const { data: unreadCountData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const markAllAsRead = useMarkAllAsRead();

  // Check if FCM is properly set up (but don't block notifications)
  const fcmTokens = fcmTokensData?.data?.tokens || [];
  const isFCMConfigured = fcmTokens.length > 0;

  // Handle sending test notification via backend
  const handleSendTestNotification = async () => {
    if (!isFCMConfigured) {
      Alert.alert(
        'FCM Not Configured',
        'Please build a native APK to enable push notifications.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSendingTest(true);
    try {
      console.log('📤 Sending test notification via backend...');
      
      const result = await sendQuickTestNotification({
        title: '🎯 Test Notification',
        body: 'This is a test push notification from MyToDoo! If you see this, FCM is working perfectly! 🎉',
      });

      console.log('✅ Test notification sent:', result);
      
      Alert.alert(
        'Success!',
        `Test notification sent to ${result.sentTo} device(s). Check your device notification tray!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('❌ Failed to send test notification:', error);
      
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to send test notification. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  // Safely extract data with fallbacks
  const notifications = React.useMemo(() => {
    return (notificationsData as any)?.data || [];
  }, [notificationsData]);
  
  const unreadCount = React.useMemo(() => {
    return (unreadCountData as any)?.count || (unreadCountData as any)?.unreadCount || 0;
  }, [unreadCountData]);

  // Log detailed status for debugging
  useEffect(() => {
    if (visible) {
      const isExpoGo = __DEV__ && !process.env.EAS_BUILD;
      
      console.log('\n📱 ========== NOTIFICATION SCREEN STATUS ==========');
      console.log('🔔 Notifications API:');
      console.log('  - Loading:', isLoading);
      console.log('  - Error:', error?.message || 'None');
      console.log('  - Error Status:', (error as any)?.response?.status);
      console.log('  - Notifications Count:', notifications?.length || 0);
      console.log('  - Unread Count:', unreadCount);
      
      console.log('\n📱 FCM Status:');
      console.log('  - Loading:', fcmLoading);
      console.log('  - Error:', fcmError?.message || 'None');
      console.log('  - Configured:', isFCMConfigured);
      console.log('  - Total Devices:', fcmTokensData?.data?.totalDevices || 0);
      console.log('  - Tokens:', fcmTokens.length);
      
      if (isExpoGo) {
        console.log('\n⚠️  EXPO GO DETECTED:');
        console.log('  - Push notifications require native build');
        console.log('  - Run: npx eas build --platform android --profile development');
        console.log('  - Notifications API will still work for viewing');
      }
      
      console.log('\n💡 Note: FCM is optional for viewing notifications');
      console.log('   Notifications work via backend endpoints');
      console.log('   FCM is only needed for push notifications\n');
      console.log('================================================\n');
    }
  }, [visible, isFCMConfigured, fcmTokensData, fcmLoading, fcmError, isLoading, error, notifications, unreadCount, fcmTokens]);

  // Handle notification press - mark as read
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id as any);
    }

    // Show notification details
    Alert.alert(
      notification.title,
      notification.message,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  // Handle delete notification
  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNotification.mutate(notificationId as any);
          },
        },
      ]
    );
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert('Info', 'No unread notifications');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notifications as read?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark All',
          onPress: () => {
            markAllAsRead.mutate();
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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Expo Go Warning */}
        {__DEV__ && !process.env.EAS_BUILD && (
          <View style={styles.expoGoWarning}>
            <Ionicons name="warning" size={18} color="#FF9500" />
            <Text style={styles.expoGoWarningText}>
              Expo Go: Push notifications require native build (APK). Run: npx eas build --platform android
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        )}

        {/* Backend Errors (including 404) - Treat as empty state */}
        {error && !isLoading && (
          <View style={styles.centerContainer}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll receive notifications for new messages, offers, and task updates
            </Text>
            
            {/* FCM Test Button - Only if configured */}
            {isFCMConfigured && (
              <TouchableOpacity 
                style={[styles.testButton, isSendingTest && styles.testButtonDisabled]}
                onPress={handleSendTestNotification}
                disabled={isSendingTest}
              >
                {isSendingTest ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.testButtonText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="notifications" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.testButtonText}>Send Test Notification</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <View style={styles.centerContainer}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications here when you receive offers, messages, and updates
            </Text>
          </View>
        )}

        {/* Notifications List */}
        {!isLoading && !error && notifications.length > 0 && (
          <FlatList
            data={notifications}
            renderItem={({ item }) => (
              <NotificationItemComponent
                item={item}
                onPress={() => handleNotificationPress(item)}
                onDelete={() => handleDeleteNotification(item._id)}
              />
            )}
            keyExtractor={(item) => item._id}
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={['#007bff']}
              />
            }
          />
        )}
      </View>
    </Modal>
  );
};

export default NotificationModalWithAPI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  badgeContainer: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    padding: 4,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#f8f9fa',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#007bff',
    textAlign: 'center',
  },
  infoSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  fcmStatusBox: {
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fcmStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fcmStatusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  fcmStatusDetail: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
    paddingLeft: 36,
  },
  instructionsBox: {
    marginTop: 20,
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004085',
    marginBottom: 12,
  },
  instructionsItem: {
    fontSize: 13,
    color: '#004085',
    marginBottom: 8,
    lineHeight: 18,
  },
  buildButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  testButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
    gap: 8,
  },
  expoGoWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#0052A2',
    flex: 1,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
