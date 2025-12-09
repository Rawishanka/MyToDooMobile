// context/AuthProvider.tsx
import { useStorageState } from '@/src/shared/hooks/useStorageState';
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { PropsWithChildren, useEffect, useRef } from 'react';
import API_CONFIG from '../api/config';

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { token, isAuthenticated, expiresIn } = useAuthStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Proactive token refresh - refresh token 5 minutes before expiration
  useEffect(() => {
    const setupTokenRefresh = () => {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      if (!token || !isAuthenticated || !expiresIn) {
        return;
      }
      
      // Calculate time until token expires (expiresIn is in seconds)
      const expiresInMs = expiresIn * 1000;
      const now = Date.now();
      const refreshBuffer = 5 * 60 * 1000; // Refresh 5 minutes before expiration
      const timeUntilRefresh = expiresInMs - refreshBuffer;
      
      if (timeUntilRefresh > 0) {
        console.log(`⏰ Token will be refreshed in ${Math.floor(timeUntilRefresh / 1000 / 60)} minutes`);
        
        refreshTimerRef.current = setTimeout(async () => {
          console.log("🔄 Proactively refreshing token before expiration");
          await refreshToken();
        }, timeUntilRefresh);
      } else {
        console.log("⚠️ Token already expired or will expire soon, refreshing now");
        refreshToken();
      }
    };
    
    setupTokenRefresh();
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [token, isAuthenticated, expiresIn]);
  
  const refreshToken = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');
      
      if (!storedEmail || !storedPassword) {
        console.log("⚠️ No stored credentials for token refresh - logging out");
        const { clearAuth } = useAuthStore.getState();
        await clearAuth();
        
        // Import router dynamically to avoid circular dependencies
        const { router } = require('expo-router');
        if (router) {
          console.log("🔄 Redirecting to login screen...");
          router.replace('/(auth)/login');
        }
        return;
      }
      
      console.log("🔐 Refreshing token with stored credentials");
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/login`,
        { email: storedEmail, password: storedPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      const { token: newToken, user, expiresIn: newExpiresIn } = response.data;
      
      if (newToken && user) {
        console.log("✅ Token refreshed successfully");
        const { setAuthData } = useAuthStore.getState();
        await setAuthData(newToken, user, newExpiresIn);
        setStoredToken(newToken);
      }
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error?.message);
      
      // If refresh fails, clear auth and redirect to login
      const { clearAuth } = useAuthStore.getState();
      await clearAuth();
      
      // Import router dynamically to avoid circular dependencies
      const { router } = require('expo-router');
      if (router) {
        console.log("🔄 Token refresh failed, redirecting to login screen...");
        router.replace('/(auth)/login');
      }
    }
  };
  
  useEffect(() => {
    // Restore full auth state from AsyncStorage when app starts
    const restoreAuthState = async () => {
      if (isLoading) {
        console.log("⏳ AsyncStorage still loading, waiting...");
        return; // Wait for storage to load
      }
      
      // CRITICAL: Check if user explicitly logged out
      const userLoggedOut = await AsyncStorage.getItem('userLoggedOut');
      if (userLoggedOut === 'true') {
        console.log("🚪 User explicitly logged out, skipping auth restoration");
        console.log("🔑 User will be shown login screen");
        return; // Don't restore auth if user logged out
      }
      
      console.log("🔍 Checking if auth restoration needed...", {
        hasStoredToken: !!storedToken,
        hasCurrentToken: !!token,
        isAuthenticated,
        userLoggedOut: userLoggedOut
      });
      
      // If we have a stored token but no current token, restore it
      // This happens when the app is closed and reopened (but user didn't logout)
      if (storedToken && !token) {
        console.log("🔄 Restoring auth state from AsyncStorage...");
        console.log("📦 Stored token found:", storedToken.substring(0, 30) + "...");
        
        try {
          // Load user data from AsyncStorage
          const storedUser = await AsyncStorage.getItem('user');
          const storedExpiresIn = await AsyncStorage.getItem('expiresIn');
          
          console.log("📦 Stored user found:", !!storedUser);
          
          if (storedUser) {
            const user = JSON.parse(storedUser);
            const expiresIn = storedExpiresIn ? parseInt(storedExpiresIn, 10) : undefined;
            
            console.log("✅ Restoring full auth state with user data:", {
              token: storedToken.substring(0, 20) + "...",
              userId: user.id || user._id,
              email: user.email,
              expiresIn
            });
            
            // Call setAuthData directly from store to avoid dependency issues
            const { setAuthData } = useAuthStore.getState();
            await setAuthData(storedToken, user, expiresIn);
            console.log("✅ Auth state restored successfully - user should be logged in now");
          } else {
            // No user data, just restore token
            console.log("⚠️ Found token but no user data, restoring token only");
            const { setAuthData } = useAuthStore.getState();
            await setAuthData(storedToken, null, undefined);
            console.log("✅ Token restored, user data will be fetched from API");
          }
        } catch (error) {
          console.error("❌ Error restoring auth state:", error);
        }
      } else if (storedToken && token) {
        console.log("✅ Auth already restored (token present in both storage and state)");
      } else {
        console.log("ℹ️ No stored token found - user needs to login");
      }
    };
    
    restoreAuthState();
  }, [isLoading, storedToken, token]); // Removed isAuthenticated from dependencies

  // Don't show loading screen - let app render while auth loads in background
  // Auth status will be checked by individual screens that need it
  return <>{children}</>;
}
