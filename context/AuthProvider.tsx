// context/AuthProvider.tsx
import { useStorageState } from '@/hooks/useStorageState';
import { useAuthStore } from '@/store/auth-task-store';
import { PropsWithChildren, useEffect } from 'react';

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { user, expiresIn, setAuthData } = useAuthStore();
  
  useEffect(() => {
    // Don't block the UI, let auth load in background
    if (!isLoading && storedToken) {
      // Use setTimeout to avoid blocking render
      setTimeout(() => {
        setAuthData(storedToken, user!, expiresIn!);
      }, 0);
    }
  }, [isLoading, storedToken, user, expiresIn, setAuthData]);

  // Don't show loading screen - let app render while auth loads in background
  // Auth status will be checked by individual screens that need it
  return <>{children}</>;
}
