# Chat Participant Avatars Fix - "??" Issue Resolution

## Problem
ALL message avatars were showing "??" instead of the actual sender's initials. Both screenshots showed the same issue regardless of which user was viewing.

## Root Cause
The `/chats/{chatId}` endpoint was returning `posterId` and `taskerId` as **string IDs** instead of **populated user objects** with firstName, lastName, avatar fields.

When ChatWindow tried to extract participant info:
```tsx
const poster = typeof chat.posterId === 'object' ? chat.posterId : null;
const tasker = typeof chat.taskerId === 'object' ? chat.taskerId : null;
```
Both returned `null` because they were strings, causing all avatars to show "??" (the fallback initials).

## Solution

### 1. Extract Participants from Chat List
The `/chats/user` endpoint DOES return populated `posterId` and `taskerId` objects. We now extract and pass them:

**message-screen.tsx** (lines ~115-120):
```tsx
// Get participant info - posterId and taskerId should be populated objects from API
const posterId = typeof chat.posterId === 'object' ? chat.posterId : null;
const taskerId = typeof chat.taskerId === 'object' ? chat.taskerId : null;

return {
  // ... other fields
  posterId: posterId,  // ✅ Full user object
  taskerId: taskerId,  // ✅ Full user object
};
```

### 2. Pass Participants to ChatWindow
**message-screen.tsx** (line ~342):
```tsx
<ChatWindow
  visible={showChat}
  onClose={handleCloseChat}
  message={selectedMessage}
  taskId={(selectedMessage as any)?.taskId}
  chatIdProp={selectedChatId || undefined}
  posterIdProp={(selectedMessage as any)?.posterId}  // ✅ NEW
  taskerIdProp={(selectedMessage as any)?.taskerId}  // ✅ NEW
/>
```

### 3. Use Props as Fallback in ChatWindow
**ChatWindow.tsx** - Updated participant resolution:

```tsx
// Try to get participants from chat details API response first
let poster: ChatParticipant | null = null;
let tasker: ChatParticipant | null = null;

if (chatDetailsResponse?.chat) {
  const chat = chatDetailsResponse.chat;
  poster = typeof chat.posterId === 'object' ? chat.posterId : null;
  tasker = typeof chat.taskerId === 'object' ? chat.taskerId : null;
}

// Fallback to props if chat details don't have populated participants
if (!poster && posterIdProp) {
  console.log('📌 Using posterIdProp as fallback');
  poster = posterIdProp;  // ✅ Use from chat list
}
if (!tasker && taskerIdProp) {
  console.log('📌 Using taskerIdProp as fallback');
  tasker = taskerIdProp;  // ✅ Use from chat list
}
```

### 4. Calculate "Other Person" for Header
```tsx
const otherPerson = React.useMemo(() => {
  // Get participants (with fallback to props)
  let poster = /* ... from API or props ... */;
  let tasker = /* ... from API or props ... */;
  
  // If current user is poster → show tasker
  if (poster && poster._id === currentUserId) return tasker;
  
  // If current user is tasker → show poster
  if (tasker && tasker._id === currentUserId) return poster;
  
  return null;
}, [chatDetailsResponse, currentUserId, posterIdProp, taskerIdProp]);
```

### 5. Display Correct Initials in Messages
```tsx
const getParticipant = (senderId: string): ChatParticipant | null => {
  if (poster && poster._id === senderId) return poster;  // ✅ Has firstName/lastName
  if (tasker && tasker._id === senderId) return tasker;  // ✅ Has firstName/lastName
  return null;
};

const getInitials = (firstName: string, lastName: string = ''): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;  // ✅ Returns "PR", "KA", etc.
};

// For each message
const sender = getParticipant(msg.senderId);
const senderInitials = sender ? getInitials(sender.firstName, sender.lastName) : '??';
```

## Files Changed
1. **src/features/messages/screens/message-screen.tsx**
   - Extract `posterId` and `taskerId` objects from chat data
   - Add to message data structure
   - Pass as `posterIdProp` and `taskerIdProp` to ChatWindow

2. **src/features/messages/components/ChatWindow.tsx**
   - Add `posterIdProp` and `taskerIdProp` to interface
   - Use props as fallback when API doesn't populate participants
   - Update `otherPerson` calculation to use fallback
   - Update message conversion to use fallback participants
   - Add dependency array items

## Testing
After this fix:
1. ✅ Header shows correct person's name/initials (who you're chatting with)
2. ✅ Message avatars show correct sender's initials
3. ✅ No more "??" avatars
4. ✅ Works even if `/chats/{chatId}` doesn't populate participants

## Console Logs to Verify
Look for these logs when opening a chat:
```
📌 Using posterIdProp as fallback
📌 Using taskerIdProp as fallback
👥 Chat participants: { poster: "Alice Johnson (...)", tasker: "Bob Smith (...)" }
📨 Message XXX: senderId=..., isMine=true/false, sender=Alice Johnson (AJ)
```

If you still see "??" after this fix, check that:
1. `/chats/user` API is returning populated `posterId` and `taskerId` 
2. Console shows participant data is being extracted
3. No errors in the Metro logs

## Backend Consideration
Ideally, the backend should fix `/chats/{chatId}` to populate participants using:
```javascript
// In chat controller
.populate('posterId', 'firstName lastName avatar rating')
.populate('taskerId', 'firstName lastName avatar rating')
```

But this mobile fix works around that backend issue by using data from `/chats/user` which already has populated participants.
