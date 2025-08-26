import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import the local assets
const LottieAnimation = require('@/assets/animations/lottie-animation.json');

const tags = ['End of lease cleaning', 'Help me move', 'Fix lights'];
const tasks = [
  { id: '1', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '2', name: 'Jane F.', task: 'Folding arm awning needs reset' },
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
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top Section with Animation Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {!lottieError ? (
            <LottieView
              source={LottieAnimation}
              style={styles.logoAnimation}
              autoPlay={true}
              loop={true}
              speed={1}
              onAnimationFinish={() => {
                console.log('Logo animation finished');
                setLottieLoaded(true);
              }}
              onAnimationFailure={(error) => {
                console.log('Logo animation error:', error);
                setLottieError(true);
              }}
            />
          ) : (
            // Fallback text logo if Lottie fails to load
            <Text style={styles.fallbackLogo}>MyToDoo</Text>
          )}
        </View>
        <View style={styles.rightIcons}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
        </View>
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>Good evening. Prasanna</Text>

      {/* Post a Task Section */}
      <View style={styles.taskCard}>
        <Text style={styles.postTitle}>Post a Task. Get it Done.</Text>
        <TextInput
          style={styles.input}
          placeholder="In a few words what do you need done?"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.postButton}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.postButtonText}>Post a Task</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
        {tags.map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag}>
            <Text style={{ color: '#007bff' }}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task Cards */}
      <Text style={styles.sectionTitle}>Get more work now</Text>
      <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskBox}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.task}</Text>
            <Text style={styles.messageLink}>💬 Sent a message</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 10, paddingHorizontal: 10 }}
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
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#003399',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoAnimation: {
    width: 120,
    height: 40,
  },
  fallbackLogo: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  welcomeAnimation: {
    width: '100%',
    height: 200,
  },
  logo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  greeting: { fontSize: 16, margin: 10, color: '#333' },
  taskCard: { backgroundColor: '#003399', padding: 16 },
  postTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  lottieAnimation: {
    width: 40,
    height: 40,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lottieIcon: {
    width: 24,
    height: 24,
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
  postButtonText: { color: '#fff', fontWeight: 'bold' },
  tagRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#007bff',
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
  name: { fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: 13, color: '#333' },
  messageLink: { color: '#007bff', marginTop: 6 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  gridItem: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    width: '42%',
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});