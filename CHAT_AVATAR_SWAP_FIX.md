# Chat Avatar Swap Fix

## Issue
User reported that in the chat window, sender profiles/avatars were swapped:
- When the poster sends a message → it displayed with the tasker's avatar
- When the tasker sends a message → it displayed with the poster's avatar

The screenshots showed that ALL messages in a chat displayed the same avatar (either "PR" or "KA" initials), regardless of who actually sent each message.

## Root Cause
In `ChatWindow.tsx`, the avatar rendering was incorrectly using the **chat participant's avatar** (`message.avatar` from the Messages list) for ALL "other" messages, instead of looking up the **actual message sender's avatar** from the chat participants.

```tsx
// OLD CODE (INCORRECT)
{msg.sender === 'other' && (
  <Image 
    source={{ uri: message.avatar }} // ❌ Always shows chat participant avatar
    style={styles.messageAvatar} 
  />
)}
```

This meant:
- The `message.avatar` prop came from the Messages screen (the OTHER person in the chat)
- Every message from "other" showed the same avatar
- If you're the tasker, ALL messages from poster showed YOUR avatar (because you're "other" from poster's perspective)
- If you're the poster, ALL messages from tasker showed YOUR avatar (because you're "other" from tasker's perspective)

## Solution

### 1. Fetch Chat Details with Participants
Added `useGetChatById` hook to fetch full chat details including populated participant objects:

```tsx
import { useGetChatById } from '@/src/shared/hooks/useTaskChat';
import type { ChatParticipant } from '@/src/api/task-chat-api';

const {
  data: chatDetailsResponse,
  isLoading: isLoadingChatDetails
} = useGetChatById(chatId, !!chatId && visible);
```

### 2. Map Message Sender to Participant Info
Updated message conversion logic to look up the actual sender from participants:

```tsx
// Get participant info from chat details
const chat = chatDetailsResponse.chat;
const poster = typeof chat.posterId === 'object' ? chat.posterId : null;
const tasker = typeof chat.taskerId === 'object' ? chat.taskerId : null;

// Helper to get participant by ID
const getParticipant = (senderId: string): ChatParticipant | null => {
  if (poster && poster._id === senderId) return poster;
  if (tasker && tasker._id === senderId) return tasker;
  return null;
};

// Helper to get user initials
const getInitials = (firstName: string, lastName: string = ''): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
};

// Convert each message with correct sender info
const convertedMessages: ChatMessage[] = messagesResponse.messages.map(msg => {
  const isMine = msg.senderId === currentUserId;
  const sender = getParticipant(msg.senderId);
  const senderName = sender ? `${sender.firstName} ${sender.lastName || ''}`.trim() : 'Unknown User';
  const senderInitials = sender ? getInitials(sender.firstName, sender.lastName) : '??';
  const senderAvatar = sender?.avatar || undefined;
  
  return {
    id: msg._id,
    text: msg.content,
    sender: isMine ? 'me' : 'other',
    senderName,
    senderAvatar,      // ✅ Actual sender's avatar
    senderInitials,    // ✅ Actual sender's initials
    messageType: msg.messageType || 'text',
    mediaUrl: msg.mediaUrl || null,
  };
});
```

### 3. Updated ChatMessage Interface
Extended the interface to include sender info:

```tsx
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  senderName?: string;
  senderAvatar?: string;     // ✅ NEW
  senderInitials?: string;   // ✅ NEW
  messageType?: 'text' | 'image' | 'file';
  mediaUrl?: string | null;
}
```

### 4. Display Correct Avatar
Updated avatar rendering to use the message's sender info with fallback to initials:

```tsx
{msg.sender === 'other' && (
  msg.senderAvatar ? (
    <Image 
      source={{ uri: msg.senderAvatar }}  // ✅ Actual sender's avatar
      style={styles.messageAvatar} 
    />
  ) : (
    <View style={styles.messageAvatarFallback}>
      <Text style={styles.messageAvatarInitials}>
        {msg.senderInitials || '??'}  // ✅ Fallback to initials
      </Text>
    </View>
  )
)}
```

### 5. Added Fallback Avatar Styles
Added styles for circular initials badge when avatar image is not available:

```tsx
messageAvatarFallback: {
  width: 28,
  height: 28,
  borderRadius: 14,
  marginRight: 8,
  backgroundColor: '#007AFF',
  justifyContent: 'center',
  alignItems: 'center',
},
messageAvatarInitials: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: '600',
},
```

## Files Changed
1. `src/features/messages/components/ChatWindow.tsx`
   - Added `useGetChatById` import and hook
   - Added `ChatParticipant` type import
   - Updated message conversion with participant mapping
   - Updated avatar rendering to use actual sender info
   - Added fallback initials avatar
   - Added avatar styles

2. `src/features/messages/components/message-types.ts`
   - Added `senderAvatar?: string` field
   - Added `senderInitials?: string` field

## Testing
Test the fix by:
1. Open a chat from the Messages screen
2. Send messages from both poster and tasker accounts
3. Verify each message shows the CORRECT sender's avatar/initials
4. Poster's messages should show poster's initials (e.g., "PR")
5. Tasker's messages should show tasker's initials (e.g., "KA")
6. Avatar should NOT swap based on who's viewing

## Result
✅ Each message now displays the actual sender's avatar or initials
✅ Poster messages show poster's profile
✅ Tasker messages show tasker's profile
✅ Profiles no longer swap based on viewer
✅ Graceful fallback to initials badge if no avatar image
