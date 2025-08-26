import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
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
  Switch,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

// Type definitions
interface Task {
  id: number;
  title: string;
  location: string;
  price: number;
  priceDisplay: string;
  status: string;
  offers: number;
  category: string;
  type: 'in-person' | 'remote';
  hasOffers: boolean;
  isAssigned: boolean;
  datePosted: Date;
  dueDate: Date;
  latitude?: number;
  longitude?: number;
}

// Mock data with coordinates for map display
const allTasks: Task[] = [
  {
    id: 1,
    title: 'Window installation',
    location: 'Dingley village VIC 3172, Australia',
    price: 400,
    priceDisplay: 'A$400',
    status: 'open',
    offers: 1,
    category: 'Home & Garden',
    type: 'in-person',
    hasOffers: true,
    isAssigned: false,
    datePosted: new Date('2024-01-15'),
    dueDate: new Date('2024-02-01'),
    latitude: -37.9857,
    longitude: 145.1341,
  },
  {
    id: 2,
    title: 'Logo Design',
    location: 'Remote',
    price: 150,
    priceDisplay: 'A$150',
    status: 'open',
    offers: 3,
    category: 'Design & Creative',
    type: 'remote',
    hasOffers: true,
    isAssigned: false,
    datePosted: new Date('2024-01-20'),
    dueDate: new Date('2024-01-30'),
  },
  {
    id: 3,
    title: 'Data Entry',
    location: 'Melbourne VIC, Australia',
    price: 75,
    priceDisplay: 'A$75',
    status: 'assigned',
    offers: 0,
    category: 'Admin & Data',
    type: 'remote',
    hasOffers: false,
    isAssigned: true,
    datePosted: new Date('2024-01-10'),
    dueDate: new Date('2024-01-25'),
    latitude: -37.8136,
    longitude: 144.9631,
  },
  {
    id: 4,
    title: 'House Cleaning',
    location: 'Sydney NSW 2000, Australia',
    price: 120,
    priceDisplay: 'A$120',
    status: 'open',
    offers: 2,
    category: 'Cleaning',
    type: 'in-person',
    hasOffers: true,
    isAssigned: false,
    datePosted: new Date('2024-01-18'),
    dueDate: new Date('2024-02-05'),
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    id: 5,
    title: 'Website Development',
    location: 'Remote',
    price: 800,
    priceDisplay: 'A$800',
    status: 'open',
    offers: 5,
    category: 'Technology',
    type: 'remote',
    hasOffers: true,
    isAssigned: false,
    datePosted: new Date('2024-01-12'),
    dueDate: new Date('2024-02-15'),
  },
  {
    id: 6,
    title: 'Garden Maintenance',
    location: 'Brisbane QLD 4000, Australia',
    price: 200,
    priceDisplay: 'A$200',
    status: 'open',
    offers: 0,
    category: 'Home & Garden',
    type: 'in-person',
    hasOffers: false,
    isAssigned: false,
    datePosted: new Date('2024-01-22'),
    dueDate: new Date('2024-02-10'),
    latitude: -27.4698,
    longitude: 153.0251,
  },
];

const categories = [
  'All Categories',
  'Home & Garden',
  'Design & Creative',
  'Technology',
  'Cleaning',
  'Admin & Data',
  'Business',
  'Writing & Translation',
];

export default function BrowseTasksScreen() {
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // 🔥 ADD NOTIFICATION STATE AND ROUTER
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 3; // You can make this dynamic
  const router = useRouter();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [taskType, setTaskType] = useState<'all' | 'in-person' | 'remote'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([5, 200]);
  const [availableTasksOnly, setAvailableTasksOnly] = useState(false);
  const [showTasksWithNoOffers, setShowTasksWithNoOffers] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(300);

  // 🔥 ADD NOTIFICATION FUNCTIONS
  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // Alternative: Navigate to notification screen instead of modal
  const navigateToNotifications = () => {
    router.push('/notification-screen');
  };

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

  // Filter and sort logic
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = allTasks;

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    // Apply task type filter
    if (taskType === 'in-person') {
      filtered = filtered.filter(task => task.type === 'in-person');
    } else if (taskType === 'remote') {
      filtered = filtered.filter(task => task.type === 'remote');
    }

    // Apply price range filter
    filtered = filtered.filter(task => 
      task.price >= priceRange[0] && task.price <= priceRange[1]
    );

    // Apply available tasks only filter
    if (availableTasksOnly) {
      filtered = filtered.filter(task => !task.isAssigned);
    }

    // Apply show tasks with no offers filter
    if (showTasksWithNoOffers) {
      filtered = filtered.filter(task => !task.hasOffers);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 1: // Price: High to low
          return b.price - a.price;
        case 2: // Price: Low to High
          return a.price - b.price;
        case 3: // Due date: Earliest
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 4: // Due date: Latest
          return b.dueDate.getTime() - a.dueDate.getTime();
        case 5: // Newest tasks
          return b.datePosted.getTime() - a.datePosted.getTime();
        case 6: // Oldest tasks
          return a.datePosted.getTime() - b.datePosted.getTime();
        default: // Recommended
          return 0;
      }
    });

    return sorted;
  }, [searchText, selectedCategory, taskType, priceRange, availableTasksOnly, showTasksWithNoOffers, selectedSort]);

  // Generate map HTML with markers
  const generateMapHTML = () => {
    const tasksWithCoordinates = filteredAndSortedTasks.filter(task => task.latitude && task.longitude);
    
    const markers = tasksWithCoordinates.map(task => ({
      id: task.id,
      lat: task.latitude,
      lng: task.longitude,
      title: task.title,
      price: task.priceDisplay,
      location: task.location,
      status: task.status,
      offers: task.offers,
    }));

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        #map {
            height: 100vh;
            width: 100vw;
        }
        .custom-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .popup-price {
            font-weight: bold;
            color: #007bff;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .popup-location {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        .popup-status {
            font-size: 12px;
            color: #333;
        }
        .marker-icon {
            background-color: #007bff;
            border: 2px solid white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map centered on Australia
        const map = L.map('map').setView([-25.2744, 133.7751], 4);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Task markers
        const markers = ${JSON.stringify(markers)};
        
        // Create custom icon
        function createCustomIcon(taskId) {
            return L.divIcon({
                html: '<div class="marker-icon">' + taskId + '</div>',
                className: 'custom-div-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
        }
        
        // Add markers to map
        markers.forEach(marker => {
            const popupContent = \`
                <div class="custom-popup">
                    <div class="popup-title">\${marker.title}</div>
                    <div class="popup-price">\${marker.price}</div>
                    <div class="popup-location">\${marker.location}</div>
                    <div class="popup-status">\${marker.status} • \${marker.offers} offer\${marker.offers !== 1 ? 's' : ''}</div>
                </div>
            \`;
            
            L.marker([marker.lat, marker.lng], {
                icon: createCustomIcon(marker.id)
            })
            .bindPopup(popupContent)
            .addTo(map);
        });
        
        // Fit map to markers if there are any
        if (markers.length > 0) {
            const group = new L.featureGroup(map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    return layer;
                }
            }));
            
            if (markers.length === 1) {
                map.setView([markers[0].lat, markers[0].lng], 12);
            } else {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    </script>
</body>
</html>
    `;
  };

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setTaskType('all');
    setPriceRange([5, 200]);
    setAvailableTasksOnly(false);
    setShowTasksWithNoOffers(false);
  };

  const handleSliderTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    const value = Math.round(5 + (percentage * 195)); // 5 to 200 range
    
    // For simplicity, we'll just update the max value
    if (percentage > 0.5) {
      setPriceRange([priceRange[0], value]);
    } else {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'All Categories') count++;
    if (taskType !== 'all') count++;
    if (priceRange[0] !== 5 || priceRange[1] !== 200) count++;
    if (availableTasksOnly) count++;
    if (showTasksWithNoOffers) count++;
    return count;
  };

  const renderTaskCard = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskSub}>{item.location}</Text>
        <Text style={styles.taskSub}>Flexible</Text>
        <Text style={styles.taskStatus}>
          <Text style={{ color: item.status === 'open' ? '#007bff' : '#666' }}>
            {item.status}
          </Text>
          {' '}{item.offers} offer{item.offers !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.taskPrice}>{item.priceDisplay}</Text>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://randomuser.me/api/portraits/men/${item.id}.jpg` }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
          <MaterialCommunityIcons 
            name={viewMode === 'list' ? 'map-outline' : 'format-list-bulleted'} 
            size={24} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Tasks</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={20} color="#000" />
          </TouchableOpacity>
          {/* 🔥 UPDATED NOTIFICATION BELL WITH BADGE AND NAVIGATION */}
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
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setFilterVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} />
          <Text style={styles.filterText}>
            Filter {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSortVisible(true)}>
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Content - Map or List */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHTML() }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
          />
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedTasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={renderTaskCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks found matching your criteria</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterModal}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#007bff" />
            </TouchableOpacity>
            <Text style={styles.filterTitle}>Filter</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Categories */}
            <View style={[styles.filterSection, { zIndex: categoryDropdownVisible ? 1000 : 1 }]}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
              >
                <Text style={styles.dropdownText}>{selectedCategory}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              {categoryDropdownVisible && (
                <View style={styles.dropdownList}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dropdownItem, index === categories.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => {
                        setSelectedCategory(category);
                        setCategoryDropdownVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCategory === category && styles.selectedDropdownItem
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* To be done */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>To be done</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'in-person' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType(taskType === 'in-person' ? 'all' : 'in-person')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'in-person' && styles.typeButtonTextActive
                  ]}>
                    In person
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'remote' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType(taskType === 'remote' ? 'all' : 'remote')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'remote' && styles.typeButtonTextActive
                  ]}>
                    Remotely
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    taskType === 'all' && styles.typeButtonActive
                  ]}
                  onPress={() => setTaskType('all')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    taskType === 'all' && styles.typeButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Price</Text>
              <Text style={styles.priceRangeText}>
                A${priceRange[0]} - A${priceRange[1]}
              </Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.sliderTrack}
                  onPress={handleSliderTouch}
                  onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                  activeOpacity={1}
                >
                  <View 
                    style={[
                      styles.sliderFill,
                      {
                        left: `${((priceRange[0] - 5) / 195) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / 195) * 100}%`
                      }
                    ]}
                  />
                  <View 
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${((priceRange[0] - 5) / 195) * 100}%`,
                      }
                    ]}
                  />
                  <View 
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${((priceRange[1] - 5) / 195) * 100}%`,
                      }
                    ]}
                  />
                </TouchableOpacity>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>A$5</Text>
                  <Text style={styles.sliderLabel}>A$200+</Text>
                </View>
              </View>
            </View>

            {/* Other filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Other filters</Text>
              
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Available tasks only</Text>
                  <Text style={styles.switchSubtitle}>Hide tasks that are already assigned</Text>
                </View>
                <Switch
                  value={availableTasksOnly}
                  onValueChange={setAvailableTasksOnly}
                  trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Show tasks with no offers</Text>
                  <Text style={styles.switchSubtitle}>Hide tasks that have offers</Text>
                </View>
                <Switch
                  value={showTasksWithNoOffers}
                  onValueChange={setShowTasksWithNoOffers}
                  trackColor={{ false: '#e0e0e0', true: '#007bff' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom buttons */}
          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort by</Text>
              <Pressable onPress={() => setSortVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} />
              </Pressable>
            </View>
            {sortOptions.map((option, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.sortOption} 
                onPress={() => { 
                  setSelectedSort(i); 
                  setSortVisible(false); 
                }}
              >
                <View style={styles.sortOptionContent}>
                  <Text style={styles.sortOptionText}>{option}</Text>
                  {selectedSort === i && (
                    <MaterialCommunityIcons name="check" size={20} color="#007bff" style={{ marginLeft: 8 }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={styles.searchModalOverlay}>
            <View style={styles.searchModalContent}>
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
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webView: {
    flex: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItem: {
    color: '#007bff',
    fontWeight: '600',
  },
  buttonGroup: {
    gap: 12,
  },
  typeButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonPrimary: {
    backgroundColor: '#f5f5f5',
  },
  typeButtonActive: {
    backgroundColor: '#1a237e',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  typeButtonTextPrimary: {
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceRangeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  sliderContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 12,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#007bff',
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    position: 'absolute',
    top: -7,
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortOptionText: {
    fontSize: 16,
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
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchModalContent: {
    width: '95%',
    marginTop: 50,
  },
});

 