// app/(tabs)/welcome-screen.tsx - Updated with category images
import NotificationModal from '@/src/features/messages/screens/notification-screen';
import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// � **ALL Category Images with proper sources**
const categoryImages: { id: string; title: string; image: string }[] = [
  { id: '1', title: 'Appliance Installation & Repair', image: 'https://i.ibb.co/W49F1KXP/Appliance-Instolation.png' },
  { id: '2', title: 'Auto Mechanic & Electrician', image: 'https://i.ibb.co/RGGCd2BP/Auto-mechanicle-and-Electrician.png' },
  { id: '3', title: 'Building Maintenance', image: 'https://i.ibb.co/k2yvpj3x/Building-Maintences-and-Renovations.png' },
  { id: '4', title: 'Business & Accounting', image: 'https://i.ibb.co/xtRGxgSy/Business-and-accounting.png' },
  { id: '5', title: 'Carpentry', image: 'https://i.ibb.co/W40cZb10/carpentry.png' },
  { id: '6', title: 'Delivery', image: 'https://i.ibb.co/6Rfyg45C/Delivery.png' },
  { id: '7', title: 'Education & Tutoring', image: 'https://i.ibb.co/7N2KYVg8/Education-and-Tutoring.png' },
  { id: '8', title: 'Electrical', image: 'https://i.ibb.co/tpB3FBRZ/Electrical.png' },
  { id: '9', title: 'Event Planning', image: 'https://i.ibb.co/3YPP7TRg/Event-Planning.png' },
  { id: '10', title: 'Furniture Repair', image: 'https://i.ibb.co/TMDZLQnw/furniture-repair-and-fl.png' },
  { id: '11', title: 'Graphic Design', image: 'https://i.ibb.co/s9zXGDBM/Graphic-Design.png' },
  { id: '12', title: 'Handyman & Handywomen', image: 'https://i.ibb.co/qMJDNCSy/Handyman-and-handywomen.png' },
  { id: '13', title: 'Health & Fitness', image: 'https://i.ibb.co/1J2Z4Vg5/health-and-fitness.png' },
  { id: '14', title: 'IT & Tech', image: 'https://i.ibb.co/WpHmsKRR/IT-and-Tech.png' },
  { id: '15', title: 'Legal Services', image: 'https://i.ibb.co/DfC74zpp/Legal-services.png' },
  { id: '16', title: 'Marketing', image: 'https://i.ibb.co/S4HF67H9/Marketing.png' },
  { id: '17', title: 'Music', image: 'https://i.ibb.co/YBwCYf8S/Music.png' },
  { id: '18', title: 'Painting', image: 'https://i.ibb.co/B58CyKLF/Painting-Services.png' },
  { id: '19', title: 'Personal Assistance', image: 'https://i.ibb.co/cScgX7jF/Personal-Assist.png' },
  { id: '20', title: 'Pet Care', image: 'https://i.ibb.co/TDSZJTq0/pet-care.png' },
  { id: '21', title: 'Photography', image: 'https://i.ibb.co/mrjdhnYG/Photography.png' },
  { id: '22', title: 'Plumbing', image: 'https://i.ibb.co/1G5rz4Yb/Plumbing.png' },
  { id: '23', title: 'Real Estate', image: 'https://i.ibb.co/dsrjsRJQ/Realestate.png' },
  { id: '24', title: 'Something Else', image: 'https://i.ibb.co/8LH3kKMD/somthing-else.png' },
  { id: '25', title: 'Tours & Transport', image: 'https://i.ibb.co/XrX1FRwV/Tours-and.png' },
  { id: '26', title: 'Web & App Development', image: 'https://i.ibb.co/9kPKTPzy/web-App-development.png' },
];

// � **Image Category Component for Carousel**
const ImageCategory = ({ item }: { item: typeof categoryImages[0] }) => {
  return (
    <View style={styles.carouselItem}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.carouselLabel} numberOfLines={2}>{item.title}</Text>
    </View>
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const [taskInput, setTaskInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useGetCategories();
  const { updateMyTask, myTask } = useCreateTaskStore();

  // Auto-scroll carousel refs and state
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % categoryImages.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Reset task input when task is completed
  useFocusEffect(
    useCallback(() => {
      if (!myTask.title || myTask.title === '') {
        setTaskInput('');
      }
    }, [myTask.title])
  );

  const handlePostTask = () => {
    if (taskInput.trim()) {
      updateMyTask({
        mainGoal: taskInput,
        title: taskInput
      });
      router.push('/(welcome-screen)/title-screen' as any);
    }
  };

  const handleTagPress = (tag: string) => {
    setTaskInput(tag);
    updateMyTask({
      mainGoal: tag,
      title: tag
    });
    router.push('/(welcome-screen)/title-screen' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#003399' }}>
      {/* Header */}
      <View style={styles.headerWhite}>
        <View style={styles.logoPlaceholder} />
        
        <Image
          source={require('@/assets/MyToDoo_logo.gif')}
          style={styles.logoCenter} 
          resizeMode="contain"
        />
        
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={() => setShowNotifications(true)}
        >
          <Bell size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>5</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* Blue Section with Input */}
        <View style={styles.blueSection}>
          <Text style={styles.title}>Get it Done Now🔥</Text>
          <Text style={styles.subtitle}>
            Describe your job and get offers from mytoodoo
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="In a few words what do you need done?"
            placeholderTextColor="#999"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          
          <TouchableOpacity style={styles.postButton} onPress={handlePostTask}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.postButtonText}>Post a Task</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
          
          {/* Database Categories Tags */}
          {loadingCategories ? (
            <View style={styles.tagsLoadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.tagsLoadingText}>Loading categories...</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.tagsErrorContainer}>
              <Text style={styles.tagsErrorText}>Failed to load categories</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagRow}
            >
              {((categories?.data || []).map((cat: any) => typeof cat === 'string' ? cat : cat.name) || []).map((categoryName: string, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tag}
                  onPress={() => handleTagPress(categoryName)}
                >
                  <Text style={{ color: '#fff' }}>{categoryName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Auto-Scrolling Video Categories Carousel */}
        <Text style={styles.sectionTitle}>Need something done</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={categoryImages}
            renderItem={({ item }) => <ImageCategory item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth * 0.35 + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            getItemLayout={(data, index) => ({
              length: screenWidth * 0.35 + 12,
              offset: (screenWidth * 0.35 + 12) * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {Array.from({ length: Math.min(10, categoryImages.length) }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  Math.floor(currentIndex / 3) === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWhite: {
    backgroundColor: '#003399',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  logoPlaceholder: {
    width: 24,
    flexShrink: 0, // Prevent shrinking
  },
  logoCenter: {
    height: 150,
    width: 240,
    flexShrink: 0,
  },
  notificationButton: {
    position: 'relative',
    width: 24,
    flexShrink: 0, // Prevent disappearing
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  blueSection: {
    backgroundColor: '#003399',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  tagsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsLoadingText: {
    color: '#fff',
    marginLeft: 8,
  },
  tagsErrorContainer: {
    alignItems: 'center',
  },
  tagsErrorText: {
    color: '#ff6b35',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  // NEW: Auto-scrolling Carousel Styles (show 5 at a time)
  carouselContainer: {
    paddingVertical: 8,
    paddingBottom: 20,
    marginBottom: 0,
  },
  carouselContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  carouselItem: {
    width: screenWidth * 0.35,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.35,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E3F2FD',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '90%', // Slightly smaller than container to show full image
    height: '90%', // Slightly smaller than container to show full image
    backgroundColor: '#E3F2FD',
  },
  carouselLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  // Pagination Dots
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 51, 153, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#003399',
    width: 18,
  },
});