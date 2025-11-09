feat(messages): integrate real-time chat API with Firebase backend

Implemented comprehensive chat system using provided API endpoints and Firebase real-time messaging:

Major Changes:
- Added Firebase configuration with provided credentials
- Created complete Chat API service layer with 8 endpoints:
  * GET /api/ChatApp/ - Get all user chats
  * GET/POST /api/chats/:taskId/messages - Individual chat messages
  * GET/POST /api/group-chats/:taskId/messages - Group chat messages
  * POST /api/group-chats/:taskId/system-message - System messages
  * GET /api/group-chats/:taskId/participants - Chat participants
  * POST /api/ChatApp/create-or-update - Create/update chats
- Implemented React Query hooks for all chat operations
- Added Firebase real-time messaging service with Firestore integration
- Enhanced MessageScreen with real API data instead of mock data
- Updated ChatWindow with real-time Firebase subscriptions
- Added proper loading states, error handling, and fallback mechanisms

Technical Features:
- Real-time message delivery via Firebase Firestore
- Dual sync: API + Firebase for reliability
- Auto-fallback to mock data during development
- Proper TypeScript interfaces for all chat data
- React Query caching and optimistic updates
- Pull-to-refresh and retry functionality
- User authentication integration with AsyncStorage

User Experience:
- Instant message delivery and updates
- Loading indicators and empty states
- Error handling with retry options
- Search functionality through chat titles
- Unread message count badges
- Responsive design across screen sizes

Files Added:
- src/config/firebase.ts - Firebase configuration
- src/api/chat-api.ts - Chat API service
- src/api/types/chat.ts - Chat TypeScript types
- src/services/firebase-chat.ts - Firebase real-time service
- src/shared/hooks/useChatApi.ts - React Query hooks
- docs/CHAT_API_IMPLEMENTATION.md - Complete documentation

Files Modified:
- src/features/messages/screens/message-screen.tsx - Real API integration
- src/features/messages/components/ChatWindow.tsx - Real-time messaging

Ready for backend activation: Full graceful degradation to mock data ensures app works during development phase.