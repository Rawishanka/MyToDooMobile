// 🔄 **CACHE UTILITIES**
// Utility functions for managing React Query cache

import { CATEGORIES_QUERY_KEYS } from '@/src/shared/hooks/useCategoriesApi';
import { TASK_QUERY_KEYS } from '@/src/shared/hooks/useTaskApi';
import { USER_QUERY_KEYS } from '@/src/shared/hooks/useUserApi';
import { USER_PROFILE_QUERY_KEYS } from '@/src/shared/hooks/useUserProfileApi';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 🧹 Clear All Task Caches
 * Completely removes all task-related data from React Query cache
 */
export function useClearTaskCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    
    // Remove all task-related queries from cache
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    
    // Also remove any other task-related queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        return query.queryKey[0] === 'tasks';
      }
    });
    
  };
}

/**
 * 🏷️ Clear All Categories Caches
 * Completely removes all categories-related data from React Query cache
 */
export function useClearCategoriesCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    
    // Remove all categories-related queries from cache
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
    
    // Also remove any other categories-related queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        return query.queryKey[0] === 'categories';
      }
    });
    
  };
}

/**
 * 👤 Clear All User Profile Caches
 * Completely removes all user profile-related data from React Query cache
 */
export function useClearUserProfileCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    
    // Clear user profile queries from useUserProfileApi
    queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
    
    // Clear user queries from useUserApi 
    queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.all });
    
    // Also remove any other user/profile-related queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        const key = query.queryKey[0];
        return key === 'user' || key === 'userProfile' || key === 'user-profile' || 
               key === 'profile' || key === 'auth-token' || key === 'auth';
      }
    });
    
    // Force clear everything to be absolutely sure
    queryClient.clear();
    
  };
}
/**
 * 🧹 Clear All Caches (Tasks + Categories + User Profile)
 * Completely removes all data from React Query cache
 */
export function useClearAllCaches() {
  const clearTaskCaches = useClearTaskCaches();
  const clearCategoriesCaches = useClearCategoriesCaches();
  const clearUserProfileCaches = useClearUserProfileCaches();
  
  return () => {
    clearTaskCaches();
    clearCategoriesCaches();
    clearUserProfileCaches();
  };
}

/**
 * 🔄 Force Refresh All Tasks
 * Forces immediate refetch of all task data
 */
export function useForceRefreshTasks() {
  const queryClient = useQueryClient();
  
  return async () => {
    
    // Invalidate all task queries and force immediate refetch
    await queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    await queryClient.refetchQueries({ 
      queryKey: TASK_QUERY_KEYS.lists(),
      type: 'all'
    });
    
  };
}

/**
 * 🏷️ Force Refresh Categories
 * Forces immediate refetch of categories data
 */
export function useForceRefreshCategories() {
  const queryClient = useQueryClient();
  
  return async () => {
    
    // Invalidate all categories queries and force immediate refetch
    await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    await queryClient.refetchQueries({ 
      queryKey: CATEGORIES_QUERY_KEYS.lists(),
      type: 'all'
    });
    
  };
}

/**
 * 🧹 Clear All Caches (Global Function)
 * This function can be called outside of React components to clear all caches
 * Used for global cache clearing during logout
 */
export function clearAllCachesGlobal(queryClient: any) {
  if (!queryClient) {
    return;
  }
  
  try {
    
    // Clear all task-related queries
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    
    // Clear all categories-related queries
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
    
    // Clear all user profile-related queries
    queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.all });
    
    // Clear all other possible auth/user queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        const key = query.queryKey[0];
        return key === 'user' || key === 'userProfile' || key === 'user-profile' || 
               key === 'profile' || key === 'auth-token' || key === 'auth' ||
               key === 'tasks' || key === 'categories' || key === 'notifications' ||
               key === 'offers' || key === 'chats';
      }
    });
    
    // Also clear the entire cache as a final step
    queryClient.clear();
    
  } catch (error) {
  }
}

/**
 * 🔄 Hook to clear all caches on login
 * Ensures fresh data is loaded for new user session
 */
export function useClearCachesOnLogin() {
  const clearAllCaches = useClearAllCaches();
  
  return () => {
    clearAllCaches();
  };
}