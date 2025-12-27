// FCM Notification Screen - With Local History Storage
// Notifications are stored locally in AsyncStorage (similar to web's localStorage)
import { sendQuickTestNotification } from '@/src/api/notification-api';
import { useGetFCMTokens } from '@/src/shared/hooks/useFCM';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  type StoredNotification,
} from '@/src/services/notification-storage';
import { NotificationHistoryList } from '@/src/features/messages/components/NotificationHistoryList';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModalWithAPI: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, read: 0 });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all');
  
  // Check FCM token status
  const { data: fcmTokensData, isLoading: fcmLoading, error: fcmError } = useGetFCMTokens();

  // Check if FCM is properly set up
  const fcmTokens = fcmTokensData?.data?.tokens || [];
  const isFCMConfigured = fcmTokens.length > 0;

  // Load notification history
  const loadNotifications = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const [allNotifications, stats] = await Promise.all([
        getNotifications(),
        getNotificationStats(),
      ]);
      setNotifications(allNotifications);
      setNotificationStats(stats);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load notifications when modal opens
  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === 'unread') return !n.isRead;
    if (selectedTab === 'read') return n.isRead;
    return true;
  });

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await loadNotifications();
  };

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

  // Log FCM status for debugging
  useEffect(() => {
    if (visible) {
      // Log FCM status for debugging
      const isExpoGo = __DEV__ && !process.env.EAS_BUILD;
      
      console.log('\n📱 ========== FCM NOTIFICATION STATUS ==========');
      console.log('📱 FCM Status:');
      console.log('  - Loading:', fcmLoading);
      console.log('  - Error:', fcmError?.message || 'None');
      console.log('  - Configured:', isFCMConfigured);
      console.log('  - Total Devices:', fcmTokensData?.data?.totalDevices || 0);
      console.log('  - Tokens:', fcmTokens.length);
      console.log('\n📜 Notification History (AsyncStorage):');
      console.log('  - Total:', notificationStats.total);
      console.log('  - Unread:', notificationStats.unread);
      console.log('  - Read:', notificationStats.read);
      
      if (isExpoGo) {
        console.log('\n⚠️  EXPO GO DETECTED:');
        console.log('  - Push notifications require native build');
        console.log('  - Run: npx eas build --platform android --profile development');
      }
      
      console.log('\n💡 Note: Notifications are stored locally in AsyncStorage');
      console.log('   Similar to web implementation using localStorage');
      console.log('================================================\n');
    }
  }, [visible, isFCMConfigured, fcmTokensData, fcmLoading, fcmError, fcmTokens, notificationStats]);

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
            <Ionicons name="chevron-back" size={wp('6%')} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {notificationStats.total > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{notificationStats.total}</Text>
              </View>
            )}
          </View>
          {notificationStats.unread > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={wp('5%')} color="#007bff" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {notificationStats.unread === 0 && (
            <View style={styles.markAllButton} />
          )}
        </View>

        {/* Expo Go Warning */}
        {__DEV__ && !process.env.EAS_BUILD && (
          <View style={styles.expoGoWarning}>
            <Ionicons name="warning" size={wp('5%')} color="#856404" />
            <Text style={styles.expoGoWarningText}>
              Push notifications require a native build. Use: npx eas build
            </Text>
          </View>
        )}

        {/* Info Message */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={wp('5%')} color="#0c5460" />
          <Text style={styles.infoText}>
            Push notifications are sent when you receive messages, offers, or task updates. 
            {isFCMConfigured ? ' Notification history is stored locally on your device.' : ' They appear in your device\'s notification tray.'}
          </Text>
        </View>

        {/* Tabs */}
        {notifications.length > 0 && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
              onPress={() => setSelectedTab('all')}
            >
              <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
                All ({notificationStats.total})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'unread' && styles.tabActive]}
              onPress={() => setSelectedTab('unread')}
            >
              <Text style={[styles.tabText, selectedTab === 'unread' && styles.tabTextActive]}>
                Unread ({notificationStats.unread})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'read' && styles.tabActive]}
              onPress={() => setSelectedTab('read')}
            >
              <Text style={[styles.tabText, selectedTab === 'read' && styles.tabTextActive]}>
                Read ({notificationStats.read})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification History List */}
        <View style={styles.listContainer}>
          <NotificationHistoryList
            notifications={filteredNotifications}
            loading={isLoadingHistory}
            onRefresh={loadNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onNotificationPress={(notification) => {
              console.log('Notification pressed:', notification);
              // TODO: Navigate to relevant screen based on notification.data
            }}
          />
        </View>

        {/* Warning if not configured */}
        {!isFCMConfigured && notifications.length === 0 && (
          <View style={styles.centerContainer}>
            <Ionicons name="notifications-off" size={wp('16%')} color="#ccc" />
            <Text style={styles.emptyText}>FCM Not Configured</Text>
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={wp('6%')} color="#856404" />
              <Text style={styles.warningText}>
                {__DEV__ && !process.env.EAS_BUILD 
                  ? "⚠️ Expo Go Detected\nPush notifications require a native build.\n\nBuild with: npx eas build\n\nNote: This is normal in development mode."
                  : "Build a native APK to enable push notifications"}
              </Text>
            </View>
          </View>
        )}
      </View>
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
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#000',
  },
  headerBadge: {
    backgroundColor: '#007bff',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.25%'),
    marginLeft: wp('2%'),
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('2%'),
  },
  markAllText: {
    fontSize: RFValue(12),
    color: '#007bff',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    margin: wp('4%'),
  },
  expoGoWarningText: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: RFValue(13),
    color: '#856404',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    margin: wp('4%'),
    marginTop: hp('1%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  statusTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    marginLeft: wp('2%'),
    color: '#000',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('0.75%'),
  },
  statusLabel: {
    fontSize: RFValue(14),
    color: '#6c757d',
  },
  statusValue: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#000',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
    borderWidth: 1,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    margin: wp('4%'),
    marginTop: 0,
  },
  infoText: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: RFValue(13),
    color: '#0c5460',
    lineHeight: RFValue(18),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1%'),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: RFValue(14),
    color: '#6c757d',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
  },
  emptyText: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#333',
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    marginTop: hp('1%'),
    lineHeight: RFValue(20),
  },
  bottomButtonContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
  },
  testButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: wp('2%'),
    padding: wp('4%'),
    marginTop: hp('3%'),
  },
  warningText: {
    marginLeft: wp('3%'),
    fontSize: RFValue(14),
    color: '#856404',
    fontWeight: '500',
  },
});
