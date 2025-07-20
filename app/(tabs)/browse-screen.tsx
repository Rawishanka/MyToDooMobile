import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const tasks = new Array(6).fill({
  title: 'window installation',
  location: 'Dingley village VIC 3172, Australia',
  price: 'A$400',
  status: 'open',
  offers: '1 offer',
});

export default function BrowseTasksScreen() {
  const [sortVisible, setSortVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const sortOptions = [
    'Recommended',
    'Price: High to low',
    'Price: Low to High',
    'Due date: Earliest',
    'Due date: Latest',
    'Newest tasks',
    'Oldest tasks',
    'Closest to me',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-outline" size={24} />
        <Text style={styles.headerTitle}>Browse Tasks</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={20} color="#000" style={{ marginLeft: 10 }} />
        </View>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      )}

      {/* Filter & Sort Row */}
      <View style={styles.filterSortRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialCommunityIcons name="filter-variant" size={20} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSortVisible(true)}>
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskSub}>{item.location}</Text>
              <Text style={styles.taskSub}>Flexible</Text>
              <Text style={styles.taskStatus}>
                <Text style={{ color: '#007bff' }}>{item.status}</Text> {item.offers}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.taskPrice}>{item.price}</Text>
              <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  style={{ width: 32, height: 32 }}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Modal */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { transform: [{ translateY: sortVisible ? 0 : 400 }], opacity: sortVisible ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort by</Text>
              <Pressable onPress={() => setSortVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} />
              </Pressable>
            </View>
            {sortOptions.map((option, i) => (
              <TouchableOpacity key={i} style={styles.sortOption} onPress={() => { setSelectedSort(i); setSortVisible(false); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16 }}>{option}</Text>
                  {selectedSort === i && (
                    <MaterialCommunityIcons name="check" size={20} color="#007bff" style={{ marginLeft: 8 }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={searchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={{ flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-start', alignItems: 'center' }}>
            <View style={[styles.searchBarContainer, { width: '95%', marginTop: 50 }]}> 
              <TextInput
                style={styles.searchBar}
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
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 16,
  },
  sortText: {
    fontSize: 16,
    color: '#007bff',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    justifyContent: 'space-between',
    elevation: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  taskSub: {
    fontSize: 13,
    color: '#444',
  },
  taskStatus: {
    marginTop: 4,
    fontSize: 13,
  },
  taskPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sortOption: {
    paddingVertical: 10,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
});
