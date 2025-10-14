
// 🚧 **DEVELOPMENT MODE: Set to true to use only mock data and skip network calls**
const USE_MOCK_API_ONLY = false; // 🔧 CHANGED: Using real API instead of mock data

// Different platforms handle localhost differently:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical devices: Your computer's IP address
const getApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // 🔧 Updated: Using consistent IP address for all platforms during development
    return "http://192.168.1.3:5001/api"; // Your current machine IP
};

const API_CONFIG = {
    BASE_URL: getApiUrl(),
    USE_MOCK_ONLY: USE_MOCK_API_ONLY
}

export default API_CONFIG;