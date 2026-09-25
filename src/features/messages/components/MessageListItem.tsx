// Message List Item Component - Optimized for Performance

import { isTablet, wp } from '@/src/shared/utils/responsive';
import React, { useCallback } from 'react';
import { useTheme } from '@/src/shared/theme';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from './message-types';

interface MessageListItemProps {
  message: Message;
  onPress: (message: Message) => void;
}

const MessageListItemComponent: React.FC<MessageListItemProps> = ({ message, onPress }) => {
  const { isDarkMode } = useTheme();
  // Memoize the onPress handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(message);
  }, [message, onPress]);

  // Memoize avatar URL to ensure it's always valid
  const avatarUri = React.useMemo(() => {
    return message.avatar || 'https://ui-avatars.com/api/?name=User&background=003399&color=fff&size=100';
  }, [message.avatar]);

  return (
    <TouchableOpacity 
      style={[
        styles.messageItem,
        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
        (message.unreadCount && message.unreadCount > 0) ? styles.unreadItem : undefined
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.avatar}
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
              isDarkMode && { color: '#F8FAFC' },
              (message.unreadCount && message.unreadCount > 0) ? (isDarkMode ? { color: '#F8FAFC' } : styles.unreadTitle) : undefined
            ]} 
            numberOfLines={1}
          >
            {message.title}
          </Text>
          <Text style={[styles.messageDate, isDarkMode && { color: '#94A3B8' }]}>{message.date}</Text>
        </View>
        
        <Text 
          style={[
            styles.messagePreview,
            isDarkMode && { color: '#94A3B8' },
            (message.unreadCount && message.unreadCount > 0) ? (isDarkMode ? { color: '#CBD5E1' } : styles.unreadPreview) : undefined
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginHorizontal: isTablet ? wp('12.5%') : 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: isTablet ? 56 : 52,
    height: isTablet ? 56 : 52,
    borderRadius: isTablet ? 28 : 26,
    backgroundColor: '#EEF2FA',
    borderWidth: 2,
    borderColor: '#E8ECF4',
  },
  unreadDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#ff6b35',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
  },
  messageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  messageDate: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 0,
  },
  messagePreview: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b35',
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadPreview: {
    fontWeight: '600',
    color: '#334155',
  },
  unreadBadge: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 7,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
