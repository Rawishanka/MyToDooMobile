import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { forgotPassword } from '@/src/api/auth-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { hp, RFValue, wp } from '@/src/shared/utils/responsive';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                {/* MyToDoo SVG Logo in Blue Container */}
                <View style={styles.logoContainer}>
                  <View style={styles.logoBackground}>
                    <MyToDooLogo 
                      width={wp('20%')}
                      height={wp('20%')}
                    />
                  </View>
                </View>
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
                  placeholderTextColor="#999"
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
                  <Ionicons name="arrow-back" size={wp('4%')} color="#007BFF" style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom spacer for better layout */}
              <View style={styles.bottomSpacer} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: hp('100%'),
  },
  innerContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  backButton: {
    position: 'absolute',
    top: hp('5%'),
    left: wp('4.5%'),
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: wp('4%'),
    padding: wp('1%'),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp('4%'),
    marginTop: hp('2%'),
  },
  logoContainer: {
    marginBottom: hp('3%'),
  },
  logoBackground: {
    backgroundColor: '#0a2d5c',
    borderRadius: wp('8%'),
    padding: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('2%'),
    elevation: 8,
    width: wp('36%'),
    height: wp('36%'),
  },
  title: {
    fontSize: RFValue(26),
    fontWeight: 'bold',
    marginBottom: hp('1.5%'),
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: RFValue(20),
    paddingHorizontal: wp('2%'),
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: RFValue(14),
    color: '#333',
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.75%'),
    marginBottom: hp('2.5%'),
    fontSize: RFValue(16),
    backgroundColor: '#fff',
  },
  resetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('1%'),
    elevation: 3,
  },
  resetButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: RFValue(16),
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
  },
  backIcon: {
    marginRight: wp('1.5%'),
  },
  backToLoginText: {
    color: '#007BFF',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  bottomSpacer: {
    height: hp('5%'),
  },
});
