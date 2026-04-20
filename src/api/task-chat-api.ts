/**
 * Task-Based Chat API
 * 
 * Task-based 1-to-1 messaging system using Firebase
 * Each chat is scoped to a single task between poster and tasker
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==================== TYPES ====================

export interface ChatParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating?: number;
}

export interface TaskInfo {
  _id: string;
  title: string;
  status: string;
  budget: number;
  location?: string;
  createdAt: string;
}

export interface LastMessage {
  content: string;
  senderId: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  taskId: TaskInfo | string;
  posterId: ChatParticipant | string;
  taskerId: ChatParticipant | string;
  status: 'active' | 'closed';
  lastMessage?: LastMessage;
  unreadCount?: number;
  posterUnreadCount: number;
  taskerUnreadCount: number;
  createdAt: string;
  closedAt?: string | null;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string | ChatParticipant; // Can be populated or just ID
  content: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface CreateChatRequest {
  posterId: string;
  taskerId: string;
}

export interface CreateChatResponse {
  success: boolean;
  chat: Chat;
  isNew: boolean;
}

export interface GetChatsResponse {
  success: boolean;
  chats: Chat[];
  total?: number;
}

export interface GetChatResponse {
  success: boolean;
  chat: Chat;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SendMessageRequest {
  content: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  markedCount: number;
}

// ==================== API FUNCTIONS ====================

/**
 * GET /chats/user
 * Get all chats for authenticated user
 */
export const getUserChats = async (): Promise<GetChatsResponse> => {
  try {
    console.log('📋 Fetching user chats...');
    
    // Request populated fields for full participant details
    const response = await api.get<any>('/chats/user?populate=posterId,taskerId,taskId');
    
    // Handle different response structures from backend
    let chats = [];
    
    if (response.data?.success && Array.isArray(response.data?.chats)) {
      chats = response.data.chats;
    } else if (Array.isArray(response.data)) {
      chats = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      chats = response.data.data;
    }
    
    if (!Array.isArray(chats) || chats.length === 0) {
      console.log('📭 No chats found');
      return {
        success: true,
        chats: [],
        total: 0
      };
    }
    
    // Transform and filter chats
    const validChats = chats
      .map((chat: any) => {
        if (!chat) return null;
        
        // Skip chats without task reference
        const hasTask = !!chat.taskId || !!chat.task;
        if (!hasTask) {
          console.warn(`⚠️ Skipping chat ${chat._id}: missing task`);
          return null;
        }
        
        // Build participants array from different backend formats:
        // Format 1: participants array (ideal)
        // Format 2: posterId + taskerId (legacy)
        // Format 3: otherUser object (current backend)
        let participants = chat.participants;
        
        if (!Array.isArray(participants) || participants.length === 0) {
          participants = [];
          
          // Legacy format: posterId + taskerId
          if (chat.posterId) participants.push(chat.posterId);
          if (chat.taskerId) participants.push(chat.taskerId);
          
          // Current format: otherUser
          if (chat.otherUser) {
            const nameParts = chat.otherUser.name?.split(' ') || ['User'];
            participants.push({
              _id: chat.otherUser.id,
              firstName: nameParts[0] || 'User',
              lastName: nameParts.slice(1).join(' ') || '',
              avatar: chat.otherUser.avatar,
              email: chat.otherUser.email,
            });
          }
        }
        
        // Validate participants (need at least 1 for otherUser format, 2 for legacy)
        const minParticipants = chat.otherUser ? 1 : 2;
        if (!Array.isArray(participants) || participants.length < minParticipants) {
          console.warn(`⚠️ Skipping chat ${chat._id}: insufficient participants`);
          return null;
        }
        
        // Normalize chat structure to match Chat interface
        return {
          _id: chat.chatId || chat._id,
          chatId: chat.chatId || chat._id,
          taskId: chat.taskId,
          taskTitle: chat.taskTitle,
          taskStatus: chat.taskStatus,
          participants,
          // Required fields for Chat interface
          posterId: chat.posterId || participants[0] || '',
          taskerId: chat.taskerId || participants[1] || participants[0] || '',
          posterUnreadCount: chat.posterUnreadCount || 0,
          taskerUnreadCount: chat.taskerUnreadCount || 0,
          // Optional fields
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount || 0,
          status: chat.status || 'active',
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          closedAt: chat.closedAt,
        } as any; // Use 'as any' since we're extending the interface with additional fields
      })
      .filter((chat): chat is NonNullable<typeof chat> => chat !== null);
    
    console.log(`✅ Retrieved ${validChats.length} valid chats (${chats.length} total)`);
    
    return {
      success: true,
      chats: validChats,
      total: validChats.length
    };
  } catch (error: any) {
    // Don't log authentication errors as errors - they're expected when user is not logged in
    if (error?.response?.status === 401) {
      console.log('ℹ️ User not authenticated - skipping chat fetch');
      throw new Error('Authentication required');
    }
    
    console.error('❌ Failed to fetch user chats:', error);
    
    throw new Error(
      error?.response?.data?.message || 'Failed to fetch chats. Please try again.'
    );
  }
};

/**
 * POST /chats/task/{taskId}/create
 * Create or retrieve chat for a task
 */
export const createOrGetTaskChat = async (
  taskId: string,
  data: CreateChatRequest
): Promise<CreateChatResponse> => {
  try {
    console.log('💬 Creating/getting chat for task:', taskId);
    console.log('💬 Participants:', data);
    
    const response = await api.post<any>(
      `/chats/task/${taskId}/create`,
      data
    );
    
    console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats
    let chat = null;
    let isNew = false;
    
    // Try all possible response structures
    if (response.data?.chat) {
      // Format: { success: true, chat: {...}, isNew: boolean }
      chat = response.data.chat;
      isNew = response.data.isNew || false;
    } else if (response.data?.data?.chat) {
      // Format: { success: true, data: { chat: {...}, isNew: boolean } }
      chat = response.data.data.chat;
      isNew = response.data.data.isNew || false;
    } else if (response.data?.data?._id) {
      // Format: { success: true, data: { _id, taskId, ... } }
      chat = response.data.data;
      isNew = response.data.data.isNew || response.data.isNew || false;
    } else if (response.data?._id) {
      // Format: { _id, taskId, posterId, taskerId, ... }
      chat = response.data;
      isNew = response.data.isNew || true;
    } else if (response.data?.success && typeof response.data === 'object') {
      // Last resort: check if response.data itself looks like a chat object
      const dataKeys = Object.keys(response.data);
      console.log('⚠️ Unexpected format, data keys:', dataKeys);
      
      // If it has taskId field, it might be the chat object wrapped differently
      if ('taskId' in response.data || 'posterId' in response.data) {
        chat = response.data;
        isNew = true;
      }
    }
    
    if (!chat || !chat._id) {
      console.error('❌ Could not extract chat from response');
      console.error('📋 Response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data,
      });
      throw new Error('Invalid response format: missing chat data');
    }
    
    console.log('✅ Chat created/retrieved:', {
      chatId: chat._id,
      isNew
    });
    
    return {
      success: true,
      chat,
      isNew
    };
  } catch (error: any) {
    console.error('❌ Failed to create/get chat:', error);
    console.error('❌ Error response:', error?.response?.data);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Invalid chat data');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to create chat. Please try again.'
    );
  }
};

/**
 * GET /chats/{chatId}
 * Get chat details by ID
 */
export const getChatById = async (chatId: string): Promise<GetChatResponse> => {
  try {
    console.log('🔍 Fetching chat details:', chatId);
    
    // Request populated posterId and taskerId to get participant details
    const response = await api.get<any>(`/chats/${chatId}?populate=posterId,taskerId`);
    
    console.log('📦 Raw chat response:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats
    let chat = null;
    
    if (response.data?.chat) {
      chat = response.data.chat;
    } else if (response.data?.data?.chat) {
      chat = response.data.data.chat;
    } else if (response.data?._id) {
      chat = response.data;
    } else if (response.data?.success === true) {
      // Backend might return { success: true } without chat data for some cases
      console.warn('⚠️ Chat API returned success but no chat data');
      // Return a minimal chat object so UI doesn't break
      return {
        success: true,
        chat: {
          _id: chatId,
          taskId: { _id: '', title: '', status: '', budget: 0, location: '', createdAt: '' },
          posterId: { _id: '', firstName: '', lastName: '', avatar: '', rating: 0 },
          taskerId: { _id: '', firstName: '', lastName: '', avatar: '', rating: 0 },
          status: 'active',
          posterUnreadCount: 0,
          taskerUnreadCount: 0,
          createdAt: new Date().toISOString(),
        } as any
      };
    }
    
    if (!chat) {
      console.error('❌ Invalid response format:', response.data);
      // Don't throw - return a minimal object to prevent UI crash
      console.warn('⚠️ Returning minimal chat object to prevent crash');
      return {
        success: false,
        chat: {
          _id: chatId,
          taskId: { _id: '', title: '', status: '', budget: 0, location: '', createdAt: '' },
          posterId: { _id: '', firstName: '', lastName: '', avatar: '', rating: 0 },
          taskerId: { _id: '', firstName: '', lastName: '', avatar: '', rating: 0 },
          status: 'active',
          posterUnreadCount: 0,
          taskerUnreadCount: 0,
          createdAt: new Date().toISOString(),
        } as any
      };
    }
    
    console.log('✅ Chat details retrieved:', chat._id);
    
    return {
      success: true,
      chat
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch chat:', error);
    console.error('❌ Error details:', error?.response?.data);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('You do not have access to this chat');
    }
    
    if (error?.response?.status === 404) {
      throw new Error('Chat not found');
    }
    
    throw new Error(
      error?.response?.data?.message || error?.message || 'Failed to fetch chat. Please try again.'
    );
  }
};

/**
 * GET /chats/{chatId}/messages
 * Get paginated messages for a chat
 */
export const getChatMessages = async (
  chatId: string,
  page: number = 1,
  limit: number = 50
): Promise<GetMessagesResponse> => {
  try {
    console.log('📨 Fetching messages for chat:', chatId, { page, limit });
    
    // Request populated senderId to get sender details
    const response = await api.get<any>(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}&populate=senderId`
    );
    
    // Handle different response formats from backend
    let messages = [];
    let pagination = {
      currentPage: page,
      totalPages: 1,
      totalMessages: 0,
      hasNextPage: false,
      hasPrevPage: false
    };

    if (response.data) {
      // Format 1: { success: true, messages: [...], pagination: {...} }
      if (Array.isArray(response.data.messages)) {
        messages = response.data.messages;
        pagination = response.data.pagination || pagination;
      }
      // Format 2: Direct array of messages
      else if (Array.isArray(response.data)) {
        messages = response.data;
      }
      // Format 3: { data: { messages: [...] } }
      else if (response.data.data && Array.isArray(response.data.data.messages)) {
        messages = response.data.data.messages;
        pagination = response.data.data.pagination || pagination;
      }
    }

    console.log('✅ Messages retrieved:', messages.length);
    
    // Debug log first few messages to understand structure
    if (messages.length > 0) {
      console.log('📨 Sample messages:', JSON.stringify(messages.slice(0, 3), null, 2));
    }
    
    return {
      success: true,
      messages,
      pagination
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch messages:', error);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('You do not have access to this chat');
    }
    
    if (error?.response?.status === 404) {
      // Chat exists but no messages yet - return empty array
      console.log('ℹ️ No messages found for chat:', chatId);
      return {
        success: true,
        messages: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalMessages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to fetch messages. Please try again.'
    );
  }
};

/**
 * POST /chats/{chatId}/message
 * Send a message in a chat
 */
export const sendMessage = async (
  chatId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  try {
    console.log('✉️ Sending message to chat:', chatId);
    console.log('📤 Message data:', JSON.stringify(data, null, 2));
    
    const response = await api.post<any>(
      `/chats/${chatId}/message`,
      data
    );
    
    console.log('✅ Message sent successfully');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to send message:', error);
    console.error('❌ Error response:', error?.response?.data);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('You do not have access to this chat');
    }
    
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Invalid message data');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to send message. Please try again.'
    );
  }
};

/**
 * POST /chats/{chatId}/read
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId: string): Promise<MarkAsReadResponse> => {
  try {
    console.log('✓ Marking messages as read for chat:', chatId);
    
    const response = await api.post<MarkAsReadResponse>(`/chats/${chatId}/read`);
    
    console.log('✅ Messages marked as read:', response.data.markedCount);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to mark messages as read:', error);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('You do not have access to this chat');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to mark messages as read.'
    );
  }
};
