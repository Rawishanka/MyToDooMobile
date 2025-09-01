import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Modal,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// Import your notification modal
import NotificationModal from './notification-screen';

// Define message type
interface Message {
  id: string;
  title: string;
  preview: string;
  date: string;
  avatar?: string;
  unreadCount?: number;
}

// Define chat message type
interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  senderName?: string;
}

// Sample chat messages for demo
const sampleChatMessages: ChatMessage[] = [
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

const messages: Message[] = [
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
    title: 'Looking for someone who could maintain the garden in weekly basis',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: '5',
    title: 'Home cleaning service needed',
    preview: 'Sarah: I can help with weekly cleaning',
    date: '8 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    unreadCount: 3,
  },
  {
    id: '6',
    title: 'Plumbing repair required',
    preview: 'Mike: I have 10 years experience in plumbing',
    date: '7 Jan 2025',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
];

// Chat Screen Component
const ChatScreen: React.FC<{
  visible: boolean;
  onClose: () => void;
  message: Message | null;
}> = ({ visible, onClose, message }) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(sampleChatMessages);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  if (!message) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.chatContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Image 
              source={{ uri: message.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
              style={styles.chatAvatar} 
            />
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatTitle} numberOfLines={1}>{message.title}</Text>
              <Text style={styles.chatStatus}>Online</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: msg }) => (
            <View
              style={[
                styles.messageWrapper,
                msg.sender === 'me' ? styles.myMessageWrapper : styles.otherMessageWrapper
              ]}
            >
              {msg.sender === 'other' && (
                <Image 
                  source={{ uri: message.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.messageAvatar} 
                />
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myMessage : styles.otherMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText
                ]}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  msg.sender === 'me' ? styles.myMessageTime : styles.otherMessageTime
                ]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Message Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default function PrivateMessagesScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const notificationCount = 5;

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages;
    }
    
    return messages.filter(message =>
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  const openChat = (message: Message) => {
    setSelectedMessage(message);
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedMessage(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerText}>Private messages</Text>
        </View>
        <TouchableOpacity onPress={openNotifications} style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={20} color="#000" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color="#ccc" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results Info */}
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* Message List */}
      {filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.messageItem}
              onPress={() => openChat(item)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: item.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  style={styles.avatar}
                />
                {item.unreadCount && item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.messageContent}>
                <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.preview}>{item.preview}</Text>
              </View>
              <View style={styles.messageRight}>
                <Text style={styles.date}>{item.date}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" style={styles.chevron} />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.messageListContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color="#ccc" />
          <Text style={styles.noResultsText}>No messages found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search terms
          </Text>
        </View>
      )}

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={closeNotifications}
      />

      {/* Chat Modal */}
      <ChatScreen
        visible={showChat}
        onClose={closeChat}
        message={selectedMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  searchWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  searchResultsInfo: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  preview: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
  },
  messageRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  chevron: {
    opacity: 0.5,
  },
  messageListContainer: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  chatHeaderText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  chatStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#666',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
}); 
