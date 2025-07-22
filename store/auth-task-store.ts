// stores/useAuthStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  expiresIn: number | null;
  setAuthData: (token: string, user: User, expiresIn: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  expiresIn: null,
  setAuthData: (token, user, expiresIn) => set({ token, user, expiresIn }),
  clearAuth: () => set({ token: null, user: null, expiresIn: null }),
}));
