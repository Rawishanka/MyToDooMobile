// 🔄 **CACHE UTILITIES**
// Utility functions for managing React Query cache

import { CATEGORIES_QUERY_KEYS } from '@/src/shared/hooks/useCategoriesApi';
import { TASK_QUERY_KEYS } from '@/src/shared/hooks/useTaskApi';
import { useQueryClient } from '@tanstack/react-query';

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
 * 🏷️ Clear All Categories Caches
 * Completely removes all categories-related data from React Query cache
 */
export function useClearCategoriesCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("🧹 Clearing all categories caches...");
    
    // Remove all categories-related queries from cache
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
    
    // Also remove any other categories-related queries
    queryClient.removeQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'categories';
      }
    });
    
    console.log("✅ All categories caches cleared successfully");
  };
}

/**
 * 🧹 Clear All Caches (Tasks + Categories)
 * Completely removes all data from React Query cache
 */
export function useClearAllCaches() {
  const clearTaskCaches = useClearTaskCaches();
  const clearCategoriesCaches = useClearCategoriesCaches();
  
  return () => {
    console.log("🧹 Clearing ALL caches...");
    clearTaskCaches();
    clearCategoriesCaches();
    console.log("✅ All caches cleared successfully");
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

/**
 * 🏷️ Force Refresh Categories
 * Forces immediate refetch of categories data
 */
export function useForceRefreshCategories() {
  const queryClient = useQueryClient();
  
  return async () => {
    console.log("🔄 Force refreshing categories data...");
    
    // Invalidate all categories queries and force immediate refetch
    await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    await queryClient.refetchQueries({ 
      queryKey: CATEGORIES_QUERY_KEYS.lists(),
      type: 'all'
    });
    
    console.log("✅ All categories data refreshed");
  };
}