// FCM Notification Screen - Push Notifications Only
// Note: Backend doesn't have /api/notifications endpoint for history
// This screen only tests FCM push notification sending
import { sendQuickTestNotification } from '@/src/api/notification-api';
import { useGetFCMTokens } from '@/src/shared/hooks/useFCM';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModalWithAPI: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // Check FCM token status
  const { data: fcmTokensData, isLoading: fcmLoading, error: fcmError } = useGetFCMTokens();

  // Check if FCM is properly set up
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

  // Log FCM status for debugging
  useEffect(() => {
    if (visible) {
      const isExpoGo = __DEV__ && !process.env.EAS_BUILD;
      
      console.log('\n📱 ========== FCM NOTIFICATION STATUS ==========');
      console.log('📱 FCM Status:');
      console.log('  - Loading:', fcmLoading);
      console.log('  - Error:', fcmError?.message || 'None');
      console.log('  - Configured:', isFCMConfigured);
      console.log('  - Total Devices:', fcmTokensData?.data?.totalDevices || 0);
      console.log('  - Tokens:', fcmTokens.length);
      
      if (isExpoGo) {
        console.log('\n⚠️  EXPO GO DETECTED:');
        console.log('  - Push notifications require native build');
        console.log('  - Run: npx eas build --platform android --profile development');
      }
      
      console.log('\n💡 Note: Backend does not have /api/notifications endpoint');
      console.log('   Only FCM push notifications are supported');
      console.log('   Notification history is not available\n');
      console.log('================================================\n');
    }
  }, [visible, isFCMConfigured, fcmTokensData, fcmLoading, fcmError, fcmTokens]);

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
            <Text style={styles.headerTitle}>Push Notifications</Text>
          </View>
          <View style={styles.markAllButton} />
        </View>

        {/* Expo Go Warning */}
        {__DEV__ && !process.env.EAS_BUILD && (
          <View style={styles.expoGoWarning}>
            <Ionicons name="warning" size={20} color="#856404" />
            <Text style={styles.expoGoWarningText}>
              Push notifications require a native build. Use: npx eas build
            </Text>
          </View>
        )}

        {/* FCM Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={isFCMConfigured ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={isFCMConfigured ? "#28a745" : "#ffc107"} 
            />
            <Text style={styles.statusTitle}>
              {isFCMConfigured 
                ? 'FCM Configured' 
                : (__DEV__ && !process.env.EAS_BUILD) 
                  ? 'Expo Go Mode - FCM Unavailable'
                  : 'FCM Not Configured'}
            </Text>
          </View>
          
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: isFCMConfigured ? '#28a745' : '#ffc107' }]}>
              {fcmLoading ? 'Loading...' : isFCMConfigured ? 'Ready' : 'Not Ready'}
            </Text>
          </View>
          
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Devices:</Text>
            <Text style={styles.statusValue}>
              {fcmTokensData?.data?.totalDevices || 0}
            </Text>
          </View>
          
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Tokens:</Text>
            <Text style={styles.statusValue}>
              {fcmTokens.length}
            </Text>
          </View>
        </View>

        {/* Info Message */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0c5460" />
          <Text style={styles.infoText}>
            Push notifications are sent when you receive messages, offers, or task updates. 
            They appear in your device's notification tray.
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.centerContainer}>
          <Ionicons name="notifications" size={64} color="#ccc" />
          <Text style={styles.emptyText}>FCM Push Notifications</Text>
          <Text style={styles.emptySubtext}>
            This feature sends push notifications to your device. Notification history is not available.
          </Text>
          
          {/* FCM Test Button */}
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

          {/* Warning if not configured */}
          {!isFCMConfigured && (
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#856404" />
              <Text style={styles.warningText}>
                {__DEV__ && !process.env.EAS_BUILD 
                  ? "⚠️ Expo Go Detected\nPush notifications require a native build.\n\nBuild with: npx eas build\n\nNote: This is normal in development mode."
                  : "Build a native APK to enable push notifications"}
              </Text>
            </View>
          )}
        </View>
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
    marginRight: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  markAllButton: {
    padding: 8,
    width: 40,
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  expoGoWarningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#856404',
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 0,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0c5460',
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
    minWidth: 200,
  },
  testButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  warningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
});
