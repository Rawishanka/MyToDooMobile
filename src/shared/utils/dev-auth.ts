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
  
  try {
    // Check if we have stored credentials
    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');
    const storedToken = await AsyncStorage.getItem('token');
    
    if (storedToken) {
      // Try to use stored token
      console.log("🔄 Found stored token, attempting to restore session");
      
      // Create a mock user for the stored session
      const mockUser = {
        id: "dev-user-123",
        _id: "dev-user-123", 
        email: storedEmail || "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        role: "user" as const,
        isVerified: false, // Start as unverified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAuthData(storedToken, mockUser, 3600);
      console.log("✅ Development session restored");
      return;
    }
    
    // If no stored credentials, create a development session
    console.log("🔧 No authentication found, creating development session");
    
    const devToken = "dev-token-" + Date.now();
    const devUser = {
      id: "dev-user-123",
      _id: "dev-user-123",
      email: "john.doe@example.com", 
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "user" as const,
      isVerified: false, // Important: Start as unverified
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Set development auth data
    setAuthData(devToken, devUser, 3600);
    
    // Store for persistence
    await AsyncStorage.setItem('token', devToken);
    await AsyncStorage.setItem('userEmail', devUser.email);
    
    console.log("✅ Development user session created:", {
      email: devUser.email,
      isVerified: devUser.isVerified
    });
    
  } catch (error) {
    console.error("❌ Failed to create development session:", error);
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