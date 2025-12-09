// Enhanced Message Screen with Real Chat API Integration
// Features:
// ✅ Real-time chat data from API
// ✅ Profile pictures with fallback to generated avatars
// ✅ Unread message count badges
// ✅ Visual indicators for unread messages (blue background, bold text, blue dot)
// ✅ Local storage integration for message previews
// ✅ Pull-to-refresh functionality

import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
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
import { MessageListItem } from '@/src/features/messages/components/MessageListItem';
import { SearchBar } from '@/src/features/messages/components/SearchBar';

// Import notification modal and NEW task-based chat API
import { NetworkAlert } from '@/src/shared/components/NetworkAlert';
import { OfflineBanner } from '@/src/shared/components/OfflineBanner';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';
import { useGetUserChats } from '@/src/shared/hooks/useTaskChat';
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

  // Get real chat data from NEW task-based chat API
  const { 
    data: chatData, 
    isLoading: isLoadingChats, 
    error: chatError,
    refetch: refetchChats 
  } = useGetUserChats();

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
            if (__DEV__) console.warn(`Preview load issue for ${key}`);
          }
        }
        
        if (__DEV__) console.log(`📱 Loaded ${Object.keys(previews).length} local message previews`);
        setLocalMessagePreviews(previews);
      } catch {
        // Silently handle errors
        if (__DEV__) console.warn('Failed to load local message previews');
      }
    };
    
    loadLocalPreviews();
  }, []);

  // Convert NEW task-based chat API data to display format
  // BUSINESS RULE: Only shows chats for accepted/paid tasks (backend handles filtering)
  const chatMessages: Message[] = useMemo(() => {
    // Safe check for chat data
    if (!chatData) {
      console.log('📱 No chat data received from API');
      return [];
    }
    
    const chats = chatData?.chats || [];
    
    if (!Array.isArray(chats) || chats.length === 0) {
      console.log('📱 No chats available from API (empty or invalid array)');
      return [];
    }

    try {
      console.log(`💬 Processing ${chats.length} chats from NEW task-based API...`);
      
      return chats.map((chat: any) => {
        // Safe extraction with fallbacks
        const lastMessage = chat.lastMessage || {};
        const preview = lastMessage.content || 'Start a conversation';
        
        // DEBUG: Log raw chat data
        console.log('🔍 RAW CHAT DATA:', {
          chatId: chat._id,
          posterIdType: typeof chat.posterId,
          taskerIdType: typeof chat.taskerId,
          posterId: chat.posterId,
          taskerId: chat.taskerId,
        });
        
        // Get participant info - posterId and taskerId should be populated objects from API
        const posterId = typeof chat.posterId === 'object' ? chat.posterId : null;
        const taskerId = typeof chat.taskerId === 'object' ? chat.taskerId : null;
        
        console.log('✅ EXTRACTED PARTICIPANTS:', {
          poster: posterId ? `${posterId.firstName} ${posterId.lastName}` : 'NULL',
          tasker: taskerId ? `${taskerId.firstName} ${taskerId.lastName}` : 'NULL',
        });
        
        // Get other participant info (poster or tasker, depending on current user)
        const participants = Array.isArray(chat.participants) ? chat.participants : [];
        const otherUser = participants.find((p: any) => p && p._id !== chat.currentUserId);
        
        // Generate avatar with safe fallbacks
        let avatarUrl = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=100';
        if (otherUser?.profileImage) {
          avatarUrl = otherUser.profileImage;
        } else if (otherUser?.firstName || otherUser?.lastName) {
          const firstName = otherUser.firstName || '';
          const lastName = otherUser.lastName || '';
          const name = `${firstName}+${lastName}`.trim() || 'User';
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff&size=100&bold=true&rounded=true`;
        }
        
        // Safe date handling
        let dateStr = 'Recently';
        try {
          const dateValue = lastMessage.createdAt || chat.createdAt;
          if (dateValue) {
            dateStr = new Date(dateValue).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
          }
        } catch (e) {
          console.warn('⚠️ Invalid date format for chat:', chat._id);
        }
        
        const taskTitle = chat.taskTitle || chat.task?.title || 'Untitled Task';
        const unreadCount = typeof chat.unreadCount === 'number' && chat.unreadCount > 0 
          ? chat.unreadCount 
          : undefined;
        
        console.log(`✅ Chat: "${taskTitle}" | Unread: ${unreadCount || 0} | Participants: ${participants.length}`);
        
        return {
          id: chat._id || `chat-${Date.now()}`,
          chatId: chat.chatId || chat._id, // Add chatId for direct chat access
          title: taskTitle,
          preview: preview,
          date: dateStr,
          avatar: avatarUrl,
          unreadCount: unreadCount,
          taskId: chat.taskId || chat.task?._id || '',
          // Pass participant data for ChatWindow
          posterId: posterId,
          taskerId: taskerId,
        };
      });
    } catch (error) {
      console.error('❌ Error processing chat data:', error);
      return [];
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
    console.log('📱 Opening chat:', {
      messageId: message.id,
      chatId: (message as any).chatId,
      taskId: (message as any).taskId
    });
    setSelectedMessage(message);
    setSelectedChatId((message as any).chatId || (message as any).taskId || null);
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
        taskId={(selectedMessage as any)?.taskId}
        chatIdProp={selectedChatId || undefined}
        posterIdProp={(selectedMessage as any)?.posterId}
        taskerIdProp={(selectedMessage as any)?.taskerId}
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
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingTop: isTablet ? hp('6%') : hp('6.5%'),
    paddingBottom: isTablet ? hp('2%') : hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: RFValue(isTablet ? 18 : 24),
    fontWeight: '700',
    color: '#000',
  },
  notificationButton: {
    padding: isTablet ? 10 : 8,
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
    fontSize: RFValue(isTablet ? 10 : 12),
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? hp('8%') : hp('7.5%'),
  },
  loadingText: {
    fontSize: RFValue(isTablet ? 18 : 16),
    color: '#8E8E93',
    marginTop: isTablet ? hp('1.5%') : hp('1.2%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? hp('8%') : hp('7.5%'),
  },
  emptyText: {
    fontSize: RFValue(isTablet ? 18 : 16),
    color: '#8E8E93',
    marginTop: isTablet ? hp('2%') : hp('2%'),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: isTablet ? hp('2%') : hp('2%'),
    paddingHorizontal: isTablet ? wp('5%') : wp('5%'),
    paddingVertical: isTablet ? hp('1.5%') : hp('1.2%'),
    backgroundColor: '#007AFF',
    borderRadius: isTablet ? 10 : 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: RFValue(isTablet ? 16 : 16),
    fontWeight: '600',
  },
});

export default MessageScreen;
