# 🎯 **COMPLETE API INTEGRATION GUIDE: BACKEND TO FRONTEND**

## 📋 **OVERVIEW: The Complete Integration Process**

```
BACKEND                    FRONTEND                   STATE MANAGEMENT
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│ Controllers │ ────────► │ API Layer   │ ────────► │ Hooks/Store │
│ Routes      │           │ HTTP Client │           │ Components  │
│ Models      │           │ Config      │           │ UI Updates  │
└─────────────┘           └─────────────┘           └─────────────┘
```

---

## 🏗️ **STEP 1: BACKEND API STRUCTURE**

### **Backend File Structure:**
```
backend/
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── taskController.js     # Task management logic
│   └── userController.js     # User management logic
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   ├── taskRoutes.js         # Task endpoints
│   └── userRoutes.js         # User endpoints
├── models/
│   ├── User.js               # User data model
│   └── Task.js               # Task data model
├── middleware/
│   └── auth.js               # JWT verification
└── server.js                 # Main server file
```

### **Example Backend Controller:**
```javascript
// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Create user in database
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    
    // Send success response
    res.status(201).json({
      message: 'Signup successful, OTP sent to email',
      email: email
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user || !user.comparePassword(password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { signup, login };
```

### **Backend Routes:**
```javascript
// routes/authRoutes.js
const express = require('express');
const { signup, login, verifyOTP } = require('../controllers/authController');
const router = express.Router();

// Define API endpoints
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

module.exports = router;
```

### **Main Server Setup:**
```javascript
// server.js
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes - This creates the API endpoints
app.use('/api/auth', authRoutes);  // Creates /api/auth/signup, /api/auth/login, etc.

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
```

---

## 🎯 **STEP 2: FRONTEND FILE STRUCTURE**

### **Frontend File Organization:**
```
frontend/
├── api/
│   ├── config.ts             # API configuration
│   ├── mytasks.ts            # API functions
│   └── types/
│       └── index.ts          # TypeScript types
├── hooks/
│   └── useApi.ts             # React Query hooks
├── store/
│   └── auth-task-store.ts    # Zustand state management
├── components/
│   ├── QuickAuthTest.tsx     # Testing component
│   └── ui/                   # UI components
├── app/
│   ├── login-screen.tsx      # Login UI
│   ├── signup-screen.tsx     # Signup UI
│   └── (tabs)/               # Protected routes
└── constants/
    └── Colors.ts             # App constants
```

---

## 🔧 **STEP 3: API CONFIGURATION LAYER**

### **File: `api/config.ts`**
```typescript
import axios from 'axios';

// 1. Environment Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.4:5001/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// 2. HTTP Client Factory
export const createApi = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
};
```

---

## 🚀 **STEP 4: API FUNCTIONS LAYER**

### **File: `api/mytasks.ts`**
```typescript
import { API_CONFIG, createApi } from './config';

// 1. TypeScript Types (matches backend response)
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
}

// 2. API Functions that call backend endpoints
async function handleSignUpUser(signUpData: SignUpRequest) {
  const api = createApi(API_CONFIG.BASE_URL);
  
  try {
    // Calls POST http://192.168.1.4:5001/api/auth/signup
    const response = await api.post('/auth/signup', signUpData);
    return response.data;
  } catch (error: any) {
    console.error("Signup failed:", error?.response?.data);
    throw error;
  }
}

async function handleLoginUser(email: string, password: string) {
  const api = createApi(API_CONFIG.BASE_URL);
  
  try {
    // Calls POST http://192.168.1.4:5001/api/auth/login
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error?.response?.data);
    throw error;
  }
}

// 3. Export functions for use in hooks
export {
  handleSignUpUser,
  handleLoginUser
};
```

---

## 🎯 **STEP 5: STATE MANAGEMENT LAYER**

### **File: `hooks/useApi.ts` - React Query Integration**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleSignUpUser, handleLoginUser } from '../api/mytasks';

// 1. Signup Hook
export function useCreateSignUpToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Connect to API function
    mutationFn: (signUpData: SignUpRequest) => handleSignUpUser(signUpData),
    
    // Handle success
    onSuccess: (data) => {
      console.log('Signup successful:', data);
      queryClient.setQueryData(['signup'], data);
    },
    
    // Handle errors
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });
}

// 2. Login Hook
export function useCreateAuthToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Connect to API function
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      handleLoginUser(username, password),
    
    // Handle success - store token
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Update auth state
      setAuthData(data.token, data.user);
    },
    
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}
```

### **File: `store/auth-task-store.ts` - Zustand Store**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  // State
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  
  // Actions
  setAuthData: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthTaskStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      token: null,
      user: null,
      
      // Actions
      setAuthData: (token: string, user: User) => {
        set({
          isAuthenticated: true,
          token,
          user
        });
      },
      
      clearAuth: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null
        });
      }
    }),
    {
      name: 'auth-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Export actions for use in API functions
export const { setAuthData, clearAuth } = useAuthTaskStore.getState();
```