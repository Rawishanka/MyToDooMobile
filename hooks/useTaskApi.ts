// 🎯 **REACT QUERY HOOKS FOR TASK API**
// This file contains all React Query hooks for task operations

import { TaskAPI } from '@/api/task-api';
import {
    CreateOfferRequest,
    CreateTaskRequest,
    MyTasksParams,
    TaskOffer,
    TaskSearchParams,
    UpdateTaskRequest
} from '@/api/types/tasks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
 * � Get Categories Hook
 */
export function useGetCategories() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.categories(),
    queryFn: () => TaskAPI.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

/**
 * �🔍 Search Tasks Hook
 */
export function useSearchTasks(params: TaskSearchParams, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => TaskAPI.searchTasks(params),
    enabled: enabled && Object.keys(params).length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
 * ➕ Post Task Mutation (Alternative)
 */
export function usePostTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => TaskAPI.postTask(taskData),
    onSuccess: (result, variables) => {
      console.log("🎯 Task posted successfully, forcing UI refresh...");
      
      // Force immediate invalidation and refetch of ALL task-related data
      queryClient.resetQueries({ queryKey: TASK_QUERY_KEYS.all }); // Reset all cached data
      
      // Force refetch specific queries with type 'all' to ensure fresh data
      queryClient.refetchQueries({ 
        queryKey: TASK_QUERY_KEYS.lists(),
        type: 'all' // Refetch regardless of stale time
      });
      
      queryClient.refetchQueries({ 
        queryKey: TASK_QUERY_KEYS.myTasks(),
        type: 'all' // Refetch regardless of stale time
      });
      
      // Also reset and refetch My Offers
      queryClient.resetQueries({ queryKey: TASK_QUERY_KEYS.myOffers() });
      queryClient.refetchQueries({ 
        queryKey: TASK_QUERY_KEYS.myOffers(),
        type: 'all'
      });
      
      // Invalidate any other task-related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'tasks';
        }
      });
      
      console.log("✅ All task queries refreshed - new task should appear immediately in browse and my tasks");
    },
    onError: (error: any) => {
      console.error("❌ Error posting task:", error);
      
      // Check if it's an authentication error
      if (error?.message?.includes("Authentication expired") || error?.message?.includes("Please login again")) {
        console.error("❌ Authentication error detected - user needs to login");
        // The error message will be displayed by the UI component
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
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequest }) => 
      TaskAPI.updateTask(taskId, updates),
    onSuccess: (data, variables) => {
      // Update all task-related queries for consistency
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }); // All views
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() }); // Browse tasks
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.myTasks() }); // My tasks
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
    mutationFn: ({ taskId, offerId }: { taskId: string; offerId: string }) => 
      TaskAPI.acceptOffer(taskId, offerId),
    onSuccess: (data, variables) => {
      // Refetch task details and offers
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.offers(variables.taskId) });
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
 * ❌ Cancel Task Mutation
 */
export function useCancelTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => TaskAPI.cancelTask(taskId),
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
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
 * ❓ Post Task Question Mutation
 */
export function usePostTaskQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, question }: { taskId: string; question: string }) => 
      TaskAPI.postTaskQuestion(taskId, question),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.questions(variables.taskId) });
    },
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
  useGetMyTasks,
  useGetMyOffers,
  useGetTaskById,
  useGetTaskOffers,
  useGetAcceptedOffer,
  useGetTaskCompletionStatus,
  useGetPaymentStatus,
  useGetTaskQuestions,
  useGetUserTasks,
  
  // Mutation Hooks
  useCreateTask,
  usePostTask,
  useUpdateTask,
  useDeleteTask,
  useCreateOffer,
  useAcceptOffer,
  useUpdateOffer,
  useCompleteTask,
  useCancelTask,
  useUpdateTaskStatus,
  useAcceptTask,
  useCompletePayment,
  usePostTaskQuestion,
  useAnswerTaskQuestion,
};

export default TaskHooks;