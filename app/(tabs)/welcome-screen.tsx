// app/(tabs)/index.tsx (Welcome Screen with Modal)
import { useGetCategories } from '@/hooks/useTaskApi';
import { useCreateTaskStore } from '@/store/create-task-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
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

// 🔥 IMPORT YOUR NOTIFICATION MODAL
import NotificationModal from './notification-screen';

// Import the logo GIF
const MyToDoLogo = require('@/assets/MyToDoo_logo.gif');

const tasks = [
  { id: '1', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '2', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '3', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '4', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '5', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '6', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '7', name: 'Jane F.', task: 'Folding arm awning needs reset' },
];

type MaterialCommunityIconName =
  | "shovel"
  | "format-paint"
  | "broom"
  | "truck-outline"
  | "clipboard-text-outline"
  | "tools"
  | "file-document-edit-outline"
  | "wrench-outline";

// 🎬 **NEW: Video categories with 17 videos from assets**
const videoCategories: { title: string; video: any }[] = [
  { title: 'Appliance Repair', video: require('@/assets/appliance_installation_and_repair.mp4') },
  { title: 'Auto Mechanic', video: require('@/assets/auto-mechanic.mp4') },
  { title: 'Building Maintenance', video: require('@/assets/building_maintenance_and.mp4') },
  { title: 'Business & Accounting', video: require('@/assets/business_and_accounting.mp4') },
  { title: 'Carpentry', video: require('@/assets/carpentry.mp4') },
  { title: 'Carpentry Services', video: require('@/assets/carpentry2.mp4') },
  { title: 'Delivery', video: require('@/assets/delivery.mp4') },
  { title: 'Education & Tutoring', video: require('@/assets/education_and_tutoring.mp4') },
  { title: 'Electrical', video: require('@/assets/Electrical.mp4') },
  { title: 'Event Planning', video: require('@/assets/Event_Planning.mp4') },
  { title: 'Painting Services', video: require('@/assets/Painting_Services.mp4') },
  { title: 'Personal Assistant', video: require('@/assets/personal_assistence.mp4') },
  { title: 'Pet Care', video: require('@/assets/pet_care.mp4') },
  { title: 'Photography', video: require('@/assets/photography.mp4') },
  { title: 'Plumbing', video: require('@/assets/plumbing.mp4') },
  { title: 'Real Estate', video: require('@/assets/Real-estate.mp4') },
  { title: 'Something Else', video: require('@/assets/something_else.mp4') },
];

// Debug: Log video categories
console.log(`🎬 Welcome Screen - Total video categories loaded: ${videoCategories.length}`);
videoCategories.forEach((cat, index) => {
  console.log(`${index + 1}. ${cat.title} - Video ID:`, cat.video);
  
  // Additional debugging to check if video source is valid
  if (cat.video) {
    console.log(`✅ Video source exists for: ${cat.title}`);
  } else {
    console.log(`❌ Missing video source for: ${cat.title}`);
  }
});

// 🎬 **NEW: Video Category Component**
const VideoCategory = ({ title, videoSource, onPress }: { 
  title: string; 
  videoSource: any; 
  onPress: () => void;
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoRef, setVideoRef] = useState<any>(null);
  
  // Try to start playback when video is loaded
  const handleVideoLoad = async () => {
    console.log(`✅ Video loaded for: ${title}`);
    setIsLoading(false);
    if (videoRef) {
      try {
        await videoRef.playAsync();
        console.log(`🎬 Started playing: ${title}`);
      } catch (error) {
        console.log(`❌ Failed to play ${title}:`, error);
      }
    }
  };
  
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
      <View style={styles.videoContainer}>
        {!videoError ? (
          <>
            <Video
              ref={setVideoRef}
              source={videoSource}
              style={styles.videoPlayer}
              shouldPlay={true}
              isLooping={true}
              isMuted={true}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
              onError={(error) => {
                console.log(`❌ Video error for ${title}:`, error);
                setVideoError(true);
                setIsLoading(false);
              }}
              onLoad={handleVideoLoad}
              onLoadStart={() => {
                // console.log(`📥 Loading video for: ${title}`);
                setIsLoading(true);
              }}
              onPlaybackStatusUpdate={(status) => {
                // if (status.isLoaded && !status.isPlaying && !status.didJustFinish) {
                //   // console.log(`⏸️ Video paused for ${title}, attempting to resume...`);
                // } 
              }}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <MaterialCommunityIcons name="loading" size={24} color="#666" />
              </View>
            )}
          </>
        ) : (
          // Fallback to icon if video fails
          <View style={styles.videoFallback}>
            <MaterialCommunityIcons name="video-outline" size={32} color="#666" />
            <Text style={styles.fallbackText}>Video</Text>
          </View>
        )}
      </View>
      <Text style={styles.gridLabel}>{title}</Text>
    </TouchableOpacity>
  );
};

const categories: { title: string; icon: MaterialCommunityIconName }[] = [
  { title: 'Gardening', icon: 'shovel' },
  { title: 'Painting', icon: 'format-paint' },
  { title: 'Cleaning', icon: 'broom' },
  { title: 'Removals', icon: 'truck-outline' },
  { title: 'Data Entry', icon: 'clipboard-text-outline' },
  { title: 'Furniture Assembly', icon: 'tools' },
  { title: 'Copy Writing', icon: 'file-document-edit-outline' },
  { title: 'Repairs & installations', icon: 'wrench-outline' },
];

export default function GetItDoneScreen() {
  // 🔥 ADD STATE FOR MODAL
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 5; // You can make this dynamic

  // 🔥 ADD STATE FOR TASK INPUT AND NAVIGATION
  const [taskInput, setTaskInput] = useState('');
  const router = useRouter();
  const { updateMyTask, myTask } = useCreateTaskStore();

  // 🔥 FETCH CATEGORIES FROM DATABASE
  const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  // 🔄 RESET TASK INPUT WHEN TASK IS COMPLETED (STORE IS RESET)
  useFocusEffect(
    useCallback(() => {
      // Check if the task store has been reset (title is empty)
      if (!myTask.title || myTask.title === '') {
        setTaskInput('');
        console.log('🔄 Welcome screen input reset - task was completed');
      }
    }, [myTask.title])
  );

  // 🔥 ADD FUNCTIONS TO CONTROL MODAL
  const openNotifications = () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // 🔥 ADD NAVIGATION FUNCTIONS
  const handlePostTask = () => {
    if (taskInput.trim()) {
      // Save the task input to the store
      updateMyTask({ title: taskInput.trim() });
      // Navigate to title screen
      router.push('/title-screen');
    }
  };

  const handleTagPress = (tag: string) => {
    // Save the tag as task title to the store
    updateMyTask({ title: tag });
    // Navigate to title screen
    router.push('/title-screen');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#003399' }}>
      <View style={styles.headerWhite}>
        {/* Invisible placeholder to maintain layout */}
        <View style={styles.logoPlaceholder} />
        
        {/* Logo GIF */}
        <Image
          source={MyToDoLogo}
          style={styles.logoAnimation}
          resizeMode="contain"
        />
        
        {/* 🔥 CLICKABLE NOTIFICATION BELL WITH BADGE */}
        <TouchableOpacity onPress={openNotifications} style={styles.bellButton}>
          <Bell size={24} color="#fff" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Post a Task Section: blue background, below greeting */}
        <View style={styles.taskCard}>
          <Text style={styles.greetingText}>Good evening. Prasanna</Text>
          <View style={{ height: 28 }} />
          <Text style={styles.postTitle}>Post a Task. Get it Done.</Text>
          <View style={{ height: 24 }} />
          <TextInput
            style={styles.input}
            placeholder="In a few words what do you need done?"
            placeholderTextColor="#999"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <View style={{ height: 24 }} />
          <TouchableOpacity style={styles.postButton} onPress={handlePostTask}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.postButtonText}>Post a Task</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ height: 18 }} />
          {/* Tags inside blue section - NOW FROM DATABASE */}
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
              decelerationRate={0.95}
              snapToAlignment="center"
            >
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tag}
                  onPress={() => handleTagPress(category)}
                >
                  <Text style={{ color: '#fff' }}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Task Cards */}
        <Text style={styles.sectionTitle}>Get more work now</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskBox}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.task}</Text>
              <TouchableOpacity>
                <Text style={styles.messageLink}>💬 Sent a message</Text>
              </TouchableOpacity>
            </View>
          )}
          style={{ marginBottom: 10, paddingHorizontal: 10 }}
          decelerationRate={0.95}
          snapToAlignment="center"
        />

        {/* Category Grid - NOW WITH VIDEOS! */}
        <Text style={styles.sectionTitle}>Need something done</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

        <View style={styles.gridContainer}>
          {videoCategories.map((cat, index) => {
            console.log(`🎬 Rendering video category ${index + 1}: ${cat.title}`, cat.video);
            return (
              <VideoCategory
                key={index}
                title={cat.title}
                videoSource={cat.video}
                onPress={() => {
                  // Handle category selection
                  console.log(`Selected video category: ${cat.title}`);
                  // You can add navigation here if needed
                }}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* 🔥 ADD NOTIFICATION MODAL */}
      <NotificationModal
        visible={showNotifications}
        onClose={closeNotifications}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWhite: {
    backgroundColor: '#003399',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoAnimation: {
    position: 'absolute',
    top: '80%',
    transform: [{ translateY: -20 }],
    width: 120,
    height: 80,
    zIndex: 1,
  }, 
  logoPlaceholder: {
    width: 120,
    height: 40,
  },
  // 🔥 NOTIFICATION BELL STYLES
  bellButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  greetingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  taskCard: { 
    backgroundColor: '#003399', 
    paddingHorizontal: 16, 
    paddingVertical: 36 
  },
  postTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#001f66',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  postButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  tagRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tagsLoadingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  tagsErrorContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tagsErrorText: {
    color: '#ffcccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#444',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  taskBox: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 220,
  },
  name: { 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  desc: { 
    fontSize: 13, 
    color: '#333' 
  },
  messageLink: { 
    color: '#007bff', 
    marginTop: 6 
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  gridItem: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    width: '48%',
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  
  // 🎬 **NEW: Video category styles**
  videoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  },
  fallbackText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});