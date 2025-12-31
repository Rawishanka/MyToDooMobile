// Custom hook for signup form state and logic

import API_CONFIG from '@/src/api/config';
import { useCreateSignUpToken, useVerifyOTP } from '@/src/api/user-api';
import { useGoogleSignIn } from '@/src/shared/hooks/useApi';
import { useLocationCountry } from '@/src/shared/hooks/useLocationCountry';
import { usePostTaskDirect } from '@/src/shared/hooks/useTaskApi';
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
  const googleIosClientId = Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const owner = Constants.expoConfig?.owner || 'janidu5678';
  const slug = Constants.expoConfig?.slug || 'MyToDooMobile';
  
  // Always use Expo auth proxy for better compatibility
  const redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    iosClientId: googleIosClientId || googleClientId,
    androidClientId: googleClientId,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = usePostTaskDirect(); // ✅ Use postTaskDirect for proper image handling
  
  // 🌍 Auto-detect user's country
  const { countryInfo, isDetecting: isDetectingCountry } = useLocationCountry();
  
  // Helper function to find country in COUNTRIES array by country code
  const findCountryByCode = (countryCode: string): CountryData => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country || COUNTRIES[2]; // Fallback to Sri Lanka if not found
  };
  
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
  
  // Location state - Auto-detect country based on GPS location
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    // Initialize with detected country if available, otherwise use Sri Lanka as fallback
    if (countryInfo?.countryCode) {
      const detectedCountry = findCountryByCode(countryInfo.countryCode);
      console.log('🌍 Signup: Initializing with detected country:', detectedCountry.name);
      return detectedCountry;
    }
    console.log('🌍 Signup: No country detected yet, using Sri Lanka as fallback');
    return COUNTRIES[2]; // Sri Lanka as fallback
  });
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
  const emailOtpRefs = useRef<(TextInput | null)[]>([]);
  const smsOtpRefs = useRef<(TextInput | null)[]>([]);
  
  // API hooks
  const { mutateAsync: signUp } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();
  
  // 🌍 Update selected country when GPS detection completes
  useEffect(() => {
    if (countryInfo?.countryCode && !isDetectingCountry) {
      const detectedCountry = findCountryByCode(countryInfo.countryCode);
      // Only update if different from current selection
      if (detectedCountry.code !== selectedCountry.code) {
        console.log('🌍 Signup: Country detected, updating from', selectedCountry.name, 'to', detectedCountry.name);
        setSelectedCountry(detectedCountry);
        // Clear location when country changes
        setSelectedLocation(null);
      }
    }
  }, [countryInfo?.countryCode, isDetectingCountry]);
  
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
    
    const taskData: any = {
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
      images: myTask.photos || [],
    };
    
    console.log('📸 Task images from myTask.photos:', myTask.photos?.length || 0, 'images');
    
    // ✅ Include coordinates if available from location selection
    if (!myTask.isRemoval && myTask.coordinates && myTask.coordinates.lat && myTask.coordinates.lng) {
      taskData.coordinates = {
        lat: myTask.coordinates.lat,
        lng: myTask.coordinates.lng
      };
      console.log('📍 Including coordinates in task request:', taskData.coordinates);
    } else {
      console.log('⚠️ No coordinates available from myTask');
    }
    
    return taskData;
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
      console.log('📝 [SIGNUP] Task data prepared for posting:', {
        title: taskData.title,
        hasImages: !!taskData.images,
        imageCount: taskData.images?.length || 0,
        firstImagePreview: taskData.images?.[0]?.substring(0, 50)
      });
      console.log('📸 [SIGNUP] CRITICAL: Verifying myTask.photos from store:', {
        photosExist: !!myTask.photos,
        photosCount: myTask.photos?.length || 0,
        photosPreview: myTask.photos?.map(p => p.substring(0, 30))
      });
      
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
      // Parse backend error message for specific issues
      let errorMessage = 'Failed to create account. Please try again.';
      let errorTitle = 'Sign Up Error';
      
      if (error?.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Check for phone validation errors
        if (backendMessage.toLowerCase().includes('validation failed') || 
            (backendMessage.toLowerCase().includes('phone') && 
             backendMessage.toLowerCase().includes('invalid'))) {
          errorTitle = 'Invalid Mobile Number';
          errorMessage = 'Please enter a valid mobile number';
        }
        // Check for phone already registered
        else if (backendMessage.toLowerCase().includes('phone') && 
            (backendMessage.toLowerCase().includes('already') || 
             backendMessage.toLowerCase().includes('exists') ||
             backendMessage.toLowerCase().includes('registered'))) {
          errorMessage = 'Phone number already registered. Please use a different number or login.';
        }
        // Check for email already registered
        else if (backendMessage.toLowerCase().includes('email') && 
                   (backendMessage.toLowerCase().includes('already') || 
                    backendMessage.toLowerCase().includes('exists') ||
                    backendMessage.toLowerCase().includes('registered'))) {
          errorMessage = 'Email already registered. Please use a different email or login.';
        }
        // Default to backend message
        else {
          errorMessage = backendMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (__DEV__) {
        console.log('ℹ️ Signup failed:', errorMessage);
      }
      
      Alert.alert(errorTitle, errorMessage);
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
      
      // Backend automatically sends SMS after email verification
      console.log('📱 SMS OTP should be sent by backend automatically');
      
    } catch (error: any) {
      if (__DEV__) {
        console.log('ℹ️ Email verification error:', error?.response?.data?.message || error?.message);
      }
      
      // Extract the actual error message from the backend
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Verification Failed', errorMessage);
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
      console.log('📱 SMS verification response:', data);
      
      // Backend returns: { verified: true, token: "...", user: {...}, message: "..." }
      if (data.verified === true) {
        setSmsVerified(true);
        
        console.log('🎉 Account verification completed successfully!');
        console.log('📝 User data received:', data.user);
        console.log('🔐 User needs to login with their credentials');
        
        // Close modal first
        setVerificationStep(null);
        
        // Small delay to let modal close
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Clear the form data for security
        const userEmail = email; // Save email before clearing
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setDateOfBirth(null);
        setSelectedLocation(null);
        
        // Navigate to login immediately
        console.log('🚀 Navigating to login screen...');
        router.replace('/(auth)/login' as any);
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            'Account Created Successfully!',
            `Your account has been verified. Please login with ${userEmail} to continue.`,
            [{ text: 'OK' }]
          );
        }, 500);
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
    // Backend automatically sends SMS after email verification
    // This function is kept for manual resend only
    console.log('📱 Note: SMS is automatically sent by backend after email verification');
    console.log('⚠️ Separate SMS send endpoint may not be available');
  };

  const handleResendSms = async () => {
    try {
      const fullPhone = `${selectedCountry.phoneCode}${phone}`;
      console.log(`📱 Attempting to resend SMS OTP to ${fullPhone} for email ${email}`);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/two-factor-auth/send-sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, email }),
        }
      );
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('📱 SMS Resend API Response:', {
          status: response.status,
          ok: response.ok,
          data: data
        });
        
        if (data.success || data.verified) {
          setSmsTimer(57);
          Alert.alert('Sent!', 'Verification code resent to your phone.');
        } else {
          Alert.alert('Info', 'SMS code may have been sent. Please check your messages.');
        }
      } else {
        // HTML response (404 or error page)
        console.warn('⚠️ SMS resend endpoint returned non-JSON response');
        Alert.alert(
          'SMS Resend Unavailable',
          'The SMS code was already sent when you verified your email. Please check your messages.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      if (__DEV__) {
        console.log('ℹ️ Failed to resend SMS code:', error?.message);
      }
      Alert.alert(
        'Info',
        'The SMS code was already sent. Please check your messages or wait for the timer to try again.',
        [{ text: 'OK' }]
      );
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
      if (__DEV__) {
        console.log('ℹ️ Google Sign-In backend error:', error?.response?.data?.message || error?.message);
      }
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
      
      // Check if in Expo Go
      const Constants = await import('expo-constants').then(m => m.default);
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        // Show message that Google Sign-In requires APK build
        Alert.alert(
          '📱 Native Build Required',
          'Google Sign-In/Sign-Up requires native Firebase modules and only works in APK builds.\n\n✅ You can still create an account with email/password in Expo Go.\n\n🔧 To use Google Sign-Up:\n1. Build APK with: eas build --platform android\n2. Install APK on device\n3. Test Google Sign-Up',
          [{ text: 'OK, I Understand' }]
        );
        setGoogleLoading(false);
        return;
      }
      
      console.log('🔐 Starting Firebase Google Sign-In for signup...');
      
      // Import Firebase Auth service
      const { signInWithGoogle } = await import('@/src/services/firebase-auth-service');
      
      // Get Firebase ID Token (Firebase SDK handles everything!)
      const firebaseIdToken = await signInWithGoogle();
      console.log('✅ Got Firebase ID Token');
      
      // Send to backend /users/firebase-auth
      await handleGoogleSignInSuccess(firebaseIdToken);
      
    } catch (error: any) {
      console.log('❌ Firebase Google Sign-In Error:', error?.message || 'Unknown error');
      console.log('Error code:', error?.code);
      
      let errorMessage = 'Unable to complete Google Sign-In. Please try again.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Google credentials. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === -5) {
        // User cancelled
        console.log('User cancelled Google Sign-In');
        setGoogleLoading(false);
        return;
      }
      
      Alert.alert('Sign-In Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCloseVerification = () => {
    setVerificationStep(null);
    // Clear OTP inputs
    setEmailOtp(['', '', '', '', '', '']);
    setSmsOtp(['', '', '', '', '', '']);
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
    handleCloseVerification,
    handleGoogleSignIn,
  };
};
