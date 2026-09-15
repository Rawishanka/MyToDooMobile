import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { forgotPassword } from '@/src/api/auth-api';
import { FORM_MAX_WIDTH, RFValue, isTablet } from '@/src/shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password.', [
        { text: 'OK' },
      ]);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.', [{ text: 'OK' }]);
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email: trimmedEmail });

      if (response.success) {
        setEmailSent(true);
        Alert.alert(
          'Email Sent',
          response.message || 'If an account exists with this email, you will receive a password reset link shortly.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset link. Please try again.', [
          { text: 'OK' },
        ]);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred. Please check your connection and try again.';

      if (error?.response?.status === 404) {
        Alert.alert('Notice', 'If an account exists with this email, you will receive a password reset link.', [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sleek 2026 Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color="#0F172A" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentWrapper}>
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={[styles.innerContainer, isTablet && styles.innerContainerTablet]}>
                {/* Header - EXACT SAME logo frame and dimensions as LoginScreen */}
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <View style={styles.logoBackground}>
                      <MyToDooLogo width={50} height={50} />
                    </View>
                  </View>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address and we'll send{'\n'}you a password reset link.
                  </Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={19} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoFocus
                      editable={!emailSent}
                    />
                  </View>

                  {/* Send Reset Link Button */}
                  <TouchableOpacity
                    style={[styles.resetButton, (loading || emailSent) && styles.resetButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading || emailSent}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={emailSent ? 'checkmark-circle' : 'paper-plane-outline'}
                          size={18}
                          color="#FFFFFF"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.resetButtonText}>
                          {emailSent ? 'Reset Link Sent!' : 'Send Reset Link'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                {/* Back to Login */}
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back-outline" size={17} color="#0F172A" style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  innerContainerTablet: {
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  // EXACT SAME logo container & frame as login-screen.tsx
  logoContainer: {
    marginBottom: 16,
  },
  logoBackground: {
    backgroundColor: '#1A2980',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: RFValue(13),
    color: '#334155',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: RFValue(15),
    color: '#0F172A',
  },
  resetButton: {
    backgroundColor: '#FF914D',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FF914D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  resetButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: RFValue(15),
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: RFValue(13),
    color: '#94A3B8',
    fontWeight: '500',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  backIcon: {
    marginRight: 8,
  },
  backToLoginText: {
    color: '#0F172A',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
});
