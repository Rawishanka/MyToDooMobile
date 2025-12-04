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
    
    if (!token) {
      return;
    }
    
    if (!user) {
      // Allow setting token without user for initial restoration
      // The user data will be fetched from API later
      set({ token, user: null, expiresIn, isAuthenticated: !!token });
      return;
    }
    
    set({ token, user, expiresIn, isAuthenticated: true });
  },
  clearUser: () => {
    set({ user: null });
  },
  disableAuth: () => {
    set({ isAuthenticated: false });
  },
  clearAuth: async () => {
    set({ token: null, user: null, expiresIn: null, isAuthenticated: false });
    
    // Clear stored credentials
    try {
      await AsyncStorage.multiRemove(['token', 'userEmail', 'userPassword', 'user', 'expiresIn']);
      
      // NOTE: Cache clearing is now handled by the logout component to prevent race conditions
      // The clearAllCachesGlobal functionality has been moved to the logout sequence
      
    } catch (error) {
    }
  },
}));
