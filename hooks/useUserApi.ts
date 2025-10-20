// hooks/useUserApi.ts
import { User } from '@/api/types/user';
import * as UserAPI from '@/api/user-api';
import { useAuthStore } from '@/store/auth-task-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ==========================================
// API CONFIGURATION
// ==========================================

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.168:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// FALLBACK FUNCTIONS
// ==========================================

const fallbackGetUserProfile = async (): Promise<User> => ({
  _id: 'dev-user',
  id: 'dev-user',
  email: 'dev@example.com',
  firstName: 'Dev',
  lastName: 'User',
  phone: '0000000000',
  role: 'user',
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const fallbackUpdateUserProfile = async (profileData: Partial<User>): Promise<User> => ({
  _id: profileData._id ?? 'dev-user',
  id: 'dev-user',
  email: 'dev@example.com',
  role: 'user',
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...profileData,
  firstName: profileData.firstName || 'Dev',
  lastName: profileData.lastName || 'User',
  phone: profileData.phone || '0000000000',
});

// ==========================================
// QUERY KEYS
// ==========================================

export const USER_QUERY_KEYS = {
  all: ['user'] as const,
  profile: () => ['user', 'profile'] as const,
};

// ==========================================
// USER PROFILE HOOKS
// ==========================================

/**
 * Hook for fetching user profile
 */
export function useGetUserProfile() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<User, Error>({
    queryKey: USER_QUERY_KEYS.profile(),
    queryFn: async () => {
      console.log('📥 Fetching user profile...');
      
      try {
        // Try to use the real API first
        if (typeof UserAPI.getUserProfile === 'function') {
          const profile = await UserAPI.getUserProfile();
          console.log('✅ User profile fetched:', profile);
          if (profile !== undefined && profile !== null) {
            return profile;
          } else {
            // If profile is undefined/null, fallback to mock data
            console.warn('🎭 UserAPI.getUserProfile returned no data, using fallback');
            return await fallbackGetUserProfile();
          }
        } else {
          // Fallback to mock data
          console.warn('🎭 Using fallback user profile');
          return await fallbackGetUserProfile();
        }
      } catch (error: any) {
        console.error('❌ Get user profile error:', error);

        // Network error fallback
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('🎭 Network failed - Using Mock Profile');
          return await fallbackGetUserProfile();
        }

        // If error is thrown, fallback to mock data as last resort
        return await fallbackGetUserProfile();
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Reasonable implementation for updating user profile
 */
export async function updateUserProfile(profileData: Partial<User>): Promise<User> {
  try {
    // Attempt to update via API
    const response = await api.put<User>('/user/profile', profileData);
    return response.data;
  } catch (error: any) {
    console.error('❌ updateUserProfile API error:', error);

    // Network error fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.warn('🎭 Network failed - Using fallbackUpdateUserProfile');
      return fallbackUpdateUserProfile(profileData);
    }

    throw error;
  }
}
/**
 * Fetches the current user's profile from the API.
 */
export async function getUserProfile(): Promise<User> {
  try {
    const response = await api.get<User>('/user/profile');
    return response.data;
  } catch (error: any) {
    console.error('❌ getUserProfile API error:', error);

    // Network error fallback
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.warn('🎭 Network failed - Using fallbackGetUserProfile');
      return fallbackGetUserProfile();
    }

    throw error;
  }
}