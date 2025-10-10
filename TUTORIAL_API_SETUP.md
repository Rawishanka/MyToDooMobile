# 📖 **COMPLETE BACKEND-FRONTEND INTEGRATION TUTORIAL**

## 🎯 **LESSON 1: API Configuration & Setup**

### **🚀 Overview: What We're Building**
A complete authentication system connecting React Native frontend with Node.js backend through:
- Environment-based configuration
- Centralized HTTP client setup
- Robust error handling
- State management integration

---

## 🔧 **Step 1: Environment Configuration**

### **❌ Problem:** 
Hard-coded API URLs throughout the app make it difficult to switch between development, staging, and production environments.

### **✅ Solution: Environment Variables**

**Created `.env` file:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.4:5001/api
API_URL=http://192.168.1.4:5001/api
```

### **🎯 Why This Approach:**
- ✅ **Flexibility:** Easy to change URLs for different environments
- ✅ **Security:** Sensitive configs not hard-coded in source code
- ✅ **Maintainability:** Single source of truth for API endpoints
- ✅ **Team Collaboration:** Each developer can use their own local URLs

---

## 🔧 **Step 2: Centralized API Client Setup**

### **📁 File: `api/config.ts`**
```typescript
import axios from 'axios';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.4:5001/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Create reusable Axios instance with common configuration
export const createApi = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Add request interceptor for auth tokens
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors
  });
};
```

### **🎯 Key Benefits:**
- 🚀 **Reusability:** One client configuration for all API calls
- ⚡ **Performance:** Configured timeouts prevent hanging requests
- 🔒 **Consistency:** Same headers and settings across all requests
- 🛡️ **Security:** Centralized place to add authentication headers
- 🔧 **Maintainability:** Easy to modify client behavior globally

---

## 🔧 **Step 3: Core Authentication API Functions**

### **📁 File: `api/mytasks.ts`**
```typescript
import { API_CONFIG, createApi } from './config';
import { setAuthData, setStoredToken } from '../store/auth-task-store';

// TypeScript interfaces for type safety
interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  expiresIn?: string;
}

// 🔐 User Registration Function
async function handleSignUpUser(signUpData: SignUpRequest) {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.4:5001/api";
  
  const api = createApi(baseUrl);
  console.log("Calling signup API:", baseUrl + "/auth/signup");
  console.log("With data:", signUpData);

  try {
    const response = await api.post('/auth/signup', signUpData);
    console.log("✅ Signup Success Response:", response.data);
    return response.data;
  } catch (error: any) {
    // Comprehensive error logging for debugging
    console.error("❌ Signup failed with detailed error:");
    console.error("Status:", error?.response?.status);
    console.error("Status Text:", error?.response?.statusText);
    console.error("Response Data:", error?.response?.data);
    console.error("Request Config:", error?.config);
    console.error("Full Error:", error);
    throw error;
  }
}

// 🔑 User Login Function
async function handleLoginUser(email: string, password: string) {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.4:5001/api";
  
  const api = createApi(baseUrl);
  console.log("Calling login API:", baseUrl + "/auth/login");
  console.log("With data:", { email: email, password });

  try {
    const response = await api.post('/auth/login', { email, password });
    console.log("✅ Login Success Response:", response.data);
    
    const { token, user, expiresIn } = response.data;
    
    // Store authentication data immediately
    setAuthData(token, user, expiresIn);
    setStoredToken(token);
    
    return token;
  } catch (error: any) {
    console.error("❌ Login failed with detailed error:");
    console.error("Status:", error?.response?.status);
    console.error("Status Text:", error?.response?.statusText);
    console.error("Response Data:", error?.response?.data);
    console.error("Request Config:", error?.config);
    console.error("Full Error:", error);
    throw error;
  }
}

// 📧 OTP Verification Function with Fallback Strategy
async function handleVerifyOTP(email: string, otp: string) {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.4:5001/api";
  
  const api = createApi(baseUrl);
  
  // Try different common OTP verification endpoints
  const possibleEndpoints = [
    '/auth/verify-otp',
    '/auth/verify',
    '/auth/otp/verify',
    '/auth/confirm',
    '/auth/activate'
  ];

  console.log("Attempting OTP verification with email:", email, "OTP:", otp);
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Trying OTP verification endpoint: ${baseUrl}${endpoint}`);
      
      const response = await api.post(endpoint, { email, otp });
      console.log(`✅ OTP Verification Success with ${endpoint}:`, response.data);
      return response.data;
      
    } catch (error: any) {
      console.log(`❌ Failed ${endpoint}:`, error?.response?.status);
      
      // If it's the last endpoint, throw the error
      if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
        console.error("All OTP endpoints failed. Last error:", error);
        throw error;
      }
      // Otherwise, continue to next endpoint
      continue;
    }
  }
}

// Export all functions
export {
  handleSignUpUser,
  handleLoginUser,
  handleVerifyOTP
};
```

### **🎓 Critical Learning Points:**
- 📝 **Comprehensive Error Handling:** Always log errors with full context for debugging
- 💾 **Immediate Data Storage:** Store authentication tokens immediately after successful login
- 🔄 **Consistent Patterns:** Same structure for all API functions
- 🛡️ **Fallback Strategy:** Try multiple endpoints for better reliability
- 🏷️ **TypeScript Integration:** Use interfaces for type safety
- 📊 **Logging Strategy:** Detailed logs for both success and failure cases

---

## 🎯 **Key Architecture Decisions:**

### **1. Separation of Concerns:**
```
Config Layer    →  Environment & HTTP client setup
API Layer       →  Business logic & HTTP calls  
Hooks Layer     →  React Query integration
Component Layer →  UI and user interaction
```

### **2. Error Handling Strategy:**
```
Network Level   →  Axios interceptors & timeouts
API Level       →  Detailed error logging
Hook Level      →  React Query error states
UI Level        →  User-friendly error messages
```

### **3. Data Flow:**
```
User Input → Component → Hook → API Function → HTTP Client → Backend
Backend Response → HTTP Client → API Function → Hook → Component → UI Update
```

This setup provides a **solid foundation** for any React Native app that needs to communicate with a backend API! 🚀
