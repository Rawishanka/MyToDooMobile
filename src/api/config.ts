

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
    
    // 🔧 Fallback: Using IP address from .env file
    return "http://192.168.8.130:5001/api";
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