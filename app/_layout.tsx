import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/shared/AuthProvider';
import { DeepLinkHandler } from '@/src/shared/components/DeepLinkHandler';
import ProfessionalSplashScreen from '@/src/shared/components/ProfessionalSplashScreen';
import { useColorScheme } from '@/src/shared/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create QueryClient outside component to avoid re-creation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors - they need user intervention
        if (error?.isAuthError || error?.status === 401) {
          return false;
        }
        // Don't retry on network errors since we have mock fallback
        if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Prevent refetch when returning to app - preserves screen state
      refetchOnMount: false, // Prevent refetch on component mount - preserves screen state
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Hide native splash immediately - our custom splash will show
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash:', e);
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepareApp();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Always show custom splash first
  if (showSplash) {
    return <ProfessionalSplashScreen onFinish={handleSplashFinish} duration={3000} />;
  }

  // After splash, check if fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <DeepLinkHandler />
              <Stack>
                <Stack.Screen name='index' options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(welcome-screen)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(legal)" options={{ headerShown: false }} />
                <Stack.Screen name="task-detail" options={{ headerShown: false }} />
                <Stack.Screen name="make-offer-screen" options={{ headerShown: false }} />
                <Stack.Screen name="questions" options={{ headerShown: false }} />
                <Stack.Screen name="public-questions" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
