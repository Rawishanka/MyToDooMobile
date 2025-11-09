// Firebase Chat Service for Real-time Messaging (React Native Firebase)

import { GroupChatMessage } from '@/src/api/types/chat';
import { db } from '@/src/config/firebase';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface FirebaseMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: FirebaseFirestoreTypes.Timestamp | string;
  messageType: 'text' | 'image' | 'file' | 'system';
  senderRole: 'poster' | 'tasker';
  metadata?: Record<string, any>;
}

class FirebaseChatServiceClass {
  // Generate Firebase chat ID from task ID
  private getFirebaseChatId(taskId: string): string {
    return `group_${taskId}_chat`;
  }

  // Subscribe to real-time messages
  subscribeToMessages(
    taskId: string,
    onUpdate: (messages: GroupChatMessage[]) => void,
    onError?: (error: Error) => void,
    messageLimit: number = 50
  ): () => void {
    const chatId = this.getFirebaseChatId(taskId);
    
    console.log(`🔥 Subscribing to Firebase chat: ${chatId}`);

    return db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(messageLimit)
      .onSnapshot(
        (snapshot) => {
          const messages: GroupChatMessage[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data() as FirebaseMessage;
            
            // Convert Firestore timestamp to ISO string
            let timestamp: string;
            if (data.timestamp && typeof data.timestamp === 'object' && 'toDate' in data.timestamp) {
              timestamp = (data.timestamp as FirebaseFirestoreTypes.Timestamp).toDate().toISOString();
            } else {
              timestamp = (data.timestamp as string) || new Date().toISOString();
            }

            messages.push({
              id: doc.id,
              text: data.text,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              timestamp,
              messageType: data.messageType,
              senderRole: data.senderRole,
              metadata: data.metadata || {},
            });
          });

          // Reverse to get chronological order (oldest first)
          const sortedMessages = messages.reverse();
          console.log(`🔥 Firebase messages updated: ${sortedMessages.length} messages`);
          onUpdate(sortedMessages);
        },
        (error) => {
          console.error('❌ Firebase subscription error:', error);
          if (onError) {
            onError(error);
          }
        }
      );
  }

  // Send message to Firebase (for real-time updates)
  async sendMessageToFirebase(
    taskId: string,
    message: {
      text: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      messageType: 'text' | 'image' | 'file' | 'system';
      senderRole: 'poster' | 'tasker';
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    try {
      const chatId = this.getFirebaseChatId(taskId);

      const messageData = {
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        timestamp: firestore.FieldValue.serverTimestamp(),
        messageType: message.messageType,
        senderRole: message.senderRole,
        metadata: message.metadata || {},
      };

      const docRef = await db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageData);

      console.log(`✅ Message sent to Firebase: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to send message to Firebase:', error);
      throw error;
    }
  }

  // Send system message to Firebase
  async sendSystemMessageToFirebase(
    taskId: string,
    systemMessage: {
      text: string;
      triggerUserId: string;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    return this.sendMessageToFirebase(taskId, {
      text: systemMessage.text,
      senderId: 'system',
      senderName: 'System',
      messageType: 'system',
      senderRole: 'poster',
      metadata: {
        triggerUserId: systemMessage.triggerUserId,
        ...systemMessage.metadata,
      },
    });
  }

  // Get Firebase chat reference for advanced operations
  getChatReference(taskId: string) {
    const chatId = this.getFirebaseChatId(taskId);
    return db.collection('chats').doc(chatId);
  }

  // Get messages collection reference
  getMessagesReference(taskId: string) {
    const chatId = this.getFirebaseChatId(taskId);
    return db.collection('chats').doc(chatId).collection('messages');
  }
}

export const FirebaseChatService = new FirebaseChatServiceClass();