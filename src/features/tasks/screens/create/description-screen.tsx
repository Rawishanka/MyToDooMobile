import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from '@/src/shared/utils/responsive';
import { useTheme } from '@/src/shared/theme';

export default function DescribeTaskScreen() {
  const { isDarkMode } = useTheme();
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
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color="black" />
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
        placeholderTextColor="#aaa"
      />

      {/* Button */}
      <TouchableOpacity
        style={[styles.button, description.trim() === '' && { opacity: 0.5 }]}
        onPress={handleContinue}
        disabled={description.trim() === ''}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
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
    color: '#002366',
    marginTop: 40,
  },
  subtitle: {
    color: '#6e6e6e',
    marginBottom: 20,
  },
  textArea: {
    height: 150,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 16,
    fontSize: RFValue(16),
    textAlignVertical: 'top',
    color: '#000',
  },
  button: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#0050C8',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(16),
    textTransform: 'capitalize',
  },
});