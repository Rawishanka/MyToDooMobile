// stores/useAuthStore.ts
import { User } from '@/src/api/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { getTokenExpiresIn } from '../shared/utils/jwt-utils';

interface AuthState {
  token: string | null;
  user: User | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  setAuthData: (token: string, user: User | null, expiresIn?: number) => Promise<void>;
  clearAuth: () => Promise<void>;
  clearUser: () => void;
  disableAuth: () => void; // Immediately disable auth to stop queries
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  expiresIn: null,
  isAuthenticated: false,
  setAuthData: async (token, user, expiresIn) => {
    console.log("🔐 Setting NEW auth data:", { 
      token: token?.substring(0, 20) + "...", 
      user: user ? {
        id: user.id || user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      } : undefined,
      expiresIn
    });
    
    if (!token) {
      console.error("❌ No token provided to setAuthData");
      return;
    }
    
    // If expiresIn not provided, extract it from JWT token
    let finalExpiresIn = expiresIn;
    if (!finalExpiresIn) {
      const extractedExpiresIn = getTokenExpiresIn(token);
      if (extractedExpiresIn) {
        finalExpiresIn = extractedExpiresIn;
        console.log(`⏰ Extracted expiresIn from token: ${finalExpiresIn} seconds`);
      }
    }
    
    // Save to AsyncStorage for persistence
    try {
      await AsyncStorage.setItem('token', token);
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      if (finalExpiresIn) {
        await AsyncStorage.setItem('expiresIn', finalExpiresIn.toString());
      }
      // Set flag that user has logged in before (for welcome screen logic)
      await AsyncStorage.setItem('hasLoggedInBefore', 'true');
      console.log("🏁 hasLoggedInBefore flag set to 'true' - user will see login screen after logout");
      
      // Clear the logout flag since user is now logging in
      await AsyncStorage.removeItem('userLoggedOut');
      console.log("🔓 userLoggedOut flag cleared - user is now authenticated");
      
      console.log("💾 Auth data saved to AsyncStorage");
    } catch (error) {
      console.error("❌ Error saving auth data to AsyncStorage:", error);
    }
    
    if (!user) {
      console.warn("⚠️ No user provided to setAuthData - this might be initial token restoration");
      // Allow setting token without user for initial restoration
      // The user data will be fetched from API later
      set({ token, user: null, expiresIn: finalExpiresIn, isAuthenticated: !!token });
      console.log("✅ Token set without user data (will fetch user data later)");
      return;
    }
    
    set({ token, user, expiresIn: finalExpiresIn, isAuthenticated: true });
    console.log("✅ Auth data successfully set in store");
  },
  clearUser: () => {
    console.log("🧹 Clearing user data only...");
    set({ user: null });
  },
  disableAuth: () => {
    console.log("🚫 Disabling authentication immediately (for logout)...");
    set({ isAuthenticated: false });
  },
  clearAuth: async () => {
    console.log("🧹 Clearing auth data...");
    
    // CRITICAL: Set a flag in AsyncStorage to indicate user explicitly logged out
    // This persists across app restarts, unlike the Zustand store
    try {
      await AsyncStorage.setItem('userLoggedOut', 'true');
      console.log("🚪 userLoggedOut flag set - user will see login screen on app reopen");
    } catch (error) {
      console.error("❌ Error setting logout flag:", error);
    }
    
    // Set isAuthenticated to false in Zustand store
    set({ isAuthenticated: false, token: null, user: null, expiresIn: null });
    console.log("🚫 isAuthenticated set to FALSE in store");
    
    // Clear stored credentials from AsyncStorage
    try {
      await AsyncStorage.multiRemove([
        'token', 
        'user', 
        'expiresIn',
        'userEmail', 
        'userPassword',
        'saved_email',
        'saved_password',
        'remember_me'
      ]);
      console.log("✅ All auth data cleared from AsyncStorage");
      
      // Verify token was actually removed
      const verifyToken = await AsyncStorage.getItem('token');
      if (verifyToken) {
        console.warn("⚠️ Token still exists in AsyncStorage after clear, forcing removal");
        await AsyncStorage.removeItem('token');
      } else {
        console.log("✅ Verified: token removed from AsyncStorage");
      }
      
      // NOTE: Cache clearing is now handled by the logout component to prevent race conditions
      // The clearAllCachesGlobal functionality has been moved to the logout sequence
      
    } catch (error) {
      console.error("❌ Error clearing stored auth data:", error);
    }
  },
}));
