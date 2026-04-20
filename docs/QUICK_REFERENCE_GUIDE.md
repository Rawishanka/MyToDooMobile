# 🎯 **QUICK REFERENCE: Integration Patterns**

## 🚀 **1. API Integration Pattern**
```typescript
// 1. Environment Config
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "fallback",
};

// 2. HTTP Client
export const createApi = (baseURL: string) => 
  axios.create({ baseURL, timeout: 10000 });

// 3. API Functions  
async function handleApiCall(data: any) {
  const api = createApi(API_CONFIG.BASE_URL);
  try {
    const response = await api.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// 4. React Query Hook
export function useApiCall() {
  return useMutation({
    mutationFn: (data) => handleApiCall(data),
    onSuccess: (result) => console.log("Success:", result),
    onError: (error) => console.error("Failed:", error)
  });
}

// 5. Component Usage
const { mutateAsync, isLoading } = useApiCall();
const handleSubmit = async () => {
  try {
    await mutateAsync(formData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## 🔐 **2. Authentication Pattern**
```typescript
// State Management
const useAuthStore = create(persist((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  setAuth: (token, user) => set({ isAuthenticated: true, token, user }),
  clearAuth: () => set({ isAuthenticated: false, token: null, user: null })
})));

// Login Flow
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  setAuth(token, user);
  return token;
};
```

## 🛡️ **3. Error Handling Pattern**
```typescript
// API Error Handler
const handleApiError = (error: any) => {
  if (error?.response?.status === 400) {
    Alert.alert('Bad Request', 'Please check your input');
  } else if (error?.response?.status === 401) {
    Alert.alert('Unauthorized', 'Please login again');
  } else if (error?.response?.status === 404) {
    Alert.alert('Not Found', 'Resource not found');
  } else {
    Alert.alert('Error', 'Something went wrong');
  }
};
```

## 🧪 **4. Testing Pattern**
```typescript
// Component Test Tool
export const ApiTester = () => {
  const testEndpoint = async () => {
    try {
      const response = await fetch('http://api.url/endpoint');
      console.log('✅ Success:', response.status);
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  };
  
  return (
    <TouchableOpacity onPress={testEndpoint}>
      <Text>Test API</Text>
    </TouchableOpacity>
  );
};
```

---

# 📝 **Implementation Checklist**

## ✅ **Phase 1: Setup**
- [ ] Environment variables configured
- [ ] API client created with Axios
- [ ] Base URL and timeout configured  
- [ ] TypeScript types defined

## ✅ **Phase 2: API Layer**
- [ ] API functions created for each endpoint
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Response data validation

## ✅ **Phase 3: State Management**
- [ ] React Query hooks created
- [ ] Zustand store for authentication
- [ ] AsyncStorage for persistence
- [ ] Cache invalidation strategy

## ✅ **Phase 4: UI Integration**
- [ ] Components use hooks for API calls
- [ ] Loading states implemented
- [ ] Error messages user-friendly
- [ ] Success feedback provided

## ✅ **Phase 5: Testing**
- [ ] Direct API testing (curl/Postman)
- [ ] Component testing with real data
- [ ] Error scenario testing
- [ ] Integration testing complete

## ✅ **Phase 6: Production**
- [ ] Environment-specific configs
- [ ] Error monitoring setup
- [ ] Performance optimization
- [ ] Security review complete

---

**Use this as your blueprint for any React Native ↔ Backend integration!** 🎯