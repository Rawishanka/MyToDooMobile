// ChatWindow using NEW task-based chat API

import { uploadChatFile, uploadChatImage } from '@/src/api/cdn-api';
import API_CONFIG from '@/src/api/config';
import type { ChatParticipant } from '@/src/api/task-chat-api';
import { useCreateOrGetTaskChat, useGetChatById, useGetChatMessages, useMarkMessagesAsRead, useSendMessage } from '@/src/shared/hooks/useTaskChat';
import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import type { ChatMessage, Message } from './message-types';

// URL normalization helper for APK builds
const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/^http:\/\//i, 'https://'); // Force HTTPS
  }
  
  // Relative URL - make it absolute
  if (url.startsWith('/')) {
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  
  return url;
};

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
  message: Message | null;
  taskId?: string | null;
  posterId?: string;
  taskerId?: string;
  chatIdProp?: string; // Direct chatId if available from messages list
  posterIdProp?: ChatParticipant; // Populated poster object from /chats/user
  taskerIdProp?: ChatParticipant; // Populated tasker object from /chats/user
}

export const ChatWindow: React.FC<ChatScreenProps> = ({ 
  visible, 
  onClose, 
  message, 
  taskId,
  posterId,
  taskerId,
  chatIdProp,
  posterIdProp,
  taskerIdProp
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastTaskId, setLastTaskId] = useState<string | null>(taskId || null);
  const [lastChatId, setLastChatId] = useState<string | null>(chatIdProp || null);
  const [chatId, setChatId] = useState<string | null>(chatIdProp || null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Get current user from auth store
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?._id || user?.id || '';
  const currentUserName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You';
  
  // Reset state when modal closes to prevent stale data on next open
  useEffect(() => {
    if (!visible) {
      console.log('🚪 Modal closed, clearing chat state');
      setChatMessages([]);
      setNewMessage('');
      setPreviewImage(null);
    }
  }, [visible]);
  
  // Debug user info
  useEffect(() => {
    if (visible && user) {
      console.log('👤 Current user info:', {
        userId: currentUserId,
        name: currentUserName,
        fullUser: JSON.stringify(user, null, 2)
      });
    }
  }, [visible, user]);

  // Debug participant props
  useEffect(() => {
    if (visible) {
      console.log('🎭 PARTICIPANT PROPS RECEIVED:', {
        posterIdProp: posterIdProp ? `${posterIdProp.firstName} ${posterIdProp.lastName} (${posterIdProp._id})` : 'NULL',
        taskerIdProp: taskerIdProp ? `${taskerIdProp.firstName} ${taskerIdProp.lastName} (${taskerIdProp._id})` : 'NULL',
      });
    }
  }, [visible, posterIdProp, taskerIdProp]);

  // Create or get chat for this task
  const createChatMutation = useCreateOrGetTaskChat();

  // Get chat details with participants (only when we have a chatId)
  const {
    data: chatDetailsResponse,
    isLoading: isLoadingChatDetails
  } = useGetChatById(chatId, !!chatId && visible);

  // Debug chat details
  useEffect(() => {
    if (chatDetailsResponse?.chat) {
      const chat = chatDetailsResponse.chat as any;
      console.log('🔍 Chat details loaded:', {
        chatId: chat._id || chat.chatId,
        posterId: chat.posterId || chat.poster,
        taskerId: chat.taskerId || chat.tasker,
        posterIdType: typeof chat.posterId,
        taskerIdType: typeof chat.taskerId,
        hasPoster: !!chat.poster,
        hasTasker: !!chat.tasker,
      });
    } else if (chatId && !isLoadingChatDetails) {
      console.log('⚠️ Chat details NOT loaded for chatId:', chatId);
    }
  }, [chatDetailsResponse, chatId, isLoadingChatDetails]);

  // Get chat messages (only when we have a chatId)
  const { 
    data: messagesResponse, 
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useGetChatMessages(chatId, 1, 50, !!chatId && visible);

  // Mutation for sending messages
  const sendMessageMutation = useSendMessage();
  
  // Mutation for marking messages as read
  const markAsReadMutation = useMarkMessagesAsRead();

  // Calculate the other person (the one you're chatting with)
  const otherPerson = React.useMemo(() => {
    console.log('🧮 CALCULATING OTHER PERSON...');
    
    if (!currentUserId) {
      console.log('❌ No currentUserId');
      return null;
    }
    
    // Try to get participants from chat details API response first
    let poster: ChatParticipant | null = null;
    let tasker: ChatParticipant | null = null;
    
    if (chatDetailsResponse?.chat) {
      const chat = chatDetailsResponse.chat as any;
      
      // Handle different API formats:
      // Format 1: posterId/taskerId as populated objects (standard)
      // Format 2: poster/tasker objects (getUserChats format)
      
      if (chat.poster && typeof chat.poster === 'object') {
        // getUserChats format: { poster: { id, name, avatar }, tasker: { id, name, avatar } }
        const nameParts = chat.poster.name?.split(' ') || ['', ''];
        poster = {
          _id: chat.poster.id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          avatar: chat.poster.avatar,
        };
      } else if (typeof chat.posterId === 'object') {
        // Standard format: { posterId: { _id, firstName, lastName, avatar } }
        poster = chat.posterId;
      }
      
      if (chat.tasker && typeof chat.tasker === 'object') {
        const nameParts = chat.tasker.name?.split(' ') || ['', ''];
        tasker = {
          _id: chat.tasker.id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          avatar: chat.tasker.avatar,
        };
      } else if (typeof chat.taskerId === 'object') {
        tasker = chat.taskerId;
      }
      
      console.log('📡 From chat details API:', {
        poster: poster ? `${poster.firstName} ${poster.lastName} (${poster._id})` : 'NULL',
        tasker: tasker ? `${tasker.firstName} ${tasker.lastName} (${tasker._id})` : 'NULL',
      });
    }
    
    // Fallback to props if chat details don't have populated participants
    if (!poster && posterIdProp) {
      console.log('📌 Using posterIdProp as fallback');
      poster = posterIdProp;
    }
    if (!tasker && taskerIdProp) {
      console.log('📌 Using taskerIdProp as fallback');
      tasker = taskerIdProp;
    }
    
    console.log('👥 FINAL PARTICIPANTS:', {
      poster: poster ? `${poster.firstName} ${poster.lastName} (${poster._id})` : 'NULL',
      tasker: tasker ? `${tasker.firstName} ${tasker.lastName} (${tasker._id})` : 'NULL',
      currentUserId: currentUserId,
    });
    
    if (!poster && !tasker) {
      console.warn('⚠️ No participant data available (neither from API nor props)');
      return null;
    }
    
    // If current user is the poster, show tasker
    if (poster && poster._id === currentUserId) {
      console.log('✅ Current user is POSTER → showing TASKER:', tasker ? `${tasker.firstName} ${tasker.lastName}` : 'NULL');
      return tasker;
    }
    // If current user is the tasker, show poster
    if (tasker && tasker._id === currentUserId) {
      console.log('✅ Current user is TASKER → showing POSTER:', poster ? `${poster.firstName} ${poster.lastName}` : 'NULL');
      return poster;
    }
    
    console.warn('⚠️ Current user is neither poster nor tasker');
    return null;
  }, [chatDetailsResponse, currentUserId, posterIdProp, taskerIdProp]);

  // Debug props when component mounts or updates
  useEffect(() => {
    if (visible) {
      console.log('🎬 ChatWindow opened with props:', {
        visible,
        chatIdProp,
        taskId,
        posterId,
        taskerId,
        messageId: message?.id,
        currentChatId: chatId
      });
    }
  }, [visible, chatIdProp, taskId, posterId, taskerId, message?.id, chatId]);

  // Helper functions for local storage
  const getStorageKey = (taskId: string) => `chat_messages_${taskId}`;
  
  const saveMessagesToStorage = async (taskId: string, messages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(getStorageKey(taskId), JSON.stringify(messages));
      console.log(`💾 Saved ${messages.length} messages to storage for task: ${taskId}`);
    } catch (error) {
      console.error('❌ Failed to save messages to storage:', error);
    }
  };
  
  const loadMessagesFromStorage = async (taskId: string): Promise<ChatMessage[]> => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(taskId));
      if (stored) {
        const messages = JSON.parse(stored);
        console.log(`💼 Loaded ${messages.length} messages from storage for task: ${taskId}`);
        return messages;
      }
    } catch (error) {
      console.error('❌ Failed to load messages from storage:', error);
    }
    return [];
  };

  // Update chatId when prop changes or modal closes
  useEffect(() => {
    if (visible && chatIdProp && chatIdProp !== chatId) {
      console.log('🆔 Updating chatId from prop:', chatIdProp);
      setChatId(chatIdProp);
    } else if (!visible && chatId !== null) {
      // Reset chatId when chat closes
      console.log('🔄 Resetting chatId (chat closed)');
      setChatId(null);
    }
  }, [chatIdProp, visible]);

  // Initialize chat when component opens with a taskId (only if no chatIdProp)
  useEffect(() => {
    if (visible && taskId && !chatId && !chatIdProp && user) {
      console.log('🔄 Initializing chat for task:', taskId);
      
      // Check if we have posterId and taskerId from props
      if (!posterId || !taskerId) {
        console.warn('⚠️ Missing posterId or taskerId - chat list should provide chatId instead');
        Alert.alert(
          'Unable to Open Chat',
          'Missing participant information. Please try again from the task detail screen.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      createChatMutation.mutate(
        {
          taskId,
          data: {
            posterId,
            taskerId,
          },
        },
        {
          onSuccess: (response) => {
            console.log('✅ Chat initialized:', response.chat._id);
            setChatId(response.chat._id);
          },
          onError: (error: any) => {
            console.error('❌ Failed to initialize chat:', error);
            Alert.alert(
              'Error',
              error.message || 'Failed to create chat. Please try again.',
              [{ text: 'OK', onPress: onClose }]
            );
          },
        }
      );
    }
  }, [visible, taskId, chatId, chatIdProp, user, posterId, taskerId, onClose]);

  // Reset chat when switching to a different task
  useEffect(() => {
    if (taskId && lastTaskId && taskId !== lastTaskId && visible) {
      console.log(`🔄 Switching chat from ${lastTaskId} to ${taskId}`);
      setChatMessages([]);
      setChatId(null); // Reset chatId when switching tasks
      setLastTaskId(taskId);
    } else if (taskId && !lastTaskId && visible) {
      // First time setting taskId
      setLastTaskId(taskId);
    }
  }, [taskId, lastTaskId, visible]);

  // Reset messages when switching to a different chat (chatIdProp changes)
  useEffect(() => {
    if (visible && chatIdProp && lastChatId && chatIdProp !== lastChatId) {
      console.log(`🔄 Switching from chat ${lastChatId} to ${chatIdProp}`);
      setChatMessages([]);
      setLastChatId(chatIdProp);
    } else if (visible && chatIdProp && !lastChatId) {
      // First time setting chatId
      setLastChatId(chatIdProp);
    }
  }, [chatIdProp, lastChatId, visible]);

  // Load messages from API when chatId is available
  useEffect(() => {
    if (messagesResponse?.messages && visible && currentUserId && chatId) {
      console.log(`📡 Loading ${messagesResponse.messages.length} messages from API for chat: ${chatId}`);
      console.log('👤 Comparing with currentUserId:', currentUserId);
      console.log('🔄 Chat visible, messages will be rendered immediately');
      
      // Get participant info from chat details API or fallback to props
      let poster: ChatParticipant | null = null;
      let tasker: ChatParticipant | null = null;
      
      if (chatDetailsResponse?.chat) {
        const chat = chatDetailsResponse.chat as any;
        
        // Handle different API formats
        if (chat.poster && typeof chat.poster === 'object') {
          const nameParts = chat.poster.name?.split(' ') || ['', ''];
          poster = {
            _id: chat.poster.id,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            avatar: chat.poster.avatar,
          };
        } else if (typeof chat.posterId === 'object') {
          poster = chat.posterId;
        }
        
        if (chat.tasker && typeof chat.tasker === 'object') {
          const nameParts = chat.tasker.name?.split(' ') || ['', ''];
          tasker = {
            _id: chat.tasker.id,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            avatar: chat.tasker.avatar,
          };
        } else if (typeof chat.taskerId === 'object') {
          tasker = chat.taskerId;
        }
      }
      
      // Fallback to props if API didn't populate participants
      if (!poster && posterIdProp) {
        console.log('📌 Using posterIdProp as fallback');
        poster = posterIdProp;
      }
      if (!tasker && taskerIdProp) {
        console.log('📌 Using taskerIdProp as fallback');
        tasker = taskerIdProp;
      }
      
      console.log('👥 Chat participants:', {
        poster: poster ? `${poster.firstName} ${poster.lastName} (${poster._id})` : 'N/A',
        tasker: tasker ? `${tasker.firstName} ${tasker.lastName} (${tasker._id})` : 'N/A',
      });
      
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
      
      console.log('🔍 CONVERTING MESSAGES - Participants available:', {
        poster: poster ? `${poster.firstName} ${poster.lastName} (${poster._id})` : 'NULL',
        tasker: tasker ? `${tasker.firstName} ${tasker.lastName} (${tasker._id})` : 'NULL',
        currentUserId,
      });
      
      const convertedMessages: ChatMessage[] = messagesResponse.messages.map(msg => {
        console.log('📨 RAW MESSAGE:', {
          _id: msg._id,
          senderId: msg.senderId,
          senderIdType: typeof msg.senderId,
          content: msg.content.substring(0, 30),
          messageType: msg.messageType,
          mediaUrl: msg.mediaUrl,
        });
        
        // Handle senderId as both object and string
        const senderIdRaw: any = msg.senderId;
        const senderId = typeof senderIdRaw === 'object' && senderIdRaw?._id 
          ? senderIdRaw._id 
          : senderIdRaw;
        
        const isMine = senderId === currentUserId;
        const sender = getParticipant(senderId as string);
        
        console.log('🔍 SENDER LOOKUP:', {
          senderId,
          isMine,
          senderFound: !!sender,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'NOT FOUND',
        });
        
        // If sender not found in participants, check if senderId is already populated
        let senderName: string;
        let senderInitials: string;
        let senderAvatar: string | undefined;
        let senderRole: 'poster' | 'tasker' | 'unknown' = 'unknown';
        
        if (sender) {
          senderName = `${sender.firstName} ${sender.lastName || ''}`.trim();
          senderInitials = getInitials(sender.firstName, sender.lastName);
          senderAvatar = sender.avatar || undefined;
          // Determine role based on which participant matched
          if (poster && sender._id === poster._id) {
            senderRole = 'poster';
          } else if (tasker && sender._id === tasker._id) {
            senderRole = 'tasker';
          }
        } else if (typeof senderIdRaw === 'object' && senderIdRaw?.firstName) {
          // senderId is a populated object with user data from API
          console.log('✅ Using populated sender from API:', senderIdRaw);
          senderName = `${senderIdRaw.firstName} ${senderIdRaw.lastName || ''}`.trim();
          senderInitials = getInitials(senderIdRaw.firstName, senderIdRaw.lastName || '');
          senderAvatar = senderIdRaw.avatar || undefined;
        } else {
          // Last resort: try to match by ID to determine role
          console.warn('⚠️ Sender not found in participants or API response:', senderId);
          if (poster && senderId === poster._id) {
            senderName = `${poster.firstName} ${poster.lastName || ''}`.trim();
            senderInitials = getInitials(poster.firstName, poster.lastName);
            senderAvatar = poster.avatar || undefined;
            senderRole = 'poster';
          } else if (tasker && senderId === tasker._id) {
            senderName = `${tasker.firstName} ${tasker.lastName || ''}`.trim();
            senderInitials = getInitials(tasker.firstName, tasker.lastName);
            senderAvatar = tasker.avatar || undefined;
            senderRole = 'tasker';
          } else {
            senderName = 'Unknown User';
            senderInitials = '??';
            senderAvatar = undefined;
          }
        }
        
        console.log(`📨 CONVERTED Message ${msg._id}:`, {
          senderId,
          isMine,
          senderName,
          senderInitials,
          senderRole,
          hasAvatar: !!senderAvatar,
          messageType: msg.messageType,
          mediaUrl: msg.mediaUrl,
        });
        
        // Normalize mediaUrl for APK compatibility
        const normalizedMediaUrl = normalizeMediaUrl(msg.mediaUrl);
        
        if (msg.mediaUrl && normalizedMediaUrl !== msg.mediaUrl) {
          console.log('🔄 Media URL normalized:', { original: msg.mediaUrl, normalized: normalizedMediaUrl });
        }
        
        return {
          id: msg._id,
          text: msg.content,
          sender: isMine ? 'me' : 'other',
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          senderName,
          senderAvatar,
          senderInitials,
          messageType: msg.messageType || 'text',
          mediaUrl: normalizedMediaUrl,
          isRead: msg.isRead || false,
          readAt: msg.readAt || null,
        };
      });
      
      console.log('📬 Sample converted message:', JSON.stringify(convertedMessages[0], null, 2));
      
      // Always update messages state - even if empty
      setChatMessages(convertedMessages);
      
      // Save to storage if we have messages
      if (convertedMessages.length > 0 && taskId) {
        saveMessagesToStorage(taskId, convertedMessages);
        console.log(`✅ Loaded ${convertedMessages.length} messages for chat`);
        
        // Mark messages as read when opening chat
        if (chatId) {
          markAsReadMutation.mutate(chatId, {
            onSuccess: () => {
              console.log('✅ Messages marked as read');
            },
            onError: (error) => {
              console.error('❌ Failed to mark messages as read:', error);
            }
          });
        }
      } else if (convertedMessages.length === 0) {
        console.log('📦 No messages in chat yet');
        // Still try to load from storage as backup
        if (taskId) {
          loadMessagesFromStorage(taskId).then(storedMessages => {
            if (storedMessages.length > 0) {
              console.log(`💾 Loaded ${storedMessages.length} messages from storage as fallback`);
              setChatMessages(storedMessages);
            }
          });
        }
      }
    }
  }, [messagesResponse, visible, currentUserId, chatId, taskId, currentUserName, chatDetailsResponse, posterIdProp, taskerIdProp]);

  const sendMessage = async () => {
    if (newMessage.trim() && chatId) {
      const messageText = newMessage.trim();
      let optimisticMsg: ChatMessage | null = null;
      
      try {
        setIsLoading(true);
        
        console.log('📤 Sending message to chatId:', chatId);
        
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
        if (taskId) {
          await saveMessagesToStorage(taskId, newMessages);
        }
        
        // Send via NEW chat API
        const response = await sendMessageMutation.mutateAsync({
          chatId,
          data: {
            content: messageText,
            messageType: 'text',
          }
        });

        // Update the temporary message with real ID from response
        if (response.message?._id) {
          setChatMessages(prev => {
            const updatedMessages = prev.map(msg => 
              msg.id === optimisticMsg!.id 
                ? { ...msg, id: response.message._id } 
                : msg
            );
            // Save updated messages
            if (taskId) {
              saveMessagesToStorage(taskId, updatedMessages);
            }
            return updatedMessages;
          });
        }
        
        console.log('✅ Message sent successfully for chat:', chatId);
        
        // Refetch messages to get the latest
        refetchMessages();
        
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        
        // Remove the optimistic message on error
        if (optimisticMsg) {
          setChatMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== optimisticMsg!.id);
            console.log('🔄 Rolled back optimistic message, remaining:', filtered.length);
            // Save the rolled back state
            if (taskId) {
              saveMessagesToStorage(taskId, filtered);
            }
            return filtered;
          });
        }
        setNewMessage(messageText); // Restore the message text for retry
        
        Alert.alert('Error', 'Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (newMessage.trim() && !chatId) {
      console.error('❌ Cannot send message - chatId is missing:', {
        chatId,
        chatIdProp,
        taskId,
        visible,
        hasMessage: !!newMessage.trim()
      });
      Alert.alert(
        'Error', 
        'Chat not initialized. Please close and reopen the chat.',
        [{ text: 'OK' }]
      );
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
    if (!chatId || !taskId) {
      Alert.alert('Error', 'Chat not initialized');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        console.log('📤 Uploading image from ChatWindow:', result.assets[0].uri);
        
        // Upload to CDN
        const imageUrl = await uploadChatImage(result.assets[0].uri, taskId);
        console.log('✅ Image uploaded, CDN URL:', imageUrl);
        
        // Send message with image
        sendMessageMutation.mutate(
          {
            chatId,
            data: {
              content: 'Photo',
              messageType: 'image',
              mediaUrl: imageUrl,
            },
          },
          {
            onSuccess: () => {
              console.log('✅ Image message sent from ChatWindow');
              refetchMessages();
              setIsUploading(false);
            },
            onError: (error) => {
              setIsUploading(false);
              console.error('❌ Failed to send image:', error);
              Alert.alert('Error', 'Failed to send image');
            },
          }
        );
      }
    } catch (error) {
      setIsUploading(false);
      console.error('❌ Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleFileDownload = async (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) {
      Alert.alert('Error', 'File URL not available');
      return;
    }

    try {
      console.log('📥 Opening file:', fileUrl);
      Alert.alert(
        'Open File',
        `Do you want to open ${fileName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open',
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(fileUrl);
                if (supported) {
                  await Linking.openURL(fileUrl);
                  console.log('✅ File opened:', fileUrl);
                } else {
                  Alert.alert('Error', 'Cannot open this file type');
                }
              } catch (openError) {
                console.error('❌ Open error:', openError);
                Alert.alert('Error', 'Failed to open file');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ File open error:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const pickDocument = async () => {
    if (!chatId || !taskId) {
      Alert.alert('Error', 'Chat not initialized');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        console.log('📤 Uploading file from ChatWindow:', result.assets[0].name);
        
        // Upload to CDN
        const fileUrl = await uploadChatFile(
          result.assets[0].uri,
          result.assets[0].name,
          result.assets[0].mimeType || 'application/octet-stream',
          taskId
        );
        console.log('✅ File uploaded, CDN URL:', fileUrl);
        
        // Send message with file
        sendMessageMutation.mutate(
          {
            chatId,
            data: {
              content: result.assets[0].name,
              messageType: 'file',
              mediaUrl: fileUrl,
            },
          },
          {
            onSuccess: () => {
              console.log('✅ File message sent from ChatWindow');
              refetchMessages();
              setIsUploading(false);
            },
            onError: (error) => {
              setIsUploading(false);
              console.error('❌ Failed to send file:', error);
              Alert.alert('Error', 'Failed to send file');
            },
          }
        );
      }
    } catch (error) {
      setIsUploading(false);
      console.error('❌ File upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            
            <View style={styles.chatHeaderInfo}>
            {otherPerson ? (
              <>
                {otherPerson.avatar ? (
                  <Image 
                    source={{ uri: otherPerson.avatar }} 
                    style={styles.chatAvatar} 
                  />
                ) : (
                  <View style={styles.chatAvatarFallback}>
                    <Text style={styles.chatAvatarInitials}>
                      {otherPerson.firstName?.charAt(0)?.toUpperCase() || ''}
                      {otherPerson.lastName?.charAt(0)?.toUpperCase() || ''}
                    </Text>
                  </View>
                )}
                <View style={styles.chatHeaderText}>
                  <Text style={styles.chatTitle} numberOfLines={1}>
                    {`${otherPerson.firstName} ${otherPerson.lastName || ''}`.trim()}
                  </Text>
                  {isLoadingMessages && (
                    <Text style={styles.chatStatus}>Loading...</Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <Image 
                  source={{ uri: message.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.chatAvatar} 
                />
                <View style={styles.chatHeaderText}>
                  <Text style={styles.chatTitle} numberOfLines={1}>{message.title}</Text>
                  {isLoadingMessages && (
                    <Text style={styles.chatStatus}>Loading...</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={() => (
            isLoadingMessages ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading messages...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#E1E8ED" />
                <Text style={styles.emptyTitle}>Start a conversation</Text>
                <Text style={styles.emptySubtext}>Send a message to begin chatting about this task</Text>
              </View>
            )
          )}
          renderItem={({ item: msg }) => (
            <View
              style={[
                styles.messageWrapper,
                msg.sender === 'me' ? styles.myMessageWrapper : styles.otherMessageWrapper
              ]}
            >
              {msg.sender === 'other' && (
                msg.senderAvatar ? (
                  <Image 
                    source={{ uri: msg.senderAvatar }} 
                    style={styles.messageAvatar} 
                  />
                ) : (
                  <View style={styles.messageAvatarFallback}>
                    <Text style={styles.messageAvatarInitials}>
                      {msg.senderInitials || '??'}
                    </Text>
                  </View>
                )
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myMessage : styles.otherMessage
                ]}
              >
                {msg.messageType === 'image' && msg.mediaUrl ? (
                  <View>
                    <TouchableOpacity onPress={() => setPreviewImage(normalizeMediaUrl(msg.mediaUrl))}>
                      <Image 
                        source={{ uri: msg.mediaUrl }} 
                        style={styles.messageImage}
                        onError={(e) => {
                          // Silently handle CDN image errors (401, 404, etc.)
                          // These are usually auth token issues from backend
                          if (__DEV__) {
                            console.log('🖼️ Image unavailable (CDN auth issue):', msg.id);
                          }
                        }}
                      />
                    </TouchableOpacity>
                    {msg.text && msg.text !== 'Photo' && (
                      <Text style={[
                        styles.messageText,
                        msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
                        { marginTop: 8 }
                      ]}>
                        {msg.text}
                      </Text>
                    )}
                  </View>
                ) : msg.messageType === 'file' && msg.mediaUrl ? (
                  <TouchableOpacity onPress={() => handleFileDownload(normalizeMediaUrl(msg.mediaUrl), msg.text || 'File')}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="document-attach" size={24} color={msg.sender === 'me' ? '#fff' : '#007AFF'} />
                      <Text style={[
                        styles.messageText,
                        msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText
                      ]}>
                        {msg.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text style={[
                    styles.messageText,
                    msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText
                  ]}>
                    {msg.text}
                  </Text>
                )}
                <View style={styles.messageFooter}>
                  <Text style={[
                    styles.messageTime,
                    msg.sender === 'me' ? styles.myMessageTime : styles.otherMessageTime
                  ]}>
                    {msg.timestamp}
                  </Text>
                  {msg.sender === 'me' && (
                    <View style={styles.readReceipt}>
                      {msg.isRead ? (
                        // Double checkmark (read) - blue
                        <>
                          <Ionicons name="checkmark" size={14} color="#34B7F1" style={styles.checkmark1} />
                          <Ionicons name="checkmark" size={14} color="#34B7F1" style={styles.checkmark2} />
                        </>
                      ) : (
                        // Double checkmark (delivered) - gray  
                        <>
                          <Ionicons name="checkmark" size={14} color={msg.sender === 'me' ? '#fff' : '#999'} style={styles.checkmark1} />
                          <Ionicons name="checkmark" size={14} color={msg.sender === 'me' ? '#fff' : '#999'} style={styles.checkmark2} />
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity onPress={handleAttachment} style={styles.attachButton}>
              <Ionicons name="attach" size={22} color="#666" />
            </TouchableOpacity>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
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

        {/* Upload Loading Overlay */}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <View style={styles.uploadOverlayContent}>
              <Ionicons name="cloud-upload" size={48} color="#007AFF" />
              <Text style={styles.uploadOverlayText}>Uploading...</Text>
            </View>
          </View>
        )}

        {/* Image Preview Modal */}
        <Modal
          visible={!!previewImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <View style={styles.previewModalContainer}>
            <TouchableOpacity
              style={styles.previewModalBackground}
              activeOpacity={1}
              onPress={() => setPreviewImage(null)}
            >
              <View style={styles.previewModalContent}>
                <TouchableOpacity
                  style={styles.previewCloseButton}
                  onPress={() => setPreviewImage(null)}
                >
                  <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                {previewImage && (
                  <Image
                    source={{ uri: previewImage }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
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
  chatAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    paddingBottom: 16,
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  readReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  checkmark1: {
    marginRight: -8,
  },
  checkmark2: {
    marginLeft: 0,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
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
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadOverlayContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  uploadOverlayText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  previewModalBackground: {
    flex: 1,
  },
  previewModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});