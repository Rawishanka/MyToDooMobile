// Message List Item Component - Optimized for Performance

import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from './message-types';

interface MessageListItemProps {
  message: Message;
  onPress: (message: Message) => void;
}

const MessageListItemComponent: React.FC<MessageListItemProps> = ({ message, onPress }) => {
  // Memoize the onPress handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(message);
  }, [message, onPress]);

  return (
    <TouchableOpacity 
      style={[
        styles.messageItem,
        (message.unreadCount && message.unreadCount > 0) ? styles.unreadItem : undefined
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: message.avatar || 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=100' }} 
          style={styles.avatar}
          resizeMode="cover"
        />
        {message.unreadCount && message.unreadCount > 0 && (
          <View style={styles.unreadDot} />
        )}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageTitleRow}>
          <Text 
            style={[
              styles.messageTitle,
              (message.unreadCount && message.unreadCount > 0) ? styles.unreadTitle : undefined
            ]} 
            numberOfLines={1}
          >
            {message.title}
          </Text>
          <Text style={styles.messageDate}>{message.date}</Text>
        </View>
        
        <Text 
          style={[
            styles.messagePreview,
            (message.unreadCount && message.unreadCount > 0) ? styles.unreadPreview : undefined
          ]} 
          numberOfLines={1}
        >
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
};

// Optimize with React.memo and custom comparison function
export const MessageListItem = React.memo(MessageListItemComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.title === nextProps.message.title &&
    prevProps.message.preview === nextProps.message.preview &&
    prevProps.message.date === nextProps.message.date &&
    prevProps.message.unreadCount === nextProps.message.unreadCount &&
    prevProps.message.avatar === nextProps.message.avatar
  );
});

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: 'row',
    paddingVertical: isTablet ? hp('1.8%') : hp('1.7%'),
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isTablet ? wp('2%') : wp('3%'),
  },
  avatar: {
    width: isTablet ? 56 : 50,
    height: isTablet ? 56 : 50,
    borderRadius: isTablet ? 28 : 25,
    backgroundColor: '#F0F0F0',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
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
    fontSize: RFValue(isTablet ? 14 : 15),
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: isTablet ? wp('2%') : wp('2%'),
  },
  messageDate: {
    fontSize: RFValue(isTablet ? 10 : 13),
    color: '#8E8E93',
    flexShrink: 0,
  },
  messagePreview: {
    fontSize: RFValue(isTablet ? 10 : 14),
    color: '#8E8E93',
    lineHeight: isTablet ? RFValue(20) : 18,
  },
  unreadItem: {
    backgroundColor: '#F0F7FF',
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#000',
  },
  unreadPreview: {
    fontWeight: '600',
    color: '#000',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: isTablet ? 18 : 12,
    minWidth: isTablet ? 36 : 24,
    height: isTablet ? 36 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: isTablet ? wp('2%') : wp('2%'),
    paddingHorizontal: isTablet ? 8 : 6,
  },
  unreadText: {
    fontSize: RFValue(isTablet ? 10 : 12),
    color: '#fff',
    fontWeight: '700',
  },
});