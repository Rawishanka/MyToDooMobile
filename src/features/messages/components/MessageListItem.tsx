// Message List Item Component

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from './message-types';

interface MessageListItemProps {
  message: Message;
  onPress: (message: Message) => void;
}

export const MessageListItem: React.FC<MessageListItemProps> = ({ message, onPress }) => (
  <TouchableOpacity 
    style={styles.messageItem} 
    onPress={() => onPress(message)}
    activeOpacity={0.7}
  >
    <Image 
      source={{ uri: message.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
      style={styles.avatar} 
    />
    
    <View style={styles.messageContent}>
      <View style={styles.messageTitleRow}>
        <Text style={styles.messageTitle} numberOfLines={1}>
          {message.title}
        </Text>
        <Text style={styles.messageDate}>{message.date}</Text>
      </View>
      
      <Text style={styles.messagePreview} numberOfLines={1}>
        {message.preview}
      </Text>
    </View>
    
    {message.unreadCount && message.unreadCount > 0 && (
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>{message.unreadCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  messageDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  messagePreview: {
    fontSize: 14,
    color: '#8E8E93',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
