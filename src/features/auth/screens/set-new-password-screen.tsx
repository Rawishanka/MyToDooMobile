import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resetToken = params.token as string; // Token from email link
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    return null;
  };

  const handleSetNewPassword = async () => {
    // Validate inputs
    if (!password || !confirmPassword) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert(
        'Weak Password',
        passwordError,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords Don&apos;t Match',
        'Please make sure both passwords are the same.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual API call to your backend
      // Example: await resetPasswordConfirm({ token: resetToken, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Set Password Error:', error);

      // Show user-friendly error messages
      if (error?.response?.status === 400) {
        Alert.alert(
          'Invalid Request',
          'The password reset link is invalid or has expired. Please request a new one.',
          [{ text: 'OK' }]
        );
      } else if (error?.response?.status === 404) {
        Alert.alert(
          'Link Expired',
          'This password reset link has expired. Please request a new one.',
          [{ text: 'OK' }]
        );
      } else if (error?.message?.includes('Network Error') || error?.code === 'ECONNREFUSED') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Reset Failed',
          'Something went wrong. Please try again later.',
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
          <Ionicons name="key-outline" size={64} color="#007BFF" style={styles.keyIcon} />
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password for your account.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Password requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.requirement}>
              <Ionicons
                name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={password.length >= 8 ? '#28a745' : '#999'}
              />
              <Text style={[styles.requirementText, password.length >= 8 && styles.requirementMet]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons
                name={/[A-Z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[A-Z]/.test(password) ? '#28a745' : '#999'}
              />
              <Text style={[styles.requirementText, /[A-Z]/.test(password) && styles.requirementMet]}>
                One uppercase letter
              </Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons
                name={/[a-z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[a-z]/.test(password) ? '#28a745' : '#999'}
              />
              <Text style={[styles.requirementText, /[a-z]/.test(password) && styles.requirementMet]}>
                One lowercase letter
              </Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons
                name={/[0-9]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[0-9]/.test(password) ? '#28a745' : '#999'}
              />
              <Text style={[styles.requirementText, /[0-9]/.test(password) && styles.requirementMet]}>
                One number
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleSetNewPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
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
    marginBottom: 32,
  },
  keyIcon: {
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#28a745',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
