import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NetworkTestScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResults([]);
    
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5001/api';
    addResult(`Testing connection to: ${baseUrl}`);

    // Helper function to create fetch with timeout
    const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Test 1: Basic connectivity
    try {
      addResult('🔍 Testing basic connectivity...');
      const response = await fetchWithTimeout(baseUrl, { 
        method: 'GET',
      });
      addResult(`✅ Connection successful! Status: ${response.status}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addResult(`❌ Connection timeout (5 seconds)`);
      } else {
        addResult(`❌ Connection failed: ${error.message}`);
      }
    }

    // Test 2: Test auth endpoint
    try {
      addResult('🔐 Testing auth endpoint...');
      const response = await fetchWithTimeout(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }),
      });
      
      const data = await response.text();
      addResult(`📡 Auth endpoint response: ${response.status} - ${data.substring(0, 100)}...`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addResult(`❌ Auth endpoint timeout`);
      } else {
        addResult(`❌ Auth endpoint failed: ${error.message}`);
      }
    }

    // Test 3: Test tasks endpoint
    try {
      addResult('📋 Testing tasks endpoint...');
      const response = await fetchWithTimeout(`${baseUrl}/tasks`, {
        method: 'GET',
      });
      
      const data = await response.text();
      addResult(`📋 Tasks endpoint response: ${response.status} - ${data.substring(0, 100)}...`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addResult(`❌ Tasks endpoint timeout`);
      } else {
        addResult(`❌ Tasks endpoint failed: ${error.message}`);
      }
    }

    setTesting(false);
    addResult('🏁 Test complete!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>🌐 Network Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Backend Connection Test</Text>
          <Text style={styles.infoText}>Testing connectivity to your backend server</Text>
          <Text style={styles.infoText}>URL: {process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5001/api'}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.testButton, testing && styles.disabledButton]} 
          onPress={testConnection}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? '🔄 Testing...' : '🚀 Start Network Test'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0c5460',
  },
  infoText: {
    fontSize: 12,
    color: '#0c5460',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#495057',
  },
});