import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLOW, FlowBackground, primaryShadow } from './flowTheme';

export default function DescribeTaskScreen() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const navigation = useNavigation();
  const { myTask, updateMyTask } = useCreateTaskStore();

  // Initialize with existing data from store
  useEffect(() => {
    if (myTask.description) {
      setDescription(myTask.description);
    }
  }, [myTask.description]);

  // Helper to update zustand store with description
  const handleContinue = () => {
    if (description.trim() !== '') {
      updateMyTask({
        description: description,
      });
      router.push('/image-upload-screen');
    }
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? '#0B1120' : FLOW.blue} />
      <FlowBackground isDarkMode={isDarkMode} />
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.back, { top: Math.max(insets.top, 20) + 6 }]}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Describe the MyToDoo task</Text>
      <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Give a detailed description of the MyToDoo tasks</Text>

      {/* Input */}
      <TextInput
        style={[styles.textArea, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1, color: '#F8FAFC' }]}
        multiline
        placeholder="Type your task details here..."
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={isDarkMode ? '#64748B' : FLOW.placeholder}
      />

      {/* Button */}
      <View style={[styles.actionBar, isDarkMode && { backgroundColor: '#0B1120', borderTopColor: '#1E293B' }, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.button, description.trim() === '' && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={description.trim() === ''}
        >
          <Text style={[styles.buttonText, description.trim() === '' && styles.buttonTextDisabled]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: FLOW.blue,
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 40,
  },
  subtitle: {
    color: FLOW.textMuted,
    marginBottom: 20,
  },
  textArea: {
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    fontSize: RFValue(16),
    textAlignVertical: 'top',
    color: FLOW.ink,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: FLOW.blueDeep,
    borderTopWidth: 1,
    borderTopColor: FLOW.line,
  },
  button: {
    backgroundColor: FLOW.orange,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...primaryShadow,
  },
  buttonDisabled: {
    backgroundColor: FLOW.disabledFill,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(16),
    textTransform: 'capitalize',
  },
  buttonTextDisabled: {
    color: FLOW.disabledText,
  },
});