// components/NotificationModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Define notification item type
interface NotificationItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: { uri: string };
}

// Define component props types
interface NotificationItemProps {
  item: NotificationItem;
  onMenuPress: (item: NotificationItem) => void;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onPostTaskAgain?: () => void;
  onEditTask?: () => void;
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onPostTaskAgain: () => void;
  selectedNotification: NotificationItem | null;
}

// Sample notification data - matching your image
const notificationsData: NotificationItem[] = [
  {
    id: '1',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '2',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '3',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
  {
    id: '4',
    user: 'nebulan.d',
    action: 'commented on Help me with Excel',
    time: '3 weeks ago',
    avatar: { uri: 'https://ui-avatars.com/api/?name=N+D&background=FF6B6B&color=fff&size=40' },
  },
];

// Construction Icon Component
const ConstructionIcon: React.FC = () => (
  <View style={styles.constructionContainer}>
    {/* Traffic Cones */}
    <View style={styles.cone1}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
    
    {/* Construction Barrier */}
    <View style={styles.barrier}>
      <View style={styles.barrierPost1} />
      <View style={styles.barrierPost2} />
      <View style={styles.barrierBoard}>
        <View style={styles.barrierStripe1} />
        <View style={styles.barrierStripe2} />
        <View style={styles.barrierStripe3} />
      </View>
    </View>
    
    <View style={styles.cone2}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
    
    <View style={styles.cone3}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
  </View>
);

// Menu Modal Component
const MenuModal: React.FC<MenuModalProps> = ({ 
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

// Edit Task Modal Component
const EditTaskModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ 
  visible, 
  onClose 
}) => {
  const [taskTitle, setTaskTitle] = useState('Help me with Excel');
  const [selectedDateOption, setSelectedDateOption] = useState('before');
  const [isOnline, setIsOnline] = useState(true);
  const [needsTimeOfDay, setNeedsTimeOfDay] = useState(false);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.editContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>Edit task</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.editContent}>
          {/* Task Title */}
          <Text style={styles.sectionLabel}>Task title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task title"
            />
          </View>

          {/* Task Date */}
          <Text style={styles.sectionLabel}>Task date</Text>
          
          <TouchableOpacity 
            style={[
              styles.dateOption, 
              selectedDateOption === 'before' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('before')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'before' && styles.dateOptionTextSelected
            ]}>
              Before Tue, 19 Aug
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dateOption,
              selectedDateOption === 'ondate' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('ondate')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'ondate' && styles.dateOptionTextSelected
            ]}>
              On date
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dateOption,
              selectedDateOption === 'flexible' && styles.dateOptionSelected
            ]}
            onPress={() => setSelectedDateOption('flexible')}
          >
            <Text style={[
              styles.dateOptionText,
              selectedDateOption === 'flexible' && styles.dateOptionTextSelected
            ]}>
              I'm flexible
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setNeedsTimeOfDay(!needsTimeOfDay)}
          >
            <View style={[styles.checkbox, needsTimeOfDay && styles.checkboxChecked]}>
              {needsTimeOfDay && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>I need a certain time of day</Text>
          </TouchableOpacity>

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              style={[
                styles.locationOption, 
                !isOnline && styles.locationOptionSelected
              ]}
              onPress={() => setIsOnline(false)}
            >
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={!isOnline ? "#fff" : "#666"} 
                style={styles.locationIcon}
              />
              <Text style={[
                styles.locationTitle,
                !isOnline && styles.locationTitleSelected
              ]}>
                In Person
              </Text>
              <Text style={[
                styles.locationDescription,
                !isOnline && styles.locationDescriptionSelected
              ]}>
                This task has to be done{'\n'}in person
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.locationOption,
                isOnline && styles.locationOptionSelected
              ]}
              onPress={() => setIsOnline(true)}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={isOnline ? "#fff" : "#666"}
                style={styles.locationIcon}
              />
              <Text style={[
                styles.locationTitle,
                isOnline && styles.locationTitleSelected
              ]}>
                Online
              </Text>
              <Text style={[
                styles.locationDescription,
                isOnline && styles.locationDescriptionSelected
              ]}>
                This task can to be done{'\n'}from anywhere
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={onClose}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onMenuPress }) => (
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

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  visible, 
  onClose, 
  onPostTaskAgain, 
  onEditTask 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleMenuPress = (item: NotificationItem) => {
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
            data={notificationsData}
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
  
  // Header
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
    width: 32, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  
  // Notifications List
  notificationsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
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
    paddingTop: 2,
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

  // Menu Modal Styles
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
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  menuContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },

  // Construction Icon Styles
  iconSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  constructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    width: 200,
  },
  cone1: {
    position: 'absolute',
    left: 20,
    bottom: 0,
  },
  cone2: {
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  cone3: {
    position: 'absolute',
    right: 60,
    bottom: 0,
  },
  coneBase: {
    width: 20,
    height: 25,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    // clipPath: 'polygon(20% 100%, 80% 100%, 90% 0%, 10% 0%)',
  },
  coneTop: {
    position: 'absolute',
    top: -3,
    left: 8,
    width: 4,
    height: 8,
    backgroundColor: '#D32F2F',
    borderRadius: 2, 
  },
  coneStripe: {
    position: 'absolute',
    top: 8,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: '#fff',
  },
  barrier: {
    position: 'relative',
    alignItems: 'center',
    bottom: 0,
  },
  barrierPost1: {
    position: 'absolute',
    left: -15,
    bottom: 0,
    width: 4,
    height: 35,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  barrierPost2: {
    position: 'absolute',
    right: -15,
    bottom: 0,
    width: 4,
    height: 35,
    borderRadius: 2,
    backgroundColor: '#8B4513',
  },
  barrierBoard: {
    width: 60,
    height: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    position: 'relative',
    bottom: 15,
  },
  barrierStripe1: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  barrierStripe2: {
    position: 'absolute',
    left: 20,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  barrierStripe3: {
    position: 'absolute',
    left: 38,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },

  // Cancellation Text
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

  // Post Task Button
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

  // Task Details
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

  // Bottom Menu
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

  // Edit Task Modal Styles
  editContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editHeader: {
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
  editHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    flex: 1,
  },
  editContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 25,
  },
  inputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 20,
  },
  dateOption: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateOptionSelected: {
    backgroundColor: '#1a237e',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  locationOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 120,
  },
  locationOptionSelected: {
    backgroundColor: '#1a237e',
  },
  locationIcon: {
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationTitleSelected: {
    color: '#fff',
  },
  locationDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
  },
  locationDescriptionSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});