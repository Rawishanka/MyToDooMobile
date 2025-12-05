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
            // ✅ Only log successful responses in development
            if (__DEV__) {
                console.log("📥 API Response:", {
                    status: response.status,
                    url: response.config.url,
                });
            }
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            const requestUrl = originalRequest?.url || '';
            
            // Silent network error handling - don't log network errors
            if (isNetworkError(error)) {
                return Promise.reject({
                    isNetworkError: true,
                    message: "Unable to connect. Please check your internet connection.",
                    originalError: error
                });
            }
            
            // List of non-critical endpoints that shouldn't show errors
            const nonCriticalEndpoints = [
                '/notifications/unread-count',
                '/notifications/stats',
                '/notifications',
                '/service-fee/calculate',
                '/service-fee/test',
            ];
            
            const isNonCriticalEndpoint = nonCriticalEndpoints.some(endpoint => 
                requestUrl.includes(endpoint)
            );
            
            // If we get 401 and haven't already retried this request
            if (error.response?.status === 401) {
                const errorMessage = error.response?.data?.message || error.message || '';
                const isTokenExpired = errorMessage.includes('jwt expired') || 
                                      errorMessage.includes('token expired') ||
                                      errorMessage.includes('Authentication expired');
                
                // Only log 401 errors for critical endpoints in development
                if (__DEV__ && !isNonCriticalEndpoint && !originalRequest._retry) {
                    console.warn("⚠️ 401 Unauthorized:", requestUrl, isTokenExpired ? '(Token Expired)' : '');
                }
                
                // Skip auth endpoints and non-critical endpoints
                const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                                      requestUrl.includes('/auth/signup') || 
                                      requestUrl.includes('/auth/google') ||
                                      requestUrl.includes('/auth/register');
                
                // Attempt automatic token refresh if token is expired and not already retried
                if (isTokenExpired && !originalRequest._retry && !isAuthEndpoint && !isNonCriticalEndpoint) {
                    originalRequest._retry = true;
                    
                    console.log("🔄 Token expired - attempting automatic re-authentication");
                    
                    try {
                        // Try to get stored credentials
                        const storedEmail = await AsyncStorage.getItem('userEmail');
                        const storedPassword = await AsyncStorage.getItem('userPassword');
                        
                        if (storedEmail && storedPassword) {
                            console.log("🔐 Found stored credentials, re-authenticating...");
                            
                            // Create a new axios instance to avoid interceptor loops
                            const loginResponse = await axios.post(
                                `${baseURL}/auth/login`,
                                { email: storedEmail, password: storedPassword },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                    },
                                    timeout: 30000,
                                }
                            );
                            
                            const { token, user, expiresIn } = loginResponse.data;
                            
                            if (token && user) {
                                console.log("✅ Re-authentication successful, updating token");
                                
                                // Update token in store and AsyncStorage
                                const { setAuthData } = useAuthStore.getState();
                                await setAuthData(token, user, expiresIn);
                                await AsyncStorage.setItem('token', token);
                                
                                // Update the original request with new token
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                
                                console.log("🔄 Retrying original request with new token");
                                
                                // Retry the original request
                                return axiosInstance(originalRequest);
                            }
                        } else {
                            console.log("⚠️ No stored credentials found for automatic re-authentication");
                            // Clear auth and redirect to login
                            const { clearAuth } = useAuthStore.getState();
                            await clearAuth();
                            
                            // Import router dynamically to avoid circular dependencies
                            const { router } = require('expo-router');
                            if (router) {
                                console.log("🔄 Redirecting to login screen...");
                                router.replace('/(auth)/login');
                            }
                        }
                    } catch (refreshError: any) {
                        console.error("❌ Automatic re-authentication failed:", refreshError?.message);
                        // Clear auth on refresh failure
                        const { clearAuth } = useAuthStore.getState();
                        await clearAuth();
                        
                        // Redirect to login screen
                        const { router } = require('expo-router');
                        if (router) {
                            console.log("🔄 Token refresh failed, redirecting to login screen...");
                            router.replace('/(auth)/login');
                        }
                    }
                }
                
                // Return a user-friendly auth error
                return Promise.reject({
                    isAuthError: true,
                    isTokenExpired,
                    message: isTokenExpired 
                        ? "Your session has expired. Please log in again." 
                        : "Authentication expired. Please login again to continue.",
                    status: 401,
                    isNonCritical: isNonCriticalEndpoint,
                    originalError: error
                });
            }
            
            // Handle 403 Forbidden errors (e.g., admin-only endpoints)
            if (error.response?.status === 403) {
                // Only log 403 errors for critical endpoints in development
                if (__DEV__ && !isNonCriticalEndpoint) {
                    console.warn("⚠️ 403 Forbidden:", requestUrl);
                }
                
                // Return structured error for proper handling
                return Promise.reject({
                    isForbiddenError: true,
                    message: error.response?.data?.message || "Access forbidden. Insufficient permissions.",
                    status: 403,
                    isNonCritical: isNonCriticalEndpoint,
                    originalError: error
                });
            }
            
            // Only log other errors in development for non-network issues
            // Exclude 401, 403, and non-critical endpoints from logging
            const statusCode = error.response?.status;
            const shouldLog = __DEV__ && 
                             !isNetworkError(error) && 
                             !isNonCriticalEndpoint && 
                             statusCode !== 401 && 
                             statusCode !== 403;
            
            if (shouldLog) {
                console.error("❌ API Error:", {
                    status: statusCode,
                    url: requestUrl,
                    message: error.message,
                });
            }
            
            return Promise.reject(error);
        }
    );
    
    return axiosInstance;
}
