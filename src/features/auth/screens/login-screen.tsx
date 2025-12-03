import MyToDooLogo from '@/assets/images/MyToDoo_logo.svg';
import { useCreateAuthToken, useGoogleSignIn } from '@/src/shared/hooks/useApi';
import { useCreateTask } from '@/src/shared/hooks/useTaskApi';
import { USER_PROFILE_QUERY_KEYS } from '@/src/shared/hooks/useUserProfileApi';
import { useClearCachesOnLogin } from '@/src/shared/utils/cache-utils';
import { checkPendingAction, executePendingAction } from '@/src/shared/utils/pending-action-utils';
import { useAuthStore } from '@/src/store/auth-task-store';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { usePendingActionStore } from '@/src/store/pending-action-store';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Warm up the browser for better OAuth performance
WebBrowser.warmUpAsync();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync } = useCreateAuthToken();
  const { mutateAsync: googleSignIn } = useGoogleSignIn();
  const clearCachesOnLogin = useClearCachesOnLogin();
  const queryClient = useQueryClient();
  
  // Task store and mutation for auto-posting pending tasks
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = useCreateTask();
  const { pendingAction } = usePendingActionStore();

  // Get Google Client ID from environment
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  // Use the correct owner from app.config.ts
  const owner = Constants.expoConfig?.owner || 'janidu5678';
  const slug = Constants.expoConfig?.slug || 'MyToDooMobile';
  
  // Always use Expo auth proxy for better compatibility
  const redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
  
  console.log('📱 Redirect URI for Google OAuth:', redirectUri);
  console.log('🔐 Google Client ID:', googleClientId ? 'Configured' : 'Not configured');
  console.log('🔐 Google Sign-In Configuration:', {
    'Client ID': googleClientId,
    'Redirect URI': redirectUri,
    'Owner': owner,
    'Slug': slug,
  });
  
  // Configure Google Sign-In - Use Web Client ID for mobile
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

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
        console.log('🔄 Profile queries invalidated for user:', authState.user.id);
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

  // Handle Google Sign-In response
  useEffect(() => {
    if (!response) return;

    console.log('🔍 Google OAuth Response:', {
      type: response.type,
      params: (response as any).params,
      error: (response as any).error,
    });

    if (response?.type === 'success') {
      const { id_token, authentication } = (response as any).params;
      const token = id_token || authentication?.idToken;
      
      if (token) {
        handleGoogleSignInSuccess(token);
      } else {
        console.log('⚠️ No ID token in response:', (response as any).params);
        Alert.alert(
          'Authentication Failed',
          'Unable to complete Google Sign-In. The authentication token was not received.\n\nPlease try again or use email/password login.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      console.log('❌ Google Sign-In error:', (response as any).error?.message || 'Unknown error');
      setGoogleLoading(false);
      
      // Check for specific error
      const errorMsg = (response as any).error?.message || '';
      const errorDescription = (response as any).error?.description || '';
      
      if (errorMsg.includes('invalid_request') || errorMsg.includes('400')) {
        Alert.alert(
          'Configuration Error',
          'Google Sign-In is not properly configured.\n\nPlease use email/password login or contact support.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('access_denied') || errorDescription.includes('access_denied')) {
        Alert.alert(
          'Access Denied',
          'Google Sign-In was denied. Please grant the necessary permissions or try email/password login.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        Alert.alert(
          'Connection Problem',
          'Unable to connect to Google services. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Google Sign-In Failed',
          'Unable to sign in with Google. Please try again or use email/password login.',
          [{ text: 'OK' }]
        );
      }
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      console.log('ℹ️ User cancelled Google Sign-In');
      setGoogleLoading(false);
    }
  }, [response, handleGoogleSignInSuccess]);

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
      console.log('📝 Task data:', taskData);
      
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
      
      // Force invalidate profile queries to ensure fresh profile data
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEYS.all });
      console.log('🔄 Profile queries invalidated for fresh data');
      
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
            'The email or password you entered is incorrect.\n\n✓ Check your email spelling\n✓ Verify your password is correct\n✓ Try using "Forgot Password" if needed',
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
      
      // Validate Google configuration
      if (!googleClientId) {
        Alert.alert(
          'Setup Required',
          'Google Sign-In is not configured for this app. Please use email/password login or contact support.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
        return;
      }

      if (!request) {
        Alert.alert(
          'Not Ready',
          'Google Sign-In is initializing. Please wait a moment and try again.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
        return;
      }
      
      // Log configuration for debugging
      console.log('🔐 Initiating Google Sign-In...');
      console.log('Client ID:', googleClientId.substring(0, 20) + '...');
      console.log('Redirect URI:', redirectUri);
      
      // Trigger Google Sign-In flow
      const result = await promptAsync();
      console.log('Google Sign-In result type:', result?.type);
      
    } catch (error: any) {
      console.log('❌ Google Sign-In Error:', error?.message || 'Unknown error');
      
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to Google. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('popup') || errorMessage.includes('Popup')) {
        Alert.alert(
          'Browser Error',
          'Unable to open Google Sign-In. Please try again or use email/password login.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sign-In Error',
          'Unable to complete Google Sign-In. Please try again or use email/password login.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };


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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
        <View style={styles.header}>
          {/* MyToDoo SVG Logo in Blue Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <MyToDooLogo 
                width={60}
                height={60}
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
            disabled={googleLoading || loading || !request}
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
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
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
  logoContainer: {
    marginBottom: 16,
  },
  logoBackground: {
    backgroundColor: '#0a2d5c',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
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
    color: '#333',
    backgroundColor: '#fff',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#333',
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
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
