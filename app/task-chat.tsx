/**
 * Task Chat Screen
 * 
 * 1-to-1 chat between task poster and tasker
 * Uses Firebase for real-time messaging
 */

import { uploadChatFile, uploadChatImage } from '@/src/api/cdn-api';
import API_CONFIG from '@/src/api/config';
import { formatUserName } from '@/src/utils/formatUserName';
import { Message } from '@/src/api/task-chat-api';
import {
  useCreateOrGetTaskChat,
  useGetChatById,
  useGetChatMessages,
  useMarkMessagesAsRead,
  useSendMessage,
} from '@/src/shared/hooks/useTaskChat';
import { getTaskById } from '@/src/api/task-api';
import { resolveTaskChatParticipants } from '@/src/shared/utils/resolve-task-participants';
import { allowsContactInChat, moderateContent } from '@/src/shared/utils/contentModeration';
import { useAuthStore } from '@/src/store/auth-task-store';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';

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

function normalizeRouteParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' && first.trim() ? first.trim() : undefined;
  }
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getMessageSenderId(senderId: Message['senderId']): string | undefined {
  if (typeof senderId === 'string') return senderId;
  if (senderId && typeof senderId === 'object' && '_id' in senderId) {
    return String(senderId._id);
  }
  return undefined;
}

function getMessageContent(content: Message['content']): string {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  return String(content);
}

export default function TaskChatScreen() {
  const params = useLocalSearchParams<{ 
    taskId?: string | string[]; 
    taskTitle?: string | string[];
    posterId?: string | string[];
    taskerId?: string | string[];
    chatId?: string | string[];
    posterName?: string | string[];
    posterAvatar?: string | string[];
    taskerName?: string | string[];
    taskerAvatar?: string | string[];
  }>();

  const normalizedTaskId = normalizeRouteParam(params.taskId);
  const normalizedTaskTitle = normalizeRouteParam(params.taskTitle);
  const normalizedPosterId = normalizeRouteParam(params.posterId);
  const normalizedTaskerId = normalizeRouteParam(params.taskerId);
  const normalizedChatIdParam = normalizeRouteParam(params.chatId);
  const normalizedPosterName = normalizeRouteParam(params.posterName);
  const normalizedPosterAvatar = normalizeRouteParam(params.posterAvatar);
  const normalizedTaskerName = normalizeRouteParam(params.taskerName);
  const normalizedTaskerAvatar = normalizeRouteParam(params.taskerAvatar);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerTopPadding = insets.top + 10;
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const chatInitStartedRef = useRef(false);

  const [chatId, setChatId] = useState<string | null>(normalizedChatIdParam || null);
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resolvedPosterId, setResolvedPosterId] = useState<string | undefined>(normalizedPosterId);
  const [resolvedTaskerId, setResolvedTaskerId] = useState<string | undefined>(normalizedTaskerId);
  const [resolvedTaskId, setResolvedTaskId] = useState<string | undefined>(normalizedTaskId);
  const [isResolvingParticipants, setIsResolvingParticipants] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | undefined>(undefined);

  const effectiveTaskId = resolvedTaskId || normalizedTaskId;

  // Swipe back gesture handler
  const onSwipeGesture = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      // Swipe right (back) - must be > 100px or fast velocity
      if (translationX > 100 || velocityX > 500) {
        router.back();
      }
    }
  };

  // Create or get chat
  const createChatMutation = useCreateOrGetTaskChat();
  
  // Get chat details (optional - not critical for displaying messages)
  const { data: chatData, isLoading: chatLoading, error: chatError } = useGetChatById(chatId, !!chatId);
  
  // Get messages
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGetChatMessages(
    chatId,
    1,
    50,
    !!chatId
  );

  // Send message
  const sendMessageMutation = useSendMessage();
  
  // Mark as read
  const markAsReadMutation = useMarkMessagesAsRead();

  const chat = chatData?.chat;
  const messages = messagesData?.messages || [];
  
  // Debug: Log all messages
  useEffect(() => {
    if (messages.length > 0) {
      console.log('📬 MESSAGES LOADED:', messages.length);
      messages.forEach((msg, index) => {
        console.log(`Message ${index + 1}:`, {
          id: msg._id,
          type: msg.messageType,
          content: typeof msg.content === 'string' ? msg.content.substring(0, 100) : msg.content,
          contentType: typeof msg.content,
          hasMediaUrl: !!msg.mediaUrl
        });
      });
    }
  }, [messages]);
  
  // Calculate other person (the one you're chatting with)
  const otherPerson = useMemo(() => {
    if (!user?._id) {
      console.log('❌ No user ID available');
      return null;
    }

    console.log('🔍 Calculating otherPerson:', {
      userId: user._id,
      hasChat: !!chat,
      posterId: normalizedPosterId,
      taskerId: normalizedTaskerId,
      posterName: normalizedPosterName,
      taskerName: normalizedTaskerName,
      posterAvatar: normalizedPosterAvatar,
      taskerAvatar: normalizedTaskerAvatar
    });

    // First, try to get from chat API data
    if (chat) {
      let poster: any = null;
      let tasker: any = null;

      const chatData = chat as any;

      if (chatData.poster && typeof chatData.poster === 'object') {
        poster = chatData.poster;
      } else if (typeof chat.posterId === 'object') {
        poster = chat.posterId;
      }

      if (chatData.tasker && typeof chatData.tasker === 'object') {
        tasker = chatData.tasker;
      } else if (typeof chat.taskerId === 'object') {
        tasker = chat.taskerId;
      }

      // If current user is poster, show tasker; if tasker, show poster
      if (poster && poster._id === user._id && tasker) {
        console.log('✅ From chat API: showing tasker', tasker);
        return tasker;
      }
      if (tasker && tasker._id === user._id && poster) {
        console.log('✅ From chat API: showing poster', poster);
        return poster;
      }
    }

    const effectivePosterId = resolvedPosterId || normalizedPosterId;
    const effectiveTaskerId = resolvedTaskerId || normalizedTaskerId;

    if (effectivePosterId === user._id && effectiveTaskerId) {
      const taskerInfo = {
        _id: effectiveTaskerId,
        firstName: normalizedTaskerName ? normalizedTaskerName.split(' ')[0] : '',
        lastName: normalizedTaskerName ? normalizedTaskerName.split(' ').slice(1).join(' ') : '',
        avatar: normalizedTaskerAvatar || null,
        displayName: normalizedTaskerName || 'Tasker'
      };
      console.log('✅ From params: current user is poster, showing tasker', taskerInfo);
      return taskerInfo;
    } else if (effectiveTaskerId === user._id && effectivePosterId) {
      const posterInfo = {
        _id: effectivePosterId,
        firstName: normalizedPosterName ? normalizedPosterName.split(' ')[0] : '',
        lastName: normalizedPosterName ? normalizedPosterName.split(' ').slice(1).join(' ') : '',
        avatar: normalizedPosterAvatar || null,
        displayName: normalizedPosterName || 'Poster'
      };
      console.log('✅ From params: current user is tasker, showing poster', posterInfo);
      return posterInfo;
    }

    console.log('❌ Could not determine other person - no ID match');
    console.log('   Debug: posterId:', effectivePosterId, 'taskerId:', effectiveTaskerId, 'user._id:', user._id);
    return null;
  }, [chat, user, normalizedPosterId, normalizedTaskerId, normalizedPosterName, normalizedPosterAvatar, normalizedTaskerName, normalizedTaskerAvatar, resolvedPosterId, resolvedTaskerId]);
  
  // Debug: Verify chat and task alignment
  useEffect(() => {
    if (chat && chatId) {
      const chatTaskId = typeof chat.taskId === 'string' ? chat.taskId : chat.taskId?._id;
      const chatTaskTitle = typeof chat.taskId === 'object' ? chat.taskId?.title : 'Unknown';
      console.log('🔍 CHAT VERIFICATION:', {
        chatId,
        paramTaskId: normalizedTaskId,
        chatTaskId,
        paramTaskTitle: normalizedTaskTitle,
        chatTaskTitle,
        MATCH: chatTaskId === normalizedTaskId
      });
      
      if (chatTaskId && normalizedTaskId && chatTaskId !== normalizedTaskId) {
        console.error('❌ MISMATCH: Chat belongs to different task!', {
          expected: normalizedTaskId,
          actual: chatTaskId
        });
      }
    }
  }, [chat, chatId, normalizedTaskId, normalizedTaskTitle]);
  
  // Debug log messages
  useEffect(() => {
    if (messages.length > 0) {
      console.log('💬 Messages loaded:', messages.length);
      console.log('💬 Sample message:', JSON.stringify(messages[0], null, 2));
    }
  }, [messages.length]);
  
  // Log chat error but don't block UI
  useEffect(() => {
    if (chatError) {
      console.warn('⚠️ Chat details error (non-critical):', chatError);
    }
  }, [chatError]);

  // Resolve poster/tasker + status from task (needed for contact moderation rules)
  useEffect(() => {
    if (!effectiveTaskId) return;

    let cancelled = false;

    // Always fetch status when we have a task id; also resolve participants if missing
    const needsParticipants =
      !normalizedChatIdParam && !(resolvedPosterId && resolvedTaskerId);

    if (needsParticipants) {
      setIsResolvingParticipants(true);
    }

    getTaskById(effectiveTaskId)
      .then((response) => {
        if (cancelled) return;
        const task = response?.data;
        if (task?.status) {
          setTaskStatus(String(task.status));
        }
        if (needsParticipants) {
          const participants = resolveTaskChatParticipants(task);
          if (participants.posterId) setResolvedPosterId(participants.posterId);
          if (participants.taskerId) setResolvedTaskerId(participants.taskerId);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('⚠️ Failed to resolve task for chat:', error);
      })
      .finally(() => {
        if (!cancelled && needsParticipants) setIsResolvingParticipants(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveTaskId, normalizedChatIdParam, resolvedPosterId, resolvedTaskerId]);

  // Resolve task + participants from chat when opened via chatId-only notification
  useEffect(() => {
    if (!chat || !chatId) return;

    const chatTaskId =
      typeof chat.taskId === 'string' ? chat.taskId : chat.taskId?._id;
    if (chatTaskId) {
      setResolvedTaskId(chatTaskId);
    }

    const chatData = chat as any;
    const posterFromChat =
      chatData.poster?._id ||
      (typeof chat.posterId === 'object' ? chat.posterId?._id : chat.posterId);
    const taskerFromChat =
      chatData.tasker?._id ||
      (typeof chat.taskerId === 'object' ? chat.taskerId?._id : chat.taskerId);

    if (posterFromChat) setResolvedPosterId(String(posterFromChat));
    if (taskerFromChat) setResolvedTaskerId(String(taskerFromChat));

    const statusFromChat =
      (typeof chat.taskId === 'object' && chat.taskId?.status) ||
      chatData.task?.status ||
      chatData.taskStatus;
    if (statusFromChat && !taskStatus) {
      setTaskStatus(String(statusFromChat));
    }
  }, [chat, chatId, taskStatus]);

  // Use chatId from notification params immediately
  useEffect(() => {
    if (!user || !normalizedChatIdParam) return;
    setChatId(normalizedChatIdParam);
  }, [user, normalizedChatIdParam]);

  // Initialize chat on mount (task-based flow)
  useEffect(() => {
    if (!user) return;
    if (normalizedChatIdParam) return;
    if (!effectiveTaskId) return;
    if (chatInitStartedRef.current) return;

    if (isResolvingParticipants) return;

    const effectivePosterId = resolvedPosterId || normalizedPosterId;
    const effectiveTaskerId = resolvedTaskerId || normalizedTaskerId;

    // If we don't have both IDs, show error
    if (!effectivePosterId || !effectiveTaskerId) {
      console.error('❌ Missing poster or tasker ID');
      Alert.alert(
        'Error', 
        'Unable to load chat. Missing participant information.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/message')
          }
        ]
      );
      return;
    }

    chatInitStartedRef.current = true;

    // Create or get chat for this task with actual participant IDs
    createChatMutation.mutate(
      {
        taskId: effectiveTaskId,
        data: {
          posterId: effectivePosterId,
          taskerId: effectiveTaskerId,
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
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
        },
      }
    );
  }, [effectiveTaskId, user, normalizedPosterId, normalizedTaskerId, normalizedChatIdParam, resolvedPosterId, resolvedTaskerId, isResolvingParticipants]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (chatId && messages.length > 0) {
      markAsReadMutation.mutate(chatId);
    }
  }, [chatId, messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!chatId || !messageText.trim()) return;

    const text = messageText.trim();
    
    // Moderate contact details only before assign; allow phone/email/website once assigned
    if (!allowsContactInChat(taskStatus)) {
      const moderationResult = moderateContent(text);
      if (!moderationResult.isClean) {
        Alert.alert(
          'Message Blocked',
          moderationResult.reason || 'Do not include personal contact details (phone, email, or websites). Please amend and resubmit.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setMessageText('');

    sendMessageMutation.mutate(
      {
        chatId,
        data: {
          content: text,
          messageType: 'text',
        },
      },
      {
        onSuccess: () => {
          console.log('✅ Message sent');
          refetchMessages();
        },
        onError: (error: any) => {
          console.error('❌ Failed to send message:', error);
          Alert.alert('Error', error.message || 'Failed to send message');
          setMessageText(text); // Restore message on error
        },
      }
    );
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    if (!chatId || !effectiveTaskId) return;

    try {
      setIsUploading(true);
      console.log('📤 Uploading image:', imageUri);

      const imageUrl = await uploadChatImage(imageUri, effectiveTaskId);
      
      console.log('✅ Image uploaded, CDN URL:', imageUrl);

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
          onSuccess: (response) => {
            console.log('✅ Image message sent successfully');
            console.log('📬 Message response:', JSON.stringify(response, null, 2));
            refetchMessages();
          },
          onError: (error: any) => {
            console.error('❌ Failed to send image message:', error);
            Alert.alert('Error', 'Failed to send image');
          },
        }
      );
    } catch (error: any) {
      console.error('❌ Image upload failed:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
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

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        await handleFileUpload(
          result.assets[0].uri,
          result.assets[0].name,
          result.assets[0].mimeType || 'application/octet-stream'
        );
      }
    } catch (error) {
      console.error('❌ Document picker error:', error);
    }
  };

  const handleFileUpload = async (fileUri: string, fileName: string, fileType: string) => {
    if (!chatId || !effectiveTaskId) return;

    try {
      setIsUploading(true);
      console.log('📤 Uploading file:', fileName);

      const fileUrl = await uploadChatFile(fileUri, fileName, fileType, effectiveTaskId);

      sendMessageMutation.mutate(
        {
          chatId,
          data: {
            content: fileName,
            messageType: 'file',
            mediaUrl: fileUrl,
          },
        },
        {
          onSuccess: () => {
            console.log('✅ File message sent');
            refetchMessages();
          },
          onError: (error: any) => {
            console.error('❌ Failed to send file:', error);
            Alert.alert('Error', 'Failed to send file');
          },
        }
      );
    } catch (error: any) {
      console.error('❌ File upload failed:', error);
      Alert.alert('Error', error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const senderId = getMessageSenderId(item.senderId);
    const isMine = senderId === user?._id;
    const messageContent = getMessageContent(item.content);
    
    // Normalize mediaUrl for APK compatibility
    const normalizedMediaUrl = normalizeMediaUrl(item.mediaUrl);
    
    // Debug logging for ALL messages to understand structure
    console.log('🎨 Rendering message:', {
      id: item._id,
      type: item.messageType,
      content: item.content,
      originalMediaUrl: item.mediaUrl,
      normalizedMediaUrl: normalizedMediaUrl,
      hasContent: !!item.content,
      hasMediaUrl: !!normalizedMediaUrl,
      isMine
    });
    
    // Debug logging for problematic messages
    if (!item.content && !normalizedMediaUrl) {
      console.warn('⚠️ Empty message detected:', JSON.stringify(item, null, 2));
    }
    if (item.messageType === 'image' && !normalizedMediaUrl) {
      console.warn('⚠️ Image message without mediaUrl:', JSON.stringify(item, null, 2));
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {item.messageType === 'image' && normalizedMediaUrl ? (
          <View>
            <TouchableOpacity onPress={() => setPreviewImage(normalizedMediaUrl)}>
              <Image 
                source={{ uri: normalizedMediaUrl }} 
                style={styles.messageImage}
                onError={(error) => {
                  // Silently handle CDN image errors (401, 404, etc.)
                  // These are usually auth token issues from backend CDN
                  if (__DEV__) {
                    console.log('🖼️ Image unavailable (CDN auth issue):', item._id);
                  }
                }}
              />
            </TouchableOpacity>
            {messageContent && messageContent !== 'Photo' && (
              <Text style={[styles.messageText, isMine && styles.myMessageText, { marginTop: 8 }]}>
                {messageContent}
              </Text>
            )}
          </View>
        ) : item.messageType === 'file' && item.mediaUrl ? (
          <TouchableOpacity
            style={styles.fileMessage}
            onPress={() => handleFileDownload(normalizedMediaUrl, messageContent || 'File')}
          >
            <MaterialIcons name="insert-drive-file" size={24} color="#007bff" />
            <Text style={styles.fileName}>{messageContent || 'File'}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>
            {messageContent || '[Empty message]'}
          </Text>
        )}
        <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
          {new Date(item.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if ((chatLoading && normalizedChatIdParam && !chat) || (createChatMutation.isPending && !normalizedChatIdParam)) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.headerSafeArea, { paddingTop: headerTopPadding }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading chat...</Text>
          </View>
        </View>
        <View style={[{ flex: 1 }, styles.centerContent]}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onHandlerStateChange={onSwipeGesture}
        activeOffsetX={[-10, 10000]}
        failOffsetY={[-20, 20]}
      >
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            {/* Header with safe area */}
            <View style={[styles.headerSafeArea, { paddingTop: headerTopPadding }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          
          {otherPerson ? (
            <View style={styles.headerInfo}>
              {otherPerson.avatar ? (
                <Image source={{ uri: otherPerson.avatar }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarFallback}>
                  <Text style={styles.headerAvatarInitials}>
                    {otherPerson.firstName?.charAt(0)?.toUpperCase() || ''}
                    {otherPerson.lastName?.charAt(0)?.toUpperCase() || ''}
                  </Text>
                </View>
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {(() => {
                    const fullName = formatUserName(otherPerson.firstName, otherPerson.lastName);
                    const displayName = fullName || (otherPerson as any).displayName || 'User';
                    console.log('🏷️ Header displaying name:', displayName, 'from otherPerson:', otherPerson);
                    return displayName;
                  })()}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {normalizedTaskTitle || 'Chat'}
            </Text>
          )}
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            messagesLoading ? (
              <View style={styles.loadingHeader}>
                <ActivityIndicator size="small" color="#007bff" />
                <Text style={styles.loadingHeaderText}>Loading messages...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !messagesLoading ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="chat-bubble-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Start a conversation</Text>
                <Text style={styles.emptySubtext}>Send a message to begin chatting about this task</Text>
              </View>
            ) : null
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />

        {/* Input Area - Fixed for APK edge-to-edge mode with Android nav buttons */}
        <View style={[
          styles.inputContainer, 
          { 
            paddingBottom: Platform.OS === 'android' 
              ? (insets.bottom > 0 ? insets.bottom + 10 : 50) // Add extra space for Android nav buttons in APK
              : Math.max(insets.bottom, 16)
          }
        ]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              Alert.alert('Attach', 'Choose attachment type', [
                { text: 'Image', onPress: handleImagePicker },
                { text: 'File', onPress: handleDocumentPicker },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            disabled={isUploading}
          >
            <MaterialIcons name="attach-file" size={24} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sendMessageMutation.isPending || isUploading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending || isUploading}
          >
            {sendMessageMutation.isPending || isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Upload Loading Overlay */}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <View style={styles.uploadOverlayContent}>
              <ActivityIndicator size="large" color="#007bff" />
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
                  <MaterialIcons name="close" size={30} color="#fff" />
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
          </KeyboardAvoidingView>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: '#666',
  },
  headerSafeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarInitials: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000',
    flexShrink: 1,
  },
  headerStatus: {
    fontSize: RFValue(12),
    color: '#34C759',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingHeaderText: {
    fontSize: RFValue(14),
    color: '#666',
  },
  messagesLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  messagesLoadingText: {
    marginTop: 16,
    fontSize: RFValue(16),
    color: '#666',
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: RFValue(16),
    color: '#333',
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: RFValue(11),
    color: '#666',
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: RFValue(14),
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: RFValue(14),
    color: '#ccc',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    // paddingBottom handled dynamically in component for safe area
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: RFValue(16),
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
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
    fontSize: RFValue(16),
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
