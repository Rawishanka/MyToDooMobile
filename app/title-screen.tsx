import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TitleInputScreen() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const letterCount = title.trim().length;
  const handleContinue = () => {
    if (letterCount >= 50) {
      // Handle next step
      console.log('Title:', title);
      router.push('/time-select-screen'); // Navigate to the next screen
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#333" />
      </TouchableOpacity>

      {/* Title & Subtitle */}
      <Text style={styles.title}>Start with a title</Text>
      <Text style={styles.subtitle}>In a few words, what do you need to done?</Text>

      {/* Input Field */}
      <TextInput
        style={[
          styles.input,
          { maxHeight: 6 * 24 + 28 } // 6 lines, estimate line height
        ]}
        placeholder="e.g. Move my couch"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
        multiline
        numberOfLines={1}
        maxLength={200}
        textAlignVertical="top"
        onContentSizeChange={e => {
          const height = Math.min(e.nativeEvent.contentSize.height, 4 * 24 + 28);
          e.target.setNativeProps({ style: { height } });
        }}
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          letterCount >= 50 && styles.continueButtonEnabled,
        ]}
        disabled={letterCount < 50}
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 5,
    paddingTop: 24,
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
