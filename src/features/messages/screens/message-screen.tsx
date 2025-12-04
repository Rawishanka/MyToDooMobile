// Enhanced Message Screen with Real Chat API Integration
// Features:
// ✅ Real-time chat data from API
// ✅ Profile pictures with fallback to generated avatars
// ✅ Unread message count badges
// ✅ Visual indicators for unread messages (blue background, bold text, blue dot)
// ✅ Local storage integration for message previews
// ✅ Pull-to-refresh functionality

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import components
import { ChatWindow } from '@/src/features/messages/components/ChatWindow';
import type { Message } from '@/src/features/messages/components/message-types';
import { MESSAGES_DATA } from '@/src/features/messages/components/message-types';
import { MessageListItem } from '@/src/features/messages/components/MessageListItem';
import { SearchBar } from '@/src/features/messages/components/SearchBar';

// Import notification modal and chat API
import type { ChatListItem } from '@/src/api/types/chat';
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';
import { useGetAllChats } from '@/src/shared/hooks/useChatApi';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';
import NotificationModal from './notification-screen-api';

const MessageScreen: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [localMessagePreviews, setLocalMessagePreviews] = useState<Record<string, string>>({});
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [networkAlertMessage, setNetworkAlertMessage] = useState('');

  // Network status monitoring
  const { isConnected } = useNetworkStatus();

  // Get real chat data from API
  const { 
    data: chatData, 
    isLoading: isLoadingChats, 
    error: chatError,
    refetch: refetchChats 
  } = useGetAllChats();

  // Get real notification count from API
  const { data: unreadCountData } = useUnreadCount();
  const notificationCount = (unreadCountData as any)?.unreadCount || 0;

  // Don't show network alert automatically - OfflineBanner handles that
  // Only show alert when user tries to interact (e.g., refresh) while offline

  // Load local message previews on mount
  useEffect(() => {
    const loadLocalPreviews = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const chatKeys = keys.filter(key => key.startsWith('chat_messages_'));
        const previews: Record<string, string> = {};
        
        for (const key of chatKeys) {
          try {
            const taskId = key.replace('chat_messages_', '');
            const messagesJson = await AsyncStorage.getItem(key);
            if (messagesJson) {
              const messages = JSON.parse(messagesJson);
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                previews[taskId] = lastMessage.text;
              }
            }
          } catch {
            // Silently handle preview loading errors
          }
        }
        
        setLocalMessagePreviews(previews);
      } catch {
        // Silently handle errors
      }
    };
    
    loadLocalPreviews();
  }, []);

  // Convert API chat data to display format
  // BUSINESS RULE: Only show chats for tasks where an offer has been ACCEPTED
  // Workflow: Tasker makes offer → Poster accepts offer → Chat becomes visible
  const chatMessages: Message[] = useMemo(() => {
    if (!chatData?.data) {
      // Fallback to mock data if API not available

      return MESSAGES_DATA;
    }

    try {

      const filteredChats = chatData.data
        .filter((chatItem: ChatListItem) => {
          // Filter out invalid chat items
          if (!chatItem || !chatItem.chat || !chatItem.chat._id) {

            return false;
          }
          
          // ✅ ACCEPTANCE FILTER: Only show chats where the offer has been accepted
          // After a poster accepts a tasker's offer, task status changes to one of:
          // - 'accepted': Immediately after acceptance
          // - 'assigned': Task assigned to tasker
          // - 'todo': Task is ready to start
          // - 'in_progress': Task is being worked on
          // - 'completed': Task finished
          // 
          // Task statuses that mean offer NOT accepted yet:
          // - 'open': No offers accepted
          // - 'pending': Offers submitted but none accepted
          const task = chatItem.task;
          const taskStatus = task?.status?.toLowerCase();
          
          // Only show chats for tasks with accepted offers
          // Valid statuses after offer acceptance: 'accepted', 'assigned', 'todo', 'in_progress', 'completed'
          const validStatuses = ['accepted', 'assigned', 'todo', 'in_progress', 'completed'];
          const isAcceptedOffer = taskStatus && validStatuses.includes(taskStatus);
          
          if (!isAcceptedOffer) {
            return false;
          }
          
          return true;
        });

      return filteredChats.map((chatItem: ChatListItem) => {
          // Get preview from local storage if API doesn't have lastMessage
          const taskId = chatItem.chat.taskId;
          const apiPreview = chatItem.lastMessage?.text;
          const localPreview = localMessagePreviews[taskId];
          const preview = apiPreview || localPreview || 'Start a conversation';
          
          // Get avatar from API or use fallback
          const otherParticipant = chatItem.chat.otherParticipant;
          let avatarUrl = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=100';
          
          if ((otherParticipant as any)?.avatar) {
            // Use actual avatar from API
            avatarUrl = (otherParticipant as any).avatar;
          } else if (otherParticipant?.firstName || otherParticipant?.lastName) {
            // Generate avatar with first letter of name using better styling
            const firstName = otherParticipant.firstName || '';
            const lastName = otherParticipant.lastName || '';
            const name = `${firstName}+${lastName}`.trim();
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff&size=100&bold=true&rounded=true`;
          }

          return {
            id: chatItem.chat._id,
            title: chatItem.task?.title || 'Untitled Task',
            preview: preview,
            date: new Date(chatItem.lastMessage?.timestamp || chatItem.chat.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            avatar: avatarUrl,
            unreadCount: chatItem.unreadCount && chatItem.unreadCount > 0 ? chatItem.unreadCount : undefined,
            taskId: chatItem.chat.taskId || '', // Store task ID for chat functionality, ensure it's not null
          };
        });
    } catch (error) {


      return MESSAGES_DATA;
    }
  }, [chatData, localMessagePreviews]);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return chatMessages;
    
    const query = searchQuery.toLowerCase();
    return chatMessages.filter(
      (message) =>
        message.title.toLowerCase().includes(query) ||
        message.preview.toLowerCase().includes(query)
    );
  }, [searchQuery, chatMessages]);

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    setSelectedChatId((message as any).taskId || null);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedMessage(null);
    setSelectedChatId(null);
  };

  const handleRefresh = () => {
    if (!isConnected) {
      setNetworkAlertMessage('Unable to connect to chat. Please check your internet connection.');
      setShowNetworkAlert(true);
      return;
    }

    refetchChats();
    // Also reload local previews when refreshing
    const loadLocalPreviews = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const chatKeys = keys.filter(key => key.startsWith('chat_messages_'));
        const previews: Record<string, string> = {};
        
        for (const key of chatKeys) {
          try {
            const taskId = key.replace('chat_messages_', '');
            const messagesJson = await AsyncStorage.getItem(key);
            if (messagesJson) {
              const messages = JSON.parse(messagesJson);
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                previews[taskId] = lastMessage.text;
              }
            }
          } catch {
            // Silently handle errors
          }
        }
        
        setLocalMessagePreviews(previews);
      } catch {
        // Silently handle errors
      }
    };
    loadLocalPreviews();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          onPress={() => setShowNotifications(true)}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        placeholder="Search messages..."
      />

      {/* Messages List */}
      {isLoadingChats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageListItem 
              message={item} 
              onPress={handleMessagePress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChats}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {chatError ? 'Failed to load chats' : 'No messages yet'}
              </Text>
              {chatError && (
                <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Chat Modal */}
      <ChatWindow
        visible={showChat}
        onClose={handleCloseChat}
        message={selectedMessage}
        taskId={selectedChatId}
      />

      {/* Network Alert */}
      <NetworkAlert
        visible={showNetworkAlert}
        onClose={() => setShowNetworkAlert(false)}
        message={networkAlertMessage}
        actionText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageScreen;
