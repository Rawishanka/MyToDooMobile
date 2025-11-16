// Custom hook for signup form state and logic

import API_CONFIG from '@/src/api/config';
import { useCreateSignUpToken, useVerifyOTP } from '@/src/api/user-api';
import { useGoogleSignIn } from '@/src/shared/hooks/useApi';
import { useCreateTask } from '@/src/shared/hooks/useTaskApi';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, TextInput } from 'react-native';
import { extractCityFromAddress, extractRegionFromAddress, formatDateForAPI, validateForm } from './signup-helpers';
import type { CountryData, LocationData, VerificationStep } from './signup-types';
import { COUNTRIES } from './signup-types';

export const useSignup = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, setAuthData } = useAuthStore();
  const { mutateAsync: googleSignIn } = useGoogleSignIn();
  
  // Google OAuth Configuration
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const owner = Constants.expoConfig?.owner || 'janidu5678';
  const slug = Constants.expoConfig?.slug || 'MyToDooMobile';
  
  // Always use Expo auth proxy for better compatibility
  const redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = useCreateTask();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Location state - Default to Sri Lanka
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[2]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Verification state
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(null);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [smsOtp, setSmsOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Timer state
  const [emailTimer, setEmailTimer] = useState(57);
  const [smsTimer, setSmsTimer] = useState(57);
  
  // Refs for OTP inputs
  const emailOtpRefs = useRef<Array<TextInput | null>>([]);
  const smsOtpRefs = useRef<Array<TextInput | null>>([]);
  
  // API hooks
  const { mutateAsync: signUp } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();
  
  // Google OAuth Response Handler
  useEffect(() => {
    if (!googleResponse) return;

    console.log('🔍 Google OAuth Response (Signup):', {
      type: googleResponse.type,
      params: (googleResponse as any).params,
      error: (googleResponse as any).error,
    });

    if (googleResponse?.type === 'success') {
      const { id_token, authentication } = (googleResponse as any).params;
      const token = id_token || authentication?.idToken;
      
      if (token) {
        handleGoogleSignInSuccess(token);
      } else {
        console.error('❌ No ID token in Google signup response:', (googleResponse as any).params);
        Alert.alert(
          'Authentication Error',
          'Unable to retrieve authentication token. Please try again.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
      }
    } else if (googleResponse?.type === 'error') {
      console.error('❌ Google OAuth error:', (googleResponse as any).error);
      Alert.alert(
        'Google Sign-In Error',
        'There was an error connecting to Google. Please try again.',
        [{ text: 'OK' }]
      );
      setGoogleLoading(false);
    } else if (googleResponse?.type === 'dismiss') {
      console.log('ℹ️ Google OAuth dismissed by user');
      setGoogleLoading(false);
    }
  }, [googleResponse]);

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
  useEffect(() => {
    if (verificationStep === 'email' && emailTimer > 0) {
      const interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, emailTimer]);

  useEffect(() => {
    if (verificationStep === 'sms' && smsTimer > 0) {
      const interval = setInterval(() => {
        setSmsTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verificationStep, smsTimer]);

  // Helper function to check if there's a pending task to post
  const hasPendingTask = () => {
    return myTask && myTask.title && myTask.title.trim() !== '';
  };

  // Helper function to convert task store data to API format
  const convertTaskToAPIFormat = () => {
    const taskDate = myTask.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const category = !myTask.isRemoval && myTask.category ? myTask.category : "General";
    
    // Extract location string - API expects location as string
    let locationString = '';
    if (selectedLocation) {
      locationString = selectedLocation.address;
    }
    
    return {
      title: myTask.title || "Untitled Task",
      category: category,
      details: myTask.description || "",
      dateType: "DoneBy",
      date: taskDate,
      time: myTask.time || "Anytime",
      location: locationString,
      locationType: !myTask.isRemoval ? (myTask.locationType || 'In-person') : 'In-person',
      budget: myTask.budget || 0,
      currency: "LKR",
      images: [],
    };
  };

  // Helper function to post pending task after signup
  const postPendingTask = async () => {
    if (!hasPendingTask()) {
      console.log('No pending task to post');
      return false;
    }

    try {
      console.log('🚀 Posting pending task after signup...');
      
      // Wait for authentication token to be properly set in API client
      console.log('⏱️ Waiting for auth token to be set in API client...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const taskData = convertTaskToAPIFormat();
      console.log('📝 Task data:', taskData);
      
      const result = await postTaskMutation.mutateAsync(taskData);
      console.log('✅ Pending task posted successfully:', result);
      
      // Reset task store after successful posting
      resetTask();
      console.log('🔄 Task store reset after posting');
      
      // Add a small delay to ensure the task is fully saved on the server
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('⏱️ Waited for server to process task');
      
      return true;
    } catch (error) {
      console.error('❌ Error posting pending task:', error);
      return false;
    }
  };

  // Form submission
  const handleSignUp = async () => {
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      dateOfBirth,
      selectedCountry,
      selectedLocation,
    };

    if (!validateForm(formData)) return;

    try {
      setLoading(true);
      
      const response = await signUp({
        firstName,
        lastName,
        email,
        password,
        phone: `${selectedCountry.phoneCode}${phone}`,
        dateOfBirth: dateOfBirth ? formatDateForAPI(dateOfBirth) : '',
        location: {
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          suburb: selectedLocation ? selectedLocation.address : '',
          region: selectedLocation ? extractRegionFromAddress(selectedLocation.address) : '',
          city: selectedLocation ? extractCityFromAddress(selectedLocation.address) : '',
        },
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

  // OTP handlers
  const handleEmailOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5 && emailOtpRefs.current[index + 1]) {
      emailOtpRefs.current[index + 1]?.focus();
    }
    
    if (!value && index > 0 && emailOtpRefs.current[index - 1]) {
      emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleSmsOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...smsOtp];
    newOtp[index] = value;
    setSmsOtp(newOtp);

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
      });
      
      console.log('Email verification response:', response);
      
      setEmailVerified(true);
      setVerificationStep('sms');
      setSmsTimer(57);
      
      // Automatically send SMS after email verification
      await sendSmsCode();
      
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
      
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/sms-verification`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email,
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSmsVerified(true);
        setVerificationStep(null);
        
        // Check if there's a pending task to post
        if (hasPendingTask()) {
          console.log('📋 Pending task detected after signup');
          
          // Post the pending task
          const taskPosted = await postPendingTask();
          
          if (taskPosted) {
            Alert.alert(
              'Success!',
              'Account verified successfully! Your task has been posted.',
              [
                {
                  text: 'View My Tasks',
                  onPress: () => {
                    console.log('🚀 Navigating to my tasks screen...');
                    router.dismissAll(); // Clear all previous screens
                    router.replace({
                      pathname: '/(tabs)/my-tasks',
                      params: { role: 'Poster', tab: 'posted' }
                    } as any);
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'Success!',
              'Account verified successfully! However, there was an issue posting your task. You can create it again from the home page.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('🚀 Navigating to home screen (task failed to post)...');
                    router.dismissAll(); // Clear all previous screens
                    router.replace('/(tabs)' as any);
                  }
                }
              ]
            );
          }
        } else {
          console.log('🎉 Account verification completed - no pending task');
          Alert.alert(
            'Success!',
            'Account created successfully! Welcome to MyToDoo.',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('🚀 Navigating to home screen (Get it Done)...');
                  router.dismissAll(); // Clear all previous screens
                  router.replace('/(tabs)' as any);
                }
              }
            ]
          );
        }
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
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-email`,
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

  const sendSmsCode = async () => {
    try {
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      console.log(`📱 Attempting to send SMS OTP to ${fullPhone} for email ${email}`);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, email }),
        }
      );
      
      const data = await response.json();
      console.log('📱 SMS API Response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      if (!response.ok) {
        throw new Error(`SMS API returned ${response.status}: ${data.message || 'Unknown error'}`);
      }
      
      if (data.success) {
        console.log('✅ SMS code sent automatically after email verification');
      } else {
        console.warn('⚠️ SMS API returned success=false:', data.message);
        // Don't show alert for automatic SMS - user can use resend if needed
      }
    } catch (error: any) {
      console.error('❌ Failed to send SMS code automatically:', {
        error: error.message,
        phone: `${selectedCountry.phoneCode}${phone}`,
        endpoint: `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`
      });
      
      // Only show error alert for critical failures that prevent SMS entirely
      // Don't show for JSON parsing errors as SMS might still be sent
      if (!error.message.includes('JSON Parse error') && !error.message.includes('Unexpected character')) {
        Alert.alert(
          'SMS Sending Issue', 
          `Could not send SMS to ${selectedCountry.phoneCode}${phone}. Please use the "Resend" button if you don't receive the code.`,
          [{ text: 'OK' }]
        );
      } else {
        // Just log JSON parsing errors - SMS might still work
        console.log('📱 SMS request completed but got non-JSON response (possibly still successful)');
      }
    }
  };

  const handleResendSms = async () => {
    try {
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      console.log(`📱 Resending SMS OTP to ${fullPhone} for email ${email}`);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, email }),
        }
      );
      
      const data = await response.json();
      console.log('📱 SMS Resend API Response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      if (!response.ok) {
        throw new Error(`SMS API returned ${response.status}: ${data.message || 'Unknown error'}`);
      }
      
      if (data.success) {
        setSmsTimer(57);
        Alert.alert('Sent!', 'Verification code resent to your phone.');
      } else {
        Alert.alert('Error', data.message || 'Failed to resend SMS code.');
      }
    } catch (error: any) {
      console.error('❌ Failed to resend SMS code:', {
        error: error.message,
        phone: `${selectedCountry.phoneCode}${phone}`,
        endpoint: `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`
      });
      Alert.alert('Error', `Failed to resend SMS code: ${error.message}`);
    }
  };

  // Google Sign-In Success Handler
  const handleGoogleSignInSuccess = async (idToken: string) => {
    try {
      console.log('✅ Google Sign-In successful for signup, ID token received');
      console.log('📤 Sending token to backend...');
      
      // Send the ID token to backend
      const result = await googleSignIn({ credential: idToken });
      
      console.log('✅ Backend authentication successful:', result);
      console.log('🔍 Google signup result:', { 
        hasToken: !!result.token, 
        hasUser: !!result.user,
        userEmail: result.user?.email,
        isVerified: result.user?.isVerified 
      });
      
      if (result.user?.isVerified) {
        // User is already verified - complete signup and go to welcome
        console.log('✅ User already verified - completing signup');
        Alert.alert(
          'Welcome Back!',
          'Your Google account is already verified. Welcome to MyToDoo!',
          [
            {
              text: 'Continue',
              onPress: () => {
                router.replace('/(tabs)' as any);
              }
            }
          ]
        );
      } else {
        // User is not verified - show verification needed and go to 2FA
        console.log('⚠️ User not verified - redirecting to verification');
        
        // Set form data from Google response
        if (result.user?.email) setEmail(result.user.email);
        if (result.user?.firstName) setFirstName(result.user.firstName);
        if (result.user?.lastName) setLastName(result.user.lastName);
        if (result.user?.phone) setPhone(result.user.phone.replace(/^\+\d+/, '')); // Remove country code
        
        Alert.alert(
          'Account Not Verified',
          'Your Google account needs verification. Please verify your email and phone number.',
          [
            {
              text: 'Verify Account',
              onPress: () => {
                setVerificationStep('email');
                setEmailTimer(57);
                // Send email verification
                handleResendEmail();
              }
            }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Google Sign-In backend error:', error);
      Alert.alert(
        'Authentication Error',
        error?.response?.data?.message || 'Failed to authenticate with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      console.log('🔐 Starting Google Sign-In for signup...');
      
      if (!googleClientId) {
        Alert.alert(
          'Configuration Error',
          'Google Sign-In is not configured. Please contact support.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      if (!googleRequest) {
        console.error('❌ Google request not ready');
        Alert.alert('Error', 'Google Sign-In is not ready. Please try again.');
        return;
      }
      
      console.log('🔐 Google Sign-In Configuration:');
      console.log('Client ID:', googleClientId);
      console.log('Redirect URI:', redirectUri);
      console.log('Request ready:', !!googleRequest);
      
      console.log('🚀 Prompting Google OAuth...');
      const result = await promptGoogleAsync();
      console.log('Google Sign-In result:', result);
      
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      Alert.alert('Error', 'Failed to start Google Sign-In. Please try again.');
      setGoogleLoading(false);
    }
  };

  return {
    // Form state
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phone,
    dateOfBirth,
    showDatePicker,
    showPassword,
    showConfirmPassword,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setPhone,
    setDateOfBirth,
    setShowDatePicker,
    setShowPassword,
    setShowConfirmPassword,
    
    // Location state
    selectedCountry,
    selectedLocation,
    showCountryPicker,
    setSelectedCountry,
    setSelectedLocation,
    setShowCountryPicker,
    
    // Verification state
    verificationStep,
    emailOtp,
    smsOtp,
    emailVerified,
    smsVerified,
    loading,
    verifyLoading,
    googleLoading,
    emailTimer,
    smsTimer,
    emailOtpRefs,
    smsOtpRefs,
    
    // Handlers
    handleSignUp,
    handleEmailOtpChange,
    handleSmsOtpChange,
    handleVerifyEmail,
    handleVerifySms,
    handleResendEmail,
    handleResendSms,
    handleGoogleSignIn,
  };
};
