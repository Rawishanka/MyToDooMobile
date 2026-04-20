// Notification Item Component

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem as NotificationItemType } from './message-types';

interface NotificationItemProps {
  item: NotificationItemType;
  onMenuPress: (item: NotificationItemType) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onMenuPress }) => (
  <TouchableOpacity 
    style={styles.notificationItem}
    onPress={() => onMenuPress(item)}
  >
    <Image source={item.avatar} style={styles.avatar} />
    <View style={styles.notificationContent}>
      <Text style={styles.notificationText}>
        <Text style={styles.username}>{item.user}</Text> {item.action}
      </Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
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
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    color: '#000',
  },
  timeText: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
});
