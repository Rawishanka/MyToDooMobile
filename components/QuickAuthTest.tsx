import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Quick Auth Test Component - Add this to any screen to test authentication
export const QuickAuthTest = () => {
  const [testing, setTesting] = useState(false);

  const testAuthFlow = async () => {
    setTesting(true);
    const baseUrl = 'http://192.168.1.4:5001/api';
    
    try {
      // Test 1: Check if server is running
      console.log('🔍 Testing server connectivity...');
      const healthCheck = await fetch(`${baseUrl}/../api-docs`);
      
      if (!healthCheck.ok) {
        Alert.alert('❌ Error', 'Backend server not reachable');
        return;
      }
      
      // Test 2: Test signup endpoint
      console.log('✅ Server is running! Testing signup...');
      const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'TestUser',
          lastName: 'Demo',
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });
      
      console.log('📧 Signup response:', signupResponse.status);
      
      // Test 3: Test login endpoint  
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });
      
      console.log('🔐 Login response:', loginResponse.status);
      
      Alert.alert(
        '🎉 SUCCESS!', 
        `All endpoints working!\n\n✅ Server: Running\n✅ Signup: ${signupResponse.status}\n✅ Login: ${loginResponse.status}\n\nYour authentication is ready!`
      );
      
    } catch (error: any) {
      Alert.alert('❌ Error', `Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.testButton, testing && styles.testButtonDisabled]} 
        onPress={testAuthFlow}
        disabled={testing}
      >
        <Text style={styles.testButtonText}>
          {testing ? '🔄 Testing Auth...' : '🧪 Test Authentication'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QuickAuthTest;