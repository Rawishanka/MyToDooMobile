// Enhanced Message Screen with Real Chat API Integration

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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
import { useGetAllChats } from '@/src/shared/hooks/useChatApi';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';
import NotificationModal from './notification-screen-api';

const MessageScreen: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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

  // Convert API chat data to display format
  const chatMessages: Message[] = useMemo(() => {
    if (!chatData?.data) {
      // Fallback to mock data if API not available
      console.log('📱 Using fallback chat data');
      return MESSAGES_DATA;
    }

    try {
      return chatData.data
        .filter((chatItem: ChatListItem) => {
          // Filter out invalid chat items
          return chatItem && chatItem.chat && chatItem.chat._id;
        })
        .map((chatItem: ChatListItem) => ({
          id: chatItem.chat._id,
          title: chatItem.task?.title || 'Untitled Task',
          preview: chatItem.lastMessage?.text || 'No messages yet',
          date: new Date(chatItem.lastMessage?.timestamp || chatItem.chat.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          avatar: chatItem.chat.otherParticipant?.firstName && chatItem.chat.otherParticipant?.lastName ? 
            `https://ui-avatars.com/api/?name=${chatItem.chat.otherParticipant.firstName}+${chatItem.chat.otherParticipant.lastName}&background=random&color=fff&size=50` : 
            'https://randomuser.me/api/portraits/men/1.jpg',
          unreadCount: chatItem.unreadCount > 0 ? chatItem.unreadCount : undefined,
          taskId: chatItem.chat.taskId || '', // Store task ID for chat functionality, ensure it's not null
        }));
    } catch (error) {
      console.error('❌ Error processing chat data:', error);
      console.log('📱 Falling back to mock data due to processing error');
      return MESSAGES_DATA;
    }
  }, [chatData]);

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
    refetchChats();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
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
