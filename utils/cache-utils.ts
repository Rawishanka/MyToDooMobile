// 🔄 **CACHE UTILITIES**
// Utility functions for managing React Query cache

import { useQueryClient } from '@tanstack/react-query';
import { TASK_QUERY_KEYS } from '@/hooks/useTaskApi';

/**
 * 🧹 Clear All Task Caches
 * Completely removes all task-related data from React Query cache
 */
export function useClearTaskCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("🧹 Clearing all task caches...");
    
    // Remove all task-related queries from cache
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    
    // Also remove any other task-related queries
    queryClient.removeQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'tasks';
      }
    });
    
    console.log("✅ All task caches cleared successfully");
  };
}

/**
 * 🔄 Force Refresh All Tasks
 * Forces immediate refetch of all task data
 */
export function useForceRefreshTasks() {
  const queryClient = useQueryClient();
  
  return async () => {
    console.log("🔄 Force refreshing all task data...");
    
    // Invalidate all task queries and force immediate refetch
    await queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    await queryClient.refetchQueries({ 
      queryKey: TASK_QUERY_KEYS.lists(),
      type: 'all'
    });
    
    console.log("✅ All task data refreshed");
  };
}