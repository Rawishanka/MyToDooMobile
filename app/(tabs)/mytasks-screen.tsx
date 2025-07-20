import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
          <Ionicons name="notifications-outline" size={20} color="#000" style={{ marginLeft: 10 }} />
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

      {/* Modal Filter */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

          <View style={styles.modalContent} pointerEvents="box-none">
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} />
              </Pressable>
            </View>

            {TASK_FILTERS.map((filter, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={() => handleFilterPress(filter)}>
                <Text style={{ fontSize: 16, color: '#002A5C' }}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
});
