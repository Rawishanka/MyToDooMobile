/**
 * 🔄 Sync Manager Service
 * Processes the offline queue when network connectivity is restored.
 * 
 * Features:
 * - Sequential processing of queued operations
 * - Exponential backoff on failures
 * - Priority-based ordering (critical operations first)
 * - Max retry limit per operation
 * - Event callbacks for UI updates
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from '@/src/api/config';
import {
  getOfflineQueue,
  updateOperationStatus,
  removeFromQueue,
  updateLastSyncTime,
  clearCompletedOperations,
  OfflineOperation,
} from './offlineStorage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SyncResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  remaining: number;
}

export type SyncEventCallback = (event: SyncEvent) => void;

export interface SyncEvent {
  type: 'sync_start' | 'sync_progress' | 'sync_complete' | 'sync_error' | 'operation_success' | 'operation_failed';
  data?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let isSyncing = false;
let syncListeners: SyncEventCallback[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Event System
// ─────────────────────────────────────────────────────────────────────────────

export function addSyncListener(callback: SyncEventCallback): () => void {
  syncListeners.push(callback);
  return () => {
    syncListeners = syncListeners.filter(l => l !== callback);
  };
}

function emitSyncEvent(event: SyncEvent): void {
  syncListeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.warn('⚠️ [SyncManager] Listener error:', error);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Sync Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if sync is currently in progress
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}

/**
 * Process all pending operations in the offline queue.
 * Called when network connectivity is restored.
 */
export async function processOfflineQueue(): Promise<SyncResult> {
  if (isSyncing) {
    console.log('⏳ [SyncManager] Sync already in progress, skipping...');
    return { totalProcessed: 0, successful: 0, failed: 0, remaining: 0 };
  }

  isSyncing = true;
  const result: SyncResult = { totalProcessed: 0, successful: 0, failed: 0, remaining: 0 };

  try {
    const queue = await getOfflineQueue();
    const pendingOps = queue.filter(
      op => op.status === 'pending' || (op.status === 'failed' && op.retryCount < op.maxRetries)
    );

    if (pendingOps.length === 0) {
      console.log('✅ [SyncManager] No pending operations to sync');
      isSyncing = false;
      return result;
    }

    console.log(`🔄 [SyncManager] Starting sync of ${pendingOps.length} operations...`);
    emitSyncEvent({ type: 'sync_start', data: { count: pendingOps.length } });

    const api = createApi(API_CONFIG.BASE_URL);

    // Process operations sequentially (ordered by priority)
    for (const operation of pendingOps) {
      result.totalProcessed++;

      try {
        await updateOperationStatus(operation.id, 'syncing');
        emitSyncEvent({
          type: 'sync_progress',
          data: {
            current: result.totalProcessed,
            total: pendingOps.length,
            operation: operation.description,
          },
        });

        // Execute the actual API call
        await executeOperation(api, operation);

        // Success!
        await updateOperationStatus(operation.id, 'completed');
        await removeFromQueue(operation.id);
        result.successful++;

        console.log(`✅ [SyncManager] Synced: ${operation.description}`);
        emitSyncEvent({ type: 'operation_success', data: { operation } });

      } catch (error: any) {
        result.failed++;
        const errorMessage = error?.message || error?.response?.data?.message || 'Unknown error';
        
        console.warn(`❌ [SyncManager] Failed: ${operation.description} - ${errorMessage}`);
        
        await updateOperationStatus(operation.id, 'failed', errorMessage);
        emitSyncEvent({ type: 'operation_failed', data: { operation, error: errorMessage } });

        // If max retries reached, leave it as failed for manual review
        if (operation.retryCount + 1 >= operation.maxRetries) {
          console.warn(`⚠️ [SyncManager] Max retries reached for: ${operation.description}`);
        }

        // Add delay between failed operations (exponential backoff)
        const backoffDelay = Math.min(1000 * Math.pow(2, operation.retryCount), 10000);
        await delay(backoffDelay);
      }

      // Small delay between successful operations to avoid flooding the server
      await delay(500);
    }

    await updateLastSyncTime();
    await clearCompletedOperations();

    // Count remaining
    const remainingQueue = await getOfflineQueue();
    result.remaining = remainingQueue.filter(
      op => op.status === 'pending' || op.status === 'failed'
    ).length;

    console.log(`🔄 [SyncManager] Sync complete: ${result.successful} synced, ${result.failed} failed, ${result.remaining} remaining`);
    emitSyncEvent({ type: 'sync_complete', data: result });

  } catch (error) {
    console.error('❌ [SyncManager] Sync process error:', error);
    emitSyncEvent({ type: 'sync_error', data: { error } });
  } finally {
    isSyncing = false;
  }

  return result;
}

/**
 * Execute a single queued operation against the API
 */
async function executeOperation(api: any, operation: OfflineOperation): Promise<void> {
  const { method, url, data, headers } = operation;
  
  const config: any = {};
  if (headers) {
    config.headers = headers;
  }

  switch (method) {
    case 'POST':
      await api.post(url, data, config);
      break;
    case 'PUT':
      await api.put(url, data, config);
      break;
    case 'PATCH':
      await api.patch(url, data, config);
      break;
    case 'DELETE':
      await api.delete(url, config);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

/**
 * Retry a specific failed operation
 */
export async function retryOperation(operationId: string): Promise<boolean> {
  const queue = await getOfflineQueue();
  const operation = queue.find(op => op.id === operationId);

  if (!operation) {
    console.warn('⚠️ [SyncManager] Operation not found:', operationId);
    return false;
  }

  const api = createApi(API_CONFIG.BASE_URL);

  try {
    await updateOperationStatus(operationId, 'syncing');
    await executeOperation(api, operation);
    await updateOperationStatus(operationId, 'completed');
    await removeFromQueue(operationId);
    console.log(`✅ [SyncManager] Retry successful: ${operation.description}`);
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    await updateOperationStatus(operationId, 'failed', errorMessage);
    console.warn(`❌ [SyncManager] Retry failed: ${operation.description} - ${errorMessage}`);
    return false;
  }
}

/**
 * Remove a failed operation permanently (user chooses to discard)
 */
export async function discardOperation(operationId: string): Promise<void> {
  await removeFromQueue(operationId);
  console.log(`🗑️ [SyncManager] Discarded operation: ${operationId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
