import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from '@/src/shared/utils/responsive';
import { FLOW, FlowBackground, primaryShadow } from './flowTheme';

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState('');

  const isContinueEnabled = selectedGoal !== '';
  const insets = useSafeAreaInsets();
  const { myTask, updateMyTask } = useCreateTaskStore();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={FLOW.blue} />
      <FlowBackground isDarkMode={false} />
      <TouchableOpacity style={[styles.backButton, { top: Math.max(insets.top, 20) + 6 }]} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
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
          <AntDesign name="profile" size={22} color="#ff6b35" />
        </View>
        <View>
          <Text style={[styles.cardTitle, selectedGoal === 'getThingsDone' && styles.cardTitleSelected]}>Get MyToDoo tasks completed</Text>
          <Text style={[styles.cardSubtitle, selectedGoal === 'getThingsDone' && styles.cardSubtitleSelected]}>Add, assign, done!</Text>
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
          <Text style={[styles.cardTitle, selectedGoal === 'earnMoney' && styles.cardTitleSelected]}>Provide Services</Text>
          <Text style={[styles.cardSubtitle, selectedGoal === 'earnMoney' && styles.cardSubtitleSelected]}>Become a MyToDoo Hero!</Text>
        </View>
      </TouchableOpacity>

      {/* Continue button */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <TouchableOpacity
        disabled={!isContinueEnabled}
        style={[
          styles.continueButton,
          isContinueEnabled && styles.continueEnabled,
        ]}
        onPress={() => {
          updateMyTask({ ...myTask, mainGoal: selectedGoal });
          if (selectedGoal === 'earnMoney') {
            // Provide Services → show screen-first.tsx
            router.push('/screen-first' as any);
          } else if (selectedGoal === 'getThingsDone') {
            // Get MyToDoo tasks completed → go directly to new title screen
            router.push('/title-screen');
          }
        }}
      >
        <Text style={[styles.continueText, !isContinueEnabled && styles.continueTextDisabled]}>Continue</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FLOW.blue,
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
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: FLOW.textMuted,
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: FLOW.glassBorder,
    backgroundColor: FLOW.glass,
    borderRadius: 20,
    marginBottom: 16,
    gap: 12,
  },
  cardSelected: {
    borderColor: '#ff6b35',
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardTitleSelected: {
    color: FLOW.blue,
  },
  cardSubtitle: {
    fontSize: RFValue(13),
    color: FLOW.textMuted,
  },
  cardSubtitleSelected: {
    color: '#475569',
  },
  iconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: FLOW.blueDeep,
    borderTopWidth: 1,
    borderTopColor: FLOW.line,
  },
  continueButton: {
    backgroundColor: FLOW.disabledFill,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueEnabled: {
    backgroundColor: FLOW.orange,
    ...primaryShadow,
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: RFValue(16),
  },
  continueTextDisabled: {
    color: FLOW.disabledText,
  },
});