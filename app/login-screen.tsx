import { useCreateAuthToken } from '@/hooks/useApi';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useCreateAuthToken();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await mutateAsync({ username: email, password });
      // Navigate to protected page after successful login
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Cross icon in top right */}
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => router.replace('/')}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  forgotPassword: {
    color: '#007BFF',
    textAlign: 'right',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
  },
  registerText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    top: 40,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 4,
  },
});
