

// 🚧 **DEVELOPMENT MODE: Set to true to use only mock data and skip network calls**
const USE_MOCK_API_ONLY = false; // 🔧 CHANGED: Using real API instead of mock data

// Different platforms handle localhost differently:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical devices: Your computer's IP address
const getApiUrl = () => {
    // First priority: Environment variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        console.log('✅ Using API URL from .env:', process.env.EXPO_PUBLIC_API_URL);
        return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // 🔧 Fallback: Using IP address from error logs
    const fallbackUrl = "http://172.20.10.2:5001/api";
    console.log('⚠️ Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
};

const API_CONFIG = {
    BASE_URL: getApiUrl(),
    USE_MOCK_ONLY: USE_MOCK_API_ONLY,
    TIMEOUT: 30000, // Increased timeout to 30 seconds for chat endpoints
    RETRY_ATTEMPTS: 3, // Number of retry attempts
    RETRY_DELAY: 1000, // Delay between retries in milliseconds
    DEVELOPMENT_MODE: __DEV__,
    ENDPOINTS: {
        NOTIFICATIONS: '/notifications',
        TASKS: '/tasks',
        AUTH: '/auth',
        USERS: '/users',
        OFFERS: '/offers',
        MESSAGES: '/messages',
        CHAT: '/ChatApp', // Add chat endpoint
        PAYMENTS: '/payments', // Stripe payment endpoints
        SERVICE_FEE: '/service-fee', // Service fee calculation
    },
    // Stripe Configuration
    STRIPE: {
        PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        SECRET_KEY: process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY,
        CURRENCY: 'USD',
        SUPPORTED_CURRENCIES: ['USD', 'EUR', 'LKR', 'SGD'],
    }
}

// Log the final configuration on app start
console.log('🔧 API Configuration Loaded:', {
    baseUrl: API_CONFIG.BASE_URL,
    useMockOnly: API_CONFIG.USE_MOCK_ONLY,
    timeout: API_CONFIG.TIMEOUT,
    currentTime: new Date().toISOString()
});

// Re-export createApi function for convenience
export { createApi } from '@/src/shared/utils/api';

export default API_CONFIG;