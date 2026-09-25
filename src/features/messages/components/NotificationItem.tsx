// Notification Item Component

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem as NotificationItemType } from './message-types';
import { RFValue } from '@/src/shared/utils/responsive';
import { CARD_BG, CARD_DIVIDER, CARD_TEXT, CARD_TEXT_MUTED } from '@/src/shared/theme/brandColors';
import { useTheme } from '@/src/shared/theme';

interface NotificationItemProps {
  item: NotificationItemType;
  onMenuPress: (item: NotificationItemType) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onMenuPress }) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        isDarkMode && { backgroundColor: '#1E293B', borderBottomColor: '#334155' }
      ]}
      onPress={() => onMenuPress(item)}
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, isDarkMode && { color: '#F8FAFC' }]}>
          <Text style={[styles.username, isDarkMode && { color: '#F8FAFC' }]}>{item.user}</Text> {item.action}
        </Text>
        <Text style={[styles.timeText, isDarkMode && { color: '#94A3B8' }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: CARD_DIVIDER,
    backgroundColor: CARD_BG,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: RFValue(15),
    color: CARD_TEXT,
    lineHeight: 20,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    color: CARD_TEXT,
  },
  timeText: {
    fontSize: RFValue(13),
    color: CARD_TEXT_MUTED,
    marginTop: 2,
  },
});
