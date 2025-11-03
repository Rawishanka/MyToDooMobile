// Type definitions for notification and message components

export interface NotificationItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: { uri: string };
}

export interface Message {
  id: string;
  title: string;
  preview: string;
  date: string;
  avatar?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  senderName?: string;
}

// Sample notification data
export const NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: '1',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '2',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '3',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '4',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
];

// Sample chat messages
export const SAMPLE_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Hi! I saw your task about the folding arm awning. I have experience with these types of repairs.',
    sender: 'other',
    timestamp: '10:30 AM',
    senderName: 'Jane'
  },
  {
    id: '2',
    text: 'That sounds great! What would be your approach to fixing it?',
    sender: 'me',
    timestamp: '10:32 AM'
  },
  {
    id: '3',
    text: 'I would first need to inspect the mechanism to see if it\'s a tension issue or if any parts need replacement.',
    sender: 'other',
    timestamp: '10:35 AM',
    senderName: 'Jane'
  },
  {
    id: '4',
    text: 'I can come by this weekend to take a look if that works for you.',
    sender: 'other',
    timestamp: '10:36 AM',
    senderName: 'Jane'
  },
  {
    id: '5',
    text: 'Thanks Jane, I will contact Drago.',
    sender: 'me',
    timestamp: '10:40 AM'
  }
];

// Sample messages list
export const MESSAGES_DATA: Message[] = [
  {
    id: '1',
    title: 'Folding arm awning needs reset',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Looking for someone who could maintain the garden in weekly basis',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    title: 'Folding arm awning needs reset',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    unreadCount: 1,
  },
  {
    id: '4',
    title: 'Help me to move items from old apartment to new',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: '5',
    title: 'Folding arm awning needs reset',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
];
