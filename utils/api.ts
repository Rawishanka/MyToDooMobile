// utils/api.ts
import { useAuthStore } from '@/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export function createApi(baseURL: string) {
    const axiosInstance = axios.create({
        baseURL: baseURL,
    });

    axiosInstance.interceptors.request.use(async (config) => {
        // First try to get token from auth store
        let token = useAuthStore.getState().token;
        
        // If no token in store, try to get from AsyncStorage
        if (!token) {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    token = storedToken;
                    console.log("🔄 Retrieved token from AsyncStorage for API request");
                }
            } catch (error) {
                console.error("❌ Error retrieving token from AsyncStorage:", error);
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔐 Added auth header to request:", config.url);
            console.log("🔐 Token preview:", token.substring(0, 20) + "...");
        } else {
            console.warn("⚠️ No token available for API request to:", config.url);
        }
        
        return config;
    });

    // Add response interceptor to handle 401 errors globally
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            
            // If we get 401 and haven't already retried this request
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                console.log("🔄 Token expired, attempting to refresh authentication...");
                
                try {
                    // Try to get stored credentials and re-login
                    const storedEmail = await AsyncStorage.getItem('userEmail');
                    const storedPassword = await AsyncStorage.getItem('userPassword');
                    
                    if (storedEmail && storedPassword) {
                        console.log("🔄 Re-authenticating with stored credentials...");
                        
                        // Create a new API instance without interceptors to avoid infinite loop
                        const authApi = axios.create({ baseURL: baseURL });
                        const authResponse = await authApi.post('/auth/login', {
                            email: storedEmail,
                            password: storedPassword
                        });
                        
                        if (authResponse.data?.token) {
                            const { token, user, expiresIn } = authResponse.data;
                            
                            // Update auth store
                            useAuthStore.getState().setAuthData(token, user, expiresIn);
                            
                            // Update AsyncStorage
                            await AsyncStorage.setItem('token', token);
                            
                            console.log("✅ Token refreshed successfully");
                            
                            // Retry the original request with new token
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axiosInstance(originalRequest);
                        }
                    } else {
                        console.warn("⚠️ No stored credentials found for auto-refresh");
                        
                        // Clear invalid tokens and show login message
                        useAuthStore.getState().clearAuth();
                        await AsyncStorage.multiRemove(['token']);
                        
                        console.log("🔄 Authentication expired. Please login again to continue posting tasks.");
                        
                        // Return a specific error that the UI can handle
                        return Promise.reject({
                            isAuthError: true,
                            message: "Authentication expired. Please login again to continue.",
                            status: 401
                        });
                    }
                } catch (refreshError) {
                    console.error("❌ Token refresh failed:", refreshError);
                    
                    // Clear invalid tokens and redirect to login
                    useAuthStore.getState().clearAuth();
                    await AsyncStorage.multiRemove(['token', 'userEmail', 'userPassword']);
                    
                    console.log("🔄 Authentication failed. Please login again.");
                    
                    // Return a specific error that the UI can handle
                    return Promise.reject({
                        isAuthError: true,
                        message: "Authentication failed. Please login again.",
                        status: 401
                    });
                }
            }
            
            return Promise.reject(error);
        }
    );
    
    return axiosInstance;
}
