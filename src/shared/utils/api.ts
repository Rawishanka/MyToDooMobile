// utils/api.ts
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { isNetworkError } from './networkErrorHandler';

export function createApi(baseURL: string) {
    const axiosInstance = axios.create({
        baseURL: baseURL,
        timeout: 30000, // 30 seconds timeout
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    axiosInstance.interceptors.request.use(async (config) => {
        // Skip token for authentication endpoints (login, signup, google auth)
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                               config.url?.includes('/auth/signup') || 
                               config.url?.includes('/auth/google') ||
                               config.url?.includes('/auth/register');
        
        // First try to get token from auth store
        let token = useAuthStore.getState().token;
        
        // If no token in store, try to get from AsyncStorage
        if (!token && !isAuthEndpoint) {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    token = storedToken;
                }
            } catch (error: any) {
                if (__DEV__ && !isNetworkError(error)) {
                }
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (!isAuthEndpoint) {
            // Only warn if it's NOT an auth endpoint
        } else {
        }
        
        return config;
    });

    // Add response interceptor to handle 401 errors globally
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            // Silent network error handling - don't log network errors
            if (isNetworkError(error)) {
                return Promise.reject({
                    isNetworkError: true,
                    message: "Unable to connect. Please check your internet connection.",
                    originalError: error
                });
            }
            
            const originalRequest = error.config;
            
            // If we get 401 and haven't already retried this request
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                if (__DEV__) {
                }
                
                // Return a user-friendly auth error without auto-redirect
                // Let the UI handle showing appropriate message
                return Promise.reject({
                    isAuthError: true,
                    message: "Authentication expired. Please login again to continue.",
                    status: 401,
                    originalError: error
                });
            }
            
            return Promise.reject(error);
        }
    );
    
    return axiosInstance;
}
