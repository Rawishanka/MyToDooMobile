// 🎯 **REACT QUERY HOOKS FOR TASK API**
// This file contains all React Query hooks for task operations

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskAPI } from '../../api/task-api';
import {
    CreateOfferRequest,
    CreateTaskRequest,
    MyTasksParams,
    TaskFilterParams,
    TaskOffer,
    TaskSearchParams,
    UpdateTaskRequest
} from '../../api/types/tasks';
import { handleAuthenticationError, isAuthError } from '../utils/auth-utils';

// 🔑 **QUERY KEYS**
export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters: any) => [...TASK_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
  myTasks: (params?: MyTasksParams) => [...TASK_QUERY_KEYS.all, 'my-tasks', params] as const,
  myOffers: (params?: MyTasksParams) => [...TASK_QUERY_KEYS.all, 'my-offers', params] as const,
  offers: (taskId: string) => [...TASK_QUERY_KEYS.detail(taskId), 'offers'] as const,
  allOffers: (taskId?: string) => taskId 
    ? [...TASK_QUERY_KEYS.all, 'all-offers', taskId] as const
    : [...TASK_QUERY_KEYS.all, 'all-offers'] as const,
  completionStatus: (taskId: string) => [...TASK_QUERY_KEYS.detail(taskId), 'completion-status'] as const,
  paymentStatus: () => [...TASK_QUERY_KEYS.all, 'payment-status'] as const,
  questions: (taskId: string) => [...TASK_QUERY_KEYS.detail(taskId), 'questions'] as const,
  userTasks: (userId: string) => [...TASK_QUERY_KEYS.all, 'user', userId] as const,
  categories: () => [...TASK_QUERY_KEYS.all, 'categories'] as const,
};

// 🌟 **PHASE 1: CORE TASK FEATURES - QUERY HOOKS**

/**
 * 📋 Get All Tasks Hook
 */
export function useGetAllTasks() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.lists(),
    queryFn: () => TaskAPI.getAllTasks(),
    staleTime: 0, // Always consider data stale - fetch fresh data immediately
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: 30000, // Refetch every 30 seconds to ensure fresh data
  });
}

/**
 * 🎯 Get Filtered Tasks Hook (Advanced filtering and sorting)
 */
export function useGetFilteredTasks(params?: import('@/src/api/types/tasks').TaskFilterParams, enabled = true) {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.lists(), 'filtered', params],
    queryFn: () => TaskAPI.getFilteredTasks(params),
    enabled,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * � Get Categories Hook
 */
export function useGetCategories() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.categories(),
    queryFn: () => TaskAPI.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

export function useGetCategoriesByLocation(locationType: string, enabled = true) {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.categories(), 'by-location', locationType],
    queryFn: () => TaskAPI.getCategoriesByLocation(locationType),
    enabled: enabled && !!locationType,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 🔍 Search Tasks Hook (for search functionality)
 */
export function useSearchTasks(params: TaskSearchParams, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => TaskAPI.searchTasks(params),
    enabled: enabled, // Remove the Object.keys condition that was preventing execution
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * 🎯 Filter Tasks Hook (for filter/sort UI actions)
 */
export function useFilterTasks(params: TaskFilterParams, enabled = true) {
  return useQuery({
    queryKey: ['tasks', 'filter', params],
    queryFn: () => TaskAPI.filterTasks(params),
    enabled: enabled && Object.keys(params).length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter cache for filter results
    retry: (failureCount, error: any) => {
      // Don't retry on backend routing conflicts (500 errors with ObjectId)
      if (error?.response?.status === 500 && 
          error?.response?.data?.message?.includes('Cast to ObjectId failed')) {
        console.warn('🚨 Detected routing conflict, not retrying');
        return false;
      }
      
      // Don't retry on other 500 errors
      if (error?.response?.status === 500) {
        return false;
      }
      
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * 👤 Get My Tasks Hook
 */
export function useGetMyTasks(params?: MyTasksParams) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.myTasks(params),
    queryFn: () => TaskAPI.getMyTasks(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * 🤝 Get My Offers Hook
 */
export function useGetMyOffers(params?: MyTasksParams) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.myOffers(params),
    queryFn: () => TaskAPI.getMyOffers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// 🌟 **PHASE 2: TASK DETAILS & MANAGEMENT - QUERY HOOKS**

/**
 * 📖 Get Task Details Hook
 */
export function useGetTaskById(taskId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(taskId),
    queryFn: () => TaskAPI.getTaskById(taskId),
    enabled: enabled && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// 🌟 **PHASE 3: OFFER SYSTEM - QUERY HOOKS**

/**
 * 👀 Get Task Offers Hook
 */
export function useGetTaskOffers(taskId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.offers(taskId),
    queryFn: () => TaskAPI.getTaskOffers(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * 🌍 Get All Offers Hook
 * Fetches all offers from /api/offers/all endpoint with optional taskId filter
 */
export function useGetAllOffers(params?: {
  taskId?: string;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
}, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.allOffers(params?.taskId),
    queryFn: () => TaskAPI.getAllOffers(params),
    enabled: enabled,
    staleTime: 30 * 1000, // 30 seconds - keep fresh for real-time updates
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });
}

/**
 * ✅ Get Accepted Offer Hook
 */
export function useGetAcceptedOffer(taskId: string, enabled = true) {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.offers(taskId), 'accepted'],
    queryFn: async () => {
      const offersResponse = await TaskAPI.getTaskOffers(taskId);
      const acceptedOffer = offersResponse.data?.offers?.find((offer: TaskOffer) => offer.status === 'accepted');
      return acceptedOffer ? { data: acceptedOffer } : { data: null };
    },
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// 🌟 **PHASE 4: COMPLETION FLOW - QUERY HOOKS**

/**
 * 📊 Get Task Completion Status Hook
 */
export function useGetTaskCompletionStatus(taskId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.completionStatus(taskId),
    queryFn: () => TaskAPI.getTaskCompletionStatus(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// 🌟 **PHASE 5: ADVANCED FEATURES - QUERY HOOKS**

/**
 * 📊 Get Payment Status Hook
 */
export function useGetPaymentStatus() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.paymentStatus(),
    queryFn: () => TaskAPI.getPaymentStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (endpoint doesn't exist) or 403/401 (auth issues)
      if (error?.response?.status === 404 || 
          error?.response?.status === 403 || 
          error?.response?.status === 401) {
        console.warn('🚨 Payment status endpoint not available, using fallback data');
        return false;
      }
      
      // Retry network errors up to 1 time
      return failureCount < 1;
    },
  });
}

/**
 * 💰 Get Tasker Payments Hook
 */
export function useGetTaskerPayments() {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.all, 'tasker-payments'],
    queryFn: () => TaskAPI.getTaskerPayments(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 💵 Get Poster Payments Hook
 */
export function useGetPosterPayments() {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.all, 'poster-payments'],
    queryFn: () => TaskAPI.getPosterPayments(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * ❓ Get Task Questions Hook
 */
export function useGetTaskQuestions(taskId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.questions(taskId),
    queryFn: () => TaskAPI.getTaskQuestions(taskId),
    enabled: enabled && !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * 🌍 Get All Public Questions Hook
 */
export function useGetAllPublicQuestions(enabled = true) {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.all, 'public-questions'],
    queryFn: () => TaskAPI.getAllPublicQuestions(),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 or 500 error
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        console.log('📝 Public questions endpoint not available, skipping retries');
        return false;
      }
      return failureCount < 1; // Only retry once for other errors
    },
    retryDelay: 2000, // Wait 2 seconds before retry
  });
}

/**
 * 👤 Get User Tasks Hook
 */
export function useGetUserTasks(userId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.userTasks(userId),
    queryFn: () => TaskAPI.getUserTasks(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// 🎯 **MUTATION HOOKS**

/**
 * ➕ Create Task Mutation
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => TaskAPI.createTask(taskData),
    onSuccess: () => {
      // Force immediate refetch of all task-related queries
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All task queries (includes map data, browse, my tasks, search)
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Force immediate refetch of browse tasks
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // Force immediate refetch of my tasks
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() }); // My offers specifically
      console.log("✅ Force refetched all task queries after creating new task - browse tasks should update immediately");
    },
  });
}

/**
 * ➕ Post Task with Images Mutation
 */
export function usePostTaskDirect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => {
      console.log('🚀 DIRECT MUTATION - Received task data with images:');
      console.log('🚀 DIRECT MUTATION - taskData:', JSON.stringify(taskData, null, 2));
      console.log('🚀 DIRECT MUTATION - images count:', taskData.images?.length || 0);
      return TaskAPI.postTaskDirect(taskData);
    },
    onSuccess: (result, variables) => {
      // Enhanced cache invalidation with specific task detail
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
      
      // If we have the created task ID, invalidate its specific detail query
      console.log("🔍 Task creation result structure:", JSON.stringify(result, null, 2));
      const createdTaskId = (result as any)?.data?.id || (result as any)?.data?._id;
      if (createdTaskId) {
        console.log("✅ Invalidating specific task detail cache for ID:", createdTaskId);
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(createdTaskId) });
      } else {
        console.log("⚠️ Could not extract task ID from result - cannot invalidate specific detail");
      }
      
      console.log("✅ Task posted successfully (DIRECT) - force refetched all task queries and specific detail");
    },
    onError: (error: any) => {
      console.error("❌ Error posting task (DIRECT):", error);
      
      if (isAuthError(error)) {
        console.error("❌ Authentication error detected - handling automatically");
        handleAuthenticationError(error);
      } else if (error?.message?.includes("Images are too large")) {
        console.error("❌ Image upload failed - files too large");
      } else {
        console.error("❌ Task posting failed with unknown error:", error);
      }
    }
  });
}

export function usePostTaskWithImages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskData, imageUris }: { taskData: CreateTaskRequest; imageUris: string[] }) => {
      console.log('🔧 MUTATION - Received parameters:');
      console.log('🔧 MUTATION - taskData:', JSON.stringify(taskData, null, 2));
      console.log('🔧 MUTATION - imageUris:', JSON.stringify(imageUris, null, 2));
      return TaskAPI.postTaskWithImages(taskData, imageUris);
    },
    onSuccess: (result, variables) => {
      // Force immediate refetch of all task-related queries
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All task queries (includes map data, browse, my tasks, search)
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Force immediate refetch of browse tasks
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // Force immediate refetch of my tasks
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() }); // My offers specifically
      console.log("✅ Task with images posted successfully - force refetched all task queries");
    },
    onError: (error: any) => {
      console.error("❌ Error posting task with images:", error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error detected - handling automatically");
        handleAuthenticationError(error);
      } else if (error?.message?.includes("Images are too large")) {
        console.error("❌ Image upload failed - files too large");
      } else {
        console.error("❌ Task posting with images failed with unknown error:", error);
      }
    }
  });
}

/**
 * ➕ Post Task Mutation (Alternative)
 */
export function usePostTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => TaskAPI.postTask(taskData),
    onSuccess: (result, variables) => {
      // Optimized: Only invalidate queries, let them refetch on demand
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      console.log("✅ Task posted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Error posting task:", error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error detected - handling automatically");
        handleAuthenticationError(error);
      } else {
        console.error("❌ Task posting failed with unknown error:", error);
      }
    }
  });
}

/**
 * ✏️ Update Task Mutation
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequest }) => {
      console.log('🔄 useUpdateTask: Starting mutation for taskId:', taskId);
      console.log('🔄 useUpdateTask: Update payload:', JSON.stringify(updates, null, 2));
      return TaskAPI.updateTask(taskId, updates);
    },
    onSuccess: (data, variables) => {
      console.log('✅ useUpdateTask: Mutation successful!');
      console.log('✅ useUpdateTask: Response data:', JSON.stringify(data, null, 2));
      console.log('🔄 useUpdateTask: Starting cache invalidation and refetch...');
      
      // Force immediate refetch of all task-related queries
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      console.log('✅ Invalidated task detail query for:', variables.taskId);
      
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All views
      console.log('✅ Invalidated all task queries');
      
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Force immediate refetch of browse tasks
      console.log('✅ Refetching browse tasks list...');
      
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // Force immediate refetch of my tasks
      console.log('✅ Refetching my tasks list...');
      
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() }); // My offers
      console.log('✅ Invalidated my offers query');
      
      console.log("✅ useUpdateTask: All cache operations completed - UI should update immediately");
    },
    onError: (error: any, variables) => {
      console.error('❌ useUpdateTask: Mutation failed!');
      console.error('❌ useUpdateTask: TaskId:', variables.taskId);
      console.error('❌ useUpdateTask: Updates payload:', JSON.stringify(variables.updates, null, 2));
      console.error('❌ useUpdateTask: Error details:', error);
      console.error('❌ useUpdateTask: Error message:', error?.message);
      console.error('❌ useUpdateTask: Error response:', error?.response?.data);
    },
  });
}

/**
 * ✏️🖼️ Update Task With Images Mutation
 * Handles updating tasks with new image uploads
 */
export function useUpdateTaskWithImages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      taskId, 
      updates, 
      newImageUris = [], 
      existingImages = [], 
      replaceImages = false 
    }: { 
      taskId: string; 
      updates: UpdateTaskRequest;
      newImageUris?: string[];
      existingImages?: string[];
      replaceImages?: boolean;
    }) => {
      console.log('🔄 useUpdateTaskWithImages: Starting mutation for taskId:', taskId);
      console.log('🔄 useUpdateTaskWithImages: Update payload:', JSON.stringify(updates, null, 2));
      console.log('🔄 useUpdateTaskWithImages: New images:', newImageUris.length);
      console.log('🔄 useUpdateTaskWithImages: Existing images:', existingImages.length);
      console.log('🔄 useUpdateTaskWithImages: Replace images:', replaceImages);
      return TaskAPI.updateTaskWithImages(taskId, updates, newImageUris, existingImages, replaceImages);
    },
    onSuccess: (data, variables) => {
      console.log('✅ useUpdateTaskWithImages: Mutation successful!');
      console.log('✅ useUpdateTaskWithImages: Response data:', JSON.stringify(data, null, 2));
      console.log('🔄 useUpdateTaskWithImages: Starting cache invalidation and refetch...');
      
      // Force immediate refetch of all task-related queries
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      console.log('✅ Invalidated task detail query for:', variables.taskId);
      
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All views
      console.log('✅ Invalidated all task queries');
      
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Force immediate refetch of browse tasks
      console.log('✅ Refetching browse tasks list...');
      
      queryClient.refetchQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // Force immediate refetch of my tasks
      console.log('✅ Refetching my tasks list...');
      
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() }); // My offers
      console.log('✅ Invalidated my offers query');
      
      console.log("✅ useUpdateTaskWithImages: All cache operations completed - UI should update immediately");
    },
    onError: (error: any, variables) => {
      console.error('❌ useUpdateTaskWithImages: Mutation failed!');
      console.error('❌ useUpdateTaskWithImages: TaskId:', variables.taskId);
      console.error('❌ useUpdateTaskWithImages: Updates payload:', JSON.stringify(variables.updates, null, 2));
      console.error('❌ useUpdateTaskWithImages: New images count:', variables.newImageUris?.length || 0);
      console.error('❌ useUpdateTaskWithImages: Error details:', error);
      console.error('❌ useUpdateTaskWithImages: Error message:', error?.message);
      console.error('❌ useUpdateTaskWithImages: Error response:', error?.response?.data);
    },
  });
}

/**
 * 🗑️ Delete Task Mutation
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => TaskAPI.deleteTask(taskId),
    onSuccess: (data, taskId) => {
      // Remove the task from all views
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All views
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Browse tasks
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // My tasks
    },
  });
}

/**
 * 💰 Create Offer Mutation
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, offerData }: { taskId: string; offerData: CreateOfferRequest }) => 
      TaskAPI.createOffer(taskId, offerData),
    onSuccess: (data, variables) => {
      // Refetch offers for this task
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.offers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers() }); // Invalidate global offers
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * ✅ Accept Offer Mutation
 */
export function useAcceptOffer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, offerId, userId, taskCategory }: { taskId: string; offerId: string; userId?: string; taskCategory?: string }) => 
      TaskAPI.acceptOffer(taskId, offerId, userId, taskCategory),
    onSuccess: (data, variables) => {
      // Refetch task details and offers
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.offers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers() }); // Invalidate global offers
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * ✏️ Update Offer Mutation
 */
export function useUpdateOffer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, offerId, updates }: { taskId: string; offerId: string; updates: Partial<CreateOfferRequest> }) => 
      TaskAPI.updateOffer(taskId, offerId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.offers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers() }); // Invalidate global offers
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * ✅ Complete Task Mutation
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => TaskAPI.completeTask(taskId),
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.completionStatus(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * 📋 Get Cancellation Reasons Query
 */
export function useGetCancellationReasons(type: 'poster' | 'tasker') {
  return useQuery({
    queryKey: ['cancellation-reasons', type],
    queryFn: () => TaskAPI.getCancellationReasons(type),
    staleTime: 1000 * 60 * 60, // 1 hour - reasons don't change frequently
  });
}

/**
 * ❌ Cancel Task Mutation (Legacy - Pre-payment)
 */
export function useCancelTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, reason, reasonId }: { taskId: string; reason?: string; reasonId?: string }) => 
      TaskAPI.cancelTask(taskId, reason, reasonId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * 📝 Create Cancellation Request Mutation (Post-payment)
 */
export function useCreateCancellationRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) => 
      TaskAPI.createCancellationRequest(taskId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cancellation-request', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * 🔍 Get Cancellation Request Query (Post-payment)
 */
export function useGetCancellationRequest(taskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['cancellation-request', taskId],
    queryFn: () => TaskAPI.getCancellationRequest(taskId),
    enabled: enabled && !!taskId,
    staleTime: 1000 * 30, // 30 seconds - check frequently for updates
    retry: 1, // Only retry once to avoid spam
    retryDelay: 1000, // Wait 1 second before retry
    // Suppress errors in UI - 400/404 are expected for tasks without cancellation requests
    meta: {
      errorMessage: false, // Don't show error toast/alert
    },
  });
}

/**
 * ✅ Respond to Cancellation Request Mutation (Post-payment)
 */
export function useRespondToCancellationRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'accept' | 'reject' }) => 
      TaskAPI.respondToCancellationRequest(requestId, action),
    onSuccess: (data) => {
      // Invalidate the task details and cancellation request
      const taskId = data?.data?.task?._id;
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['cancellation-request', taskId] });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      }
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * 🔄 Update Task Status Mutation
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      TaskAPI.updateTaskStatus(taskId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    },
  });
}

/**
 * 🤝 Accept Task Mutation
 */
export function useAcceptTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => TaskAPI.acceptTask(taskId),
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * 💳 Complete Payment Mutation
 */
export function useCompletePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, paymentData }: { taskId: string; paymentData?: any }) => 
      TaskAPI.completePayment(taskId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.paymentStatus() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
    },
  });
}

/**
 * 💳 Complete Task Payment Mutation (Stripe)
 */
export function useCompleteTaskPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, completionData }: { taskId: string; completionData: any }) => {
      // Import PaymentAPI here to avoid circular dependency
      const PaymentAPI = require('@/src/api/payment-api');
      return PaymentAPI.completeTaskPayment(taskId, completionData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.paymentStatus() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.allOffers() });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
    },
  });
}

/**
 * ❓ Post Task Question Mutation
 */
export function usePostTaskQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, question }: { taskId: string; question: string }) => 
      TaskAPI.postTaskQuestion(taskId, question),
    onSuccess: (data, variables) => {
      console.log('✅ Question posted successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.questions(variables.taskId) });
      // Also refresh task detail to update question count
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
    },
    onError: (error: any) => {
      console.error("❌ Error posting question:", error);
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        console.error("❌ Authentication error detected - handling automatically");
        handleAuthenticationError(error);
      } else {
        console.error("❌ Question posting failed with unknown error:", error);
      }
    }
  });
}

/**
 * 💬 Answer Task Question Mutation
 */
export function useAnswerTaskQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, questionId, answer }: { taskId: string; questionId: string; answer: string }) => 
      TaskAPI.answerTaskQuestion(taskId, questionId, answer),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.questions(variables.taskId) });
    },
  });
}

// 🚀 **EXPORT ALL HOOKS**
export const TaskHooks = {
  // Query Hooks
  useGetAllTasks,
  useSearchTasks,
  useFilterTasks, // New filter hook for Sort/Filter UI
  useGetMyTasks,
  useGetMyOffers,
  useGetTaskById,
  useGetTaskOffers,
  useGetAllOffers,
  useGetAcceptedOffer,
  useGetTaskCompletionStatus,
  useGetPaymentStatus,
  useGetTaskerPayments,
  useGetPosterPayments,
  useGetTaskQuestions,
  useGetUserTasks,
  
  // Mutation Hooks
  useCreateTask,
  usePostTask,
  useUpdateTask,
  useUpdateTaskWithImages,
  useDeleteTask,
  useCreateOffer,
  useAcceptOffer,
  useUpdateOffer,
  useCompleteTask,
  useCancelTask, // Legacy: Pre-payment cancellation
  useCreateCancellationRequest, // NEW: Post-payment cancellation request
  useRespondToCancellationRequest, // NEW: Accept/Reject cancellation request
  useUpdateTaskStatus,
  useAcceptTask,
  useCompletePayment,
  useCompleteTaskPayment,
  usePostTaskQuestion,
  useAnswerTaskQuestion,
};

export default TaskHooks;