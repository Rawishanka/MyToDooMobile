import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // integrate tanstack query with better error handling
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on network errors since we have mock fallback
          if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
            return false;
          }
          // Retry other errors up to 2 times
          return failureCount < 2;
        },
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
    },
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='login-screen' options={{ headerShown: false }} />
            <Stack.Screen name='signup-screen' options={{ headerShown: false }} />
            <Stack.Screen name='test-api' options={{ headerShown: false }} />
            <Stack.Screen name='auth-test' options={{ headerShown: false }} />
            <Stack.Screen name='auth-debug' options={{ headerShown: false }} />
            <Stack.Screen name='network-test' options={{ headerShown: false }} />
            <Stack.Screen name="(welcome-screen)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="task-detail" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>

  );
}
