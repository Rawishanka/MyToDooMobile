/**
 * MyToDoo Mobile - Root Entry Point
 * 
 * This file is the FIRST to run when the app starts.
 * It registers the FCM background message handler BEFORE anything else.
 * 
 * CRITICAL: Background handler MUST be registered at top level!
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==================== FIREBASE BACKGROUND HANDLER ====================

const isExpoGo = Constants.appOwnership === 'expo';
const isNativeBuild = !isExpoGo;

// Only register FCM background handler in native builds
if (isNativeBuild && Platform.OS === 'android') {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    
    // Register background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🔔 [Background Handler] Message received:', {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });
      
      // Process the notification in the background
      // This runs even when the app is killed
      return Promise.resolve();
    });
    
    console.log('✅ [FCM] Background message handler registered');
  } catch (error) {
    console.log('ℹ️ [FCM] Background handler registration skipped:', error.message);
  }
}

// ==================== LOAD EXPO ROUTER ====================

// Import expo-router/entry to load the app
import 'expo-router/entry';
