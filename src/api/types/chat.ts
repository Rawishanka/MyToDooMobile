// Chat API Types

export interface ChatParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating: number;
}

export interface OtherParticipant {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface TaskInfo {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export interface LastMessage {
  text: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  taskId: string;
  posterId: ChatParticipant;
  taskerId: ChatParticipant;
  otherParticipant: OtherParticipant | null;
  createdAt: string;
}

export interface ChatListItem {
  chat: Chat;
  task: TaskInfo | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface ChatListResponse {
  success: boolean;
  count: number;
  data: ChatListItem[];
}

// Individual Chat Message (Legacy)
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
}

// Group Chat Message
export interface GroupChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  senderRole: 'poster' | 'tasker';
  metadata?: Record<string, any>;
}

export interface GroupChatResponse {
  success: boolean;
  groupChatId: string;
  firebaseChatId: string;
  messages: GroupChatMessage[];
  participantCount: number;
}

// Send Message Requests
export interface SendMessageRequest {
  text: string;
  senderId: string;
  senderName: string;
}

export interface SendGroupMessageRequest {
  text: string;
  messageType: 'text' | 'image' | 'file';
  metadata?: Record<string, any>;
}

export interface SendSystemMessageRequest {
  text: string;
  messageType: 'system';
  triggerUserId: string;
  metadata?: {
    offerAmount?: number;
    currency?: string;
    [key: string]: any;
  };
}

// Send Message Responses
export interface SendMessageResponse {
  success: boolean;
  message: string;
  chatId: string;
  recipientId: string;
}

export interface SendGroupMessageResponse {
  success: boolean;
  messageId: string;
  groupChatId: string;
  firebaseChatId: string;
  message: string;
}

// Chat Participants
export interface ChatParticipantInfo {
  userId: string;
  role: 'poster' | 'tasker';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  joinedAt: string;
  isActive: boolean;
}

export interface ChatParticipantsResponse {
  success: boolean;
  participants: ChatParticipantInfo[];
  participantCount: number;
}

// Create/Update Chat
export interface CreateOrUpdateChatRequest {
  taskId: string;
  offerId: string;
  userId: string;
  action: 'accept_offer' | 'reject_offer' | 'create_chat';
  chatStatus: 'accept' | 'reject' | 'pending';
}

export interface CreateOrUpdateChatResponse {
  success: boolean;
  data: {
    _id: string;
    taskId: string;
    chatStatus: string;
    status: string;
    updatedAt: string;
  };
  message: string;
}