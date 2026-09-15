// context/AuthProvider.tsx
import { useStorageState } from '@/src/shared/hooks/useStorageState';
import { getRememberMeCredentials, tryRememberMeRenew } from '@/src/shared/utils/auth-utils';
import { getTokenExpiresIn, isTokenExpired } from '@/src/shared/utils/jwt-utils';
import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { token, isAuthenticated } = useAuthStore();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefreshFromJwt = (jwt?: string | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!jwt) return;

    const remainingSec = getTokenExpiresIn(jwt);
    if (remainingSec == null) return;

    const refreshBuffer = 5 * 60;
    const waitSec = remainingSec - refreshBuffer;

    if (waitSec > 0) {
      console.log(`⏰ Token will be refreshed in ${Math.floor(waitSec / 60)} minutes`);
      refreshTimerRef.current = setTimeout(() => {
        void renewIfRememberMe();
      }, waitSec * 1000);
      return;
    }

    void renewIfRememberMe();
  };

  const renewIfRememberMe = async () => {
    const current = useAuthStore.getState().token;
    // If user is not logged in, do not force-navigate to login screen
    if (!current) return;

    const ok = await tryRememberMeRenew();
    if (ok) {
      const next = useAuthStore.getState().token;
      if (next) setStoredToken(next);
      scheduleRefreshFromJwt(next);
      return;
    }

    const creds = await getRememberMeCredentials();
    if (creds) return;

    const { clearAuth } = useAuthStore.getState();
    await clearAuth();
    const { router } = require('expo-router');
    if (router) router.replace('/(auth)/login');
  };

  useEffect(() => {
    scheduleRefreshFromJwt(token);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [token, isAuthenticated]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state !== 'active') return;
      const current = useAuthStore.getState().token;
      // Only renew if user has an active token and it is expired/expiring
      if (current && isTokenExpired(current, 300)) {
        void renewIfRememberMe();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const restoreAuthState = async () => {
      if (isLoading) return;

      const rememberMe = await AsyncStorage.getItem('remember_me');
      const userLoggedOut = await AsyncStorage.getItem('userLoggedOut');

      if (userLoggedOut === 'true') {
        console.log('🚪 User explicitly logged out, skipping auth restoration');
        return;
      }

      if (rememberMe !== 'true') {
        if (storedToken && !token) {
          console.log('ℹ️ Remember Me off — clearing persisted session');
          try {
            await AsyncStorage.multiRemove(['token', 'user', 'expiresIn', 'userEmail', 'userPassword']);
          } catch (e) {
            console.warn('Failed to clear session-only auth keys', e);
          }
        }
        return;
      }

      const liveToken = token || storedToken;
      if (!liveToken || isTokenExpired(liveToken, 300)) {
        console.log('🔄 Remember Me: token missing/expired — silent renew');
        const ok = await tryRememberMeRenew();
        if (ok) {
          const next = useAuthStore.getState().token;
          if (next) setStoredToken(next);
        }
        return;
      }

      if (storedToken && !token) {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          const remaining = getTokenExpiresIn(storedToken) ?? undefined;
          const user = storedUser ? JSON.parse(storedUser) : null;
          await useAuthStore.getState().setAuthData(storedToken, user, remaining);
          console.log('✅ Auth state restored from valid JWT');
        } catch (error) {
          console.error('❌ Error restoring auth state:', error);
        }
      }
    };

    restoreAuthState();
  }, [isLoading, storedToken, token]);

  return <>{children}</>;
}
