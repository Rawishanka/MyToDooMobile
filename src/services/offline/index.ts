/**
 * 📦 Offline Sync Module - Barrel Export
 * 
 * Usage:
 *   import { ConnectivityProvider, useConnectivity } from '@/src/services/offline';
 *   import { addToOfflineQueue } from '@/src/services/offline';
 */

// Context & Hook
export { ConnectivityProvider, useConnectivity } from './ConnectivityProvider';

// Storage
export {
  addToOfflineQueue,
  getOfflineQueue,
  getSyncStatus,
  getPendingCount,
  clearOfflineQueue,
  replaceQueue,
  cacheData,
  getCachedData,
  detectOperationType,
} from './offlineStorage';
export type {
  OfflineOperation,
  OfflineOperationType,
  OfflineOperationStatus,
  OfflineSyncStatus,
} from './offlineStorage';

// Sync Manager
export {
  processOfflineQueue,
  retryOperation,
  discardOperation,
  addSyncListener,
  getIsSyncing,
} from './syncManager';
export type { SyncResult, SyncEvent } from './syncManager';
