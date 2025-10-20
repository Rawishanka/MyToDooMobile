// app/(tabs)/welcome-screen.tsx - Clean version with fixed recursive logging
import { useGetCategories } from '@/hooks/useTaskApi';
import { useCreateTaskStore } from '@/store/create-task-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationModal from './notification-screen';

// 🎬 **NEW: Video Categories with proper sources**
const videoCategories: { title: string; video: any }[] = [
  { title: 'Carpentry', video: require('@/assets/carpentry.mp4') },
  { title: 'Auto Mechanic', video: require('@/assets/auto-mechanic.mp4') },
  { title: 'Plumbing', video: require('@/assets/plumbing.mp4') },
  { title: 'Real Estate', video: require('@/assets/Real-estate.mp4') },
  { title: 'Something Else', video: require('@/assets/something_else.mp4') },
];

// 🎬 **Video Category Component**
const VideoCategory = ({ title, videoSource, onPress }: { 
  title: string; 
  videoSource: any; 
  onPress: () => void;
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoRef, setVideoRef] = useState<any>(null);
  
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
              style={styles.video}
              source={videoSource}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping={true}
              isMuted={true}
              onLoad={handleVideoLoad}
              onError={(error) => {
                console.log(`❌ Video error for ${title}:`, error);
                setVideoError(true);
                setIsLoading(false);
              }}
              onPlaybackStatusUpdate={(status) => {
                if (!status.isLoaded) {
                  // console.log(`📥 Loading video for: ${title}`);
                } else if (status.isLoaded && !status.isPlaying && !status.isBuffering) {
                  // Video is loaded but not playing - try to resume
                  // if (videoRef && !status.didJustFinish) {
                  //   // console.log(`⏸️ Video paused for ${title}, attempting to resume...`);
                  //   // videoRef.playAsync().catch(err => console.log(`Failed to resume ${title}:`, err));
                  // }
                }
              }}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <MaterialCommunityIcons name="loading" size={24} color="#666" />
              </View>
            )}
          </>
        ) : (
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

export default function WelcomeScreen() {
  const router = useRouter();
  const [taskInput, setTaskInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useGetCategories();
  const { updateMyTask, myTask } = useCreateTaskStore();

  // Debug: Log video categories - only once on mount
  useEffect(() => {
    console.log(`🎬 Welcome Screen - Total video categories loaded: ${videoCategories.length}`);
    videoCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.title} - Video ID:`, cat.video);
      
      if (cat.video) {
        console.log(`✅ Video source exists for: ${cat.title}`);
      } else {
        console.log(`❌ Missing video source for: ${cat.title}`);
      }
    });
  }, []); // Empty dependency array - runs only once

  // Reset task input when task is completed
  useFocusEffect(
    useCallback(() => {
      if (!myTask.title || myTask.title === '') {
        setTaskInput('');
        console.log('🔄 Welcome screen input reset - task was completed');
      }
    }, [myTask.title])
  );

  const handlePostTask = () => {
    if (taskInput.trim()) {
      updateMyTask({
        mainGoal: taskInput,
        title: taskInput
      });
      router.push('/title-screen');
    }
  };

  const handleTagPress = (tag: string) => {
    setTaskInput(tag);
    updateMyTask({
      mainGoal: tag,
      title: tag
    });
    router.push('/title-screen');
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

      <ScrollView 
        style={{ flex: 1, backgroundColor: '#f8f9fa' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue Section with Input */}
        <View style={styles.blueSection}>
          <Text style={styles.title}>Get it Done Now🔥</Text>
          <Text style={styles.subtitle}>
            Describe your job and get offers from mytoodoers
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
              {((categories?.data as string[]) || []).map((category: string, index: number) => (
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

        {/* Video Categories Grid */}
        <Text style={styles.sectionTitle}>Need something done</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

        <View style={styles.gridContainer}>
          {videoCategories.map((cat, index) => {
            return (
              <VideoCategory
                key={index}
                title={cat.title}
                videoSource={cat.video}
                onPress={() => {
                  console.log(`Selected video category: ${cat.title}`);
                  // Handle category selection
                }}
              />
            );
          })}
        </View>
      </ScrollView>

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
    paddingTop: 32,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoPlaceholder: {
    width: 24,
  },
  logoCenter: {
    height: 40,
    width: 120,
  },
  notificationButton: {
    position: 'relative',
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
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  postButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
    marginTop: 30,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridItem: {
    width: '45%',
    marginBottom: 20,
  },
  videoContainer: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
});