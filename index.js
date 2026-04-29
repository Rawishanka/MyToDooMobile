/**
 * MyToDoo Mobile - Root Entry Point
 * 
 * This file is the FIRST to run when the app starts.
 * It registers the FCM background message handler BEFORE anything else.
 * 
 * CRITICAL: Background handler MUST be registered at top level!
 */

import { Animated, Platform, Text, TextInput } from 'react-native';

// ==================== GLOBAL FONT SCALE LOCK ====================
// Prevent iOS/Android Accessibility "Text Size" setting from breaking layouts.
// This mirrors how Facebook, Instagram, etc. lock their font sizes.
// Must run HERE (entry point) — before any component renders.
Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, { allowFontScaling: false });
// Animated.Text is a separate component — must be patched independently
if (Animated.Text) {
  Animated.Text.defaultProps = Object.assign({}, Animated.Text.defaultProps, { allowFontScaling: false });
}
// ================================================================

// ==================== FIREBASE BACKGROUND HANDLER ====================

// Register FCM background handler for both Android and iOS native builds
// This MUST be registered at the top level before React renders
try {
  const messaging = require('@react-native-firebase/messaging').default;
  
  // Register background message handler
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('🔔 [Background Handler] Message received:', {
      platform: Platform.OS,
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      type: remoteMessage.data?.type,
    });
    
    // On iOS, data-only FCM messages are delivered silently.
    // Create a local notification so it appears in the device notification center.
    if (Platform.OS === 'ios' && remoteMessage.data && !remoteMessage.notification) {
      try {
        const Notifications = require('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.data?.title || 'MyToDoo',
            body: remoteMessage.data?.body || remoteMessage.data?.message || 'You have a new notification',
            data: remoteMessage.data || {},
            sound: true,
          },
          trigger: null,
        });
        console.log('✅ [iOS Background] Local notification created for data-only message');
      } catch (err) {
        console.warn('⚠️ [iOS Background] Could not create local notification:', err);
      }
    }
    
    return Promise.resolve();
  });
  
  console.log(`✅ [FCM] Background message handler registered (${Platform.OS})`);
} catch (error) {
  console.log('ℹ️ [FCM] Background handler registration skipped:', error.message);
}

// ==================== LOAD EXPO ROUTER ====================

// Import expo-router/entry to load the app
import 'expo-router/entry';
