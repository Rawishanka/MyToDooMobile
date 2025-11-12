import { useCreateAuthToken, useGoogleSignIn } from '@/src/shared/hooks/useApi';
import { useCreateTask } from '@/src/shared/hooks/useTaskApi';
import { checkPendingAction, executePendingAction } from '@/src/shared/utils/pending-action-utils';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { usePendingActionStore } from '@/src/store/pending-action-store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
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

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync } = useCreateAuthToken();
  const { mutateAsync: googleSignIn } = useGoogleSignIn();
  
  // Task store and mutation for auto-posting pending tasks
  const { myTask, resetTask } = useCreateTaskStore();
  const postTaskMutation = useCreateTask();
  const { pendingAction } = usePendingActionStore();

  // Get Google Client ID from environment
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  // FORCE use of Expo auth proxy - manually construct the URL
  // For Expo Go, we MUST use the auth proxy to avoid local IP issues
  const owner = Constants.expoConfig?.owner || 'nowanya';
  const slug = Constants.expoConfig?.slug || 'MyToDooMobile';
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
  });

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
        console.error('❌ No ID token in response:', (response as any).params);
        Alert.alert(
          'Authentication Error',
          'Unable to retrieve authentication token. Please try again.',
          [{ text: 'OK' }]
        );
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google Sign-In error:', (response as any).error);
      setGoogleLoading(false);
      
      // Check for specific error
      const errorMsg = (response as any).error?.message || '';
      if (errorMsg.includes('invalid_request') || errorMsg.includes('400')) {
        Alert.alert(
          'Google Sign-In Setup Required',
          'Please add this redirect URI to your Google Cloud Console:\n\n' + 
          redirectUri +
          '\n\nAlso add https://auth.expo.io to Authorized JavaScript origins.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Google Sign-In Failed',
          errorMsg || 'An error occurred during Google Sign-In. Please check your Google Cloud Console configuration.',
          [{ text: 'OK' }]
        );
      }
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      console.log('ℹ️ User dismissed/cancelled Google Sign-In');
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSignInSuccess = async (idToken: string) => {
    try {
      setGoogleLoading(true);
      
      console.log('✅ Google Sign-In successful, ID token received');
      console.log('📤 Sending token to backend...');
      
      // Send the ID token to backend
      const result = await googleSignIn({ credential: idToken });
      
      console.log('✅ Backend authentication successful:', result);
      
      // Check for pending actions after successful login
      const pendingActionType = checkPendingAction();
      if (pendingActionType) {
        console.log('� Found pending action after Google login, executing:', pendingActionType);
        await executePendingAction();
      } else {
        console.log('🚀 No pending action, navigating to tabs...');
        // Navigate to tabs (which shows welcome screen as default) after successful login
        router.replace('/(tabs)' as any);
      }
      
    } catch (error: any) {
      console.error('❌ Google Sign-In backend error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      Alert.alert(
        'Sign-In Failed',
        error.response?.data?.message || error.message || 'Unable to complete Google Sign-In. Please try again or use email/password.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

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
    // Validate inputs
    if (!email || !password) {
      Alert.alert(
        'Missing Information', 
        'Please enter both email and password.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      await mutateAsync({ username: email, password });
      
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
      console.error('Login Error:', error);
      
      // Show user-friendly error messages based on status code
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        Alert.alert(
          'Login Failed', 
          'Invalid email or password. Please check your credentials and try again.',
          [{ text: 'OK' }]
        );
      } else if (error?.response?.status === 404) {
        Alert.alert(
          'Account Not Found', 
          'No account found with this email. Please sign up first.',
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
          'Login Error', 
          'Something went wrong. Please try again later.',
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
      
      if (!googleClientId) {
        Alert.alert(
          'Configuration Error',
          'Google Sign-In is not configured. Please contact support.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Log configuration for debugging
      console.log('🔐 Google Sign-In Configuration:');
      console.log('Client ID:', googleClientId);
      console.log('Redirect URI:', redirectUri);
      console.log('Using Proxy:', true);
      
      // Trigger Google Sign-In flow
      const result = await promptAsync();
      console.log('Google Sign-In result:', result);
      
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      
      Alert.alert(
        'Sign-In Error',
        'Something went wrong with Google Sign-In. Please try again.',
        [{ text: 'OK' }]
      );
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
          <Text style={styles.footerText}>Don't have an account? </Text>
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
