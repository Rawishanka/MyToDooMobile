// context/AuthProvider.tsx
import { PropsWithChildren, useEffect } from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/auth-task-store';

export function AuthProvider({ children }: PropsWithChildren) {
  const setToken = useAuthStore((state) => state.setToken);
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');

  useEffect(() => {
    if (!isLoading) {
      setToken(storedToken);
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
