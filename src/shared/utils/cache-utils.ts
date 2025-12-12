// 🔄 **CACHE UTILITIES**
// Utility functions for managing React Query cache

import { CATEGORIES_QUERY_KEYS } from '@/src/shared/hooks/useCategoriesApi';
import { TASK_QUERY_KEYS } from '@/src/shared/hooks/useTaskApi';
import { CHAT_KEYS } from '@/src/shared/hooks/useTaskChat';
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
    console.log("🧹 Clearing all task caches...");
    
    // Remove all task-related queries from cache
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    
    // CRITICAL: Also remove filter API queries
    queryClient.removeQueries({ queryKey: ['tasks', 'filter'] });
    
    // Also remove any other task-related queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
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
      predicate: (query: any) => {
        return query.queryKey[0] === 'categories';
      }
    });
    
    console.log("✅ All categories caches cleared successfully");
  };
}

/**
 * 👤 Clear All User Profile Caches
 * Completely removes all user profile-related data from React Query cache
 */
export function useClearUserProfileCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("🧹 Clearing all user profile caches...");
    
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
    console.log("🧹 Force clearing entire cache to prevent any data persistence...");
    queryClient.clear();
    
    console.log("✅ All user profile caches cleared successfully");
  };
}

/**
 * 💬 Clear All Chat Caches
 * Completely removes all chat-related data from React Query cache
 */
export function useClearChatCaches() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log("🧹 Clearing all chat caches...");
    
    // Remove all chat-related queries from cache
    queryClient.removeQueries({ queryKey: CHAT_KEYS.all });
    queryClient.removeQueries({ queryKey: CHAT_KEYS.list() });
    
    // Also remove any other chat-related queries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        const key = query.queryKey[0];
        return key === 'chats' || key === 'chat' || key === 'messages';
      }
    });
    
    console.log("✅ All chat caches cleared successfully");
  };
}
/**
 * 🧹 Clear All Caches (Tasks + Categories + User Profile + Chats)
 * Completely removes all data from React Query cache
 */
export function useClearAllCaches() {
  const clearTaskCaches = useClearTaskCaches();
  const clearCategoriesCaches = useClearCategoriesCaches();
  const clearUserProfileCaches = useClearUserProfileCaches();
  const clearChatCaches = useClearChatCaches();
  
  return () => {
    console.log("🧹 Clearing ALL caches...");
    clearTaskCaches();
    clearCategoriesCaches();
    clearUserProfileCaches();
    clearChatCaches();
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
    
    // CRITICAL: Also invalidate and refetch filter API queries
    await queryClient.invalidateQueries({ queryKey: ['tasks', 'filter'] });
    await queryClient.refetchQueries({ queryKey: ['tasks', 'filter'] });
    
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

/**
 * 🧹 Clear All Caches (Global Function)
 * This function can be called outside of React components to clear all caches
 * Used for global cache clearing during logout
 */
export function clearAllCachesGlobal(queryClient: any) {
  if (!queryClient) {
    console.log("⚠️ No query client provided for cache clearing");
    return;
  }
  
  try {
    console.log("🧹 Clearing ALL caches globally...");
    
    // Clear all task-related queries
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    
    // CRITICAL: Also remove filter API queries
    queryClient.removeQueries({ queryKey: ['tasks', 'filter'] });
    
    // Clear all categories-related queries
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
    
    // Clear all user profile-related queries
    queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
    queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.all });
    
    // Clear all chat-related queries
    queryClient.removeQueries({ queryKey: CHAT_KEYS.all });
    queryClient.removeQueries({ queryKey: CHAT_KEYS.list() });
    
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
    
    console.log("✅ All caches cleared globally");
  } catch (error) {
    console.error("❌ Error clearing caches globally:", error);
  }
}

/**
 * 🔄 Hook to clear all caches on login
 * Ensures fresh data is loaded for new user session
 */
export function useClearCachesOnLogin() {
  const clearAllCaches = useClearAllCaches();
  
  return () => {
    console.log("🔄 Clearing caches for fresh login session...");
    clearAllCaches();
  };
}