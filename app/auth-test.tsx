import { useCreateAuthToken, useCreateSignUpToken } from '@/hooks/useApi';
import { useAuthStore } from '@/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AuthTestScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('sithilaakalanka36@gmail.com'); // From your CSV
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Signup state
  const [signupData, setSignupData] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'password123',
    phone: '',
  });
  const [signupLoading, setSignupLoading] = useState(false);

  const { mutateAsync: login } = useCreateAuthToken();
  const { mutateAsync: signup } = useCreateSignUpToken();

  const handleTestLogin = async () => {
    try {
      setLoginLoading(true);
      console.log('🔐 Testing Login with:', { email: loginEmail, password: loginPassword });
      
      const result = await login({ username: loginEmail, password: loginPassword });
      console.log('✅ Login Success:', result);
      
      Alert.alert('Success!', 'Login successful!');
    } catch (error: any) {
      console.error('❌ Login Error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTestSignup = async () => {
    try {
      setSignupLoading(true);
      console.log('📝 Testing Signup with:', signupData);
      
      const result = await signup(signupData);
      console.log('✅ Signup Success:', result);
      
      Alert.alert('Success!', 'Account created successfully!');
    } catch (error: any) {
      console.error('❌ Signup Error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Signup failed';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    Alert.alert('Logged Out', 'You have been logged out successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>🔐 Auth API Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Current Auth Status */}
          <View style={styles.statusCard}>
            <Text style={styles.sectionTitle}>Current Authentication Status</Text>
            <Text style={styles.statusText}>
              Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
            </Text>
            {token && <Text style={styles.tokenText}>Token: {token.substring(0, 20)}...</Text>}
            {user && (
              <Text style={styles.userText}>
                User: {user.firstName} {user.lastName} ({user.email})
              </Text>
            )}
            {isAuthenticated && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Login Test */}
          <View style={styles.testCard}>
            <Text style={styles.sectionTitle}>🔐 Test Login</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="Enter password"
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.testButton, loginLoading && styles.disabledButton]} 
              onPress={handleTestLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.testButtonText}>Test Login API</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Signup Test */}
          <View style={styles.testCard}>
            <Text style={styles.sectionTitle}>📝 Test Signup</Text>
            
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={signupData.firstName}
                  onChangeText={(text) => setSignupData(prev => ({ ...prev, firstName: text }))}
                  placeholder="First name"
                />
              </View>
              <View style={styles.nameField}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={signupData.lastName}
                  onChangeText={(text) => setSignupData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Last name"
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={signupData.email}
              onChangeText={(text) => setSignupData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={signupData.phone}
              onChangeText={(text) => setSignupData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={signupData.password}
              onChangeText={(text) => setSignupData(prev => ({ ...prev, password: text }))}
              placeholder="Enter password"
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.testButton, signupLoading && styles.disabledButton]} 
              onPress={handleTestSignup}
              disabled={signupLoading}
            >
              {signupLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.testButtonText}>Test Signup API</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* API Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📡 API Endpoints Being Tested</Text>
            <Text style={styles.infoText}>• POST /api/auth/login</Text>
            <Text style={styles.infoText}>• POST /api/auth/signup</Text>
            <Text style={styles.infoText}>• Base URL: {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api'}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoCard: {
    backgroundColor: '#e8f4fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  tokenText: {
    fontSize: 12,
    color: '#007BFF',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  userText: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  testButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0c5460',
  },
  infoText: {
    fontSize: 12,
    color: '#0c5460',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});