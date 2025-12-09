import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/shared/AuthProvider';
import { DeepLinkHandler } from '@/src/shared/components/DeepLinkHandler';
import { NotificationPermissionPrompt } from '@/src/shared/components/NotificationPermissionPrompt';
import ProfessionalSplashScreen from '@/src/shared/components/ProfessionalSplashScreen';
import { useColorScheme } from '@/src/shared/hooks/useColorScheme';
import { useInitializeFCM } from '@/src/shared/hooks/useInitializeFCM';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Import testing utilities in development mode
if (__DEV__) {
  require('@/src/shared/utils/test-auth-persistence');
}

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
      refetchOnWindowFocus: true, // ✅ FIXED: Refetch when app comes to foreground
      refetchOnMount: true, // ✅ FIXED: Refetch when component mounts
      refetchOnReconnect: true, // ✅ NEW: Refetch when internet reconnects
      staleTime: 0, // ✅ FIXED: Data always considered stale - refetch immediately
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (formerly cacheTime)
      refetchInterval: 30000, // ✅ NEW: Auto-refetch every 30 seconds for real-time updates
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
    ...AntDesign.font,
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Handle font loading errors gracefully
  useEffect(() => {
    if (error) {
      console.error('❌ Font loading error:', error);
      console.log('⚠️ App will continue with system fonts');
    }
  }, [error]);

  // 🔔 Initialize FCM Push Notifications
  const fcmStatus = useInitializeFCM();

  // Log FCM status when initialized
  useEffect(() => {
    if (fcmStatus.isInitialized) {
      console.log('📱 ========== PUSH NOTIFICATIONS STATUS ==========');
      console.log('✅ Initialized:', fcmStatus.isInitialized);
      console.log('📝 Token Registered:', fcmStatus.isRegistered);
      console.log('🔔 Permission Granted:', fcmStatus.hasPermission);
      console.log('❌ Error:', fcmStatus.error || 'None');
      console.log('==================================================');
    }
  }, [fcmStatus]);

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
    // Show notification permission prompt after splash (only on native build)
    setShowNotificationPrompt(true);
  };

  const handleNotificationPromptComplete = () => {
    setShowNotificationPrompt(false);
  };

  // Always show custom splash first
  if (showSplash) {
    return <ProfessionalSplashScreen onFinish={handleSplashFinish} duration={3000} />;
  }

  // After splash, check if fonts are loaded or errored
  // Continue even if fonts fail to load (will use system fonts)
  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider value={DefaultTheme}>
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
              <StatusBar style="dark" />
              
              {/* Notification Permission Prompt - Shows after splash */}
              {showNotificationPrompt && (
                <NotificationPermissionPrompt onComplete={handleNotificationPromptComplete} />
              )}
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
