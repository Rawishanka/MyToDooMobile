/**
 * Task-Based Chat Hooks
 * 
 * React Query hooks for task-based chat functionality
 */

import {
    CreateChatRequest,
    createOrGetTaskChat,
    getChatById,
    getChatMessages,
    getUserChats,
    markMessagesAsRead,
    sendMessage,
    SendMessageRequest,
} from '@/src/api/task-chat-api';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ==================== QUERY KEYS ====================

export const CHAT_KEYS = {
  all: ['chats'] as const,
  lists: () => [...CHAT_KEYS.all, 'list'] as const,
  list: () => [...CHAT_KEYS.lists()] as const,
  details: () => [...CHAT_KEYS.all, 'detail'] as const,
  detail: (chatId: string) => [...CHAT_KEYS.details(), chatId] as const,
  messages: (chatId: string) => [...CHAT_KEYS.all, 'messages', chatId] as const,
};

// ==================== HOOKS ====================

/**
 * Get all chats for user
 */
export const useGetUserChats = () => {
  const isAuthenticated = useAuthStore((state) => !!state.user);

  return useQuery({
    queryKey: CHAT_KEYS.list(),
    queryFn: getUserChats,
    enabled: isAuthenticated,
    staleTime: 2 * 1000, // 2 seconds - optimized for real-time updates
    refetchInterval: 3000, // Auto-refresh every 3 seconds for immediate chat list updates
    retry: 1,
  });
};

/**
 * Create or get chat for a task
 */
export const useCreateOrGetTaskChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CreateChatRequest }) =>
      createOrGetTaskChat(taskId, data),
    onSuccess: () => {
      // Invalidate chats list
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.list() });
    },
  });
};

/**
 * Get chat by ID
 */
export const useGetChatById = (chatId: string | null, enabled: boolean = true) => {
  const isAuthenticated = useAuthStore((state) => !!state.user);

  return useQuery({
    queryKey: CHAT_KEYS.detail(chatId || ''),
    queryFn: () => getChatById(chatId!),
    enabled: isAuthenticated && !!chatId && enabled,
    staleTime: 2 * 1000, // 2 seconds - optimized for real-time updates
    refetchInterval: 3000, // Auto-refresh every 3 seconds for immediate chat detail updates
    retry: 1,
  });
};

/**
 * Get chat messages
 */
export const useGetChatMessages = (
  chatId: string | null,
  page: number = 1,
  limit: number = 50,
  enabled: boolean = true
) => {
  const isAuthenticated = useAuthStore((state) => !!state.user);

  return useQuery({
    queryKey: [...CHAT_KEYS.messages(chatId || ''), page, limit],
    queryFn: () => getChatMessages(chatId!, page, limit),
    enabled: isAuthenticated && !!chatId && enabled,
    staleTime: 2 * 1000, // 2 seconds - optimized for real-time message updates
    refetchInterval: 2000, // Auto-refresh every 2 seconds for immediate message synchronization
    retry: 1,
  });
};

/**
 * Send message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: SendMessageRequest }) =>
      sendMessage(chatId, data),
    onSuccess: (_, variables) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.messages(variables.chatId) 
      });
      
      // Invalidate chat details (to update last message)
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.detail(variables.chatId) 
      });
      
      // Invalidate chats list (to update last message and unread count)
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.list() 
      });
    },
  });
};

/**
 * Mark messages as read
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => markMessagesAsRead(chatId),
    onSuccess: (_, chatId) => {
      // Invalidate chat details (to update unread count)
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.detail(chatId) 
      });
      
      // Invalidate chats list (to update unread count)
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.list() 
      });
      
      // Invalidate messages (to update read status)
      queryClient.invalidateQueries({ 
        queryKey: CHAT_KEYS.messages(chatId) 
      });
    },
  });
};
