// ...existing code...
//     <SafeAreaView style={styles.container}>
//       {/* Cross icon in top right */}
//       <TouchableOpacity
//         style={styles.closeIcon}
//         onPress={() => router.replace('/')}
//         hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
//       >
//         <Ionicons name="close" size={28} color="#333" />
//       </TouchableOpacity>
      
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.innerContainer}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>Create Account</Text>
//           <Text style={styles.subtitle}>Sign up to get started</Text>
//         </View>

//         <View style={styles.form}>
//           <View style={styles.nameRow}>
//             <View style={styles.nameField}>
//               <Text style={styles.label}>First Name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={firstName}
//                 onChangeText={setFirstName}
//                 placeholder="Enter first name"
//                 autoCapitalize="words"
//               />
//             </View>
            
//             <View style={styles.nameField}>
//               <Text style={styles.label}>Last Name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={lastName}
//                 onChangeText={setLastName}
//                 placeholder="Enter last name"
//                 autoCapitalize="words"
//               />
//             </View>
//           </View>

//           <Text style={styles.label}>Email</Text>
//           <TextInput
//             style={styles.input}
//             value={email}
//             onChangeText={setEmail}
//             placeholder="Enter your email"
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             style={styles.input}
//             value={phone}
//             onChangeText={setPhone}
//             placeholder="Enter your phone number"
//             keyboardType="phone-pad"
//             autoCapitalize="none"
//           />

//           <Text style={styles.label}>Password</Text>
//           <TextInput
//             style={styles.input}
//             value={password}
//             onChangeText={setPassword}
//             placeholder="Enter your password"
//             secureTextEntry
//           />

//           <Text style={styles.label}>Confirm Password</Text>
//           <TextInput
//             style={styles.input}
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             placeholder="Confirm your password"
//             secureTextEntry
//           />

//           <TouchableOpacity 
//             style={styles.signUpButton} 
//             onPress={handleSignUp} 
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.signUpButtonText}>Create Account</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View style={styles.footer}>
//           <Text style={styles.footerText}>Already have an account? </Text>
//           <TouchableOpacity onPress={() => router.push('./login-screen')}>
//             <Text style={styles.registerText}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       {/* OTP Verification Modal */}
//       <Modal
//         visible={showOtpModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => {
//           // Prevent closing modal by back button - user must verify OTP
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Verify Your Email</Text>
//               <Text style={styles.modalSubtitle}>
//                 We've sent a 6-digit verification code to
//               </Text>
//               <Text style={styles.emailText}>{email}</Text>
//             </View>

//             <View style={styles.otpContainer}>
//               <Text style={styles.otpLabel}>Enter Verification Code</Text>
//               <TextInput
//                 style={styles.otpInput}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="000000"
//                 keyboardType="numeric"
//                 maxLength={6}
//                 textAlign="center"
//                 autoFocus={true}
//               />
//               <Text style={styles.otpHelperText}>
//                 Check your email for the verification code
//               </Text>
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity 
//                 style={[styles.verifyButton, (!otp || otp.length !== 6) && styles.verifyButtonDisabled]} 
//                 onPress={handleVerifyOTP} 
//                 disabled={otpLoading || !otp || otp.length !== 6}
//               >
//                 {otpLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.verifyButtonText}>Verify & Complete</Text>
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.resendButton}
//                 onPress={() => {
//                   // You can add resend OTP functionality here
//                   Alert.alert('Resend OTP', 'OTP resent to your email!');
//                 }}
//               >
//                 <Text style={styles.resendButtonText}>Didn't receive code? Resend</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//   },
//   form: {
//     marginBottom: 24,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 0,
//   },
//   nameField: {
//     flex: 0.48,
//   },
//   label: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 16,
//   },
//   signUpButton: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   signUpButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   footerText: {
//     color: '#666',
//   },
//   registerText: {
//     color: '#007BFF',
//     fontWeight: 'bold',
//   },
//   closeIcon: {
//     position: 'absolute',
//     top: 40,
//     right: 18,
//     zIndex: 10,
//     backgroundColor: 'rgba(255,255,255,0.7)',
//     borderRadius: 16,
//     padding: 4,
//   },
//   otpInput: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     letterSpacing: 8,
//     backgroundColor: '#f8f9fa',
//     borderWidth: 2,
//     borderColor: '#007BFF',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginVertical: 16,
//   },
//   otpHelperText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontStyle: 'italic',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     margin: 20,
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     width: '90%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   modalSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   emailText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007BFF',
//     textAlign: 'center',
//   },
//   otpContainer: {
//     marginBottom: 24,
//   },
//   otpLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   modalActions: {
//     gap: 12,
//   },
//   verifyButton: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   verifyButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   verifyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   resendButton: {
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   resendButtonText: {
//     color: '#007BFF',
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
// });
import { useCreateSignUpToken, useVerifyOTP } from '@/hooks/useApi';
import { sendSmsCode } from '@/api/two-factor-auth';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type VerificationStep = 'email' | 'sms' | null;

export default function SignUpScreen() {
  const router = useRouter();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country] = useState('Sri Lanka');
  const [stateRegion] = useState('Western Province');
  const [city] = useState('Colombo');
  
  // Verification state
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(null);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [smsOtp, setSmsOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Timer state
  const [emailTimer, setEmailTimer] = useState(57);
  const [smsTimer, setSmsTimer] = useState(57);
  
  // Refs for OTP inputs
  const emailOtpRefs = useRef<Array<TextInput | null>>([]);
  const smsOtpRefs = useRef<Array<TextInput | null>>([]);
  
  const { mutateAsync: signUp } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (verificationStep) {
          Alert.alert(
            'Verification Required',
            'Please complete verification to continue.',
            [{ text: 'OK' }]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [verificationStep])
  );

  // Timer effects
  React.useEffect(() => {
    if (verificationStep === 'email' && emailTimer > 0) {
      const interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, emailTimer]);

  React.useEffect(() => {
    if (verificationStep === 'sms' && smsTimer > 0) {
      const interval = setInterval(() => {
        setSmsTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, smsTimer]);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await signUp({
        firstName,
        lastName,
        email,
        password,
    phone,
    // stateRegion, // Remove stateRegion from payload
    // city, // Remove city from payload
      });
      
      console.log('Signup response:', response);
      
      if (response?.userId) {
        setUserId(response.userId);
      }
      
      setVerificationStep('email');
      setEmailTimer(57);
      
    } catch (error: any) {
      console.error('Sign up Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpChange = (value: string, index: number) => {
    // Only allow numeric values
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && emailOtpRefs.current[index + 1]) {
      emailOtpRefs.current[index + 1]?.focus();
    }
    
    // Auto-focus previous input on backspace
    if (!value && index > 0 && emailOtpRefs.current[index - 1]) {
      emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleSmsOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...smsOtp];
    newOtp[index] = value;
    setSmsOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && smsOtpRefs.current[index + 1]) {
      smsOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    const otpCode = emailOtp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      setVerifyLoading(true);
      
      const response = await verifyOTP({ 
        email, 
        otp: otpCode,
  // userId // Remove userId from payload
      });
      
      console.log('Email verification response:', response);
      
      setEmailVerified(true);
      setVerificationStep('sms');
      setSmsTimer(57);
      
    } catch (error: any) {
      console.error('Email verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifySms = async () => {
    const otpCode = smsOtp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      setVerifyLoading(true);
      
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.168:5001/api'}/two-factor-auth/sms-verification`,
        try {
          const result = await sendSmsCode(payload as any);
          setSmsTimer(57);
          if (result?.success) {
            Alert.alert('Sent!', result.message || 'Verification code resent to your phone.');
          } else {
            Alert.alert('Error', result.message || 'Failed to resend SMS code.');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to resend SMS code.');
        }
        setSmsVerified(true);
        setVerificationStep(null);
        
        Alert.alert(
          'Success!',
          'Account verified successfully! You can now log in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('./login-screen')
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Invalid SMS code.');
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      Alert.alert('Error', 'Failed to verify SMS code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.168:5001/api'}/two-factor-auth/send-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId }),
        }
      );
      setEmailTimer(57);
      Alert.alert('Sent!', 'Verification code resent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend email code.');
    }
  };

  const handleResendSms = async () => {
    try {
      // include email because backend expects { phone, email } per API docs
      const payload: any = { phone: `+94${phone}`, email };
      if (userId) payload.userId = userId;

      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.168:5001/api'}/two-factor-auth/send-sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      setSmsTimer(57);
      Alert.alert('Sent!', 'Verification code resent to your phone.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend SMS code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!verificationStep && (
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => router.replace('/')}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+94</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="714184070"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handleSignUp} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity 
            onPress={() => router.push('./login-screen')}
            disabled={!!verificationStep}
          >
            <Text style={[styles.registerText, verificationStep && styles.disabledText]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Email Verification Modal */}
      <Modal
        visible={verificationStep === 'email'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Alert.alert(
            'Verification Required',
            'Please complete email verification to continue.',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color="#007BFF" />
              </View>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <Text style={styles.modalSubtitle}>Enter the code sent to</Text>
              <Text style={styles.contactText}>{email}</Text>
            </View>

            <View style={styles.verificationTabs}>
              <View style={[styles.tab, styles.activeTab]}>
                <Ionicons name="mail" size={20} color="#007BFF" />
                <Text style={styles.activeTabText}>Email Verification</Text>
              </View>
              <View style={styles.tab}>
                <Ionicons name="phone-portrait-outline" size={20} color="#999" />
                <Text style={styles.tabText}>SMS Verification</Text>
              </View>
            </View>

            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter verification code</Text>
              <View style={styles.otpInputContainer}>
                {emailOtp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { emailOtpRefs.current[index] = ref; }}
                    style={styles.otpBox}
                    value={digit}
                    onChangeText={(value) => handleEmailOtpChange(value, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              <Text style={styles.timerText}>
                Resend code in {emailTimer}s
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, emailOtp.join('').length !== 6 && styles.verifyButtonDisabled]} 
              onPress={handleVerifyEmail} 
              disabled={verifyLoading || emailOtp.join('').length !== 6}
            >
              {verifyLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {emailTimer === 0 && (
              <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
                <Text style={styles.resendButtonText}>Didn't receive a code? Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* SMS Verification Modal */}
      <Modal
        visible={verificationStep === 'sms'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Alert.alert(
            'Verification Required',
            'Please complete SMS verification to continue.',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color="#007BFF" />
              </View>
              <Text style={styles.modalTitle}>Verify Your Phone</Text>
              <Text style={styles.modalSubtitle}>Enter the code sent to</Text>
              <Text style={styles.contactText}>+94{phone}</Text>
            </View>

            <View style={styles.verificationTabs}>
              <View style={styles.tab}>
                <Ionicons name="mail" size={20} color="#28a745" />
                <Text style={styles.verifiedTabText}>Email Verification</Text>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              </View>
              <View style={[styles.tab, styles.activeTab]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#007BFF" />
                <Text style={styles.activeTabText}>SMS Verification</Text>
              </View>
            </View>

            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter verification code</Text>
              <View style={styles.otpInputContainer}>
                {smsOtp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { smsOtpRefs.current[index] = ref; }}
                    style={[
                      styles.otpBox,
                      digit && styles.otpBoxFilled
                    ]}
                    value={digit}
                    onChangeText={(value) => handleSmsOtpChange(value, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>
              {smsOtp.join('').length === 6 && !verifyLoading && (
                <View style={styles.successTextContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                  <Text style={styles.successText}>Verification successful! Redirecting...</Text>
                </View>
              )}
              <Text style={styles.timerText}>
                Resend code in {smsTimer}s
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.verifyButton,
                smsVerified && styles.verifiedButton,
                smsOtp.join('').length !== 6 && styles.verifyButtonDisabled
              ]} 
              onPress={handleVerifySms} 
              disabled={verifyLoading || smsOtp.join('').length !== 6}
            >
              {verifyLoading ? (
                <ActivityIndicator color="#fff" />
              ) : smsVerified ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verified Successfully</Text>
                </>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Complete</Text>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {smsTimer === 0 && (
              <TouchableOpacity style={styles.resendButton} onPress={handleResendSms}>
                <Text style={styles.resendButtonText}>Didn't receive a code? Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  nameField: {
    flex: 0.48,
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
    backgroundColor: '#f8f9fa',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  phonePrefix: {
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 14,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  signUpButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  disabledText: {
    color: '#ccc',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  verificationTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e8f4fd',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
  },
  activeTabText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '600',
  },
  verifiedTabText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  otpBoxFilled: {
    borderColor: '#28a745',
    backgroundColor: '#e8f5e9',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  successTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  successText: {
    fontSize: 14,
    color: '#28a745',
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifiedButton: {
    backgroundColor: '#28a745',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#007BFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});