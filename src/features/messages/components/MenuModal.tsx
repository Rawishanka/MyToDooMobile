// Menu Modal Component for cancelled task actions

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ConstructionIcon } from './ConstructionIcon';
import type { NotificationItem } from './message-types';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onPostTaskAgain: () => void;
  selectedNotification: NotificationItem | null;
}

export const MenuModal: React.FC<MenuModalProps> = ({ 
  visible, 
  onClose, 
  onPostTaskAgain, 
  selectedNotification 
}) => {
  const handleNotificationSettings = () => {
    onClose();
    // Handle notification settings
  };

  const handlePostSimilarTask = () => {
    onClose();
    // Handle post similar task
  };

  const handleCancel = () => {
    onClose();
  };

  const handlePostTaskAgain = () => {
    onPostTaskAgain();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.menuContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        {/* Header */}
        <View style={styles.menuHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuContent}>
          {/* Construction Icon */}
          <View style={styles.iconSection}>
            <ConstructionIcon />
          </View>

          {/* Cancellation Info */}
          <Text style={styles.cancelledTitle}>This task has been cancelled</Text>
          <Text style={styles.cancelledSubtitle}>Cancelled by Prasanna on Jul 15</Text>

          {/* Post Task Again Button */}
          <TouchableOpacity 
            style={styles.postTaskButton}
            onPress={handlePostTaskAgain}
          >
            <Text style={styles.postTaskButtonText}>Post task again</Text>
          </TouchableOpacity>

          {/* Task Details */}
          <View style={styles.taskDetailsContainer}>
            <Text style={styles.taskTitle}>Help me with Excel</Text>
            
            <View style={styles.taskDetailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.taskDetailText}>Remote</Text>
            </View>
            
            <View style={styles.taskDetailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.taskDetailText}>Flexible</Text>
            </View>
            
            <View style={styles.taskDetailRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <View>
                <Text style={styles.taskDetailText}>20 AUD</Text>
                <Text style={styles.budgetLabel}>Budget</Text>
              </View>
            </View>

            <Text style={styles.taskDescription}>Copy some contents from the</Text>
          </View>
        </View>

        {/* Bottom Menu Options */}
        <View style={styles.bottomMenuContainer}>
          <Text style={styles.moreOptionsText}>More options</Text>
          
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={handleNotificationSettings}
          >
            <Text style={styles.menuOptionText}>Notification settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={handlePostSimilarTask}
          >
            <Text style={styles.menuOptionText}>Post similar task</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={handleCancel}
          >
            <Text style={styles.cancelOptionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  menuContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  cancelledSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  postTaskButton: {
    backgroundColor: '#1a237e',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 40,
  },
  postTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  taskDetailsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 0,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskDetailText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8,
    fontWeight: '400',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    marginTop: 2,
  },
  taskDescription: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 15,
    lineHeight: 18,
  },
  bottomMenuContainer: {
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  moreOptionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  menuOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '400',
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '400',
  },
});
