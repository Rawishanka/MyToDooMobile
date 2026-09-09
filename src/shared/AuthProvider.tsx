// context/AuthProvider.tsx
import { useStorageState } from '@/src/shared/hooks/useStorageState';
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { PropsWithChildren, useEffect, useRef } from 'react';
import API_CONFIG from '../api/config';

async function getRememberMeCredentials(): Promise<{ email: string; password: string } | null> {
  const rememberMe = await AsyncStorage.getItem('remember_me');
  if (rememberMe !== 'true') return null;

  const savedEmail =
    (await AsyncStorage.getItem('saved_email')) ||
    (await AsyncStorage.getItem('userEmail'));
  const savedPassword =
    (await AsyncStorage.getItem('saved_password')) ||
    (await AsyncStorage.getItem('userPassword'));

  if (!savedEmail || !savedPassword) return null;
  return { email: savedEmail, password: savedPassword };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { token, isAuthenticated, expiresIn } = useAuthStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoLoginInFlight = useRef(false);

  // Proactive token refresh - refresh token 5 minutes before expiration
  useEffect(() => {
    const setupTokenRefresh = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (!token || !isAuthenticated || !expiresIn) {
        return;
      }

      const expiresInMs = expiresIn * 1000;
      const refreshBuffer = 5 * 60 * 1000;
      const timeUntilRefresh = expiresInMs - refreshBuffer;

      if (timeUntilRefresh > 0) {
        console.log(`⏰ Token will be refreshed in ${Math.floor(timeUntilRefresh / 1000 / 60)} minutes`);
        refreshTimerRef.current = setTimeout(async () => {
          console.log('🔄 Proactively refreshing token before expiration');
          await refreshToken();
        }, timeUntilRefresh);
      } else {
        console.log('⚠️ Token already expired or will expire soon, refreshing now');
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

  const loginWithCredentials = async (email: string, password: string) => {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      }
    );

    const { token: newToken, user, expiresIn: newExpiresIn } = response.data;
    if (!newToken || !user) {
      throw new Error('Invalid login response');
    }

    const { setAuthData } = useAuthStore.getState();
    await setAuthData(newToken, user, newExpiresIn);
    setStoredToken(newToken);

    // Keep refresh credentials aligned with Remember Me keys
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userPassword', password);
    await AsyncStorage.setItem('saved_email', email);
    await AsyncStorage.setItem('saved_password', password);
    await AsyncStorage.setItem('remember_me', 'true');

    return newToken;
  };

  const refreshToken = async () => {
    try {
      const creds = await getRememberMeCredentials();
      if (!creds) {
        console.log('⚠️ No Remember Me credentials for token refresh - logging out');
        const { clearAuth } = useAuthStore.getState();
        await clearAuth();
        const { router } = require('expo-router');
        if (router) {
          router.replace('/(auth)/login');
        }
        return;
      }

      console.log('🔐 Refreshing token with Remember Me credentials');
      await loginWithCredentials(creds.email, creds.password);
      console.log('✅ Token refreshed successfully');
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error?.message);
      const { clearAuth } = useAuthStore.getState();
      await clearAuth();
      const { router } = require('expo-router');
      if (router) {
        router.replace('/(auth)/login');
      }
    }
  };

  useEffect(() => {
    const restoreAuthState = async () => {
      if (isLoading) {
        console.log('⏳ AsyncStorage still loading, waiting...');
        return;
      }

      const rememberMe = await AsyncStorage.getItem('remember_me');
      const userLoggedOut = await AsyncStorage.getItem('userLoggedOut');

      // Explicit logout always wins — login screen prefills saved credentials when Remember Me is on
      if (userLoggedOut === 'true') {
        console.log('🚪 User explicitly logged out, skipping auth restoration');
        return;
      }

      // Session-only: do not restore a cold-start session when Remember Me is off
      if (rememberMe !== 'true') {
        if (storedToken && !token) {
          console.log('ℹ️ Remember Me off — clearing persisted session');
          try {
            await AsyncStorage.multiRemove(['token', 'user', 'expiresIn', 'userEmail', 'userPassword']);
          } catch (e) {
            console.warn('Failed to clear session-only auth keys', e);
          }
        } else {
          console.log('ℹ️ Remember Me off — user needs to login');
        }
        return;
      }

      console.log('🔍 Remember Me restore check...', {
        hasStoredToken: !!storedToken,
        hasCurrentToken: !!token,
        isAuthenticated,
      });

      if (storedToken && !token) {
        console.log('🔄 Restoring auth state from AsyncStorage (Remember Me)...');
        try {
          const storedUser = await AsyncStorage.getItem('user');
          const storedExpiresIn = await AsyncStorage.getItem('expiresIn');

          if (storedUser) {
            const user = JSON.parse(storedUser);
            const restoredExpiresIn = storedExpiresIn ? parseInt(storedExpiresIn, 10) : undefined;
            const { setAuthData } = useAuthStore.getState();
            await setAuthData(storedToken, user, restoredExpiresIn);
            console.log('✅ Auth state restored successfully');
          } else {
            const { setAuthData } = useAuthStore.getState();
            await setAuthData(storedToken, null, undefined);
            console.log('✅ Token restored, user data will be fetched from API');
          }
        } catch (error) {
          console.error('❌ Error restoring auth state:', error);
        }
        return;
      }

      if (storedToken && token) {
        console.log('✅ Auth already restored (token present in both storage and state)');
        return;
      }

      // No token but Remember Me + credentials → auto-login on launch
      if (!token && !autoLoginInFlight.current) {
        const creds = await getRememberMeCredentials();
        if (creds) {
          autoLoginInFlight.current = true;
          try {
            console.log('🔄 Remember Me auto-login with saved credentials...');
            await loginWithCredentials(creds.email, creds.password);
            console.log('✅ Remember Me auto-login successful');
          } catch (error: any) {
            console.warn('⚠️ Remember Me auto-login failed:', error?.message);
          } finally {
            autoLoginInFlight.current = false;
          }
          return;
        }
      }

      console.log('ℹ️ Remember Me on but no token/credentials — user needs to login');
    };

    restoreAuthState();
  }, [isLoading, storedToken, token]);

  return <>{children}</>;
}
