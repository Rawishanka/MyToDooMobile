import { useCreateTaskStore } from '@/store/create-task-store';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState('');

  const isContinueEnabled = selectedGoal !== '';
  const { myTask, updateMyTask } = useCreateTaskStore();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>

      {/* Title and Subtitle */}
      <Text style={styles.title}>What to you want to do?</Text>
      <Text style={styles.subtitle}>You can change your option later</Text>

      {/* Option 1 */}
      <TouchableOpacity
        style={[
          styles.card,
          selectedGoal === 'getThingsDone' && styles.cardSelected,
        ]}
        onPress={() => setSelectedGoal('getThingsDone')}
      >
        <View style={styles.iconCircle}>
          <AntDesign name="profile" size={22} color="#FF7A00" />
        </View>
        <View>
          <Text style={styles.cardTitle}>Get MyToDoo tasks completed</Text>
          <Text style={styles.cardSubtitle}>Add, assign, done!</Text>
        </View>
      </TouchableOpacity>

      {/* Option 2 */}
      <TouchableOpacity
        style={[
          styles.card,
          selectedGoal === 'earnMoney' && styles.cardSelected,
        ]}
        onPress={() => setSelectedGoal('earnMoney')}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#e3e3f4ff' }]}>
          <Image 
            source={require('@/assets/images/goal_service.png')} // Make sure this path is correct
            style={styles.iconImage}
          />
        </View>
        <View>
          <Text style={styles.cardTitle}>Provide Services</Text>
          <Text style={styles.cardSubtitle}>Become a MyToDoo Hero!</Text>
        </View>
      </TouchableOpacity>

      {/* Continue button */}
      <TouchableOpacity
        disabled={!isContinueEnabled}
        style={[
          styles.continueButton,
          isContinueEnabled && styles.continueEnabled,
        ]}
        onPress={() => {
          updateMyTask({ ...myTask, mainGoal: selectedGoal });
          router.push('/title-screen');
        }}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  cardSelected: {
    borderColor: '#FF7A00',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECECFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  iconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  continueButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: '#D1D1D6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueEnabled: {
    backgroundColor: '#0052CC', 
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});