/**
 * 🌐 Connectivity Context Provider
 * 
 * Global context that monitors network connectivity and manages offline sync.
 * Wraps the entire app to provide network status everywhere.
 * 
 * Features:
 * - Real-time network monitoring via NetInfo
 * - Automatic sync trigger when connectivity is restored
 * - Pending operation count for badges/indicators
 * - Manual sync capability
 * - Sync event forwarding to UI
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import {
  getPendingCount,
  getSyncStatus,
  clearOfflineQueue,
  getOfflineQueue,
  replaceQueue,
  OfflineSyncStatus,
} from '@/src/services/offline/offlineStorage';
import {
  processOfflineQueue,
  addSyncListener,
  getIsSyncing,
  SyncResult,
} from '@/src/services/offline/syncManager';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ConnectivityContextType {
  /** Whether the device currently has network connectivity */
  isOnline: boolean;
  /** Whether internet is actually reachable (not just WiFi connected) */
  isInternetReachable: boolean | null;
  /** Network connection type (wifi, cellular, etc.) */
  connectionType: string | null;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Number of pending operations waiting to sync */
  pendingCount: number;
  /** Detailed sync status */
  syncStatus: OfflineSyncStatus | null;
  /** Last successful sync timestamp */
  lastSyncAt: string | null;
  /** Manually trigger a sync */
  triggerSync: () => Promise<SyncResult | null>;
  /** Refresh the pending count */
  refreshPendingCount: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  isInternetReachable: null,
  connectionType: null,
  isSyncing: false,
  pendingCount: 0,
  syncStatus: null,
  lastSyncAt: null,
  triggerSync: async () => null,
  refreshPendingCount: async () => {},
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  
  const wasOfflineRef = useRef(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refresh pending count ──────────────────────────────────────────────
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
      
      const status = await getSyncStatus();
      setSyncStatus(status);
      setLastSyncAt(status.lastSyncAt);
    } catch (error) {
      console.warn('⚠️ [Connectivity] Error refreshing pending count:', error);
    }
  }, []);

  // ── Manual sync trigger ────────────────────────────────────────────────
  const triggerSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!isOnline || isSyncing) {
      console.log('⏳ [Connectivity] Cannot sync: offline or already syncing');
      return null;
    }

    setIsSyncing(true);
    try {
      const result = await processOfflineQueue();
      await refreshPendingCount();
      return result;
    } catch (error) {
      console.error('❌ [Connectivity] Sync error:', error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  // ── Auto-sync when coming back online ──────────────────────────────────
  const handleConnectivityRestore = useCallback(async () => {
    console.log('🌐 [Connectivity] Connection restored! Checking for pending operations...');
    
    // Debounce to avoid multiple sync triggers
    if (syncDebounceRef.current) {
      clearTimeout(syncDebounceRef.current);
    }
    
    syncDebounceRef.current = setTimeout(async () => {
      const count = await getPendingCount();
      if (count > 0) {
        console.log(`🔄 [Connectivity] Found ${count} pending operations, starting auto-sync...`);
        await triggerSync();
      }
    }, 2000); // Wait 2 seconds after reconnection before syncing
  }, [triggerSync]);

  // ── Network monitoring ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected ?? false;
      const reachable = state.isInternetReachable;
      
      setIsOnline(online);
      setIsInternetReachable(reachable);
      setConnectionType(state.type);

      // Detect transition from offline → online
      if (online && wasOfflineRef.current) {
        wasOfflineRef.current = false;
        handleConnectivityRestore();
      }
      
      if (!online) {
        wasOfflineRef.current = true;
      }
    });

    // Fetch initial state
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }
    };
  }, [handleConnectivityRestore]);

  // ── App state monitoring (sync when foregrounded) ──────────────────────
  useEffect(() => {
    const handleAppState = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isOnline) {
        // Refresh pending count when app comes to foreground
        await refreshPendingCount();
        
        // Auto-sync if there are pending operations
        const count = await getPendingCount();
        if (count > 0 && !getIsSyncing()) {
          console.log('📱 [Connectivity] App foregrounded with pending ops, auto-syncing...');
          triggerSync();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [isOnline, refreshPendingCount, triggerSync]);

  // ── Sync event listener ────────────────────────────────────────────────
  useEffect(() => {
    const removeSyncListener = addSyncListener((event) => {
      switch (event.type) {
        case 'sync_start':
          setIsSyncing(true);
          break;
        case 'sync_complete':
        case 'sync_error':
          setIsSyncing(false);
          refreshPendingCount();
          break;
        case 'operation_success':
        case 'operation_failed':
          refreshPendingCount();
          break;
      }
    });

    return removeSyncListener;
  }, [refreshPendingCount]);

  // ── Initial load — also clean stale queue on first mount ────────────
  useEffect(() => {
    const initOfflineSync = async () => {
      // Clean out stale/junk items that shouldn't be in the queue
      // (CDN uploads, notifications, FCM, service-fee, device-token, multipart)
      try {
        const queue = await getOfflineQueue();
        
        if (queue.length > 0) {
          const validOps = queue.filter((op) => {
            const url = (op.url || '').toLowerCase();
            // Filter out non-replayable operations
            const isCDN = url.includes('/cdn/') || url.includes('/cdn');
            const isNotification = url.includes('/notifications') || url.includes('/fcm') || url.includes('/device-token');
            const isServiceFee = url.includes('/service-fee');
            // Also filter out items that have exhausted all retries
            const isExhausted = op.status === 'failed' && op.retryCount >= op.maxRetries;
            // Filter out items older than 24 hours (stale safety net)
            const isStale = (Date.now() - new Date(op.createdAt).getTime()) > 24 * 60 * 60 * 1000;
            
            return !isCDN && !isNotification && !isServiceFee && !isExhausted && !isStale;
          });
          
          if (validOps.length !== queue.length) {
            const removed = queue.length - validOps.length;
            console.log(`🧹 [Connectivity] Cleaned ${removed} stale/invalid queue items (${validOps.length} remaining)`);
            await replaceQueue(validOps);
          }
        }
      } catch (e) {
        console.warn('⚠️ [Connectivity] Queue cleanup error:', e);
      }
      
      await refreshPendingCount();
    };
    
    initOfflineSync();
  }, [refreshPendingCount]);

  // ── Periodic pending count refresh ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPendingCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const value: ConnectivityContextType = {
    isOnline,
    isInternetReachable,
    connectionType,
    isSyncing,
    pendingCount,
    syncStatus,
    lastSyncAt,
    triggerSync,
    refreshPendingCount,
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useConnectivity(): ConnectivityContextType {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
}
