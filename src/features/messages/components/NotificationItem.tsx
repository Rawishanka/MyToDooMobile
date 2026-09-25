// Notification Item Component

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem as NotificationItemType } from './message-types';
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
        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }
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
    padding: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#00114D',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 21,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
