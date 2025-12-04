// Simplified ChatWindow without Firebase (temporary fix)

import { useGetGroupChatMessages, useSendGroupChatMessage } from '@/src/shared/hooks/useChatApi';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
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

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
  message: Message | null;
  taskId?: string | null;
}

export const ChatWindow: React.FC<ChatScreenProps> = ({ visible, onClose, message, taskId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Get real chat messages from API
  const { 
    data: groupChatData, 
    isLoading: isLoadingMessages 
  } = useGetGroupChatMessages(taskId || '', 50, !!taskId && visible);

  // Mutation for sending messages
  const sendGroupMessageMutation = useSendGroupChatMessage();

  // Helper functions for local storage
  const getStorageKey = (taskId: string) => `chat_messages_${taskId}`;
  
  const saveMessagesToStorage = async (taskId: string, messages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(getStorageKey(taskId), JSON.stringify(messages));

    } catch (error) {

    }
  };
  
  const loadMessagesFromStorage = async (taskId: string): Promise<ChatMessage[]> => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(taskId));
      if (stored) {
        const messages = JSON.parse(stored);

        return messages;
      }
    } catch (error) {

    }
    return [];
  };

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId') || 'unknown';
        const userName = await AsyncStorage.getItem('userName') || 'User';
        setCurrentUserId(userId);
        setCurrentUserName(userName);
      } catch (error) {

      }
    };
    
    if (visible) {
      loadUserInfo();
    }
  }, [visible]);

  // Reset chat messages when switching to a different chat
  useEffect(() => {
    if (taskId !== lastTaskId && visible) {

      setIsFirstLoad(true);
      setChatMessages([]);
      setLastTaskId(taskId || null);
    }
  }, [taskId, lastTaskId, visible]);

  // Load messages when chat opens or task changes
  useEffect(() => {
    if (visible && taskId && isFirstLoad) {
      const loadInitialMessages = async () => {
        // First, load from local storage
        const storedMessages = await loadMessagesFromStorage(taskId);
        if (storedMessages.length > 0) {

          setChatMessages(storedMessages);
        } else {

          setChatMessages([]); // Start with empty array for new conversations
        }
        setIsFirstLoad(false);
      };
      
      loadInitialMessages();
    }
  }, [visible, taskId, isFirstLoad]);

  // Load API messages when available and merge with local storage
  useEffect(() => {
    if (groupChatData?.messages && visible && currentUserId && !isFirstLoad) {

      const convertedMessages: ChatMessage[] = groupChatData.messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender: msg.senderId === currentUserId ? 'me' : 'other',
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        senderName: msg.senderName,
      }));
      
      // Only update if we have new API data and it's different from stored data
      if (convertedMessages.length > 0) {
        setChatMessages(prev => {
          // Merge API messages with any local messages that aren't duplicates
          const apiMessageIds = convertedMessages.map(msg => msg.id);
          const localMessages = prev.filter(msg => !apiMessageIds.includes(msg.id));
          const mergedMessages = [...convertedMessages, ...localMessages];
          
          // Save merged messages back to storage
          if (taskId) {
            saveMessagesToStorage(taskId, mergedMessages);
          }

          return mergedMessages;
        });
      }
    }
  }, [groupChatData, visible, currentUserId, taskId, isFirstLoad]);

  const sendMessage = async () => {
    if (newMessage.trim() && taskId) {
      const messageText = newMessage.trim();
      let optimisticMsg: ChatMessage | null = null;
      
      try {
        setIsLoading(true);
        
        // Add to local state immediately for UI feedback (optimistic update)
        optimisticMsg = {
          id: `temp_${Date.now()}`, // Temporary ID for optimistic update
          text: messageText,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: currentUserName
        };
        
        const newMessages = [...chatMessages, optimisticMsg];
        setChatMessages(newMessages);
        setNewMessage(''); // Clear input immediately for better UX
        
        // Save to local storage immediately
        await saveMessagesToStorage(taskId, newMessages);
        
        // Send via API
        const response = await sendGroupMessageMutation.mutateAsync({
          taskId,
          message: {
            text: messageText,
            messageType: 'text',
            metadata: {}
          }
        });

        // Update the temporary message with real ID from response
        if (response.messageId) {
          setChatMessages(prev => {
            const updatedMessages = prev.map(msg => 
              msg.id === optimisticMsg!.id 
                ? { ...msg, id: response.messageId! } 
                : msg
            );
            // Save updated messages
            saveMessagesToStorage(taskId, updatedMessages);
            return updatedMessages;
          });
        }

      } catch (error) {

        // Remove the optimistic message on error
        if (optimisticMsg) {
          setChatMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== optimisticMsg!.id);

            // Save the rolled back state
            saveMessagesToStorage(taskId, filtered);
            return filtered;
          });
        }
        setNewMessage(messageText); // Restore the message text for retry
        
        Alert.alert('Error', 'Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (newMessage.trim()) {
      // Fallback for demo mode
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedMessages = [...chatMessages, newMsg];
      setChatMessages(updatedMessages);
      if (taskId) {
        saveMessagesToStorage(taskId, updatedMessages);
      }
      setNewMessage('');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          text: `📷 Image: ${result.assets[0].fileName || 'image.jpg'}`,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([...chatMessages, newMsg]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          text: `📎 File: ${result.assets[0].name}`,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([...chatMessages, newMsg]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleAttachment = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose Photo', 'Choose File'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage();
          } else if (buttonIndex === 2) {
            pickDocument();
          }
        }
      );
    } else {
      Alert.alert(
        'Add Attachment',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose Photo', onPress: pickImage },
          { text: 'Choose File', onPress: pickDocument },
        ]
      );
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
              <Text style={styles.chatStatus}>
                {taskId ? (isLoadingMessages ? 'Loading...' : 'Online') : 'Demo Mode'}
              </Text>
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
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#E1E8ED" />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptySubtext}>Send a message to begin chatting about this task</Text>
            </View>
          )}
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
              <TouchableOpacity onPress={handleAttachment} style={styles.attachButton}>
                <Ionicons name="attach" size={22} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                disabled={isLoading}
              >
                <Ionicons name="send" size={20} color={isLoading ? "#ccc" : "#007AFF"} />
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
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
  },
  messageInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
    paddingVertical: 6,
  },
  attachButton: {
    padding: 6,
    marginRight: 8,
  },
  sendButton: {
    padding: 6,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});