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
import { RFValue } from '@/src/shared/utils/responsive';

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
        <StatusBar barStyle="light-content" backgroundColor="#003399" />
        
        {/* Header */}
        <View style={styles.menuHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
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
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.taskDetailText}>Remote</Text>
            </View>
            
            <View style={styles.taskDetailRow}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
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
    backgroundColor: '#003399',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    backgroundColor: '#003399',
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
    backgroundColor: '#003399',
    paddingTop: 40,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelledTitle: {
    fontSize: RFValue(20),
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  cancelledSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 30,
  },
  postTaskButton: {
    backgroundColor: '#ff6b35',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 40,
  },
  postTaskButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  taskDetailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 0,
  },
  taskTitle: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskDetailText: {
    fontSize: RFValue(16),
    color: '#fff',
    marginLeft: 8,
    fontWeight: '400',
  },
  currencySymbol: {
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  budgetLabel: {
    fontSize: RFValue(12),
    color: 'rgba(255,255,255,0.72)',
    marginLeft: 8,
    marginTop: 2,
  },
  taskDescription: {
    fontSize: RFValue(14),
    color: '#fff',
    marginTop: 15,
    lineHeight: 18,
  },
  bottomMenuContainer: {
    backgroundColor: '#00287A',
    paddingBottom: 40,
  },
  moreOptionsText: {
    fontSize: RFValue(14),
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  menuOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  menuOptionText: {
    fontSize: RFValue(16),
    color: '#fff',
    textAlign: 'center',
    fontWeight: '400',
  },
  cancelOptionText: {
    fontSize: RFValue(16),
    color: '#fff',
    textAlign: 'center',
    fontWeight: '400',
  },
});
