// context/AuthProvider.tsx
import { useStorageState } from '@/src/shared/hooks/useStorageState';
import { useAuthStore } from '@/src/store/auth-task-store';
import { PropsWithChildren, useEffect } from 'react';

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { token, setAuthData } = useAuthStore();
  
  useEffect(() => {
    // Only restore token if we have a stored token and no current token
    if (!isLoading && storedToken && !token) {
      console.log("🔄 Found stored token, but need user data from API");
      // Don't call setAuthData here - let the API calls handle user data fetching
      // The stored token will be used by API calls to authenticate requests
    }
  }, [isLoading, storedToken, token]);

  // Don't show loading screen - let app render while auth loads in background
  // Auth status will be checked by individual screens that need it
  return <>{children}</>;
}
