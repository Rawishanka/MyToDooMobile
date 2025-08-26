// app/(tabs)/index.tsx (Welcome Screen with Modal)
import { useCreateTaskStore } from '@/store/create-task-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  FlatList,
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

// Import the Lottie animation
import LottieAnimation from '@/assets/animations/lottie-animation.json';

const tags = ['End of lease cleaning', 'Help me move', 'Fix lights', 'Help me move', 'Help me move', 'Help me move', 'Help me move'];
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
  const { updateMyTask } = useCreateTaskStore();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerWhite}>
        {/* Invisible placeholder to maintain layout */}
        <View style={styles.logoPlaceholder} />
        
        {/* Absolute positioned Lottie Animation */}
        <LottieView
          source={LottieAnimation}
          style={styles.logoAnimation}
          autoPlay={true}
          loop={false}
          speed={1}
        />
        
        {/* 🔥 CLICKABLE NOTIFICATION BELL WITH BADGE */}
        <TouchableOpacity onPress={openNotifications} style={styles.bellButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#003399" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1 }}>
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
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ height: 18 }} />
          {/* Tags inside blue section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagRow}
            decelerationRate={0.95}
            snapToAlignment="center"
          >
            {tags.map((tag, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.tag}
                onPress={() => handleTagPress(tag)}
              >
                <Text style={{ color: '#fff' }}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Category Grid */}
        <Text style={styles.sectionTitle}>Need something done</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

        <View style={styles.gridContainer}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} style={styles.gridItem}>
              <MaterialCommunityIcons name={cat.icon} size={32} color="#000" />
              <Text style={styles.gridLabel}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#fff',
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
    backgroundColor: '#e8f0fe',
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
  },
});