/**
 * Notification History List Component
 * 
 * Displays notification history stored in AsyncStorage
 * Similar to web implementation that uses localStorage
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import type { StoredNotification } from '@/src/services/notification-storage';

interface NotificationHistoryListProps {
  notifications: StoredNotification[];
  loading: boolean;
  onRefresh: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNotificationPress?: (notification: StoredNotification) => void;
}

export const NotificationHistoryList: React.FC<NotificationHistoryListProps> = ({
  notifications,
  loading,
  onRefresh,
  onMarkAsRead,
  onDelete,
  onNotificationPress,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_offer':
      case 'offer_made':
        return 'briefcase';
      case 'message':
      case 'chat_message':
        return 'chatbubble';
      case 'task_completed':
        return 'checkmark-circle';
      case 'task_assigned':
        return 'person-add';
      case 'payment':
        return 'card';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_offer':
      case 'offer_made':
        return '#007bff';
      case 'message':
      case 'chat_message':
        return '#28a745';
      case 'task_completed':
        return '#28a745';
      case 'task_assigned':
        return '#17a2b8';
      case 'payment':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const renderNotification = ({ item }: { item: StoredNotification }) => {
    const iconName = getNotificationIcon(item.type || 'unknown');
    const iconColor = getNotificationColor(item.type || 'unknown');

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => {
          if (!item.isRead) {
            onMarkAsRead(item.id);
          }
          onNotificationPress?.(item);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={iconName as any} size={wp('6%')} color={iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>

          <View style={styles.actionsContainer}>
            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <View style={styles.unreadDot} />
              </View>
            )}
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={wp('5%')} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={wp('16%')} color="#ccc" />
      <Text style={styles.emptyText}>No Notifications</Text>
      <Text style={styles.emptySubtext}>
        You'll see notifications here when you receive messages, offers, or task updates
      </Text>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      contentContainerStyle={
        notifications.length === 0 ? styles.emptyListContainer : styles.listContainer
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: hp('1%'),
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('8%'),
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: RFValue(16),
    color: '#6c757d',
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    padding: wp('3%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
    borderColor: '#007bff',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  textContainer: {
    flex: 1,
    marginRight: wp('2%'),
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  unreadText: {
    fontWeight: '700',
    color: '#000',
  },
  body: {
    fontSize: RFValue(14),
    color: '#666',
    marginBottom: hp('0.5%'),
    lineHeight: RFValue(20),
  },
  time: {
    fontSize: RFValue(12),
    color: '#999',
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hp('1%'),
  },
  unreadBadge: {
    padding: wp('1%'),
  },
  unreadDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#007bff',
  },
  deleteButton: {
    padding: wp('1%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('8%'),
  },
  emptyText: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#333',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  emptySubtext: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: RFValue(20),
  },
});
