# 🎯 **STEP 6: COMPONENT INTEGRATION LAYER**

## 📱 **How Components Use the API**

### **File: `app/signup-screen.tsx`**
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCreateSignUpToken, useVerifyOTP } from '@/hooks/useApi';

export default function SignupScreen() {
  // 1. State for form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  // 2. Connect to API hooks
  const { mutateAsync: signup, isLoading: signupLoading } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP, isLoading: otpLoading } = useVerifyOTP();
  
  // 3. Handle signup button press
  const handleSignUp = async () => {
    try {
      // Call API through hook
      const result = await signup({
        firstName,
        lastName,
        email,
        password
      });
      
      // Show OTP input on success
      setShowOtpInput(true);
      Alert.alert('Success', 'OTP sent to your email!');
      
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Signup failed');
    }
  };
  
  // 4. Handle OTP verification
  const handleVerifyOTP = async () => {
    try {
      const result = await verifyOTP({ email, otp });
      Alert.alert('Success', 'Account verified! You can now login.');
      // Navigate to login screen
    } catch (error: any) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };
  
  return (
    <View>
      {/* Signup Form */}
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleSignUp} disabled={signupLoading}>
        <Text>{signupLoading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      
      {/* OTP Input (shows after successful signup) */}
      {showOtpInput && (
        <View>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
          />
          <TouchableOpacity onPress={handleVerifyOTP} disabled={otpLoading}>
            <Text>{otpLoading ? 'Verifying...' : 'Verify OTP'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
```

### **File: `app/login-screen.tsx`**
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCreateAuthToken } from '@/hooks/useApi';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Connect to login hook
  const { mutateAsync: login, isLoading } = useCreateAuthToken();
  
  const handleLogin = async () => {
    try {
      // Call login API
      await login({ username: email, password });
      
      // Navigate to protected area on success
      router.replace('/(tabs)');
      
    } catch (error: any) {
      // Show user-friendly error
      if (error?.response?.status === 400) {
        Alert.alert('Login Failed', 'Invalid email or password');
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };
  
  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        <Text>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🔄 **STEP 7: DATA FLOW EXPLANATION**

### **Complete Request Flow:**
```
1. USER ACTION
   ↓
2. COMPONENT (login-screen.tsx)
   ↓ calls handleLogin()
3. REACT QUERY HOOK (useCreateAuthToken)
   ↓ calls mutateAsync()
4. API FUNCTION (handleLoginUser)
   ↓ calls api.post()
5. HTTP CLIENT (Axios)
   ↓ sends POST request
6. BACKEND API (http://192.168.1.4:5001/api/auth/login)
   ↓ processes request
7. BACKEND CONTROLLER (authController.login)
   ↓ validates & responds
8. DATABASE (MongoDB)
   ↓ returns user data
9. BACKEND RESPONSE
   ↓ JSON with token & user
10. FRONTEND RECEIVES
    ↓ response.data
11. STATE MANAGEMENT (setAuthData)
    ↓ updates Zustand store
12. UI UPDATE
    ↓ navigates to protected area
```

---

## 🎯 **STEP 8: KEY INTEGRATION CONCEPTS**

### **1. API Endpoint Mapping:**
```typescript
// Backend Route Definition
app.use('/api/auth', authRoutes);
router.post('/login', login);

// Results in endpoint: POST /api/auth/login

// Frontend API Call
const response = await api.post('/auth/login', { email, password });
//                              ^^^^^^^^^^^ matches backend route
```

### **2. Data Type Matching:**
```typescript
// Backend sends:
res.json({
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    id: "user123",
    email: "user@example.com"
  }
});

// Frontend expects (TypeScript interface):
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}
```

### **3. Error Handling Coordination:**
```typescript
// Backend error:
res.status(400).json({ message: 'Invalid credentials' });

// Frontend handling:
catch (error: any) {
  if (error?.response?.status === 400) {
    Alert.alert('Error', error.response.data.message);
  }
}
```

---

## 🛠️ **STEP 9: DEVELOPMENT WORKFLOW**

### **1. Start Backend Development:**
```bash
# Create controller
controllers/taskController.js

# Define routes
routes/taskRoutes.js

# Test with Postman/curl
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task"}'
```

### **2. Create Frontend Integration:**
```typescript
// 1. Add API function
async function createTask(taskData) {
  return await api.post('/tasks', taskData);
}

// 2. Create hook
export function useCreateTask() {
  return useMutation({
    mutationFn: createTask
  });
}

// 3. Use in component
const { mutateAsync: createTask } = useCreateTask();
```

### **3. Test Integration:**
```typescript
// Create test component
const TestTaskCreation = () => {
  const testCreate = async () => {
    try {
      await createTask({ title: 'Test Task' });
      console.log('✅ Task created successfully');
    } catch (error) {
      console.log('❌ Task creation failed:', error);
    }
  };
  
  return (
    <TouchableOpacity onPress={testCreate}>
      <Text>Test Create Task</Text>
    </TouchableOpacity>
  );
};
```

This is the **complete process** of integrating backend APIs with React Native frontend! 🚀