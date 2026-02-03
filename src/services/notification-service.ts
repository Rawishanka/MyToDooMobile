/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * 
 * IMPORTANT: This uses React Native Firebase for push notifications
 * - Expo Go: FCM not available (skip initialization gracefully)
 * - Native Build/APK: Full FCM support with Firebase SDK
 * 
 * Notifications are sent directly from backend via Firebase Admin SDK
 * No need for /notifications REST endpoint - FCM handles delivery!
 */

import { removeFCMToken, saveFCMToken } from '@/src/api/fcm-api';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import { saveNotification } from './notification-storage';

// ==================== ENVIRONMENT DETECTION ====================

const isExpoGo = Constants.appOwnership === 'expo';
const isNativeBuild = !isExpoGo;

console.log(`🔍 Notification Mode: ${isNativeBuild ? 'NATIVE FCM' : 'EXPO GO (FCM unavailable)'}`);

// ==================== REACT NATIVE FIREBASE (CONDITIONAL) ====================

let messaging: any = null;

// Only try to load React Native Firebase in native builds
if (isNativeBuild) {
  try {
    messaging = require('@react-native-firebase/messaging').default;
    console.log('✅ React Native Firebase FCM loaded successfully');
  } catch (error) {
    console.log('⚠️ React Native Firebase not available');
  }
} else {
  console.log('ℹ️ Expo Go detected - FCM will be available in native build');
}

// ==================== TYPES ====================

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

// ==================== PERMISSION HANDLING ====================

/**
 * Request notification permissions (works in both environments)
 */
export const requestNotificationPermissions = async (): Promise<NotificationPermissionStatus> => {
  try {
    console.log('📱 Requesting notification permissions...');

    // Native Build: Use Firebase
    if (isNativeBuild && messaging) {
      // Android 13+ (API 33+): Request POST_NOTIFICATIONS permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        console.log('📱 Android 13+ detected - requesting POST_NOTIFICATIONS permission...');
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'MyToDoo Notification Permission',
            message: 'MyToDoo would like to send you notifications for new messages, offers, and updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Android POST_NOTIFICATIONS permission granted');
        } else {
          console.warn('⚠️ Android POST_NOTIFICATIONS permission denied');
          return {
            granted: false,
            canAskAgain: granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? false : true,
          };
        }
      }

      // iOS or older Android: Use Firebase permission request
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log('✅ Firebase permission status:', { authStatus, enabled });

        return {
          granted: enabled,
          canAskAgain: authStatus !== messaging.AuthorizationStatus.DENIED,
        };
      } catch (firebaseError) {
        console.warn('⚠️ Firebase not initialized yet:', firebaseError);
        return {
          granted: false,
          canAskAgain: true,
        };
      }
    }

    // Expo Go: Permissions not available (SDK 53+)
    console.warn('⚠️ Expo Go: Push permissions require native build');
    return {
      granted: false,
      canAskAgain: true,
    };
  } catch (error) {
    console.error('❌ Failed to request permissions:', error);
    return {
      granted: false,
      canAskAgain: true,
    };
  }
};

/**
 * Check if notification permissions are granted
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    // Native Build: Use Firebase
    if (isNativeBuild && messaging) {
      // Android 13+: Check POST_NOTIFICATIONS permission first
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (!hasPermission) {
          console.log('🔍 Android POST_NOTIFICATIONS permission not granted');
          return false;
        }
        console.log('✅ Android POST_NOTIFICATIONS permission granted');
      }

      // Check Firebase authorization status
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('🔍 Firebase permissions:', { enabled, authStatus });
      return enabled;
    }

    // Expo Go: Permissions not available
    console.log('ℹ️ Expo Go: Permission check skipped (native build required)');
    return false;
  } catch (error) {
    console.error('❌ Failed to check permissions:', error);
    return false;
  }
};

// ==================== TOKEN MANAGEMENT ====================

/**
 * Get push notification token (works in both environments)
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    console.log('🔑 Getting push notification token...');

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.warn('⚠️ Push notifications not supported on simulator/emulator');
      return null;
    }

    // Request permissions first (iOS requires this)
    if (Platform.OS === 'ios') {
      const { granted } = await requestNotificationPermissions();
      if (!granted) {
        console.warn('⚠️ Notification permissions not granted');
        return null;
      }
    }

    // Native Build: Get FCM token from Firebase
    if (isNativeBuild && messaging) {
      const token = await messaging().getToken();
      if (token) {
        console.log('✅ FCM token obtained (Firebase):', token.substring(0, 20) + '...');
        return token;
      }
    }

    // Expo Go: Push notifications not available in SDK 53+
    console.warn('⚠️ Expo Go: Push notifications require native build');
    console.log('ℹ️ Build with: npx eas build --platform android --profile development');
    return null;
  } catch (error) {
    console.error('❌ Failed to get push token:', error);
    return null;
  }
};

/**
 * Get device type
 */
export const getDeviceType = (): 'android' | 'ios' | 'web' => {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  return 'web';
};

/**
 * Get unique device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    const deviceType = Platform.OS;
    const deviceModel = Constants.deviceName || 'unknown';
    const installationId = Constants.installationId || '';

    const deviceId = installationId
      ? `${deviceType}-${installationId}`
      : `${deviceType}-${deviceModel}-${Date.now()}`.replace(/\s/g, '-');

    console.log('🆔 Device ID:', deviceId);
    return deviceId;
  } catch (error) {
    console.error('❌ Failed to get device ID:', error);
    return `device-${Date.now()}`;
  }
};

/**
 * Register push token with backend (works in both environments)
 */
export const registerFCMToken = async (): Promise<boolean> => {
  try {
    console.log('📝 Registering push token with backend...');

    // Get push token (works in both environments)
    const token = await getFCMToken();
    if (!token) {
      console.warn('⚠️ No push token to register');
      return false;
    }

    // Get device info
    const device = getDeviceType();
    const deviceId = await getDeviceId();

    // Save token to backend
    const response = await saveFCMToken({
      token,
      device,
      deviceId,
    });

    console.log('✅ Push token registered with backend:', {
      totalDevices: response.data.totalDevices,
      tokenType: isNativeBuild ? 'FCM (Native)' : 'Expo Push Token',
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to register push token:', error);
    return false;
  }
};

/**
 * Unregister push token from backend
 */
export const unregisterFCMToken = async (): Promise<boolean> => {
  try {
    console.log('🗑️ Unregistering push token from backend...');

    // Get current push token
    const token = await getFCMToken();
    if (!token) {
      console.warn('⚠️ No push token to unregister');
      return false;
    }

    // Remove token from backend
    await removeFCMToken({ token });

    console.log('✅ Push token unregistered from backend');
    return true;
  } catch (error) {
    console.error('❌ Failed to unregister push token:', error);
    return false;
  }
};

/**
 * Delete push token from device
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting push token from device...');

    // Native Build: Delete FCM token
    if (isNativeBuild && messaging) {
      await messaging().deleteToken();
      console.log('✅ FCM token deleted from device');
      return true;
    }

    // Expo Go: Tokens are managed by Expo, just clear from backend
    console.log('ℹ️ Expo tokens managed by Expo - cleared from backend');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete push token:', error);
    return false;
  }
};

// ==================== NOTIFICATION LISTENERS ====================

/**
 * Setup notification handlers (works in both environments)
 * 
 * @param queryClient - Optional QueryClient for cache invalidation on notification receive
 */
export const setupNotificationHandlers = (queryClient?: any) => {
  console.log('🔔 Setting up notification handlers...');

  // Native Build: Use Firebase handlers
  if (isNativeBuild && messaging) {
    setupFirebaseHandlers(queryClient);
    console.log('✅ Firebase notification handlers setup complete');
  } else {
    // Expo Go: Notification handlers not available in SDK 53+
    console.log('ℹ️ Expo Go: Notification handlers require native build');
    console.log('ℹ️ Build with: npx eas build --platform android --profile development');
  }
};

/**
 * Invalidate React Query caches based on notification type for real-time sync
 */
const handleNotificationDataRefresh = (notificationType: string, queryClient: any) => {
  if (!queryClient) return;

  console.log('🔄 [Real-time Sync] Invalidating caches for notification type:', notificationType);

  try {
    switch (notificationType) {
      case 'NEW_TASK':
      case 'TASK_CREATED':
        // Invalidate all task lists
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        console.log('✅ Invalidated tasks cache');
        break;

      case 'OFFER_MADE':
      case 'NEW_OFFER':
        // Invalidate offers and task details
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        console.log('✅ Invalidated offers and tasks cache');
        break;

      case 'OFFER_ACCEPTED':
      case 'OFFER_REJECTED':
        // Invalidate offers and my tasks
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'my-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'my-offers'] });
        console.log('✅ Invalidated offers and my tasks cache');
        break;

      case 'NEW_MESSAGE':
      case 'MESSAGE_RECEIVED':
        // Invalidate chat and message lists
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        console.log('✅ Invalidated chats cache');
        break;

      case 'TASK_COMPLETED':
      case 'TASK_STATUS_CHANGED':
        // Invalidate all task-related caches
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        console.log('✅ Invalidated all tasks cache');
        break;

      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_SENT':
        // Invalidate payment and task caches
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        console.log('✅ Invalidated payments and tasks cache');
        break;

      default:
        // For any other notification, invalidate all task caches as safety measure
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        console.log('✅ Invalidated tasks cache (default)');
    }
  } catch (error) {
    console.error('❌ Error invalidating caches:', error);
  }
};

/**
 * Setup Firebase FCM handlers (native builds)
 */
const setupFirebaseHandlers = (queryClient?: any) => {
  if (!messaging) return;

  console.log('🔥 Setting up Firebase FCM handlers...');

  // Foreground notifications - Display them when app is open
  messaging().onMessage(async (remoteMessage: any) => {
    console.log('🔔 [Foreground] Notification received:', {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
    
    // Save notification to local storage (AsyncStorage) - NON-BLOCKING
    saveNotification({
      title: remoteMessage.notification?.title || 'Notification',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
    }).catch(error => {
      console.error('Failed to save notification to storage:', error);
    });
    
    // Trigger real-time data refresh when notification arrives
    if (remoteMessage.data?.type) {
      handleNotificationDataRefresh(remoteMessage.data.type, queryClient);
    }
    
    // On Android, we need to create a local notification to display it
    // because foreground messages don't automatically show
    if (Platform.OS === 'android') {
      try {
        const Notifications = require('expo-notifications');
        
        // Configure notification behavior
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        
        // Display the notification locally
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title || 'New Notification',
            body: remoteMessage.notification?.body || '',
            data: remoteMessage.data || {},
          },
          trigger: null, // Show immediately
        });
        
        console.log('✅ Foreground notification displayed on Android');
      } catch (error) {
        console.error('❌ Error displaying foreground notification:', error);
      }
    }
  });

  // Background notification opened - User tapped notification while app was in background
  messaging().onNotificationOpenedApp((remoteMessage: any) => {
    console.log('🔔 [Background] Notification tapped:', {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
    
    // � Save notification to local storage (AsyncStorage) if not already saved
    saveNotification({
      title: remoteMessage.notification?.title || 'Notification',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
    });
    
    // �🚀 NEW: Trigger real-time data refresh when user opens notification
    if (remoteMessage.data?.type) {
      handleNotificationDataRefresh(remoteMessage.data.type, queryClient);
    }
    
    // TODO: Navigate to appropriate screen based on remoteMessage.data
  });

  // Quit state notification opened - User tapped notification while app was closed
  messaging()
    .getInitialNotification()
    .then((remoteMessage: any) => {
      if (remoteMessage) {
        console.log('🔔 [Quit State] Notification tapped:', {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
        });
        
        // � Save notification to local storage (AsyncStorage)
        saveNotification({
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
        });
        
        // �🚀 NEW: Trigger real-time data refresh when app opens from notification
        if (remoteMessage.data?.type) {
          handleNotificationDataRefresh(remoteMessage.data.type, queryClient);
        }
        
        // TODO: Navigate to appropriate screen based on remoteMessage.data
      }
    });

  // Token refresh - Firebase sometimes refreshes tokens
  messaging().onTokenRefresh(async (token: string) => {
    console.log('🔄 FCM token refreshed:', token.substring(0, 20) + '...');

    try {
      const device = getDeviceType();
      const deviceId = await getDeviceId();

      await saveFCMToken({
        token,
        device,
        deviceId,
      });

      console.log('✅ Refreshed FCM token registered with backend');
    } catch (error) {
      console.error('❌ Failed to register refreshed FCM token:', error);
    }
  });
};

/**
 * Setup Expo notification handlers (NOT AVAILABLE IN SDK 53+)
 * This function is kept for reference but won't be called in Expo Go
 */
const setupExpoHandlers = () => {
  console.log('⚠️ Expo notification handlers removed in SDK 53+');
  console.log('ℹ️ Use native build for push notifications');
  // Expo notification handlers are no longer available in SDK 53+
  // They have been removed from Expo Go
};

// ==================== EXPORT ENVIRONMENT INFO ====================

export const getNotificationEnvironment = () => ({
  isExpoGo,
  isNativeBuild,
  usingFirebase: isNativeBuild && !!messaging,
  sdkVersion: 53, // Expo SDK 53+ removes Expo Go push support
  requiresNativeBuild: !isNativeBuild || !messaging,
});
