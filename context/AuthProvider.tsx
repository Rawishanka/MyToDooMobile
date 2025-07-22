// context/AuthProvider.tsx
import { useStorageState } from '@/hooks/useStorageState';
import { useAuthStore } from '@/store/auth-task-store';
import { PropsWithChildren, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const { user, expiresIn, setAuthData } = useAuthStore();
  useEffect(() => {
    if (!isLoading && storedToken) {
      setAuthData(storedToken, user!, expiresIn!);
    }
  }, [isLoading, storedToken]);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return children;
}
