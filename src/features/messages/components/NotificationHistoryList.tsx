/**
 * Notification History List Component
 * 
 * Displays notification history stored in AsyncStorage
 * Similar to web implementation that uses localStorage
 */

import { HS } from '@/src/shared/theme/homeStyle';
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
import type { StoredNotification } from '@/src/services/notification-storage';
import { useTheme } from '@/src/shared/theme';
import { BRAND_BLUE } from '@/src/shared/theme/brandColors';

function normalizeNotificationType(item: StoredNotification): string {
  const raw =
    item.data?.type ||
    item.data?.notificationType ||
    item.data?.eventType ||
    item.type ||
    'unknown';
  return String(raw).trim().toLowerCase().replace(/-/g, '_');
}

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
  const { isDarkMode } = useTheme();
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

  const getNotificationIcon = (item: StoredNotification) => {
    const rawType = normalizeNotificationType(item);
    switch (rawType) {
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
      case 'payment_received':
      case 'payment_sent':
      case 'abn_required':
      case 'profile_incomplete':
      case 'complete_profile':
      case 'payout_required':
        return 'card';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (item: StoredNotification) => {
    const rawType = normalizeNotificationType(item);
    switch (rawType) {
      case 'task_offer':
      case 'offer_made':
        return BRAND_BLUE;
      case 'message':
      case 'chat_message':
        return BRAND_BLUE;
      case 'task_completed':
        return '#16A34A';
      case 'task_assigned':
        return '#16A34A';
      case 'payment':
      case 'payment_received':
      case 'payment_sent':
      case 'abn_required':
      case 'profile_incomplete':
      case 'complete_profile':
      case 'payout_required':
        return '#D97706';
      default:
        return BRAND_BLUE;
    }
  };

  const renderNotification = ({ item }: { item: StoredNotification }) => {
    const iconName = getNotificationIcon(item);
    const iconColor = getNotificationColor(item);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
          !item.isRead && [styles.unreadNotification, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }],
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
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? (iconColor === BRAND_BLUE ? 'rgba(0,51,153,0.08)' : iconColor + '1F') : (iconColor === '#16A34A' ? HS.greenBg : iconColor === '#D97706' ? HS.amberBg : HS.blueBg) }]}>
            <Ionicons name={iconName as any} size={19} color={isDarkMode && iconColor === BRAND_BLUE ? '#38BDF8' : iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              isDarkMode && { color: '#F8FAFC' },
              !item.isRead && [styles.unreadText, isDarkMode && { color: '#F8FAFC' }]
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.body, isDarkMode && { color: '#94A3B8' }]} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={[styles.time, isDarkMode && { color: '#64748B' }]}>{formatTime(item.createdAt)}</Text>
          </View>

          <View style={styles.actionsContainer}>
            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <View style={styles.unreadDot} />
              </View>
            )}
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={[styles.deleteButton, !isDarkMode && { backgroundColor: HS.redBg }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={isDarkMode ? '#DC2626' : HS.redText} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: '#1E293B' }]}>
        <Ionicons name="notifications-outline" size={40} color={isDarkMode ? '#38BDF8' : HS.blue} />
      </View>
      <Text style={[styles.emptyText, isDarkMode && { color: '#F8FAFC' }]}>No Notifications</Text>
      <Text style={[styles.emptySubtext, isDarkMode && { color: '#94A3B8' }]}>
        You'll see notifications here when you receive messages, offers, or task updates
      </Text>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : BRAND_BLUE} />
        <Text style={[styles.loadingText, isDarkMode && { color: '#94A3B8' }]}>Loading notifications...</Text>
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
        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[HS.blue]} tintColor={isDarkMode ? '#38BDF8' : HS.blue} />
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
    paddingTop: 14,
    paddingBottom: 32,
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
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: HS.muted,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: HS.cardBorder,
    shadowColor: HS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: HS.card,
    borderColor: HS.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: HS.orange,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: HS.navy,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
    color: HS.navy,
  },
  body: {
    fontSize: 13,
    color: HS.text,
    marginBottom: 6,
    lineHeight: 19,
  },
  time: {
    fontSize: 12,
    color: HS.muted,
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  unreadBadge: {
    padding: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: HS.orange,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: HS.navy,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: HS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
