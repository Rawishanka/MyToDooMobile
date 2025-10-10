# 📖 **LESSON 3: Major Issues We Faced & Solutions**

## 🚨 **ISSUE #1: Network Connectivity Problems**

### **❌ Problem:**
```
Network Error: Network request failed
Unable to connect to backend
```

### **🔍 Root Cause:**
- Backend server not running
- Wrong IP address in API URL
- Firewall blocking connections

### **✅ Solution Process:**
1. **Verify Backend Status:**
   ```bash
   # Test if server is running
   curl http://192.168.1.4:5001/api-docs
   ```

2. **Network Debugging:**
   ```powershell
   # PowerShell testing we used
   Invoke-WebRequest -Uri "http://192.168.1.4:5001/api-docs" -Method GET
   ```

3. **IP Address Configuration:**
   ```typescript
   // Fallback URL strategy
   const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
     ? API_CONFIG.BASE_URL  
     : "http://192.168.1.4:5001/api"; // Fallback
   ```

### **🎓 Learning:**
- Always test connectivity before debugging code
- Use network tools (curl, Postman, PowerShell) for testing
- Have fallback URLs for different environments

---

## 🚨 **ISSUE #2: Missing OTP Verification Endpoint**

### **❌ Problem:**
```
Error: Request failed with status code 404
Cannot POST /api/auth/verify-otp
```

### **🔍 Root Cause:**
Frontend was calling OTP verification endpoint, but backend didn't have this route implemented.

### **✅ Solution Strategy:**
1. **Endpoint Testing:**
   ```typescript
   // We tried multiple endpoint variations
   const possibleEndpoints = [
     '/auth/verify-otp',
     '/auth/verify', 
     '/auth/otp/verify',
     '/auth/confirm',
     '/auth/activate'
   ];
   ```

2. **Robust Error Handling:**
   ```typescript
   for (const endpoint of possibleEndpoints) {
     try {
       const response = await api.post(endpoint, { email, otp });
       return response.data; // Success!
     } catch (error) {
       console.log(`Failed: ${endpoint}`);
       continue; // Try next endpoint
     }
   }
   ```

3. **Backend Implementation:**
   - Added missing `/api/auth/verify-otp` endpoint
   - Implemented OTP validation logic
   - Added proper error responses

### **🎓 Learning:**
- Always verify all endpoints exist before frontend implementation
- Use fallback strategies for different API versions
- Document all endpoints clearly

---

## 🚨 **ISSUE #3: Authentication State Management**

### **❌ Problem:**
- Login successful but app doesn't remember user
- Token storage not working
- Navigation not redirecting after login

### **🔍 Root Cause:**
Multiple storage systems conflicting:
- AsyncStorage for persistence
- Zustand for app state  
- React Query cache

### **✅ Solution - Unified State Management:**

```typescript
// store/auth-task-store.ts
export const useAuthTaskStore = create<AuthTaskState>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      token: null,
      
      // Actions
      setAuthData: (token: string, user: User, expiresIn?: string) => {
        set({
          isAuthenticated: true,
          user,
          token,
          expiresIn
        });
      },
      
      clearAuth: () => {
        set({
          isAuthenticated: false, 
          user: null,
          token: null
        });
      }
    }),
    {
      name: 'auth-storage', // Persist key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### **🎓 Learning:**
- Use one source of truth for authentication state
- Persist critical data (tokens) to survive app restarts  
- Clear separation between temporary and persistent state