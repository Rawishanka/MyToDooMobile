/**
 * 🌐 useOfflineAware Hook
 * 
 * Helper hook for screens/components to handle offline-aware operations.
 * Provides utilities to show appropriate feedback when operations are queued offline.
 * 
 * Usage:
 *   const { wrapApiCall, isOnline } = useOfflineAware();
 *   
 *   const handleSubmit = async () => {
 *     const result = await wrapApiCall(
 *       () => createTask(taskData),
 *       'Task posted successfully!',
 *       'Task saved offline. It will be posted when you reconnect.'
 *     );
 *   };
 */

import { Alert } from 'react-native';
import { useConnectivity } from '@/src/services/offline/ConnectivityProvider';
import { useCallback } from 'react';

interface OfflineAwareOptions {
  /** Show alert on success (default: true) */
  showSuccessAlert?: boolean;
  /** Show alert when queued offline (default: true) */
  showOfflineAlert?: boolean;
  /** Show alert on error (default: true) */
  showErrorAlert?: boolean;
}

export function useOfflineAware() {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useConnectivity();

  /**
   * Wrap an API call with offline-aware error handling.
   * If the call fails due to network and gets queued, shows appropriate feedback.
   */
  const wrapApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    offlineMessage?: string,
    options: OfflineAwareOptions = {}
  ): Promise<{ success: boolean; data?: T; isOfflineQueued?: boolean }> => {
    const {
      showSuccessAlert = false,
      showOfflineAlert = true,
      showErrorAlert = true,
    } = options;

    try {
      const result = await apiCall();
      
      if (showSuccessAlert && successMessage) {
        Alert.alert('Success', successMessage);
      }
      
      return { success: true, data: result };
    } catch (error: any) {
      // Check if the operation was queued for offline sync
      if (error?.isOfflineQueued) {
        if (showOfflineAlert) {
          Alert.alert(
            '📦 Saved Offline',
            offlineMessage || "You're offline. Your changes have been saved and will sync automatically when you reconnect.",
            [{ text: 'OK', style: 'default' }]
          );
        }
        return { success: true, isOfflineQueued: true };
      }

      // Regular network error (GET requests that can't be queued)
      if (error?.isNetworkError) {
        if (showErrorAlert) {
          Alert.alert(
            'No Connection',
            'Please check your internet connection and try again.',
            [{ text: 'OK', style: 'default' }]
          );
        }
        return { success: false };
      }

      // Other API errors - let them propagate
      throw error;
    }
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    triggerSync,
    wrapApiCall,
  };
}
