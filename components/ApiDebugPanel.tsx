import API_CONFIG from '@/api/config';
import { MockApiService } from '@/api/mock-api';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ApiDebugPanel() {
  const [testResult, setTestResult] = useState<string>('');

  const handleTestConnection = async () => {
    setTestResult('Testing real API...');
    try {
      console.log('🔍 Testing API connection to:', API_CONFIG.BASE_URL);
      const response = await fetch(`${API_CONFIG.BASE_URL}/tasks`);
      console.log('✅ API Connection test - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Real API Success! Found ${data.total || 'unknown'} tasks`);
      } else {
        setTestResult(`❌ Real API Failed: HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ API Connection test failed:', error);
      setTestResult(`❌ Real API Failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleTestMockApi = async () => {
    setTestResult('Testing mock API...');
    try {
      const result = await MockApiService.getAllTasks();
      setTestResult(`✅ Mock API Success! Found ${result.total} tasks`);
    } catch (error: any) {
      setTestResult(`❌ Mock API Failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 API Debug Panel</Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <Text style={styles.info}>API URL: {API_CONFIG.BASE_URL}</Text>
      {testResult ? <Text style={styles.result}>{testResult}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
        <Text style={styles.buttonText}>Test Real API</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.mockButton]} onPress={handleTestMockApi}>
        <Text style={styles.buttonText}>Test Mock API</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  result: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  mockButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});