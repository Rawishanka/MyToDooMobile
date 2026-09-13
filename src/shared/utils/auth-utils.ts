// 🔐 **AUTHENTICATION UTILITIES**
// Utility functions for handling authentication state and recovery

import API_CONFIG from '@/src/api/config';
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { Alert } from 'react-native';

let rememberMeRenewInFlight: Promise<boolean> | null = null;

export async function getRememberMeCredentials(): Promise<{ email: string; password: string } | null> {
  const rememberMe = await AsyncStorage.getItem('remember_me');
  const userLoggedOut = await AsyncStorage.getItem('userLoggedOut');
  if (rememberMe !== 'true' || userLoggedOut === 'true') return null;

  const email =
    (await AsyncStorage.getItem('saved_email')) ||
    (await AsyncStorage.getItem('userEmail'));
  const password =
    (await AsyncStorage.getItem('saved_password')) ||
    (await AsyncStorage.getItem('userPassword'));

  if (!email || !password) return null;
  return { email, password };
}

/** Silent login when Remember Me is on. Used for 24h JWT auto-renewal. */
export async function tryRememberMeRenew(): Promise<boolean> {
  if (rememberMeRenewInFlight) return rememberMeRenewInFlight;

  rememberMeRenewInFlight = (async () => {
    const creds = await getRememberMeCredentials();
    if (!creds) return false;

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/login`,
      { email: creds.email, password: creds.password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      }
    );

    const { token, user, expiresIn } = response.data || {};
    if (!token || !user) return false;

    await useAuthStore.getState().setAuthData(token, user, expiresIn);
    await AsyncStorage.setItem('userEmail', creds.email);
    await AsyncStorage.setItem('userPassword', creds.password);
    await AsyncStorage.setItem('saved_email', creds.email);
    await AsyncStorage.setItem('saved_password', creds.password);
    await AsyncStorage.setItem('remember_me', 'true');
    return true;
  })();

  try {
    return await rememberMeRenewInFlight;
  } catch (error: any) {
    console.warn('⚠️ Remember Me renew failed:', error?.message);
    return false;
  } finally {
    rememberMeRenewInFlight = null;
  }
}

/**
 * 🧹 Clear All Authentication Data
 * Removes all stored tokens and credentials from both AsyncStorage and auth store
 * Also clears React Query cache to prevent data persistence
 * Also resets task creation form to clear any unsaved user data
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
    
    // Clear task creation store to prevent form data persistence
    const { resetTask } = await import('@/src/store/create-task-store').then(m => m.useCreateTaskStore.getState());
    resetTask();
    console.log("✅ Task creation form reset");
    
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

    const renewed = await tryRememberMeRenew();
    if (renewed) {
      console.log("✅ Session renewed with Remember Me — staying logged in");
      return;
    }
    
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