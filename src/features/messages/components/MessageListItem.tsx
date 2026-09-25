// Message List Item Component - Optimized for Performance

import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import React, { useCallback } from 'react';
import { useTheme } from '@/src/shared/theme';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from './message-types';
import { BRAND_ORANGE, CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';

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
    return message.avatar || 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=100';
  }, [message.avatar]);

  return (
    <TouchableOpacity 
      style={[
        styles.messageItem,
        isDarkMode && { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' },
        (message.unreadCount && message.unreadCount > 0) ? (isDarkMode ? { backgroundColor: '#1E293B' } : styles.unreadItem) : undefined
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
              (message.unreadCount && message.unreadCount > 0) ? (isDarkMode ? { color: '#38BDF8' } : styles.unreadTitle) : undefined
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
    paddingVertical: isTablet ? hp('1.8%') : hp('1.7%'),
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: CARD_DIVIDER,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_ORANGE,
    borderWidth: 2,
    borderColor: CARD_BG,
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
    color: CARD_TEXT,
    flex: 1,
    marginRight: isTablet ? wp('2%') : wp('2%'),
  },
  messageDate: {
    fontSize: RFValue(isTablet ? 10 : 13),
    color: CARD_TEXT_MUTED,
    flexShrink: 0,
  },
  messagePreview: {
    fontSize: RFValue(isTablet ? 10 : 14),
    color: CARD_TEXT_MUTED,
    lineHeight: isTablet ? RFValue(20) : 18,
  },
  unreadItem: {
    backgroundColor: CARD_BG,
  },
  unreadTitle: {
    fontWeight: '700',
    color: CARD_TEXT,
  },
  unreadPreview: {
    fontWeight: '600',
    color: CARD_TEXT,
  },
  unreadBadge: {
    backgroundColor: BRAND_ORANGE,
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