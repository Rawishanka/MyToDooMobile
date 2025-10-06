import { useCreateTaskStore } from '@/store/create-task-store';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TitleInputScreen() {
  const [title, setTitle] = useState('');
  const router = useRouter();
  const { myTask, updateMyTask } = useCreateTaskStore();

  // Initialize with existing data from store
  useEffect(() => {
    if (myTask.title) {
      setTitle(myTask.title);
    }
  }, [myTask.title]);

  const letterCount = title.trim().length;
  const handleContinue = () => {
    if (letterCount >= 10) {
      // Handle next step
      console.log('Title:', title);
      updateMyTask({ title });
      router.push('/time-select-screen'); // Navigate to the next screen
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>

      {/* Title & Subtitle */}
      <Text style={styles.title}>MyToDo title for task</Text>
      <Text style={styles.subtitle}>Tell MyToDoo hero's what you need done?</Text>

      {/* Input Field */}
      <TextInput
        style={[
          styles.input,
          letterCount < 10 && letterCount > 0 && styles.inputError
        ]}
        placeholder="e.g. Move my couch"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        maxLength={200}
        textAlignVertical="top"
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          letterCount >= 10 && styles.continueButtonEnabled,
        ]}
        disabled={letterCount < 10}
        onPress={handleContinue}
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
    padding: 20,
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
  input: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    height: 100, // Reduced height - smaller input field
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  validationContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 5,
  },
  errorText: {
    color: '#FF3B30',
  },
  successText: {
    color: '#34C759',
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'right',
  },
  continueButton: {
    marginTop: 'auto',
    backgroundColor: '#D1D1D6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonEnabled: {
    backgroundColor: '#0057FF', // Match the blue in your screenshot
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});