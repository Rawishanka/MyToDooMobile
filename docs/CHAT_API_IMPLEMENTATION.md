# Chat API Integration - Complete Implementation Guide

## Overview
This implementation integrates the provided Chat API endpoints with Firebase for real-time messaging functionality. The system supports both individual and group chats with proper fallback mechanisms.

## 🔧 Configuration

### Firebase Setup
```typescript
// src/config/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDndTrD2iZ9HMKR3AdW2iHMRsnWSfCXs2A",
  authDomain: "todo-851bd.firebaseapp.com",
  projectId: "todo-851bd",
  storageBucket: "todo-851bd.appspot.com",
  messagingSenderId: "49137682132",
  appId: "1:49137682132:web:3764dd2a81ebb32fccdd41",
};
```

## 📡 API Endpoints Implemented

### 1. GET /api/ChatApp/ - Get All Chats
- **Hook**: `useGetAllChats()`
- **Purpose**: Fetch all chats for authenticated user
- **Response**: List of chats with task info, participants, and last messages
- **Fallback**: Mock data if API not available

### 2. GET /api/chats/:taskId/messages - Individual Chat Messages (Legacy)
- **Hook**: `useGetChatMessages(taskId)`
- **Purpose**: Get individual chat messages for a specific task
- **Real-time**: Updates every 5 seconds
- **Fallback**: Sample chat messages

### 3. POST /api/chats/:taskId/messages - Send Individual Message
- **Hook**: `useSendChatMessage()`
- **Purpose**: Send message in individual chat
- **Auto-refresh**: Invalidates queries to refresh chat list

### 4. GET /api/group-chats/:taskId/messages - Group Chat Messages
- **Hook**: `useGetGroupChatMessages(taskId, limit)`
- **Purpose**: Get group chat messages with Firebase sync
- **Real-time**: Firebase subscription + API fallback
- **Limit**: Configurable message limit (default: 50)

### 5. POST /api/group-chats/:taskId/messages - Send Group Message
- **Hook**: `useSendGroupChatMessage()`
- **Purpose**: Send message to group chat + Firebase real-time sync
- **Features**: Supports text, image, file message types

### 6. POST /api/group-chats/:taskId/system-message - System Messages
- **Hook**: `useSendSystemMessage()`
- **Purpose**: Send automated system messages (offer accepted, etc.)
- **Integration**: Firebase + API dual sync

### 7. GET /api/group-chats/:taskId/participants - Chat Participants
- **Hook**: `useGetChatParticipants(taskId)`
- **Purpose**: Get list of chat participants with roles
- **Caching**: 1 minute stale time

### 8. POST /api/ChatApp/create-or-update - Create/Update Chat
- **Hook**: `useCreateOrUpdateChat()`
- **Purpose**: Create chat when offer accepted
- **Trigger**: Offer acceptance workflow

## 🔥 Firebase Real-time Integration

### Message Structure
```typescript
interface FirebaseMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Timestamp | string;
  messageType: 'text' | 'image' | 'file' | 'system';
  senderRole: 'poster' | 'tasker';
  metadata?: Record<string, any>;
}
```

### Real-time Features
- **Subscription**: Live message updates via Firestore
- **Dual Sync**: API + Firebase for reliability
- **Auto Fallback**: Firebase error → API data
- **Message Limit**: Configurable pagination
- **Cleanup**: Automatic subscription cleanup

## 📱 UI Components Updated

### MessageScreen Enhancements
- **Real Data**: Uses `useGetAllChats()` instead of mock data
- **Loading States**: Proper loading indicators
- **Error Handling**: Retry functionality
- **Pull-to-Refresh**: Manual chat refresh
- **Empty States**: Better UX for no chats
- **Search**: Real-time search through chat titles

### ChatWindow Enhancements
- **Real-time Messages**: Firebase subscription
- **Send Functionality**: API + Firebase dual send
- **User Context**: Auto-load current user info
- **Error Handling**: Message send failure alerts
- **Loading States**: Send button loading state

## 🔄 Data Flow

### Chat List Flow
1. `MessageScreen` loads → `useGetAllChats()`
2. API call to `/api/ChatApp/`
3. Transform API data to UI format
4. Display with unread counts and previews
5. Fallback to mock data if API fails

### Real-time Chat Flow
1. User opens chat → `ChatWindow` with `taskId`
2. Subscribe to Firebase: `group_{taskId}_chat`
3. Load initial messages via `useGetGroupChatMessages()`
4. Real-time updates via Firebase subscription
5. Send message → API + Firebase sync
6. Auto-refresh chat list

### Message Send Flow
```
User types message
    ↓
Send to API: POST /api/group-chats/:taskId/messages
    ↓
Send to Firebase: Real-time collection update
    ↓
Firebase notifies all subscribers
    ↓
UI updates instantly
```

## 🛡️ Error Handling & Fallbacks

### API Errors
- **404 Errors**: Skip retry, use fallback data
- **Auth Errors**: Don't retry, show login prompt
- **Network Errors**: Retry up to 2 times
- **Firebase Errors**: Fallback to API data

### Graceful Degradation
1. **Primary**: Firebase real-time + API sync
2. **Fallback 1**: API polling every 5 seconds
3. **Fallback 2**: Mock data for development

## 🎯 User Experience Features

### Loading States
- **Chat List**: Skeleton loading with activity indicator
- **Messages**: Progressive loading with pull-to-refresh
- **Send Button**: Loading state during message send

### Empty States
- **No Chats**: Icon + helpful message
- **API Error**: Retry button with error message
- **No Messages**: Clean empty state

### Real-time Updates
- **Instant Delivery**: Messages appear immediately
- **Typing Indicators**: Future enhancement ready
- **Read Receipts**: Structure prepared for implementation

## 📦 File Structure

```
src/
├── api/
│   ├── chat-api.ts              # Chat API service layer
│   └── types/
│       └── chat.ts              # Chat TypeScript types
├── config/
│   └── firebase.ts              # Firebase configuration
├── services/
│   └── firebase-chat.ts         # Firebase real-time service
├── shared/hooks/
│   └── useChatApi.ts           # React Query hooks
├── features/messages/
│   ├── screens/
│   │   └── message-screen.tsx   # Updated with real API
│   └── components/
│       └── ChatWindow.tsx       # Real-time chat window
```

## 🚀 Usage Examples

### Getting All Chats
```typescript
const { data: chats, isLoading, error } = useGetAllChats();
```

### Real-time Chat Messages
```typescript
const { data: messages } = useGetGroupChatMessages(taskId, 50);
```

### Sending Messages
```typescript
const sendMessage = useSendGroupChatMessage();
await sendMessage.mutateAsync({
  taskId: 'task123',
  message: {
    text: 'Hello!',
    messageType: 'text',
    metadata: {}
  }
});
```

## 🔧 Configuration Options

### API Configuration
- **Timeout**: 15 seconds
- **Retry Attempts**: 3
- **Retry Delay**: 1 second
- **Real-time Polling**: 5 seconds

### Firebase Configuration
- **Message Limit**: 50 messages default
- **Auto Cleanup**: Subscription cleanup on unmount
- **Error Fallback**: API data on Firebase errors

## 🧪 Testing Considerations

### Mock Data Fallback
- Graceful degradation to mock data
- Development-friendly error messages
- Consistent data structure

### Error Scenarios
- Network connectivity issues
- Firebase authentication problems
- API endpoint unavailability
- Invalid task IDs or permissions

## 🎯 Future Enhancements

### Ready for Implementation
- Push notifications integration
- Message attachments (images/files)
- Typing indicators
- Read receipts
- Message reactions
- Chat archiving
- Advanced search

### Performance Optimizations
- Message pagination
- Image lazy loading
- Background sync
- Offline message queue

## 🔍 Debugging

### Console Logs
- `📡 Chat API Request` - API calls
- `📥 Chat API Response` - API responses
- `🔥 Firebase messages updated` - Real-time updates
- `📱 Using fallback chat data` - Mock data usage

### Common Issues
1. **No messages loading**: Check Firebase config and network
2. **Messages not real-time**: Verify Firebase subscription
3. **Send failures**: Check API authentication
4. **Empty chat list**: Verify API endpoint availability

This implementation provides a robust, real-time chat system with proper error handling and graceful fallbacks, ensuring users always have a working chat experience regardless of backend availability.