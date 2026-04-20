# 📦 MyToDoo Offline Sync - Implementation Guide

## Overview

MyToDoo now supports **full offline mode** — users can perform write operations (post tasks, make offers, send messages, etc.) even when they have no internet connection. All changes are automatically saved to a local queue and synced when connectivity is restored.

**No backend changes were made.** The entire offline system works client-side by intercepting failed network requests and queuing them for later replay.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   App (_layout.tsx)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │           ConnectivityProvider                  │  │
│  │  (monitors network, manages sync lifecycle)     │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │         EnhancedOfflineBanner             │  │  │
│  │  │  (global UI overlay on ALL screens)       │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  ┌────────────┐   ┌────────────────────────┐  │  │
│  │  │ api.ts     │──▶│ offlineStorage.ts       │  │  │
│  │  │ interceptor│   │ (AsyncStorage queue)    │  │  │
│  │  └────────────┘   └────────────────────────┘  │  │
│  │                          │                     │  │
│  │                          ▼                     │  │
│  │                   ┌──────────────┐             │  │
│  │                   │ syncManager  │             │  │
│  │                   │ (processes   │             │  │
│  │                   │  queue when  │             │  │
│  │                   │  online)     │             │  │
│  │                   └──────────────┘             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `src/services/offline/offlineStorage.ts` | Local queue management using AsyncStorage. Stores pending operations, caches data, detects operation types. |
| `src/services/offline/syncManager.ts` | Processes the offline queue when online. Sequential execution, exponential backoff, retry logic. |
| `src/services/offline/ConnectivityProvider.tsx` | React Context that wraps the entire app. Monitors network via NetInfo, auto-triggers sync, provides `useConnectivity()` hook. |
| `src/services/offline/index.ts` | Barrel export for clean imports. |
| `src/shared/components/EnhancedOfflineBanner.tsx` | Beautiful animated banner with 4 states: offline (red), syncing (blue), back-online (green), pending (orange). |
| `src/shared/hooks/useOfflineAware.ts` | Helper hook for screens to wrap API calls with offline-aware feedback. |

### Modified Files

| File | Change |
|------|--------|
| `src/shared/utils/api.ts` | Added offline interceptor in response error handler. Write operations (POST/PUT/PATCH/DELETE) are now queued when offline instead of just failing. |
| `app/_layout.tsx` | Wrapped app with `ConnectivityProvider`, added `EnhancedOfflineBanner` overlay globally. |

---

## How It Works

### 1. Network Error Detection (api.ts interceptor)

When any API call fails due to a network error:
- **GET requests**: Fail normally (React Query cache provides stale data)
- **POST/PUT/PATCH/DELETE requests**: Automatically queued to AsyncStorage

```
User Action → API Call → Network Error Detected
                              │
                    ┌─────────┴─────────┐
                    │                   │
                GET Request        Write Request
                    │                   │
              Reject with          Queue to local DB
              network error        Return { isOfflineQueued: true }
```

### 2. Local Queue (offlineStorage.ts)

Each queued operation stores:
- HTTP method, URL, request data, headers
- Operation type (CREATE_TASK, MAKE_OFFER, etc.)
- Priority level (1=critical, 5=low)
- Retry count, max retries, timestamps
- Human-readable description

### 3. Auto-Sync (ConnectivityProvider + syncManager)

When connectivity is restored:
1. `ConnectivityProvider` detects online via NetInfo
2. Waits 2 seconds (debounce)
3. Calls `processOfflineQueue()` in `syncManager`
4. Operations are replayed sequentially, ordered by priority
5. Failed operations retry with exponential backoff (max 3 attempts)
6. UI updates via event system

### 4. Banner States (EnhancedOfflineBanner)

| State | Color | When |
|-------|-------|------|
| **Offline** | 🔴 Red | Device has no network connection |
| **Syncing** | 🔵 Blue | Queue is being processed |
| **Back Online** | 🟢 Green | Just reconnected (auto-dismisses in 3s) |
| **Pending** | 🟠 Orange | Has pending items + tappable to sync |
| **Hidden** | — | Online with no pending items |

---

## What Gets Queued Offline

| Operation | Type | Priority |
|-----------|------|----------|
| Accept Offer | `ACCEPT_OFFER` | 1 (Critical) |
| Complete Task | `COMPLETE_TASK` | 1 (Critical) |
| Confirm Completion | `CONFIRM_COMPLETION` | 1 (Critical) |
| Post Task | `CREATE_TASK` | 2 |
| Make Offer | `CREATE_OFFER` | 2 |
| Cancel Task | `CANCEL_TASK` | 2 |
| Send Message | `SEND_MESSAGE` | 2 |
| Update Task | `UPDATE_TASK` | 3 |
| Delete Task | `DELETE_TASK` | 3 |
| Submit Review | `SUBMIT_REVIEW` | 3 |
| Post Question | `POST_QUESTION` | 4 |
| Answer Question | `ANSWER_QUESTION` | 4 |
| Update Profile | `UPDATE_PROFILE` | 4 |

---

## Usage in Screens

### Basic (Automatic - No Code Changes Needed)

The offline interceptor in `api.ts` automatically handles ALL existing API calls. When a write operation fails due to network:
- It gets queued silently
- The error response includes `isOfflineQueued: true`
- The banner shows the current state

### Advanced (Optional - For Better UX)

Use the `useOfflineAware` hook for explicit offline feedback:

```tsx
import { useOfflineAware } from '@/src/shared/hooks/useOfflineAware';

function MyScreen() {
  const { wrapApiCall, isOnline, pendingCount } = useOfflineAware();
  
  const handlePostTask = async () => {
    const result = await wrapApiCall(
      () => postTaskWithImages(taskData, images),
      'Task posted successfully!',
      'Task saved offline. It will be posted when you reconnect.'
    );
    
    if (result.success) {
      // Navigate away - works for both online and offline
      router.back();
    }
  };
}
```

### Access Connectivity State Anywhere

```tsx
import { useConnectivity } from '@/src/services/offline/ConnectivityProvider';

function AnyComponent() {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useConnectivity();
  
  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Pending: {pendingCount}</Text>
      {pendingCount > 0 && (
        <Button title="Sync Now" onPress={triggerSync} />
      )}
    </View>
  );
}
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Network error on write | Queued to local storage, `isOfflineQueued: true` |
| Network error on read | React Query serves stale cache, error shown |
| Sync fails for an operation | Retried with exponential backoff (max 3 attempts) |
| Max retries exceeded | Operation stays in queue as "failed" for manual review |
| App restart while offline | Queue persists in AsyncStorage |
| App comes to foreground | Auto-checks for pending items and syncs if online |

---

## Dependencies Used

All dependencies were **already installed** — no new packages added:

- `@react-native-async-storage/async-storage` ^2.2.0 — Local persistence
- `@react-native-community/netinfo` ^11.5.2 — Network monitoring
- `@expo/vector-icons` — Icons for banner
- `react-native-safe-area-context` — Safe area for banner positioning

---

## Testing Offline Mode

1. **Enable Airplane Mode** on your iOS device
2. Perform actions (post task, make offer, etc.)
3. You should see the **red "You're Offline" banner**
4. Actions will show "saved offline" feedback
5. **Disable Airplane Mode**
6. Banner turns **green "Back Online!"** → then **blue "Syncing..."**
7. Pending operations are synced automatically
8. Banner disappears when all synced

---

## Key Design Decisions

1. **No backend changes** — Everything is client-side interception
2. **No existing code modified** — Except `api.ts` interceptor and `_layout.tsx` wrapper
3. **No screens changed** — The offline banner is a global overlay
4. **Existing API calls unchanged** — Same functions, same signatures
5. **AsyncStorage for queue** — Simple, reliable, already in the project
6. **Sequential sync** — Avoids race conditions and server overload
7. **Priority ordering** — Critical operations (accept offer, complete task) sync first
