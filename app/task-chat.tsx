/**
 * Task Chat Screen
 * 
 * 1-to-1 chat between task poster and tasker
 * Uses Firebase for real-time messaging
 */

import { uploadChatFile, uploadChatImage } from '@/src/api/cdn-api';
import { Message } from '@/src/api/task-chat-api';
import {
    useCreateOrGetTaskChat,
    useGetChatById,
    useGetChatMessages,
    useMarkMessagesAsRead,
    useSendMessage,
} from '@/src/shared/hooks/useTaskChat';
import { useAuthStore } from '@/src/store/auth-task-store';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TaskChatScreen() {
  const { taskId, taskTitle, posterId, taskerId, chatId: chatIdParam } = useLocalSearchParams<{ 
    taskId: string; 
    taskTitle: string;
    posterId?: string;
    taskerId?: string;
    chatId?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const [chatId, setChatId] = useState<string | null>(chatIdParam || null);
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  // Initialize chat on mount
  useEffect(() => {
    if (!taskId || !user) return;

    // If chatId was provided in params, use it directly (existing chat)
    if (chatIdParam) {
      console.log('💬 Using existing chat:', chatIdParam);
      setChatId(chatIdParam);
      return;
    }

    // Otherwise, create or get chat for this task
    console.log('🚀 Initializing task chat:', { 
      taskId, 
      userId: user._id,
      posterId,
      taskerId 
    });

    // If we don't have both IDs, show error
    if (!posterId || !taskerId) {
      console.error('❌ Missing poster or tasker ID');
      Alert.alert(
        'Error', 
        'Unable to load chat. Missing participant information.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    // Create or get chat for this task with actual participant IDs
    createChatMutation.mutate(
      {
        taskId,
        data: {
          posterId: posterId,
          taskerId: taskerId,
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
  }, [taskId, user, posterId, taskerId, chatIdParam]);

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
    if (!chatId || !taskId) return;

    try {
      setIsUploading(true);
      console.log('📤 Uploading image:', imageUri);

      const imageUrl = await uploadChatImage(imageUri, taskId);
      
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
    if (!chatId || !taskId) return;

    try {
      setIsUploading(true);
      console.log('📤 Uploading file:', fileName);

      const fileUrl = await uploadChatFile(fileUri, fileName, fileType, taskId);

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
    const isMine = item.senderId === user?._id;
    
    // Debug logging for ALL messages to understand structure
    console.log('🎨 Rendering message:', {
      id: item._id,
      type: item.messageType,
      content: item.content,
      mediaUrl: item.mediaUrl,
      hasContent: !!item.content,
      hasMediaUrl: !!item.mediaUrl,
      isMine
    });
    
    // Debug logging for problematic messages
    if (!item.content && !item.mediaUrl) {
      console.warn('⚠️ Empty message detected:', JSON.stringify(item, null, 2));
    }
    if (item.messageType === 'image' && !item.mediaUrl) {
      console.warn('⚠️ Image message without mediaUrl:', JSON.stringify(item, null, 2));
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {item.messageType === 'image' && item.mediaUrl ? (
          <View>
            <Image 
              source={{ uri: item.mediaUrl }} 
              style={styles.messageImage}
              onError={(error) => {
                console.error('❌ Image load error:', item.mediaUrl, error.nativeEvent.error);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', item.mediaUrl);
              }}
            />
            {item.content && item.content !== 'Photo' && (
              <Text style={[styles.messageText, isMine && styles.myMessageText, { marginTop: 8 }]}>
                {item.content}
              </Text>
            )}
          </View>
        ) : item.messageType === 'file' && item.mediaUrl ? (
          <TouchableOpacity
            style={styles.fileMessage}
            onPress={() => {
              console.log('📄 Opening file:', item.mediaUrl);
              Alert.alert('File', item.content || 'Unknown file');
            }}
          >
            <MaterialIcons name="insert-drive-file" size={24} color="#007bff" />
            <Text style={styles.fileName}>{item.content || 'File'}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>
            {item.content || '[Empty message]'}
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

  if (chatLoading || createChatMutation.isPending) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {taskTitle || 'Chat'}
        </Text>
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
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 10 }]}>
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
    </KeyboardAvoidingView>
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingHeaderText: {
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 16,
    color: '#333',
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
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
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
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
    fontSize: 16,
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
});
