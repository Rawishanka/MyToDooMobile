// Development utilities for auto-login and testing
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Auto-login for development purposes
 * This function will automatically log in a development user if no authentication exists
 */
export async function autoLoginForDevelopment() {
  const { isAuthenticated, token, setAuthData } = useAuthStore.getState();
  
  // If already authenticated, do nothing
  if (isAuthenticated && token) {
    return;
  }
  
  // Check if we're in development mode
  const isDevelopment = __DEV__;
  if (!isDevelopment) {
    return;
  }
  
  try {
    // Check if we have stored credentials
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    const storedToken = await AsyncStorage.getItem('token');
    
    if (storedToken) {
      // Don't create mock user - let the app fetch real user data from API
      setAuthData(storedToken, null, 3600);
      return;
    }
    
    // Only create development session if explicitly requested
    
  } catch (error) {
  }
}

/**
 * Clear all authentication and force re-login
 */
export async function clearAuthAndRestart() {
  const { clearAuth } = useAuthStore.getState();
  const { resetTask } = await import('@/src/store/create-task-store').then(m => m.useCreateTaskStore.getState());
  await clearAuth();
  resetTask();
}