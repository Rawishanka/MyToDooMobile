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
                    console.log("🔄 Retrieved token from AsyncStorage for API request");
                }
            } catch (error: any) {
                if (__DEV__ && !isNetworkError(error)) {
                    console.warn("⚠️ Error retrieving token from AsyncStorage:", error?.message);
                }
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔐 Added auth header to request:", config.url);
            console.log("🔐 Token preview:", token.substring(0, 20) + "...");
        } else if (!isAuthEndpoint) {
            // Only warn if it's NOT an auth endpoint
            console.warn("⚠️ No token available for API request to:", config.url);
        } else {
            console.log("✅ Auth endpoint - no token required:", config.url);
        }
        
        // 🔍 Log full request details for debugging
        console.log("📤 API Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL || ''}${config.url || ''}`,
            data: config.data,
            params: config.params,
            headers: {
                'Content-Type': config.headers['Content-Type'],
                'Authorization': config.headers.Authorization ? '✓ Present' : '✗ Missing',
            }
        });
        
        return config;
    });

    // Add response interceptor to handle 401 errors globally
    axiosInstance.interceptors.response.use(
        (response) => {
            // 🔍 Log successful response
            console.log("📥 API Response:", {
                status: response.status,
                statusText: response.statusText,
                url: response.config.url,
                data: response.data,
            });
            return response;
        },
        async (error) => {
            // 🔍 Log error response details
            console.error("❌ API Error Response:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                data: error.response?.data,
                message: error.message,
            });
            
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
                    console.warn("⚠️ 401 Unauthorized - Authentication may have expired");
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
