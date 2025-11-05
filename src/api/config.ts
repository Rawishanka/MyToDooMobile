
import { Platform } from 'react-native';

// 🚧 **DEVELOPMENT MODE: Set to true to use only mock data and skip network calls**
const USE_MOCK_API_ONLY = false; // 🔧 CHANGED: Using real API instead of mock data

// Different platforms handle localhost differently:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical devices: Your computer's IP address
const getApiUrl = () => {
    // First priority: Environment variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // Second priority: Development environment with platform-specific handling
    if (__DEV__) {
        return Platform.select({
            // Android emulator needs special IP
            android: 'http://10.0.2.2:5001/api',
            // iOS can use localhost
            ios: 'http://localhost:5001/api',
            // For physical devices, try multiple IP options
            default: Platform.select({
                android: 'http://10.0.2.2:5001/api',
                ios: 'http://localhost:5001/api',
                // Fallback to different IP options
                default: [
                    'http://192.168.8.170:5001/api',
                    'http://127.0.0.1:5001/api',
                    'http://localhost:5001/api'
                ][0] // Use first IP, can be changed if needed
            })
        });
    }
    
    // Production fallback
    return "http://192.168.8.170:5001/api";
};

const API_CONFIG = {
    BASE_URL: getApiUrl(),
    USE_MOCK_ONLY: USE_MOCK_API_ONLY,
    TIMEOUT: 15000, // Increased timeout to 15 seconds
    RETRY_ATTEMPTS: 3, // Number of retry attempts
    RETRY_DELAY: 1000, // Delay between retries in milliseconds
    DEVELOPMENT_MODE: __DEV__
}

export default API_CONFIG;