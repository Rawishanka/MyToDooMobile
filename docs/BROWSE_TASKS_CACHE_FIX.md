# Browse Tasks & Overdue Status - Issue Resolution

## Issue 1: First Task Not Appearing in Browse Tasks ✅ FIXED

### Problem Description
After logging in for the first time and creating the first task:
- Task appears in "My Tasks" immediately ✅
- Task does NOT appear in "Browse Tasks" ❌
- After reloading/reopening app, task appears in Browse Tasks ✅
- Subsequent tasks work correctly ✅

### Root Cause
The issue was with React Query cache invalidation strategy:

1. **Query Key Mismatch**: Browse Tasks uses query key `['tasks', 'filter', params]` where `params` is an object with filter parameters
2. **Invalidation Pattern**: Cache invalidation used `['tasks', 'filter']` which should match, BUT...
3. **Inactive Query Problem**: On first login, when the first task is created, the Browse Tasks screen might not be mounted/active yet, so the query doesn't exist in the cache
4. **RefetchQueries Limitation**: `refetchQueries` with a prefix only refetches **active** queries by default

### Solution Applied

Modified the cache invalidation in two mutation hooks in `src/shared/hooks/useTaskApi.ts`:

#### useCreateTask()
```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => TaskAPI.createTask(taskData),
    onSuccess: () => {
      // Force immediate refetch of all task-related queries
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
      
      // CRITICAL FIX: Use refetchType: 'active' for better control
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', 'filter'],
        refetchType: 'active' // Only refetch queries that are currently mounted/active
      });
      
      // Also invalidate search queries that might be active
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', 'search'],
        refetchType: 'active'
      });
      
      console.log("✅ Force refetched all task queries after creating new task");
    },
  });
}
```

#### usePostTaskDirect()
Same fix applied to this mutation hook as well.

### Key Changes

1. **Removed separate `refetchQueries` call**: No longer needed as `invalidateQueries` with `refetchType: 'active'` handles it
2. **Added `refetchType: 'active'`**: This ensures that only currently mounted/active queries are refetched immediately
3. **Added search query invalidation**: Also invalidates `['tasks', 'search']` queries for consistency

### How It Works Now

1. **User creates first task** → Mutation succeeds
2. **Cache invalidation runs** with `refetchType: 'active'`
3. **If Browse screen is mounted/active** → Query refetches immediately
4. **If Browse screen NOT mounted yet** → Query is marked as stale
5. **When user navigates to Browse Tasks** → Query automatically refetches because:
   - Query was invalidated (marked stale)
   - React Query global config has `refetchOnMount: true`
   - First mount always triggers fresh fetch for stale queries

### Testing Instructions

Test the fix:
1. **Clean install**: Uninstall app and reinstall
2. **Login** to fresh account
3. **Create first task** in "My Tasks"
4. **Immediately navigate** to "Browse Tasks"
5. **Verify** task appears without needing to reload app
6. **Create more tasks** and verify they appear immediately

---

## Issue 2: Overdue Tasks Functionality ⚠️ NEEDS BACKEND WORK

### Current Implementation

The app currently has **client-side overdue detection** implemented in:
- **File**: `src/features/tasks/screens/mytasks/mytasks-screen.tsx`
- **Function**: `isTaskOverdue(task: Task): boolean`

#### How Client-Side Detection Works

```typescript
const isTaskOverdue = (task: Task): boolean => {
  // Must have end date
  if (!task.dateRange || !task.dateRange.end) {
    return false;
  }

  // Don't mark completed/cancelled as overdue
  if (task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }

  // Check backend status first
  if (task.status === 'overdue') {
    return true;
  }

  // Client-side date comparison
  const currentDate = new Date();
  const endDate = new Date(task.dateRange.end);
  
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  return currentDate > endDate;
};
```

### The Problem

**Client-side detection has limitations:**

1. **Only works when app is open**: Overdue status is calculated in real-time when viewing My Tasks
2. **No persistent status**: If task becomes overdue at 3 AM, status doesn't update until user opens app
3. **Notification limitations**: Can't send push notifications for overdue tasks
4. **Inconsistent across devices**: Different devices may show different overdue status if time zones differ
5. **Performance**: Must check every task on every render

### Required Backend Solution

Implement a **backend cron job** to:

#### 1. Scheduled Job Configuration
```
Run daily at 00:00 UTC (midnight)
OR
Run every 6 hours to catch overdue tasks faster
```

#### 2. Job Logic
```javascript
// Pseudo-code for backend cron job
async function updateOverdueTasks() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Find all tasks that should be marked overdue
  const tasksToUpdate = await Task.find({
    status: { $in: ['open', 'assigned', 'in_progress', 'active'] },
    'dateRange.end': { $lt: now },
    // Don't update if already completed/cancelled
  });
  
  for (const task of tasksToUpdate) {
    // Update status to overdue
    await task.updateOne({ status: 'overdue' });
    
    // Optional: Send push notification to task poster/assignee
    await sendOverdueNotification(task);
    
    console.log(`Task ${task._id} marked as overdue`);
  }
  
  console.log(`Marked ${tasksToUpdate.length} tasks as overdue`);
}
```

#### 3. Backend Endpoints Needed

**None required** - the cron job should run automatically on the backend without API calls from the app.

#### 4. Benefits of Backend Implementation

- ✅ **Accurate & Persistent**: Status updated in database, consistent across all devices
- ✅ **Notifications**: Can send push notifications when task becomes overdue
- ✅ **Performance**: No client-side calculations needed
- ✅ **Time Zone Handling**: Centralized UTC-based calculation
- ✅ **Analytics**: Track overdue rates, patterns, etc.

### Current Workaround (Temporary)

The client-side detection works reasonably well for now:
- Tasks are checked when user views "My Tasks" screen
- Overdue tab shows tasks past their due date
- Works for both Poster and Tasker roles

**BUT** it should be replaced with backend implementation for production use.

### Implementation Priority

**Medium-High Priority**
- App is functional without it
- But user experience improves significantly with backend solution
- Important for production reliability

### Backend Implementation Checklist

- [ ] Create cron job in backend (using node-cron, agenda, or similar)
- [ ] Add logic to update task status to 'overdue'
- [ ] Add notification system for overdue tasks
- [ ] Test with various time zones
- [ ] Add monitoring/logging for cron job execution
- [ ] Document in backend API docs

### Related Files

**Frontend Files:**
- `src/features/tasks/screens/mytasks/mytasks-screen.tsx` - Contains client-side overdue detection
- `src/api/types/tasks.ts` - Task type definitions with status field

**Backend Files Needed:**
- `cron/updateOverdueTasks.js` (or similar) - Cron job implementation
- `models/Task.js` - Should have 'overdue' as valid status
- `config/cron.js` - Cron job scheduling configuration

---

## Summary

### ✅ Fixed
- **Browse Tasks not updating after first task creation**
- Used `refetchType: 'active'` in cache invalidation
- Tasks now appear immediately in Browse Tasks

### ⚠️ Needs Backend Work
- **Overdue task status updates**
- Implement backend cron job for persistent overdue status
- Current client-side detection is temporary workaround

### Testing Recommendations

**For Browse Tasks Fix:**
1. Test with clean install and first-time user
2. Verify immediate appearance in Browse Tasks
3. Test with multiple tasks created in sequence

**For Overdue Tasks:**
1. Wait for backend cron job implementation
2. Test with tasks that have past due dates
3. Verify notifications are sent when tasks become overdue
4. Check that status persists across app restarts

