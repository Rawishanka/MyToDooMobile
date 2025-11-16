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
    console.log("✅ User already authenticated");
    return;
  }
  
  // Check if we're in development mode
  const isDevelopment = __DEV__;
  if (!isDevelopment) {
    console.log("🔧 Not in development mode, skipping auto-login");
    return;
  }
  
  try {
    // Check if we have stored credentials
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    const storedToken = await AsyncStorage.getItem('token');
    
    if (storedToken) {
      // Don't create mock user - let the app fetch real user data from API
      console.log("🔄 Found stored token in development, setting token only");
      setAuthData(storedToken, null, 3600);
      console.log("✅ Development token restored (user data will be fetched from API)");
      return;
    }
    
    // Only create development session if explicitly requested
    console.log("🔧 No stored token found in development mode");
    
  } catch (error) {
    console.error("❌ Error during development auto-login:", error);
  }
}

/**
 * Clear all authentication and force re-login
 */
export async function clearAuthAndRestart() {
  const { clearAuth } = useAuthStore.getState();
  await clearAuth();
  console.log("🔄 Authentication cleared - app will need fresh login");
}