// stores/useAuthStore.ts
import { User } from '@/src/api/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  setAuthData: (token: string, user: User | null, expiresIn?: number) => void;
  clearAuth: () => Promise<void>;
  clearUser: () => void;
  disableAuth: () => void; // Immediately disable auth to stop queries
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  expiresIn: null,
  isAuthenticated: false,
  setAuthData: (token, user, expiresIn) => {
    console.log("🔐 Setting NEW auth data:", { 
      token: token?.substring(0, 20) + "...", 
      user: user ? {
        id: user.id || user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      } : undefined 
    });
    
    if (!token) {
      console.error("❌ No token provided to setAuthData");
      return;
    }
    
    if (!user) {
      console.warn("⚠️ No user provided to setAuthData - this might be initial token restoration");
      // Allow setting token without user for initial restoration
      // The user data will be fetched from API later
      set({ token, user: null, expiresIn, isAuthenticated: !!token });
      console.log("✅ Token set without user data (will fetch user data later)");
      return;
    }
    
    set({ token, user, expiresIn, isAuthenticated: true });
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
    set({ token: null, user: null, expiresIn: null, isAuthenticated: false });
    
    // Clear stored credentials
    try {
      await AsyncStorage.multiRemove(['token', 'userEmail', 'userPassword', 'user', 'expiresIn']);
      console.log("✅ All auth data cleared successfully");
      
      // NOTE: Cache clearing is now handled by the logout component to prevent race conditions
      // The clearAllCachesGlobal functionality has been moved to the logout sequence
      
    } catch (error) {
      console.error("❌ Error clearing stored auth data:", error);
    }
  },
}));
