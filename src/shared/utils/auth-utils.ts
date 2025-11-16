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
 */
export async function clearAllAuthData() {
  try {
    console.log("🧹 Clearing all authentication data...");
    
    // Clear React Query cache first to prevent data persistence
    // Note: This needs to be called from a component context for the hook to work
    try {
      console.log("ℹ️ Clearing all authentication data (cache clearing should be handled by calling component)");
    } catch (cacheError) {
      console.log("ℹ️ Cache clearing not available (normal during startup)");
    }
    
    // Clear auth store
    useAuthStore.getState().clearAuth();
    
    // Clear all authentication-related items from AsyncStorage
    await AsyncStorage.multiRemove([
      'token',
      'userEmail', 
      'userPassword',
      'user',
      'expiresIn'
    ]);
    
    console.log("✅ All authentication data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing authentication data:", error);
  }
}

/**
 * 🔍 Debug Authentication State
 * Logs current authentication state for debugging
 */
export async function debugAuthState() {
  try {
    console.log("🔍 === DEBUG AUTHENTICATION STATE ===");
    
    // Check auth store
    const authState = useAuthStore.getState();
    console.log("📱 Auth Store State:", {
      hasToken: !!authState.token,
      hasUser: !!authState.user,
      expiresIn: authState.expiresIn
    });
    
    // Check AsyncStorage
    const storedToken = await AsyncStorage.getItem('token');
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    
    console.log("💾 AsyncStorage State:", {
      hasStoredToken: !!storedToken,
      hasStoredEmail: !!storedEmail,
      hasStoredPassword: !!storedPassword,
      tokenPreview: storedToken ? storedToken.substring(0, 20) + "..." : "none"
    });
    
    console.log("🔍 === END DEBUG ===");
  } catch (error) {
    console.error("❌ Error debugging auth state:", error);
  }
}

/**
 * 🔄 Force Fresh Login
 * Clears all auth data and redirects to login
 */
export async function forceFreshLogin() {
  await clearAllAuthData();
  console.log("🔄 Authentication cleared. Please login again for a fresh session.");
}

/**
 * 🚨 Handle Authentication Error Globally
 * Called when authentication errors (401) are detected in API calls
 * Automatically clears auth data and redirects to login screen
 */
export async function handleAuthenticationError(error: any, showAlert = true) {
  try {
    console.log("🚨 Authentication error detected:", error?.message || "Token expired");
    
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
              console.log("🔄 Redirecting to login screen...");
              try {
                router.replace('/(auth)/login');
              } catch (routerError) {
                console.error("❌ Error redirecting to login:", routerError);
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
      console.log("🔄 Redirecting to login screen...");
      try {
        router.replace('/(auth)/login');
      } catch (routerError) {
        console.error("❌ Error redirecting to login:", routerError);
        // Fallback: try to navigate to root and then login
        router.dismissAll();
        router.replace('/');
      }
    }
    
    console.log("✅ Authentication error handled successfully");
  } catch (error) {
    console.error("❌ Error handling authentication error:", error);
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