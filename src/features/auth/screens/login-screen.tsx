import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { auth } from '@/src/config/firebase';
import { useAppleSignIn, useCreateAuthToken, useGoogleSignIn } from '@/src/shared/hooks/useApi';
import { usePostTaskDirect } from '@/src/shared/hooks/useTaskApi';
import { USER_PROFILE_QUERY_KEYS } from '@/src/shared/hooks/useUserProfileApi';
import { useClearCachesOnLogin } from '@/src/shared/utils/cache-utils';
import { checkPendingAction, executePendingAction } from '@/src/shared/utils/pending-action-utils';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { usePendingActionStore } from '@/src/store/pending-action-store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const { mutateAsync } = useCreateAuthToken();
  const { mutateAsync: googleSignIn } = useGoogleSignIn();
  const { mutateAsync: appleSignIn } = useAppleSignIn();
  const clearCachesOnLogin = useClearCachesOnLogin();
  const queryClient = useQueryClient();
  
  // Task store and mutation for auto-posting pending tasks
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = usePostTaskDirect(); // ✅ Use postTaskDirect for proper image handling
  const { pendingAction } = usePendingActionStore();

  // Check if Firebase Auth is available (native build only)
  const isFirebaseAvailable = !!auth;
  
  console.log('🔐 Firebase Auth Status:', isFirebaseAvailable ? 'Available' : 'Not Available (Expo Go)');

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
    checkAppleAuthAvailability();
  }, []);

  const checkAppleAuthAvailability = async () => {
    if (Platform.OS === 'ios') {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
      console.log('🍎 Apple Authentication available:', isAvailable);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('saved_email');
      const savedPassword = await AsyncStorage.getItem('saved_password');
      const rememberMeValue = await AsyncStorage.getItem('remember_me');
      
      // Load Remember Me checkbox state independently
      if (rememberMeValue === 'true') {
        setRememberMe(true);
      }
      
      // Load saved credentials if they exist and Remember Me is checked
      if (rememberMeValue === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        console.log('✅ Loaded saved credentials');
      } else if (rememberMeValue === 'true') {
        console.log('⚠️ Remember Me is enabled but no saved credentials found');
      }
    } catch (error) {
      console.log('⚠️ Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem('saved_email', email);
      await AsyncStorage.setItem('saved_password', password);
      await AsyncStorage.setItem('remember_me', 'true');
      console.log('✅ Credentials saved successfully', { email: email.substring(0, 5) + '***' });
    } catch (error) {
      console.log('⚠️ Error saving credentials:', error);
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('saved_email');
      await AsyncStorage.removeItem('saved_password');
      await AsyncStorage.removeItem('remember_me');
      console.log('✅ Credentials cleared');
    } catch (error) {
      console.log('⚠️ Error clearing credentials:', error);
    }
  };

  const handleGoogleSignInSuccess = useCallback(async (idToken: string) => {
    try {
      setGoogleLoading(true);
      
      console.log('✅ Google Sign-In successful, ID token received');
      console.log('📤 Sending token to backend...');
      
      // Clear all caches BEFORE Google Sign-In to ensure no stale data
      console.log('🧹 Pre-Google login: Clearing all cached data...');
      clearCachesOnLogin();
      await queryClient.clear(); // Force clear everything
      
      // Send the ID token to backend
      const result = await googleSignIn({ credential: idToken });
      
      console.log('✅ Backend authentication successful:', result);
      console.log('🔍 Auth result details:', { 
        hasToken: !!result.token, 
        hasUser: !!result.user,
        userEmail: result.user?.email,
        userId: result.user?.id 
      });
      
      // Wait a moment for auth store to be updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check current auth state
      const authState = useAuthStore.getState();
      console.log('🔍 Auth state after Google Sign-In:', {
        hasToken: !!authState.token,
        hasUser: !!authState.user,
        isAuthenticated: authState.isAuthenticated,
        userEmail: authState.user?.email
      });
      
      // Force invalidate profile queries to ensure fresh profile data with user context
      if (authState.user?.id) {
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        await queryClient.invalidateQueries({ queryKey: ['chats'] }); // Invalidate all chat queries
        console.log('🔄 Profile and chat queries invalidated for user:', authState.user.id);
      }
      
      // Check for pending actions after successful login
      const pendingActionType = checkPendingAction();
      if (pendingActionType) {
        console.log('📋 Found pending action after Google login, executing:', pendingActionType);
        await executePendingAction();
      } else {
        console.log('🚀 No pending action, navigating to tabs...');
        // Navigate to tabs (which shows welcome screen as default) after successful login
        router.replace('/(tabs)' as any);
      }
      
    } catch (error: any) {
      // Use console.log to prevent Metro crashes
      console.log('❌ Google Sign-In backend error:', error?.message);
      console.log('📊 Error details:', {
        message: error?.message,
        backendMessage: error?.response?.data?.message,
        status: error?.response?.status,
      });
      
      Alert.alert(
        'Sign-In Failed',
        error?.response?.data?.message || error?.message || 'Unable to complete Google Sign-In. Please try again or use email/password.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [googleSignIn, clearCachesOnLogin, queryClient, router]);

  // Helper function to check if there's a pending task
  const hasPendingTask = () => {
    return myTask && myTask.title && myTask.title.trim() !== '';
  };

  // Helper function to convert task store data to API format
  const convertTaskToAPIFormat = () => {
    const taskDate = myTask.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const category = !myTask.isRemoval && myTask.category ? myTask.category : "General";
    
    let locationString = '';
    if (!myTask.isRemoval) {
      // Type narrowing: myTask is CategoryTask here
      locationString = myTask.location || '';
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

  // Helper function to post pending task after login
  const postPendingTask = async () => {
    if (!hasPendingTask()) {
      console.log('No pending task to post');
      return false;
    }

    try {
      console.log('🚀 Posting pending task after login...');
      
      // Wait for authentication token to be properly set in API client
      console.log('⏱️ Waiting for auth token to be set in API client...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const taskData = convertTaskToAPIFormat();
      console.log('📝 Task data prepared for posting:', {
        title: taskData.title,
        hasImages: !!taskData.images,
        imageCount: taskData.images?.length || 0,
        firstImagePreview: taskData.images?.[0]?.substring(0, 50)
      });
      console.log('📸 CRITICAL: Verifying myTask.photos from store:', {
        photosExist: !!myTask.photos,
        photosCount: myTask.photos?.length || 0,
        photosPreview: myTask.photos?.map(p => p.substring(0, 30))
      });
      
      const result = await postTaskMutation.mutateAsync(taskData);
      console.log('✅ Pending task posted successfully:', result);
      
      // Reset task store after successful posting
      resetTask();
      console.log('🔄 Task store reset after posting');
      
      // Add delay to ensure server processes the task
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('⏱️ Waited for server to process task');
      
      return true;
    } catch (error) {
      console.error('❌ Error posting pending task:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    // Comprehensive input validation
    const trimmedEmail = email?.trim() || '';
    const trimmedPassword = password?.trim() || '';

    // Check for empty fields
    if (!trimmedEmail && !trimmedPassword) {
      Alert.alert(
        'Missing Information', 
        'Please enter your email and password to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!trimmedEmail) {
      Alert.alert(
        'Email Required', 
        'Please enter your email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!trimmedPassword) {
      Alert.alert(
        'Password Required', 
        'Please enter your password.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        'Invalid Email Format', 
        'Please enter a valid email address (e.g., example@email.com).',
        [{ text: 'OK' }]
      );
      return;
    }

    // Password length validation
    if (trimmedPassword.length < 3) {
      Alert.alert(
        'Password Too Short', 
        'Password must be at least 3 characters long.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      
      // Clear all caches BEFORE login to ensure no stale data
      console.log('🧹 Pre-login: Clearing all cached data...');
      clearCachesOnLogin();
      await queryClient.clear(); // Force clear everything
      
      // Use trimmed values for login
      await mutateAsync({ username: trimmedEmail.toLowerCase(), password: trimmedPassword });
      
      // Save or clear credentials based on Remember Me checkbox
      if (rememberMe) {
        console.log('💾 Remember Me is checked, saving credentials...');
        await saveCredentials(trimmedEmail, trimmedPassword);
      } else {
        console.log('🗑️ Remember Me is unchecked, clearing saved credentials...');
        await clearSavedCredentials();
      }
      
      // Force invalidate profile queries to ensure fresh profile data
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: ['chats'] }); // Invalidate all chat queries
      console.log('🔄 Profile and chat queries invalidated for fresh data');
      
      // Check if there's a pending task to post
      if (hasPendingTask()) {
        console.log('📋 Pending task detected after login');
        const taskPosted = await postPendingTask();
        
        if (taskPosted) {
          Alert.alert(
            'Success!',
            'Login successful! Your task has been posted.',
            [
              {
                text: 'View My Tasks',
                onPress: () => {
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
            'Login successful! However, there was an issue posting your task. You can create it again from the home page.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)' as any)
              }
            ]
          );
        }
      } else {
        // No pending task, just navigate to home
        // Check for pending actions after successful login
        const pendingActionType = checkPendingAction();
        if (pendingActionType) {
          console.log('🔄 Found pending action after email login, executing:', pendingActionType);
          await executePendingAction();
        } else {
          console.log('🚀 No pending action, navigating to tabs...');
          // Navigate back to detail screen after successful login
          router.replace('/(tabs)' as any);
        }
      }
    } catch (error: any) {
      // Use console.log instead of console.error to prevent Metro crashes
      console.log('❌ Login Error:', error?.message || 'Unknown error');
      console.log('📊 Login Error Details:', {
        status: error?.response?.status,
        message: error?.message,
        backendMessage: error?.response?.data?.message,
        code: error?.code
      });
      
      // Get error message from backend if available
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      
      // Show user-friendly error messages based on status code and error details
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        // Check if it's specifically about invalid email format
        if (backendMessage?.toLowerCase().includes('email') && backendMessage?.toLowerCase().includes('invalid')) {
          Alert.alert(
            'Invalid Email Format', 
            'The email address format is incorrect. Please check and try again.',
            [{ text: 'OK' }]
          );
        } else if (backendMessage?.toLowerCase().includes('not found') || backendMessage?.toLowerCase().includes('does not exist')) {
          Alert.alert(
            'Account Not Found', 
            'We couldn\'t find an account with this email address.\n\nWould you like to create a new account?',
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Create Account', 
                onPress: () => router.push('/(auth)/signup' as any),
                style: 'default'
              }
            ]
          );
        } else if (backendMessage?.toLowerCase().includes('invalid credentials') || 
                   backendMessage?.toLowerCase().includes('incorrect password')) {
          Alert.alert(
            'Incorrect Credentials', 
            'The email or password you entered is incorrect.\n',
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Reset Password', 
                onPress: () => router.push('/(auth)/forgot-password' as any),
                style: 'default'
              }
            ]
          );
        } else {
          // Generic invalid credentials message
          Alert.alert(
            'Login Failed', 
            backendMessage || 'Unable to log in with the provided credentials. Please verify your email and password.',
            [{ text: 'OK' }]
          );
        }
      } else if (error?.response?.status === 404) {
        Alert.alert(
          'Account Not Found', 
          'This email is not registered.\n\nPlease check your email or create a new account.',
          [
            { text: 'Try Again', style: 'cancel' },
            { 
              text: 'Sign Up', 
              onPress: () => router.push('/(auth)/signup' as any),
              style: 'default'
            }
          ]
        );
      } else if (error?.response?.status === 429) {
        Alert.alert(
          'Too Many Attempts', 
          'You\'ve made too many login attempts. Please wait a few minutes and try again.',
          [{ text: 'OK' }]
        );
      } else if (error?.response?.status >= 500) {
        Alert.alert(
          'Server Error', 
          'Our servers are experiencing issues. Please try again in a few moments.',
          [{ text: 'OK' }]
        );
      } else if (error?.message?.includes('Network Error') || 
                 error?.code === 'ECONNREFUSED' || 
                 error?.code === 'ETIMEDOUT' ||
                 error?.message?.includes('timeout')) {
        Alert.alert(
          'Connection Problem', 
          'Unable to connect to the server.\n\n✓ Check your internet connection\n✓ Make sure you have WiFi or mobile data\n✓ Try again in a moment',
          [{ text: 'OK' }]
        );
      } else if (error?.code === 'ERR_NETWORK') {
        Alert.alert(
          'Network Error', 
          'A network error occurred. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        // Show backend error message if available, otherwise generic message
        Alert.alert(
          'Unable to Login', 
          backendMessage || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // Check if Firebase Auth is available (only in APK, not Expo Go)
      if (!isFirebaseAvailable) {
        Alert.alert(
          '📱 Native Build Required',
          'Google Sign-In requires native Firebase modules and only works in APK builds.\n\n✅ You can use email/password login in Expo Go.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
        return;
      }
      
      console.log('🔐 Starting Firebase Google Sign-In...');
      
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

  // ========================================
  // APPLE SIGN-IN WITH BACKEND AUTHENTICATION
  // Calls backend /apple endpoint to get real auth token
  // ========================================
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      
      console.log('🍎 Starting Apple Sign-In with backend authentication...');
      
      // 1. Perform Apple authentication request
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('✅ Got Apple credential:', {
        user: credential.user,
        email: credential.email,
        hasIdToken: !!credential.identityToken,
        hasAuthCode: !!credential.authorizationCode,
        hasFullName: !!credential.fullName
      });
      
      if (!credential.identityToken || !credential.authorizationCode) {
        throw new Error('Missing Apple authentication tokens');
      }
      
      // 2. Call backend /apple endpoint to validate with Apple and get backend token
      console.log('🔄 Calling backend /apple endpoint to get auth token...');
      
      const appleUserId = credential.user;
      
      // Prepare user data for backend (only available on first sign-in)
      let userData = undefined;
      if (credential.email || credential.fullName) {
        userData = {
          name: {
            firstName: credential.fullName?.givenName || '',
            lastName: credential.fullName?.familyName || ''
          }
        };
      }
      
      // Call the backend Apple Sign-In mutation
      const result = await appleSignIn({
        id_token: credential.identityToken,
        code: credential.authorizationCode,
        user: userData,
        mode: 'signin'
      });
      
      console.log('✅ Backend authentication successful:', {
        hasToken: !!result.token,
        hasUser: !!result.user,
        isNewUser: result.isNewUser,
        userEmail: result.user?.email
      });
      
      // 3. Store Apple user ID in Keychain for credential verification
      // This allows us to verify the credential state on app launch
      await SecureStore.setItemAsync(
        `apple_user_id`,
        appleUserId,
        {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
        }
      );
      
      console.log('🔐 Stored Apple user ID in Keychain:', appleUserId);
      
      // 4. Backend has already set auth data via setAuthData in the mutation
      // No need to manually call setAuthData here
      
      // 5. Clear caches after successful auth
      console.log('🧹 Clearing cached data after Apple Sign-In...');
      clearCachesOnLogin();
      await queryClient.clear();
      
      // 6. Check for pending actions after successful login
      const hasPendingAction = await checkPendingAction();
      if (hasPendingAction) {
        console.log('📋 Found pending action after Apple login');
        await executePendingAction();
      } else {
        // No pending action - navigate to home
        console.log('🏠 Navigating to home screen');
        router.replace('/(tabs)');
      }
      
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled - don't show error, just stop
        console.log('❌ User canceled Apple Sign-In');
      } else {
        console.error('❌ Apple Sign-In error:', error);
        Alert.alert(
          'Sign In Failed',
          error.message || 'Could not sign in with Apple. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setAppleLoading(false);
    }
  };

  // ========================================
  // GOOGLE SIGN-IN
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Cross icon in top right */}
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => {
          // Clear pending action if user cancels login
          if (pendingAction) {
            const { clearPendingAction } = usePendingActionStore.getState();
            clearPendingAction();
            console.log("🔄 Cleared pending action due to login cancellation");
          }
          router.replace('/');
        }}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentWrapper}>
        <View style={styles.header}>
          {/* MyToDoo SVG Logo in Blue Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <MyToDooLogo 
                width={50}
                height={50}
              />
            </View>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          {pendingAction && (
            <View style={styles.pendingActionBanner}>
              <Ionicons name="information-circle" size={16} color="#007AFF" />
              <Text style={styles.pendingActionText}>
                {pendingAction.type === 'post-task' ? 
                  'Complete your login to post your task' :
                  'Complete your login to continue'
                }
              </Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
              importantForAutofill="yes"
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

          {/* Remember Me Checkbox */}
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={async () => {
              const newValue = !rememberMe;
              setRememberMe(newValue);
              console.log('🔄 Remember Me toggled:', newValue);
              // Immediately save the Remember Me preference
              try {
                await AsyncStorage.setItem('remember_me', newValue ? 'true' : 'false');
                console.log('✅ Remember Me preference saved:', newValue);
                if (!newValue) {
                  // If unchecking, clear saved credentials immediately
                  await clearSavedCredentials();
                }
              } catch (error) {
                console.log('⚠️ Error updating Remember Me preference:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignIn} 
            disabled={googleLoading || loading || appleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#666" />
            ) : (
              <>
                <Image 
                  source={require('@/assets/icons/google.png')}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign-In Button - Only show on iOS if available */}
          {Platform.OS === 'ios' && appleAuthAvailable && (
            <TouchableOpacity 
              style={styles.appleButton} 
              onPress={handleAppleSignIn} 
              disabled={appleLoading || loading || googleLoading}
            >
              {appleLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#fff" style={styles.appleIcon} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  contentWrapper: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoBackground: {
    backgroundColor: '#0a2d5c',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#333',
    backgroundColor: '#fff',
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#333',
    fontSize: 15,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333',
  },
  forgotPassword: {
    color: '#007BFF',
    textAlign: 'right',
    marginBottom: 16,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  appleIcon: {
    marginRight: 10,
  },
  appleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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
  pendingActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pendingActionText: {
    flex: 1,
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '500',
  },
});
