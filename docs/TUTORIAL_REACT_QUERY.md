# 📖 **LESSON 2B: React Query Integration**

## 🚀 **Step 4: State Management with React Query**

### **Problem We Solved:**
- Manual state management for API calls
- No caching of API responses
- Complex loading/error states
- No automatic retries

### **Solution: React Query Hooks**

### **File: `hooks/useApi.ts`**
```typescript
// Signup Hook
export function useCreateSignUpToken() {
  const queryClient = useQueryClient();
  const { handleSignUpUser } = useApiFunctions();
  
  return useMutation({
    mutationFn: (signUpData: SignUpRequest) => handleSignUpUser(signUpData),
    onSuccess: (data) => {
      // Cache the response
      queryClient.setQueryData(['signup'], data);
    },
    onError: (error) => {
      console.error("Signup failed:", error);
    },
  });
}

// Login Hook
export function useCreateAuthToken() {
  const queryClient = useQueryClient();
  const { handleLoginUser } = useApiFunctions();
  
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      handleLoginUser(username, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-token'], data);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}

// OTP Verification Hook
export function useVerifyOTP() {
  const queryClient = useQueryClient();
  const { handleVerifyOTP } = useApiFunctions();
  
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => 
      handleVerifyOTP(email, otp),
    onSuccess: (data) => {
      queryClient.setQueryData(['otp-verification'], data);
    },
  });
}
```

### **🎯 Benefits of React Query:**
- ✅ **Automatic Caching:** Responses cached for performance
- ✅ **Loading States:** Built-in loading/error/success states
- ✅ **Optimistic Updates:** UI updates before server confirms
- ✅ **Retry Logic:** Automatic retries on failure
- ✅ **Background Refetch:** Keep data fresh automatically

---

## 🔧 **Step 5: Component Integration**

### **How to Use in Components:**
```typescript
// In signup-screen.tsx
export default function SignupScreen() {
  const { mutateAsync: signup, isLoading } = useCreateSignUpToken();
  const { mutateAsync: verifyOTP } = useVerifyOTP();
  
  const handleSignUp = async () => {
    try {
      const result = await signup({
        firstName,
        lastName, 
        email,
        password
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

### **🎓 Key Learning:**
- 🎯 **Separation of Concerns:** API logic separate from UI logic
- 🔄 **Reusability:** Same hooks used across multiple components  
- 🛡️ **Type Safety:** TypeScript ensures correct data types