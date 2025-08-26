import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

const TASK_FILTERS = [
  'All tasks',
  'Posted tasks',
  'Booking requests',
  'Task assigned',
  'Offers pending',
  'Task completed',
];

export default function MyTasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All tasks');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  // 🔥 ADD NOTIFICATION STATE
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 5; // You can make this dynamic

  // 🔥 ADD NOTIFICATION FUNCTIONS
  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          {/* 🔥 UPDATE NOTIFICATION ICON TO BE CLICKABLE */}
          <TouchableOpacity onPress={openNotifications} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#000" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.filterRow}>
        <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 16 }}>
          <Pressable onPress={() => setModalVisible(true)} style={styles.filterButton}>
            <Ionicons name="chevron-down" size={16} color="#333" />
            <Text style={styles.filterText}>{selectedFilter}</Text>
          </Pressable>
        </View>
      </View>

      {/* Tasks Placeholder */}
      <FlatList
        data={Array(5).fill({ title: 'window installation', location: 'Dingley village VIC 3172, Australia', price: 'A$400' })}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSub}>{item.location}</Text>
                <Text style={styles.completed}>Completed</Text>
              </View>
              <View style={{ alignItems: 'center', marginLeft: 12 }}>
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eee' }}
                  resizeMode="cover"
                />
                <Text style={styles.price}>{item.price}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Modal Filter - 🔥 FIXED TO SHOW AT TOP */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Tasks</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              {TASK_FILTERS.map((filter, index) => (
                <TouchableOpacity key={index} style={styles.option} onPress={() => handleFilterPress(filter)}>
                  <Text style={[
                    styles.optionText, 
                    selectedFilter === filter && styles.selectedOptionText
                  ]}>
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <Ionicons name="checkmark" size={20} color="#002A5C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Search Bar Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={{ flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-start', alignItems: 'center' }}>
            <View style={{ width: '95%', marginTop: 50, paddingHorizontal: 16 }}>
              <TextInput
                ref={searchInputRef}
                style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#eee' }}
                placeholder="Search tasks..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => setSearchVisible(false)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 🔥 ADD NOTIFICATION MODAL */}
      <NotificationModal
        visible={showNotifications}
        onClose={closeNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    height: 56,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 🔥 ADD NOTIFICATION BUTTON STYLES
  notificationButton: {
    position: 'relative',
    marginLeft: 10,
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 16,
    color: '#002A5C',
  },
  taskCard: {
    marginHorizontal: 16,
    backgroundColor: '#F9F9F9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskSub: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  completed: {
    fontSize: 14,
    color: 'green',
    fontWeight: '500',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  // 🔥 FIXED MODAL STYLES TO SHOW AT TOP
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'flex-end' to 'flex-start'
    paddingTop: 100, // Add some top padding to position it nicely below header
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '60%', // Limit height to prevent it from taking full screen
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002A5C',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#002A5C',
    fontWeight: '600',
  },
});