// 🔐 **AUTHENTICATION UTILITIES**
// Utility functions for handling authentication state and recovery

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth-task-store';

/**
 * 🧹 Clear All Authentication Data
 * Removes all stored tokens and credentials from both AsyncStorage and auth store
 */
export async function clearAllAuthData() {
  try {
    console.log("🧹 Clearing all authentication data...");
    
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