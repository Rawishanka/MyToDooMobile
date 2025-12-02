// Chat API React Query Hooks

import { ChatAPI } from '@/src/api/chat-api';
import {
  CreateOrUpdateChatRequest,
  SendGroupMessageRequest,
  SendMessageRequest,
  SendSystemMessageRequest
} from '@/src/api/types/chat';
import { handleAuthenticationError, isAuthError } from '@/src/shared/utils/auth-utils';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 🔑 Query Keys
export const CHAT_QUERY_KEYS = {
  all: ['chats'] as const,
  lists: () => [...CHAT_QUERY_KEYS.all, 'list'] as const,
  messages: (taskId: string) => [...CHAT_QUERY_KEYS.all, 'messages', taskId] as const,
  groupMessages: (taskId: string) => [...CHAT_QUERY_KEYS.all, 'group-messages', taskId] as const,
  participants: (taskId: string) => [...CHAT_QUERY_KEYS.all, 'participants', taskId] as const,
};

// 📋 Get All Chats Hook
export function useGetAllChats() {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.lists(),
    queryFn: () => ChatAPI.getAllChats(),
    staleTime: 30000, // 30 seconds
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Auto-refresh every 30 seconds for new chats
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx) or auth errors
      if (error?.message?.includes('404') || 
          error?.message?.includes('401') || 
          error?.message?.includes('Authentication failed') ||
          error?.message?.includes('please log in again')) {
        console.log('🚫 Not retrying chat list due to client error');
        return false;
      }
      // Silent network error handling - only log non-network errors in dev
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to load chat list:', error?.message);
      }
      return failureCount < 2;
    },
  });
}

// 💬 Get Individual Chat Messages Hook (Legacy)
export function useGetChatMessages(taskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.messages(taskId),
    queryFn: () => ChatAPI.getChatMessages(taskId),
    enabled: enabled && !!taskId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    retry: (failureCount, error) => {
      if (error?.message?.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

// 👥 Get Group Chat Messages Hook
export function useGetGroupChatMessages(taskId: string, limit: number = 50, enabled: boolean = true) {
  return useQuery({
    queryKey: [...CHAT_QUERY_KEYS.groupMessages(taskId), { limit }],
    queryFn: () => ChatAPI.getGroupChatMessages(taskId, limit),
    enabled: enabled && !!taskId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('404') || 
          error?.message?.includes('Authentication failed') ||
          error?.message?.includes('No valid endpoint found')) {
        console.log('🚫 Not retrying group messages due to client error');
        return false;
      }
      return failureCount < 2;
    },
  });
}

// 👤 Get Chat Participants Hook
export function useGetChatParticipants(taskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.participants(taskId),
    queryFn: () => ChatAPI.getChatParticipants(taskId),
    enabled: enabled && !!taskId,
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      if (error?.message?.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

// 📤 Send Individual Chat Message Hook
export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, message }: { taskId: string; message: SendMessageRequest }) =>
      ChatAPI.sendChatMessage(taskId, message),
    onSuccess: (_, { taskId }) => {
      // Invalidate chat messages to refresh the list
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.messages(taskId) });
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      // Silent network error handling
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to send chat message:', error?.message);
      }
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        if (__DEV__) console.warn("⚠️ Authentication error in send chat message - handling automatically");
        handleAuthenticationError(error);
      }
    },
  });
}

// 👥 Send Group Chat Message Hook
export function useSendGroupChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, message }: { taskId: string; message: SendGroupMessageRequest }) =>
      ChatAPI.sendGroupChatMessage(taskId, message),
    onSuccess: (_, { taskId }) => {
      console.log('✅ Message sent successfully, invalidating cache for taskId:', taskId);
      // Invalidate group chat messages to refresh the list with a slight delay for API propagation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.groupMessages(taskId) });
        queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.lists() });
        console.log('🔄 Cache invalidated for taskId:', taskId);
      }, 200);
    },
    onError: (error) => {
      // Silent network error handling
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to send group chat message:', error?.message);
      }
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        if (__DEV__) console.warn("⚠️ Authentication error in send group chat message - handling automatically");
        handleAuthenticationError(error);
      }
    },
  });
}

// 🤖 Send System Message Hook
export function useSendSystemMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, message }: { taskId: string; message: SendSystemMessageRequest }) =>
      ChatAPI.sendSystemMessage(taskId, message),
    onSuccess: (_, { taskId }) => {
      // Invalidate group chat messages to refresh the list
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.groupMessages(taskId) });
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      // Silent network error handling
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to send system message:', error?.message);
      }
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        if (__DEV__) console.warn("⚠️ Authentication error in send system message - handling automatically");
        handleAuthenticationError(error);
      }
    },
  });
}

// 🔄 Create or Update Chat Hook
export function useCreateOrUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrUpdateChatRequest) =>
      ChatAPI.createOrUpdateChat(request),
    onSuccess: () => {
      // Invalidate chat lists to refresh
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      // Silent network error handling
      if (!isNetworkError(error) && __DEV__) {
        console.warn('⚠️ Failed to create/update chat:', error?.message);
      }
      
      // Check if it's an authentication error and handle automatically
      if (isAuthError(error)) {
        if (__DEV__) console.warn("⚠️ Authentication error in create/update chat - handling automatically");
        handleAuthenticationError(error);
      }
    },
  });
}