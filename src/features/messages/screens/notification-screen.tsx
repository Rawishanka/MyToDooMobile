// Refactored Notification Screen - Main Orchestrator

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../components/NotificationItem';
import { MenuModal } from '../components/MenuModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { NOTIFICATIONS_DATA } from '../components/message-types';
import type { NotificationItem as NotificationItemType } from '../components/message-types';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onPostTaskAgain?: () => void;
  onEditTask?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  visible, 
  onClose, 
  onPostTaskAgain, 
  onEditTask 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItemType | null>(null);

  const handleMenuPress = (item: NotificationItemType) => {
    setSelectedNotification(item);
    setShowMenu(true);
  };

  const handlePostTaskAgain = () => {
    setShowMenu(false);
    setShowEditTask(true);
    if (onPostTaskAgain) {
      onPostTaskAgain();
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Notifications List */}
          <FlatList
            data={NOTIFICATIONS_DATA}
            renderItem={({ item }) => (
              <NotificationItem item={item} onMenuPress={handleMenuPress} />
            )}
            keyExtractor={(item) => item.id}
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      </Modal>

      {/* Menu Modal */}
      <MenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onPostTaskAgain={handlePostTaskAgain}
        selectedNotification={selectedNotification}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        visible={showEditTask}
        onClose={() => setShowEditTask(false)}
      />
    </>
  );
};

export default NotificationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  notificationsList: {
    flex: 1,
  },
});
