import { AntDesign, Entypo, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/shared/AuthProvider';
import { DeepLinkHandler } from '@/src/shared/components/DeepLinkHandler';
import { EnhancedOfflineBanner } from '@/src/shared/components/EnhancedOfflineBanner';
import { NotificationPermissionPrompt } from '@/src/shared/components/NotificationPermissionPrompt';
import ProfessionalSplashScreen from '@/src/shared/components/ProfessionalSplashScreen';
import { useColorScheme } from '@/src/shared/hooks/useColorScheme';
import { useInitializeFCM } from '@/src/shared/hooks/useInitializeFCM';
import { ConnectivityProvider } from '@/src/services/offline/ConnectivityProvider';
import { setupAppleCredentialListener, verifyAppleCredentialState } from '@/src/shared/utils/apple-auth-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

// Testing utilities are only loaded in development mode via metro.config.js
// REMOVED: conditional require() was causing release build crashes
// The test-auth-persistence module is only needed during development debugging

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error boundary to catch crashes in critical launch components
class LaunchErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error('🚨 Launch component crashed:', error?.message || error, info?.componentStack);
    // If splash crashes, skip it so the app can still load
    this.props.fallback?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

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
      refetchOnWindowFocus: true, // ✅ Refetch when app comes to foreground
      refetchOnMount: true, // ✅ Refetch when component mounts
      refetchOnReconnect: true, // ✅ Refetch when internet reconnects
      staleTime: 5000, // ✅ 5 second stale time — prevents excessive refetching on launch
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (formerly cacheTime)
      refetchInterval: false, // ✅ FIXED: Disabled global polling — enable per-query where needed
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
    ...Feather.font,
    ...Entypo.font,
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [fontLoadingFailed, setFontLoadingFailed] = useState(false);

  // Handle font loading errors gracefully
  useEffect(() => {
    if (error) {
      console.log('⚠️ Font loading issue detected:', error.message);
      // Fonts are included in the app bundle via UIAppFonts in Info.plist
      // and [CP] Copy Pods Resources build phase. They are already registered
      // natively by iOS, so we can safely continue rendering.
      setFontLoadingFailed(true);
    }
  }, [error]);

  // 🔔 Initialize FCM Push Notifications with QueryClient for real-time sync
  const fcmStatus = useInitializeFCM(queryClient);

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
        
        // ========================================
        // PROFESSIONAL APPLE AUTHENTICATION CHECK
        // Verify stored credentials on app launch
        // ========================================
        console.log('🍎 Verifying Apple credentials on app launch...');
        const hasValidAppleSession = await verifyAppleCredentialState();
        if (hasValidAppleSession) {
          console.log('✅ Valid Apple session restored');
        }
      } catch (e) {
        console.warn('Error hiding splash:', e);
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepareApp();
    
    // ========================================
    // APPLE CREDENTIAL REVOCATION LISTENER
    // Handles when user removes app from Settings
    // ========================================
    const cleanupListener = setupAppleCredentialListener();
    
    return () => {
      // Cleanup listener on unmount
      cleanupListener();
    };
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
    return (
      <LaunchErrorBoundary fallback={handleSplashFinish}>
        <ProfessionalSplashScreen onFinish={handleSplashFinish} duration={3000} />
      </LaunchErrorBoundary>
    );
  }

  // After splash, check if fonts are loaded or if loading failed
  // Continue even if fonts fail to load (will use system fonts)
  if (!loaded && !fontLoadingFailed) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ConnectivityProvider>
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
                  <Stack.Screen name="edit-task" options={{ headerShown: false }} />
                  <Stack.Screen name="task-chat" options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true, animation: 'slide_from_right' }} />
                  <Stack.Screen name="payment-summary" options={{ headerShown: false }} />
                  <Stack.Screen name="payment-receipt" options={{ headerShown: false }} />
                  <Stack.Screen name="public-questions" options={{ headerShown: false }} />
                  <Stack.Screen name="questions/answer-question-screen" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="dark" />
                
                {/* 🌐 Offline Sync Banner - Shows on ALL screens when offline/syncing */}
                <EnhancedOfflineBanner />
                
                {/* Notification Permission Prompt - Shows after splash */}
                {showNotificationPrompt && (
                  <NotificationPermissionPrompt onComplete={handleNotificationPromptComplete} />
                )}
              </ThemeProvider>
            </SafeAreaProvider>
          </ConnectivityProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
