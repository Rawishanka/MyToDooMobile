// stores/useAuthStore.ts
import { User } from '@/api/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  setAuthData: (token: string, user: User, expiresIn: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  expiresIn: null,
  isAuthenticated: false,
  setAuthData: (token, user, expiresIn) => set({ token, user, expiresIn, isAuthenticated: true }),
  clearAuth: async () => {
    set({ token: null, user: null, expiresIn: null, isAuthenticated: false });
    // Clear stored credentials
    try {
      await AsyncStorage.multiRemove(['token', 'userEmail', 'userPassword']);
      console.log("🧹 Cleared all stored auth data");
    } catch (error) {
      console.error("❌ Error clearing stored auth data:", error);
    }
  },
}));
