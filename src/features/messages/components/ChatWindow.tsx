// Chat Window Component

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { ChatMessage, Message } from './message-types';
import { SAMPLE_CHAT_MESSAGES } from './message-types';

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
  message: Message | null;
}

export const ChatWindow: React.FC<ChatScreenProps> = ({ visible, onClose, message }) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_MESSAGES);

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

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
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
    marginRight: 10,
  },
  chatHeaderText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  chatStatus: {
    fontSize: 12,
    color: '#34C759',
  },
  moreButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    backgroundColor: '#E9ECEF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#8E8E93',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
  },
  messageInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
});
