import { forgotPassword } from '@/src/api/auth-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Validate email
    if (!email) {
      Alert.alert(
        'Missing Information',
        'Please enter your email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);

      // Call the actual API
      const response = await forgotPassword({ email });

      setEmailSent(true);
      
      Alert.alert(
        'Email Sent',
        response.message || 'If your email is registered, you will receive a password reset link',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Password Reset Error:', error);

      // Show user-friendly error messages
      if (error?.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Connection Error',
          error.message || 'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (error?.status === 404) {
        Alert.alert(
          'Email Sent',
          'If your email is registered, you will receive a password reset link',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Something went wrong. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={64} color="#007BFF" style={styles.lockIcon} />
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            editable={!emailSent}
          />

          <TouchableOpacity
            style={[styles.resetButton, (loading || emailSent) && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading || emailSent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>
                {emailSent ? 'Email Sent' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color="#007BFF" style={styles.backIcon} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backIcon: {
    marginRight: 6,
  },
  backToLoginText: {
    color: '#007BFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
