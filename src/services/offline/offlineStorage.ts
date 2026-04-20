/**
 * 📦 Offline Storage Service
 * Manages local queue of operations performed while offline.
 * Uses AsyncStorage to persist queued operations across app restarts.
 * 
 * Architecture:
 * - Each write operation (POST/PUT/DELETE) that fails due to network is queued
 * - Queue is persisted in AsyncStorage as JSON
 * - SyncManager processes the queue when connectivity is restored
 * - Read operations (GET) use cached data from React Query cache
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OfflineOperationType =
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'CREATE_OFFER'
  | 'UPDATE_OFFER'
  | 'DELETE_OFFER'
  | 'ACCEPT_OFFER'
  | 'COMPLETE_TASK'
  | 'CONFIRM_COMPLETION'
  | 'CANCEL_TASK'
  | 'POST_QUESTION'
  | 'ANSWER_QUESTION'
  | 'SUBMIT_REVIEW'
  | 'SEND_MESSAGE'
  | 'UPDATE_PROFILE'
  | 'GENERIC_POST'
  | 'GENERIC_PUT'
  | 'GENERIC_DELETE';

export type OfflineOperationStatus = 'pending' | 'syncing' | 'failed' | 'completed';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  status: OfflineOperationStatus;
  // HTTP request details
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  // Metadata
  description: string; // Human-readable description (e.g., "Post Task: Fix my plumbing")
  createdAt: string; // ISO timestamp
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  // For display purposes
  priority: number; // Lower = higher priority (1=critical, 5=low)
}

export interface OfflineSyncStatus {
  pendingCount: number;
  failedCount: number;
  syncingCount: number;
  lastSyncAt: string | null;
  operations: OfflineOperation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@mytodoo_offline_queue';
const LAST_SYNC_KEY = '@mytodoo_last_sync';
const OFFLINE_CACHE_KEY = '@mytodoo_offline_cache';

// ─────────────────────────────────────────────────────────────────────────────
// Core Storage Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all queued offline operations
 */
export async function getOfflineQueue(): Promise<OfflineOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const operations: OfflineOperation[] = JSON.parse(raw);
    return operations.sort((a, b) => a.priority - b.priority); // Sort by priority
  } catch (error) {
    console.warn('⚠️ [OfflineStorage] Error reading queue:', error);
    return [];
  }
}

/**
 * Add an operation to the offline queue
 */
export async function addToOfflineQueue(
  operation: Omit<OfflineOperation, 'id' | 'status' | 'createdAt' | 'retryCount'>
): Promise<OfflineOperation> {
  const newOperation: OfflineOperation = {
    ...operation,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = await getOfflineQueue();
  queue.push(newOperation);
  await saveQueue(queue);

  console.log(`📦 [OfflineStorage] Queued: ${newOperation.description} (${newOperation.type})`);
  return newOperation;
}

/**
 * Update an operation's status
 */
export async function updateOperationStatus(
  operationId: string,
  status: OfflineOperationStatus,
  error?: string
): Promise<void> {
  const queue = await getOfflineQueue();
  const index = queue.findIndex(op => op.id === operationId);
  
  if (index !== -1) {
    queue[index].status = status;
    if (error) {
      queue[index].lastError = error;
    }
    if (status === 'failed') {
      queue[index].retryCount += 1;
    }
    await saveQueue(queue);
  }
}

/**
 * Remove a completed or permanently failed operation from queue
 */
export async function removeFromQueue(operationId: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(op => op.id !== operationId);
  await saveQueue(filtered);
}

/**
 * Remove all completed operations from queue
 */
export async function clearCompletedOperations(): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(op => op.status !== 'completed');
  await saveQueue(filtered);
}

/**
 * Clear the entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  console.log('🧹 [OfflineStorage] Queue cleared');
}

/**
 * Get the current sync status summary
 */
export async function getSyncStatus(): Promise<OfflineSyncStatus> {
  const operations = await getOfflineQueue();
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

  return {
    pendingCount: operations.filter(op => op.status === 'pending').length,
    failedCount: operations.filter(op => op.status === 'failed').length,
    syncingCount: operations.filter(op => op.status === 'syncing').length,
    lastSyncAt: lastSync,
    operations,
  };
}

/**
 * Update the last sync timestamp
 */
export async function updateLastSyncTime(): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

/**
 * Get pending operations count (for badge display)
 * Only counts items that can still be retried
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.filter(op => 
    op.status === 'pending' || 
    (op.status === 'failed' && op.retryCount < op.maxRetries)
  ).length;
}

/**
 * Replace the entire offline queue (used for cleanup operations)
 */
export async function replaceQueue(operations: OfflineOperation[]): Promise<void> {
  await saveQueue(operations);
  console.log(`🔄 [OfflineStorage] Queue replaced with ${operations.length} operations`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Cache (for offline reading)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cache API response data for offline reading
 */
export async function cacheData(key: string, data: any): Promise<void> {
  try {
    const cache = await getCache();
    cache[key] = {
      data,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('⚠️ [OfflineStorage] Error caching data:', error);
  }
}

/**
 * Get cached data for offline reading
 */
export async function getCachedData(key: string): Promise<any | null> {
  try {
    const cache = await getCache();
    return cache[key]?.data ?? null;
  } catch (error) {
    console.warn('⚠️ [OfflineStorage] Error reading cache:', error);
    return null;
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_CACHE_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function saveQueue(queue: OfflineOperation[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

async function getCache(): Promise<Record<string, { data: any; cachedAt: string }>> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function generateId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper to determine operation type from API URL and method
 */
export function detectOperationType(
  method: string,
  url: string
): { type: OfflineOperationType; description: string; priority: number } {
  const normalizedUrl = url.toLowerCase();
  const normalizedMethod = method.toUpperCase();

  // Task operations
  if (normalizedUrl.includes('/tasks') && normalizedMethod === 'POST' && !normalizedUrl.includes('/offers') && !normalizedUrl.includes('/questions')) {
    return { type: 'CREATE_TASK', description: 'Post New Task', priority: 2 };
  }
  if (normalizedUrl.includes('/tasks/') && (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') && !normalizedUrl.includes('/status')) {
    return { type: 'UPDATE_TASK', description: 'Update Task', priority: 3 };
  }
  if (normalizedUrl.includes('/tasks/') && normalizedMethod === 'DELETE' && !normalizedUrl.includes('/offers')) {
    return { type: 'DELETE_TASK', description: 'Delete Task', priority: 3 };
  }

  // Offer operations
  if (normalizedUrl.includes('/offers') && normalizedMethod === 'POST') {
    return { type: 'CREATE_OFFER', description: 'Make Offer', priority: 2 };
  }
  if (normalizedUrl.includes('/offers/') && normalizedUrl.includes('/accept')) {
    return { type: 'ACCEPT_OFFER', description: 'Accept Offer', priority: 1 };
  }
  if (normalizedUrl.includes('/offers/') && normalizedMethod === 'DELETE') {
    return { type: 'DELETE_OFFER', description: 'Withdraw Offer', priority: 3 };
  }

  // Task completion
  if (normalizedUrl.includes('/complete') || normalizedUrl.includes('/completion')) {
    return { type: 'COMPLETE_TASK', description: 'Complete Task', priority: 1 };
  }
  if (normalizedUrl.includes('/confirm')) {
    return { type: 'CONFIRM_COMPLETION', description: 'Confirm Completion', priority: 1 };
  }

  // Cancellation
  if (normalizedUrl.includes('/cancel')) {
    return { type: 'CANCEL_TASK', description: 'Cancel Task', priority: 2 };
  }

  // Questions
  if (normalizedUrl.includes('/questions') && normalizedMethod === 'POST') {
    return { type: 'POST_QUESTION', description: 'Post Question', priority: 4 };
  }
  if (normalizedUrl.includes('/questions/') && normalizedUrl.includes('/answer')) {
    return { type: 'ANSWER_QUESTION', description: 'Answer Question', priority: 4 };
  }

  // Reviews
  if (normalizedUrl.includes('/review') && normalizedMethod === 'POST') {
    return { type: 'SUBMIT_REVIEW', description: 'Submit Review', priority: 3 };
  }

  // Chat/Messages
  if (normalizedUrl.includes('/chat') || normalizedUrl.includes('/messages')) {
    return { type: 'SEND_MESSAGE', description: 'Send Message', priority: 2 };
  }

  // Profile
  if (normalizedUrl.includes('/profile') || normalizedUrl.includes('/users')) {
    if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
      return { type: 'UPDATE_PROFILE', description: 'Update Profile', priority: 4 };
    }
  }

  // Generic fallbacks
  if (normalizedMethod === 'POST') {
    return { type: 'GENERIC_POST', description: 'Save Data', priority: 5 };
  }
  if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
    return { type: 'GENERIC_PUT', description: 'Update Data', priority: 5 };
  }
  if (normalizedMethod === 'DELETE') {
    return { type: 'GENERIC_DELETE', description: 'Delete Data', priority: 5 };
  }

  return { type: 'GENERIC_POST', description: 'Save Data', priority: 5 };
}
