// components/NotificationScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from '@/src/shared/utils/responsive';
import { HS } from '@/src/shared/theme/homeStyle';

interface NotificationItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: ImageSourcePropType;
}

interface NotificationItemProps {
  item: NotificationItem;
}

interface NotificationScreenProps {
  visible: boolean;
  onClose: () => void;
}

// Sample notification data
const notificationsData: NotificationItem[] = [
  {
    id: '1',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=4CAF50&color=fff&size=40' },
  },
  {
    id: '2',
    user: 'jane.f',
    action: 'assigned you a task: Window installation',
    time: '1 day ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=J+F&background=2196F3&color=fff&size=40' },
  },
  {
    id: '3',
    user: 'mike.r',
    action: 'sent you a message',
    time: '2 hours ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=M+R&background=FF9800&color=fff&size=40' },
  },
  {
    id: '4',
    user: 'sarah.k',
    action: 'made an offer on Garden Maintenance',
    time: '5 hours ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=S+K&background=9C27B0&color=fff&size=40' },
  },
  {
    id: '5',
    user: 'david.l',
    action: 'completed task: House Cleaning',
    time: '1 week ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=D+L&background=F44336&color=fff&size=40' },
  },
];

const NotificationItem: React.FC<NotificationItemProps> = ({ item }) => (
  <View style={styles.notificationItem}>
    <Image source={item.avatar} style={styles.avatar} />
    <View style={styles.notificationContent}>
      <Text style={styles.notificationText}>
        <Text style={styles.username}>{item.user}</Text> {item.action}
      </Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  </View>
);

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Notifications List */}
          <FlatList
            data={notificationsData}
            renderItem={({ item }) => <NotificationItem item={item} />}
            keyExtractor={(item) => item.id}
            style={styles.notificationsList}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: HS.page,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
    minHeight: '60%',
  },

  // Notification Screen Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: HS.blue,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },

  // Notifications List
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HS.cardBorder,
    alignItems: 'center',
    shadowColor: HS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationText: {
    fontSize: RFValue(14),
    color: HS.navy,
    lineHeight: 19,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    color: HS.navy,
  },
  timeText: {
    fontSize: RFValue(12),
    color: HS.muted,
  },
});
