// Message List Item Component - Optimized for Performance

import { getIsTablet, hp, RFValue, wp } from '@/src/shared/utils/responsive';
import React, { useCallback, useMemo } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { Message } from './message-types';

interface MessageListItemProps {
  message: Message;
  onPress: (message: Message) => void;
}

const MessageListItemComponent: React.FC<MessageListItemProps> = ({ message, onPress }) => {
  const { width, height } = useWindowDimensions();
  const isTablet = useMemo(() => getIsTablet(width, height), [width, height]);
  
  // Memoize the onPress handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(message);
  }, [message, onPress]);

  // Memoize avatar URL to ensure it's always valid
  const avatarUri = useMemo(() => {
    return message.avatar || 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=100';
  }, [message.avatar]);

  return (
    <TouchableOpacity 
      style={[
        styles.messageItem,
        isTablet && { paddingVertical: hp('1.8%'), paddingHorizontal: wp('12.5%') },
        (message.unreadCount && message.unreadCount > 0) ? styles.unreadItem : undefined
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.avatarContainer,
        isTablet && { marginRight: wp('2%') }
      ]}>
        <Image 
          source={{ uri: avatarUri }} 
          style={[
            styles.avatar,
            isTablet && { width: 56, height: 56, borderRadius: 28 }
          ]}
          resizeMode="cover"
          onError={(e) => {
            // Silently handle image load errors - fallback URL will be used
            if (__DEV__) {
              console.log('Avatar load fallback for:', message.title);
            }
          }}
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
              isTablet && { fontSize: RFValue(14) },
              (message.unreadCount && message.unreadCount > 0) ? styles.unreadTitle : undefined
            ]} 
            numberOfLines={1}
          >
            {message.title}
          </Text>
          <Text style={[
            styles.messageDate,
            isTablet && { fontSize: RFValue(10) }
          ]}>{message.date}</Text>
        </View>
        
        <Text 
          style={[
            styles.messagePreview,
            isTablet && { fontSize: RFValue(10), lineHeight: RFValue(20) },
            (message.unreadCount && message.unreadCount > 0) ? styles.unreadPreview : undefined
          ]} 
          numberOfLines={1}
        >
          {message.preview}
        </Text>
      </View>
      
      {message.unreadCount && message.unreadCount > 0 && (
        <View style={[
          styles.unreadBadge,
          isTablet && { 
            borderRadius: 18, 
            minWidth: 36, 
            height: 36, 
            marginLeft: wp('2%'),
            paddingHorizontal: 8 
          }
        ]}>
          <Text style={[
            styles.unreadText,
            isTablet && { fontSize: RFValue(10) }
          ]}>{message.unreadCount}</Text>
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
    paddingVertical: hp('1.7%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp('3%'),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: wp('2%'),
  },
  messageDate: {
    fontSize: RFValue(13),
    color: '#8E8E93',
    flexShrink: 0,
  },
  messagePreview: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    lineHeight: 18,
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
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('2%'),
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: RFValue(12),
    color: '#fff',
    fontWeight: '700',
  },
});