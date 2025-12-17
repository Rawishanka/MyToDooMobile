/**
 * Push Notifications Initialization Hook
 * 
 * HYBRID MODE: Works in both Expo Go and Native Builds
 * - Expo Go: Uses Expo Push Notifications
 * - APK/Native: Uses React Native Firebase FCM
 * 
 * Call this hook in your root component (_layout.tsx) to set up push notifications
 */

import {
    getNotificationEnvironment,
    registerFCMToken,
    requestNotificationPermissions,
    setupNotificationHandlers,
    unregisterFCMToken,
} from '@/src/services/notification-service';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useEffect, useState } from 'react';

export interface FCMInitializationStatus {
  isInitialized: boolean;
  isRegistered: boolean;
  hasPermission: boolean;
  error: string | null;
}

/**
 * Initialize FCM for the app
 * 
 * Usage in _layout.tsx:
 * ```tsx
 * const { isInitialized, isRegistered, hasPermission } = useInitializeFCM(queryClient);
 * ```
 * 
 * @param queryClient - React Query QueryClient for real-time cache invalidation
 */
export const useInitializeFCM = (queryClient?: any) => {
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const [status, setStatus] = useState<FCMInitializationStatus>({
    isInitialized: false,
    isRegistered: false,
    hasPermission: false,
    error: null,
  });

  // Request permission on app open (regardless of authentication)
  useEffect(() => {
    const requestPermissionOnAppOpen = async () => {
      try {
        const env = getNotificationEnvironment();
        
        // Only request if in native build
        if (!env.isNativeBuild) {
          console.log('⏸️ Expo Go detected - permission request skipped');
          return;
        }

        // Request permission immediately when app opens
        console.log('🔔 Requesting notification permission on app open...');
        const { granted } = await requestNotificationPermissions();
        
        if (granted) {
          console.log('✅ Notification permission granted on app open');
        } else {
          console.log('❌ Notification permission denied on app open');
        }
      } catch (error) {
        console.error('❌ Error requesting permission on app open:', error);
      }
    };

    requestPermissionOnAppOpen();
  }, []); // Run once on mount

  // Initialize FCM only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('⏸️ FCM token registration skipped - user not authenticated');
      setStatus({
        isInitialized: false,
        isRegistered: false,
        hasPermission: false,
        error: null,
      });
      return;
    }

    const initializeFCM = async () => {
      try {
        const env = getNotificationEnvironment();
        console.log('🚀 Initializing Push Notifications...');
        console.log(`🔍 Mode: ${env.usingFirebase ? 'Firebase FCM (Native)' : 'Expo Push Notifications'}`);

        // Step 1: Setup notification handlers with QueryClient for real-time sync
        setupNotificationHandlers(queryClient);
        console.log('✅ Notification handlers set up with real-time sync');

        // Step 2: Request permissions (CRITICAL FOR ANDROID 13+)
        console.log('📱 Requesting notification permissions...');
        const { granted, canAskAgain } = await requestNotificationPermissions();
        
        if (!granted) {
          const errorMsg = canAskAgain 
            ? 'Notification permissions denied. Please enable in app settings.' 
            : 'Notification permissions permanently denied. Enable in device Settings > Apps > MyToDoo > Notifications.';
          
          console.warn('⚠️ Notification permissions not granted:', errorMsg);
          setStatus({
            isInitialized: true,
            isRegistered: false,
            hasPermission: false,
            error: errorMsg,
          });
          return;
        }
        console.log('✅ Notification permissions granted');

        // Step 3: Register push token with backend
        const registered = await registerFCMToken();
        if (!registered) {
          console.warn('⚠️ Failed to register push token');
          setStatus({
            isInitialized: true,
            isRegistered: false,
            hasPermission: true,
            error: 'Failed to register push token',
          });
          return;
        }

        console.log('✅ Push notifications initialization complete');
        setStatus({
          isInitialized: true,
          isRegistered: true,
          hasPermission: true,
          error: null,
        });
      } catch (error: any) {
        console.error('❌ Push notifications initialization failed:', error);
        setStatus({
          isInitialized: true,
          isRegistered: false,
          hasPermission: false,
          error: error?.message || 'Initialization failed',
        });
      }
    };

    initializeFCM();

    // Cleanup on logout
    return () => {
      if (!isAuthenticated) {
        console.log('🗑️ Unregistering FCM token on logout...');
        unregisterFCMToken();
      }
    };
  }, [isAuthenticated]);

  return status;
};
