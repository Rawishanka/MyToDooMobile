// 🔐 **AUTHENTICATION UTILITIES**
// Utility functions for handling authentication state and recovery

import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * 🧹 Clear All Authentication Data
 * Removes all stored tokens and credentials from both AsyncStorage and auth store
 * Also clears React Query cache to prevent data persistence
 * Also resets task creation form to clear any unsaved user data
 */
export async function clearAllAuthData() {
  try {
    
    // Clear React Query cache first to prevent data persistence
    // Note: This needs to be called from a component context for the hook to work
    try {
    } catch (cacheError) {
    }
    
    // Clear auth store
    useAuthStore.getState().clearAuth();
    
    // Clear task creation store to prevent form data persistence
    const { resetTask } = await import('@/src/store/create-task-store').then(m => m.useCreateTaskStore.getState());
    resetTask();
    
    // Clear all authentication-related items from AsyncStorage
    await AsyncStorage.multiRemove([
      'token',
      'userEmail', 
      'userPassword',
      'user',
      'expiresIn'
    ]);
    
  } catch (error) {
  }
}

/**
 * 🔍 Debug Authentication State
 * Logs current authentication state for debugging
 */
export async function debugAuthState() {
  try {
    
    // Check auth store
    const authState = useAuthStore.getState();
    
    // Check AsyncStorage
    const storedToken = await AsyncStorage.getItem('token');
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    
  } catch (error) {
  }
}

/**
 * 🔄 Force Fresh Login
 * Clears all auth data and redirects to login
 */
export async function forceFreshLogin() {
  await clearAllAuthData();
}

/**
 * 🚨 Handle Authentication Error Globally
 * Called when authentication errors (401) are detected in API calls
 * Automatically clears auth data and redirects to login screen
 */
export async function handleAuthenticationError(error: any, showAlert = true) {
  try {
    
    // Clear all authentication data
    await clearAllAuthData();
    
    // Show user-friendly alert (optional)
    if (showAlert) {
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please log in again to continue.",
        [
          {
            text: "OK",
            onPress: () => {
              // Redirect to login screen
              try {
                router.replace('/(auth)/login');
              } catch (routerError) {
                // Fallback: try to navigate to root and then login
                router.dismissAll();
                router.replace('/');
              }
            }
          }
        ]
      );
    } else {
      // Just redirect without alert
      try {
        router.replace('/(auth)/login');
      } catch (routerError) {
        // Fallback: try to navigate to root and then login
        router.dismissAll();
        router.replace('/');
      }
    }
    
  } catch (error) {
  }
}

/**
 * 🔍 Check if an error is an authentication error
 * Utility function to identify auth errors from API responses
 */
export function isAuthError(error: any): boolean {
  return (
    error?.isAuthError === true ||
    error?.status === 401 ||
    error?.response?.status === 401 ||
    error?.message?.includes("Authentication expired") ||
    error?.message?.includes("Please login again")
  );
}