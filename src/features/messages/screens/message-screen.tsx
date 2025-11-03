// Refactored Message Screen - Main Orchestrator

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Modal,
  StatusBar,
} from 'react-native';

// Import components
import { MessageListItem } from '@/src/features/messages/components/MessageListItem';
import { SearchBar } from '@/src/features/messages/components/SearchBar';
import { ChatWindow } from '@/src/features/messages/components/ChatWindow';
import { MESSAGES_DATA } from '@/src/features/messages/components/message-types';
import type { Message } from '@/src/features/messages/components/message-types';

// Import notification modal
import NotificationModal from './notification-screen';

const MessageScreen: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return MESSAGES_DATA;
    
    const query = searchQuery.toLowerCase();
    return MESSAGES_DATA.filter(
      (message) =>
        message.title.toLowerCase().includes(query) ||
        message.preview.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedMessage(null);
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
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        placeholder="Search messages..."
      />

      {/* Messages List */}
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        )}
      />

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
  },
  listContent: {
    flexGrow: 1,
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
  },
});

export default MessageScreen;
