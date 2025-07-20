import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState('');

  const isContinueEnabled = selectedGoal !== '';

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title and Subtitle */}
      <Text style={styles.title}>What's your main goal?</Text>
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
          <AntDesign name="checkcircleo" size={20} color="#7D4AEA" />
        </View>
        <View>
          <Text style={styles.cardTitle}>Get things done</Text>
          <Text style={styles.cardSubtitle}>Find & Tackle</Text>
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
        <View style={[styles.iconCircle, { backgroundColor: '#17C964' }]}>
          <AntDesign name="wallet" size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.cardTitle}>Earn Money</Text>
          <Text style={styles.cardSubtitle}>Become a Trader</Text>
        </View>
      </TouchableOpacity>

      {/* Continue button */}
      <TouchableOpacity
        disabled={!isContinueEnabled}
        style={[
          styles.continueButton,
          isContinueEnabled && styles.continueEnabled,
        ]}
        onPress={() => router.push('/title-screen')}
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
    backgroundColor: '#0052CC', // same as previous "Get Start" button color
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
